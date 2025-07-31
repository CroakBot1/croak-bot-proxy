// index.js
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  console.log(`[PING] ${new Date().toISOString()} - ${req.method} ${req.url}`);

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('✅ UUID server active and responding!\n');
});

server.listen(PORT, () => {
  console.log(`🚀 Server running and ready at http://localhost:${PORT}`);
});
