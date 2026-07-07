/**
 * ==========================================================================
 * Zero-Dependency Static File Dev Server
 * Executed via: node server.js
 * Focuses on: Zero dependency startup, secure path validation, and proper MIME-types.
 * ==========================================================================
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '.');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // Prevent directory traversal attacks
  let safeUrl = req.url.split('?')[0];
  if (safeUrl === '/') safeUrl = '/index.html';
  
  const filePath = path.join(PUBLIC_DIR, safeUrl);
  
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden - Access Denied');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      // Cache control headers for local dev server
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      res.end(content);
    }
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 Zero-Dependency Static Server running at: http://localhost:${PORT}`);
});
