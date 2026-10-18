'use strict';
const fs = require('node:fs');
const path = require('node:path');

function createHandler(service) {
  const html = fs.readFileSync(path.join(__dirname, 'landing.html'));
  const logo = fs.readFileSync(path.join(__dirname, 'logo.svg'));
  return async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    function send(status, body, contentType = 'application/json; charset=utf-8', cache = 'no-store') {
      res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': cache });
      res.end(req.method === 'HEAD' ? undefined : typeof body === 'object' && !Buffer.isBuffer(body) ? JSON.stringify(body) : body);
    }
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD, OPTIONS'); return send(405, { error: 'Yöntem desteklenmiyor.' }); }
    let url;
    try { url = new URL(req.url, 'http://localhost'); decodeURIComponent(url.pathname); }
    catch { return send(400, { error: 'Geçersiz adres.' }); }
    if (url.pathname === '/' || url.pathname === '/configure') return send(200, html, 'text/html; charset=utf-8', 'public, max-age=300');
    if (url.pathname === '/logo.svg' || url.pathname === '/favicon.svg') return send(200, logo, 'image/svg+xml', 'public, max-age=86400');
    if (url.pathname === '/manifest.json') return send(200, service.manifest, undefined, 'public, max-age=0, s-maxage=300');
    const route = url.pathname.match(/^\/catalog\/(movie|series)\/([^/]+)(?:\/([^/]+))?\.json$/);
    if (!route) return send(404, { error: 'Bu sayfa bulunamadı.' });
    const [, type, rawId, rawExtras = ''] = route;
    const extras = Object.fromEntries(new URLSearchParams(rawExtras));
    for (const [key, value] of url.searchParams) extras[key] = value;
    try {
      const result = await service.catalog(type, decodeURIComponent(rawId), extras);
      return send(200, result, undefined, 'public, max-age=60, s-maxage=900, stale-while-revalidate=1800');
    } catch {
      // Never expose credentials, upstream URLs, or transient failures as empty successes.
      return send(502, { error: 'Katalog şu anda yüklenemiyor. Biraz sonra tekrar deneyin.' });
    }
  };
}
module.exports = { createHandler };
