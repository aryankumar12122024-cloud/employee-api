const db = require('../database');

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

async function handleApiRequest(req, res) {
  try {
    if (req.url === '/api/employees' && req.method === 'GET') {
      const employees = await db.getEmployees();
      sendJson(res, 200, employees);
      return;
    }

    if (req.url === '/api/employees' && req.method === 'POST') {
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

