const { test } = require('node:test');
const assert = require('node:assert/strict');
let createCatalogService;
try { ({ createCatalogService } = require('./catalog')); } catch (error) { if (error.code !== 'MODULE_NOT_FOUND') throw error; }

function setup(options = {}) {
  assert.equal(typeof createCatalogService, 'function', 'catalog service must be importable without starting a server');
  const calls = [];
  const fetcher = async (url, init) => {
    const u = new URL(url); calls.push(u);
    if (options.respond) return options.respond(u, init);
    if (u.pathname.includes('external_ids')) return { ok: true, json: async () => ({ imdb_id: `tt${u.pathname.split('/')[3].padStart(7, '0')}` }) };
    const page = Number(u.searchParams.get('page') || 1);
    return { ok: true, json: async () => ({ page, total_pages: 3, results: Array.from({ length: 20 }, (_, i) => ({ id: (page - 1) * 20 + i + 1, title: `Film ${i}`, name: `Dizi ${i}`, poster_path: '/poster.jpg', release_date: '2026-01-01', vote_average: 7.5 })) }) };
  };
  return { calls, service: createCatalogService({ apiKey: 'test-key', fetcher, requestTimeoutMs: options.requestTimeoutMs || 20000, now: () => new Date('2026-10-18T12:00:00Z') }) };
}

test('keeps the installed addon identity and places Turkey discovery before platforms', () => {
  const { service } = setup();
  assert.equal(service.manifest.id, 'tr.nuvio.tmdb.katalog');
  assert.equal(service.manifest.catalogs[0].id, 'tvp17-01-tr-yeni-film');
  assert.ok(service.manifest.catalogs.some(c => c.extra.some(e => e.name === 'genre')));
});
test('does not label TMDB scores as IMDb ratings', async () => {
  const { service } = setup();
  const result = await service.catalog('movie', 'tr-yeni-film', {});
  assert.equal(Object.hasOwn(result.metas[0], 'imdbRating'), false);
});
test('uses the real Turkish provider IDs and subscription availability', async () => {
  for (const [id, provider] of Object.entries({ 'tr-tvplus-film': 1904, 'tr-tod-dizi': 1826, 'tr-puhu-dizi': 342, 'tr-amazon-film': 119 })) {
    const { service, calls } = setup();
    await service.catalog('movie' === id.split('-').pop() ? 'movie' : id.endsWith('film') ? 'movie' : 'series', id, {});
    const request = calls.find(c => c.pathname.includes('/discover/'));
    assert.equal(request.searchParams.get('with_watch_providers'), String(provider));
    assert.equal(request.searchParams.get('watch_region'), 'TR');
  }
});
test('local originals use verified networks rather than incomplete availability lists', async () => {
  for (const [id, network] of Object.entries({ 'tr-exxen-dizi': 4405, 'tr-gain-dizi': 4409, 'tr-tabii-dizi': 6854 })) {
    const { service, calls } = setup();
    await service.catalog('series', id, {});
    assert.equal(calls[0].searchParams.get('with_networks'), String(network));
    assert.match(service.manifest.catalogs.find(c => c.id.endsWith(id)).name, /Orijinalleri/);
  }
});
test('new catalog keys bypass saved legacy ordering and remove Crunchyroll entirely', async () => {
  const { service, calls } = setup();
  const catalogs = service.manifest.catalogs;
  const names = ["Türkiye'de Popüler · Filmler","Türkiye'de Popüler · Diziler",'Türk Filmleri','Türk Dizileri','İyi ki İzlemişim · Sinema','Bir Bölüm Daha · Diziler','Gözden Kaçan · Filmler','Gözden Kaçan · Diziler','Netflix · Filmler','Netflix · Diziler','Prime Video · Filmler','Prime Video · Diziler','Disney+ · Filmler','Disney+ · Diziler','HBO Max · Filmler','HBO Max · Diziler','TV+ · Filmler','TV+ · Diziler','TOD · Filmler','TOD · Diziler','MUBI · Filmler','Exxen Orijinalleri','GAİN Orijinalleri','tabii Orijinalleri','puhutv','Ruh Haline Göre · Filmler','Ruh Haline Göre · Diziler','Film Ara','Dizi Ara'];
  assert.deepEqual(catalogs.map(c => c.name), names);
  assert.ok(catalogs.every(c => c.id.startsWith('tvp17-')));
  const savedOldOrder = ['tr-netflix-film', 'tr-turk-dizi', 'tr-crunchy-dizi'];
  assert.ok(catalogs.every(c => !savedOldOrder.includes(c.id)));
  assert.deepEqual(await service.catalog('series', 'tr-crunchy-dizi', {}), { metas: [] });
  assert.equal(calls.length, 0);
  const first = await service.catalog('movie', catalogs[0].id, {});
  assert.equal(first.metas.length, 20);
});
test('arbitrary offsets do not repeat entries between pages', async () => {
  const { service } = setup();
  const first = await service.catalog('movie', 'tr-yeni-film', {});
  const next = await service.catalog('movie', 'tr-yeni-film', { skip: '13' });
  assert.equal(first.metas[13].id, next.metas[0].id);
  assert.equal(next.metas.length, 20);
  assert.equal(next.metas.at(-1).id, 'tt0000033');
});
test('a missing IMDb ID does not make later pages repeat or lose titles', async () => {
  const { service } = setup({ respond: async u => {
    if (u.pathname.includes('external_ids')) { const id = Number(u.pathname.split('/')[3]); return { ok: true, json: async () => ({ imdb_id: id % 5 ? `tt${String(id).padStart(7, '0')}` : null }) }; }
    const page = Number(u.searchParams.get('page') || 1);
    return { ok: true, json: async () => ({ total_pages: 3, results: Array.from({ length: 20 }, (_, i) => ({ id: (page - 1) * 20 + i + 1, title: 'Film', poster_path: '/p.jpg' })) }) };
  } });
  const a = await service.catalog('movie', 'tr-yeni-film', {});
  const b = await service.catalog('movie', 'tr-yeni-film', { skip: '20' });
  assert.equal(a.metas.length, 20); assert.equal(b.metas.length, 20);
  assert.equal(new Set([...a.metas, ...b.metas].map(m => m.id)).size, 40);
});
test('combines genre alternatives with OR, and rejects unknown filters', async () => {
  const { service, calls } = setup();
  await service.catalog('movie', 'tr-tur-film', { genre: 'Korku ve gerilim' });
  assert.equal(calls[0].searchParams.get('with_genres'), '27|53');
  assert.deepEqual(await service.catalog('movie', 'tr-tur-film', { genre: 'invalid' }), { metas: [] });
});
test('validates catalog type and offsets before making API requests', async () => {
  const { service, calls } = setup();
  for (const skip of ['-1', 'abc', '1.5', '10001']) assert.deepEqual(await service.catalog('movie', 'tr-yeni-film', { skip }), { metas: [] });
  assert.deepEqual(await service.catalog('series', 'tr-yeni-film', {}), { metas: [] });
  assert.equal(calls.length, 0);
});
test('deduplicates simultaneous API calls and caches successful results', async () => {
  const { service, calls } = setup();
  const [a, b] = await Promise.all([service.catalog('movie', 'tr-yeni-film', {}), service.catalog('movie', 'tr-yeni-film', {})]);
  assert.deepEqual(a, b);
  await service.catalog('movie', 'tr-yeni-film', {});
  assert.equal(calls.filter(c => c.pathname.includes('/discover/')).length, 1);
  assert.equal(calls.filter(c => c.pathname.includes('/external_ids')).length, 20);
});
test('upstream failures are errors, not a successful empty catalog', async () => {
  const { service } = setup({ respond: async () => ({ ok: false, status: 401 }) });
  await assert.rejects(service.catalog('movie', 'tr-yeni-film', {}), /TMDB/);
});
test('search safely encodes Turkish text and excludes adult content', async () => {
  const { service, calls } = setup();
  await service.catalog('movie', 'tr-search-film', { search: 'Dağ & Deniz' });
  assert.equal(calls[0].searchParams.get('query'), 'Dağ & Deniz');
  assert.equal(calls[0].searchParams.get('include_adult'), 'false');
});
test('simultaneous cold requests stop waiting and abort queued work at their total deadline', async () => {
  let active = 0;
  const { service } = setup({ requestTimeoutMs: 80, respond: async (u, init) => {
    if (!u.pathname.includes('external_ids')) return { ok: true, json: async () => ({ total_pages: 500, results: Array.from({ length: 20 }, (_, i) => ({ id: i + 1, title: 'Film', poster_path: '/p.jpg' })) }) };
    active++;
    return new Promise((resolve, reject) => { const timer = setTimeout(() => { active--; resolve({ ok: true, json: async () => ({ imdb_id: 'tt1234567' }) }); }, 2000); init.signal.addEventListener('abort', () => { clearTimeout(timer); active--; reject(new Error('aborted')); }, { once: true }); });
  } });
  const start = Date.now();
  const results = await Promise.allSettled(['tr-yeni-film', 'tr-turk-film', 'tr-eniyi-film'].map(id => service.catalog('movie', id, {})));
  assert.ok(results.every(r => r.status === 'rejected'));
  assert.ok(Date.now() - start < 500, 'the deadline includes queue and lock waits');
  await new Promise(r => setTimeout(r, 20)); assert.equal(active, 0);
});
test('a cold request cannot trigger an unbounded rebuild of thousands of preceding titles', async () => {
  const { service, calls } = setup();
  assert.deepEqual(await service.catalog('movie', 'tr-yeni-film', { skip: '1000' }), { metas: [] });
  assert.equal(calls.length, 0);
});
test('the last discovery page remains bounded on a fresh service', async () => {
  const { service, calls } = setup({ respond: async (u) => {
    await new Promise(r => setTimeout(r, 5));
    if (u.pathname.includes('external_ids')) return { ok: true, json: async () => ({ imdb_id: `tt${u.pathname.split('/')[3].padStart(7, '0')}` }) };
    const page = Number(u.searchParams.get('page'));
    return { ok: true, json: async () => ({ total_pages: 500, results: Array.from({ length: 20 }, (_, i) => ({ id: (page - 1) * 20 + i + 1, title: 'Film', poster_path: '/p.jpg' })) }) };
  } });
  const result = await service.catalog('movie', 'tr-yeni-film', { skip: '180' });
  assert.equal(result.metas.length, 20);
  assert.equal(result.metas[0].id, 'tt0000181');
  assert.ok(calls.length <= 220);
  const next = await service.catalog('movie', 'tr-yeni-film', { skip: '200' });
  assert.equal(next.metas.length, 20);
  assert.equal(next.metas[0].id, 'tt0000201');
});
