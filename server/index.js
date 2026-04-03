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
<form id="f">
<label>Name<input name="name" required autocomplete="name"></label>
<label>Role<input name="role" required></label>
<label>Salary<input name="salary" type="number" required min="0"></label>
<button type="submit">Save</button>
</form>
<p id="msg"></p>
<p><a href="/api/employees">View list (JSON)</a></p>
<script>
document.getElementById('f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.textContent = 'Saving...';
  const body = {
    name: f.name.value.trim(),
    role: f.role.value.trim(),
    salary: Number(f.salary.value)
  };
  try {
    const r = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  await handleApiRequest(req, res);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

