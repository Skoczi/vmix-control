import http from 'node:http';
import {markLocalRequest} from './local-access.mjs';
import {accessControl} from './access-control.mjs';
import { networkInterfaces } from 'node:os';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { handlePresence } from './operator-presence.mjs';
import { handleVmix } from './vmix-proxy.mjs';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const mime = { '.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.woff2':'font/woff2' };
const server = http.createServer(async (req, res) => {
  try {
    markLocalRequest(req);
    const url = new URL(req.url, `http://${req.headers.host}`);
    if ((['/api/vmix','/api/operators','/api/access'].includes(url.pathname) && req.method === 'POST') || (['/api/access','/api/vmix'].includes(url.pathname) && req.method==='GET')) {
      let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 4096) { res.writeHead(413); res.end('Za duze zadanie.'); return; } }
      const request=new Request(url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}:{})});
      const response=url.pathname==='/api/access'?await accessControl.handle(request):await accessControl.guard(request)||await (url.pathname==='/api/operators'?handlePresence:handleVmix)(request);
      res.writeHead(response.status, Object.fromEntries(response.headers)); res.end(await response.text()); return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-cache'}); res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) { res.writeHead(error.code === 'ENOENT' ? 404 : 500); res.end('Nie mozna obsluzyc zadania.'); console.error(error.message); }
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} jest zajety. Zamknij poprzedni dashboard i uruchom ponownie.` : error.message); process.exitCode = 1; });
server.listen(port, host, () => {
  console.log(`\nvMix Control gotowy: http://127.0.0.1:${port}\nPozostaw to okno otwarte. Ctrl+C zatrzymuje serwer.\n`);
  if (host === '0.0.0.0') for (const entries of Object.values(networkInterfaces())) for (const entry of entries || []) if (entry.family === 'IPv4' && !entry.internal) console.log(`Adres dla operatorow w LAN: http://${entry.address}:${port}`);
});
