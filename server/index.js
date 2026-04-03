const http = require('http');
const { handleApiRequest } = require('../api');
const PORT = process.env.PORT || 3000;

const formPageHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Employee add</title>
<style>
body{font-family:system-ui,sans-serif;max-width:420px;margin:24px auto;padding:0 16px}
label{display:block;margin:12px 0 4px}
input{width:100%;padding:10px;box-sizing:border-box;font-size:16px}
button{margin-top:16px;width:100%;padding:12px;font-size:16px}
#msg{margin-top:12px;white-space:pre-wrap;word-break:break-word}
a{display:inline-block;margin-top:16px}
</style>
</head>
<body>
<h1>Employee add</h1>
<p>Default login: <b>admin</b> / <b>admin123</b></p>
<h2>Sign up</h2>
<form id="signupForm">
<label>Name<input name="name" placeholder="Your name"></label>
<label>Email<input name="email" type="email" placeholder="you@gmail.com"></label>
<label>Mobile<input name="mobile" placeholder="98xxxxxxxx"></label>
<label>Password<input name="password" type="password" required></label>
<button type="submit">Sign up</button>
</form>
<form id="loginForm">
<label>Username (email/mobile/admin)<input name="username" required value="admin"></label>
<label>Password<input name="password" type="password" required value="admin123"></label>
<button type="submit">Sign in</button>
</form>
<hr>
<h2>OTP login</h2>
<form id="otpRequestForm">
<label>Mobile or Email<input name="target" required placeholder="98xxxxxxxx or you@gmail.com"></label>
<label>Channel<input name="channel" required value="sms" placeholder="sms or email"></label>
<button type="submit">Request OTP</button>
</form>
<form id="otpVerifyForm">
<label>Same target<input name="target" required placeholder="same as above"></label>
<label>OTP<input name="otp" required placeholder="6 digit otp"></label>
<button type="submit">Verify OTP Login</button>
</form>
<p style="font-size:12px">Note: demo mode me OTP screen par show hoga.</p>
<form id="f">
<label>Name<input name="name" required autocomplete="name"></label>
<label>Role<input name="role" required></label>
<label>Salary<input name="salary" type="number" required min="0"></label>
<button type="submit">Save</button>
</form>
<p id="msg"></p>
<button id="listBtn" type="button">View list (JSON)</button>
<pre id="list"></pre>
<script>
let authToken = '';

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Creating account...';
  const body = {
    name: signupForm.name.value.trim(),
    email: signupForm.email.value.trim(),
    mobile: signupForm.mobile.value.trim(),
    password: signupForm.password.value
  };
  try {
    const r = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Signup failed');
    msg.textContent = 'Signup success. Ab Sign in karo.';
    loginForm.username.value = body.email || body.mobile || '';
    loginForm.password.value = '';
    signupForm.password.value = '';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Logging in...';
  const body = {
    username: loginForm.username.value.trim(),
    password: loginForm.password.value
  };
  try {
    const r = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Login failed');
    authToken = data.token;
    msg.textContent = 'Login success';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('otpRequestForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Requesting OTP...';
  const body = {
    target: otpRequestForm.target.value.trim(),
    channel: otpRequestForm.channel.value.trim().toLowerCase()
  };
  try {
    const r = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'OTP request failed');
    msg.textContent = 'OTP: ' + data.otp + ' (demo mode)';
    otpVerifyForm.target.value = body.target;
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('otpVerifyForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Verifying OTP...';
  const body = {
    target: otpVerifyForm.target.value.trim(),
    otp: otpVerifyForm.otp.value.trim()
  };
  try {
    const r = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'OTP verify failed');
    authToken = data.token;
    msg.textContent = 'OTP login success';
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  if (!authToken) {
    msg.textContent = 'Please login first';
    return;
  }
  msg.textContent = 'Saving...';
  const body = {
    name: f.name.value.trim(),
    role: f.role.value.trim(),
    salary: Number(f.salary.value)
  };
  try {
    const r = await fetch('/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify(body)
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Error');
    msg.textContent = 'Saved: ' + JSON.stringify(data);
    f.reset();
  } catch (err) {
    msg.textContent = err.message;
  }
});

document.getElementById('listBtn').addEventListener('click', async () => {
  const list = document.getElementById('list');
  if (!authToken) {
    list.textContent = 'Please login first';
    return;
  }
  list.textContent = 'Loading...';
  try {
    const r = await fetch('/api/employees', {
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || 'Error');
    list.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    list.textContent = err.message;
  }
});
</script>
</body>
</html>`;

const server = http.createServer(async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end('Server is running. Open /form to add employees (example: your-site.onrender.com/form)');
    return;
  }

  if (req.url === '/form' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(formPageHtml);
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  await handleApiRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

