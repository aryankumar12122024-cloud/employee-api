const http = require('http');
const { handleApiRequest } = require('../api');
const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {
  if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
    });
    res.end('Server is running');
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

