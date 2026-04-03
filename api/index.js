const crypto = require('crypto');
const db = require('../database');
const AUTH_USER = process.env.AUTH_USER || 'admin';
const AUTH_PASS = process.env.AUTH_PASS || 'admin123';
const tokenStore = new Map();
const otpStore = new Map();

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

function isAuthorized(req) {
  const token = getBearerToken(req);
  if (!token) return false;
  const expiry = tokenStore.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    tokenStore.delete(token);
    return false;
  }
  return true;
}

function createAuthToken() {
  const token = crypto.randomBytes(24).toString('hex');
  const ttlMs = 24 * 60 * 60 * 1000;
  tokenStore.set(token, Date.now() + ttlMs);
  return token;
}

function normalizeOtpTarget(target) {
  return String(target || '').trim().toLowerCase();
}

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpRecord(target) {
  const key = normalizeOtpTarget(target);
  if (!key) return null;
  const record = otpStore.get(key);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return null;
  }
  return { key, ...record };
}

async function handleApiRequest(req, res) {
  try {
    if (req.url === '/api/auth/login' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      if (payload.username !== AUTH_USER || payload.password !== AUTH_PASS) {
        sendJson(res, 401, { error: 'Invalid username or password' });
        return;
      }
      const token = createAuthToken();
      sendJson(res, 200, { token, expiresInHours: 24 });
      return;
    }

    if (req.url === '/api/auth/request-otp' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const target = normalizeOtpTarget(payload.target);
      const channel = String(payload.channel || '').toLowerCase();
      if (!target) {
        sendJson(res, 400, { error: 'target is required (mobile or email)' });
        return;
      }
      if (channel !== 'sms' && channel !== 'email') {
        sendJson(res, 400, { error: 'channel must be sms or email' });
        return;
      }

      const otp = createOtpCode();
      const ttlMs = 5 * 60 * 1000;
      otpStore.set(target, { otp, expiresAt: Date.now() + ttlMs });

      // Demo mode: OTP response me return ho raha hai.
      // Real SMS/Email delivery ke liye provider integration chahiye.
      sendJson(res, 200, {
        message: `OTP generated for ${channel}`,
        target,
        otp,
        expiresInMinutes: 5,
      });
      return;
    }

    if (req.url === '/api/auth/verify-otp' && req.method === 'POST') {
      const payload = await readJsonBody(req);
      const target = normalizeOtpTarget(payload.target);
      const providedOtp = String(payload.otp || '').trim();
      const record = getOtpRecord(target);

      if (!record) {
        sendJson(res, 400, { error: 'OTP expired or not found' });
        return;
      }
      if (record.otp !== providedOtp) {
        sendJson(res, 401, { error: 'Invalid OTP' });
        return;
      }

      otpStore.delete(target);
      const token = createAuthToken();
      sendJson(res, 200, { token, expiresInHours: 24 });
      return;
    }

    if (req.url === '/api/employees' && req.method === 'GET') {
      if (!isAuthorized(req)) {
        sendJson(res, 401, { error: 'Unauthorized. Login required.' });
        return;
      }
      const employees = await db.getEmployees();
      sendJson(res, 200, employees);
      return;
    }

    if (req.url === '/api/employees' && req.method === 'POST') {
      if (!isAuthorized(req)) {
        sendJson(res, 401, { error: 'Unauthorized. Login required.' });
        return;
      }
      const payload = await readJsonBody(req);
      const employee = await db.addEmployee(payload);
      sendJson(res, 201, employee);
      return;
    }

    sendJson(res, 404, { error: 'Route not found' });
  } catch (error) {
    sendJson(res, 400, { error: error.message || 'Bad request' });
  }
}

module.exports = { handleApiRequest };

