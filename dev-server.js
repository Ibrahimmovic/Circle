const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

async function handleApiConfig(req, res) {
  const mod = await import('./api/config.js');
  const handler = mod.default;

  const mockRes = {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, value) { this.headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    json(data) {
      this.headers['Content-Type'] = 'application/json';
      this.body = JSON.stringify(data);
    },
  };

  handler(req, mockRes);

  res.writeHead(mockRes.statusCode, mockRes.headers);
  res.end(mockRes.body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/api/config') {
    return handleApiConfig(req, res);
  }

  const filePath = path.join(__dirname, 'frontend', 'index.html');
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
  console.log('  Frontend: http://localhost:' + PORT + '/');
  console.log('  API:      http://localhost:' + PORT + '/api/config');
});
