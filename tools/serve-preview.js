import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PORT = 3000;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  let filePath = resolve(ROOT, '.' + url);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  if (!existsSync(filePath) && !extname(filePath)) {
    filePath = filePath + '.html';
  }

  if (!existsSync(filePath)) {
    console.log(`404: ${url}`);
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': mime + '; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(readFileSync(filePath));
}).listen(PORT, () => {
  console.log(`Preview server: http://localhost:${PORT}/tools/preview-devices.html`);
});
