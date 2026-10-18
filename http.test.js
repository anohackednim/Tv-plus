const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
let createHandler;
try { ({ createHandler } = require('./server')); } catch (e) { if (e.code !== 'MODULE_NOT_FOUND') throw e; }
const servers = [];
after(() => Promise.all(servers.map(s => new Promise(r => s.close(r)))));
async function boot(catalog = async () => ({ metas: [] })) {
  assert.equal(typeof createHandler, 'function', 'server must export a Vercel-compatible handler');
  const server = http.createServer(createHandler({ manifest: { id: 'test', catalogs: [] }, catalog }));
  servers.push(server);
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return `http://127.0.0.1:${server.address().port}`;
}
test('serves a CORS-enabled manifest and an accessible Turkish installation page', async () => {
  const base = await boot();
  const response = await fetch(`${base}/manifest.json`);
  assert.equal(response.headers.get('access-control-allow-origin'), '*');
  assert.equal((await response.json()).id, 'test');
  const html = await (await fetch(base)).text();
  assert.match(html, /lang="tr"/); assert.match(html, /TV\+ Keşif/);
  assert.equal((await fetch(`${base}/logo.svg`)).status, 200);
});
test('decodes catalog filters without corrupting ampersands inside search terms', async () => {
  let received;
  const base = await boot(async (...args) => { received = args; return { metas: [] }; });
  await fetch(`${base}/catalog/movie/tr-search-film/search=Da%C4%9F%20%26%20Deniz&skip=20.json`);
  assert.deepEqual(received, ['movie', 'tr-search-film', { search: 'Dağ & Deniz', skip: '20' }]);
});
test('does not cache upstream errors or expose their messages', async () => {
  const base = await boot(async () => { throw new Error('secret'); });
  const response = await fetch(`${base}/catalog/movie/tr-yeni-film.json`);
  assert.equal(response.status, 502);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.doesNotMatch(await response.text(), /secret/);
});
test('rejects missing routes, malformed escapes, and methods other than GET/HEAD/OPTIONS', async () => {
  const base = await boot();
  assert.equal((await fetch(`${base}/bad`)).status, 404);
  assert.equal((await fetch(`${base}/catalog/movie/%ZZ.json`)).status, 400);
  assert.equal((await fetch(`${base}/manifest.json`, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${base}/manifest.json`, { method: 'OPTIONS' })).status, 204);
});
