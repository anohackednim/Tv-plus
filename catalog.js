'use strict';

const IMAGE = 'https://image.tmdb.org/t/p/';
const MAX_RESULTS = 10000;
const MAX_SOURCE_PAGES = 500;
const GENRES = {
  movie: { 'Tümü': '', 'Aksiyon ve macera': '28|12', 'Bilim kurgu ve fantastik': '878|14', 'Korku ve gerilim': '27|53', 'Komedi': '35', 'Suç ve gizem': '80|9648', 'Dram': '18', 'Romantik': '10749', 'Animasyon': '16', 'Belgesel': '99', 'Aile': '10751' },
  series: { 'Tümü': '', 'Aksiyon ve macera': '10759', 'Bilim kurgu ve fantastik': '10765', 'Komedi': '35', 'Suç ve gizem': '80|9648', 'Dram': '18', 'Animasyon': '16', 'Belgesel': '99', 'Aile': '10751' }
};
const definitions = [];
function add(id, type, name, mode, params = {}, genres = false) {
  definitions.push({ id, type, name, mode, params, extra: [ ...(mode === 'search' ? [{ name: 'search', isRequired: true }] : []), ...(genres ? [{ name: 'genre', options: Object.keys(GENRES[type]) }] : []), { name: 'skip' } ] });
}
for (const [suffix, type, noun] of [['film', 'movie', 'Filmler'], ['dizi', 'series', 'Diziler']]) {
  add(`tr-yeni-${suffix}`, type, `Yeni ${noun} · Türkiye`, 'latest', { watch_region: 'TR', with_watch_monetization_types: 'flatrate|free|ads' });
}
for (const [suffix, type, noun] of [['film', 'movie', 'Filmler'], ['dizi', 'series', 'Diziler']]) {
  add(`tr-yerli-${suffix}`, type, `Türkiye'den Popüler · ${noun}`, 'discover', { with_origin_country: 'TR', sort_by: 'popularity.desc' });
}
for (const [suffix, type, noun] of [['film', 'movie', 'Filmler'], ['dizi', 'series', 'Diziler']]) {
  add(`tr-trend-${suffix}`, type, `Türkiye'de Öne Çıkan · ${noun}`, 'discover', { watch_region: 'TR', with_watch_monetization_types: 'flatrate|free|ads', sort_by: 'popularity.desc' });
}
for (const [suffix, type, noun] of [['film', 'movie', 'Filmleri'], ['dizi', 'series', 'Dizileri']]) add(`tr-turk-${suffix}`, type, `Türk ${noun}`, 'discover', { with_original_language: 'tr', sort_by: 'popularity.desc' }, true);
add('tr-eniyi-film', 'movie', 'İyi ki İzlemişim · Sinema', 'discover', { 'vote_count.gte': 1000, 'vote_average.gte': 7.5, sort_by: 'vote_average.desc' });
add('tr-eniyi-dizi', 'series', 'Bir Bölüm Daha · Diziler', 'discover', { 'vote_count.gte': 300, 'vote_average.gte': 8, sort_by: 'vote_average.desc' });
add('tr-sakli-film', 'movie', 'Gözden Kaçan · Filmler', 'discover', { 'vote_count.gte': 150, 'vote_count.lte': 3000, 'vote_average.gte': 7, sort_by: 'popularity.desc' });
add('tr-sakli-dizi', 'series', 'Gözden Kaçan · Diziler', 'discover', { 'vote_count.gte': 80, 'vote_count.lte': 1000, 'vote_average.gte': 7.5, sort_by: 'popularity.desc' });
// TMDB / JustWatch Turkey IDs verified against /watch/providers/{movie,tv}.
const PROVIDERS = [ ['netflix', 'Netflix', 8], ['amazon', 'Prime Video', 119], ['disney', 'Disney+', 337], ['hbomax', 'HBO Max', 1899], ['tvplus', 'TV+', 1904], ['tod', 'TOD', 1826], ['mubi', 'MUBI', 11] ];
for (const [slug, title, provider] of PROVIDERS) {
  for (const [suffix, type, noun] of [['film', 'movie', 'Filmler'], ['dizi', 'series', 'Diziler']]) {
    if (slug === 'mubi' && type === 'series') continue;
    add(`tr-${slug}-${suffix}`, type, `${title} · ${noun}`, 'discover', { with_watch_providers: provider, watch_region: 'TR', with_watch_monetization_types: 'flatrate|free|ads', sort_by: 'popularity.desc' }, true);
  }
}
for (const [slug, title, network] of [['exxen', 'Exxen', 4405], ['gain', 'GAİN', 4409], ['tabii', 'tabii', 6854]]) add(`tr-${slug}-dizi`, 'series', `${title} Orijinalleri`, 'discover', { with_networks: network, sort_by: 'popularity.desc' }, true);
for (const [slug, title, provider] of [['puhu', 'puhutv', 342]]) add(`tr-${slug}-dizi`, 'series', title, 'discover', { with_watch_providers: provider, watch_region: 'TR', with_watch_monetization_types: 'flatrate|free|ads', sort_by: 'popularity.desc' }, true);
add('tr-tur-film', 'movie', 'Ruh Haline Göre · Filmler', 'discover', { 'vote_count.gte': 100, sort_by: 'popularity.desc' }, true);
add('tr-tur-dizi', 'series', 'Ruh Haline Göre · Diziler', 'discover', { 'vote_count.gte': 50, sort_by: 'popularity.desc' }, true);
add('tr-search-film', 'movie', 'Film Ara', 'search');
add('tr-search-dizi', 'series', 'Dizi Ara', 'search');

// Nuvio persists user order using addon/type/catalog IDs. A generation change
// restores the intended discovery order after this catalog redesign.
const published = definitions.map((def, index) => ({ ...def, id: `tvp16-${String(index + 1).padStart(2, '0')}-${def.id}` }));

// Old installed manifests can still request these IDs after upgrading.
const aliases = {};
for (const [slug, movie, tv] of [['aksiyon', '28|12', '10759'], ['komedi', '35', '35'], ['gerilim', '27|53', '9648'], ['suc', '80', '80'], ['romantik', '10749', '18']]) {
  for (const [suffix, type, genre] of [['film', 'movie', movie], ['dizi', 'series', tv]]) aliases[`tr-${slug}-${suffix}`] = { type, mode: 'discover', params: { with_genres: genre, sort_by: 'popularity.desc' } };
}
aliases['tr-blutv-dizi'] = definitions.find(d => d.id === 'tr-hbomax-dizi');

function createCatalogService({ apiKey, fetcher = fetch, now = () => new Date(), requestTimeoutMs = 20000 } = {}) {
  const manifest = {
    id: 'tr.nuvio.tmdb.katalog', version: '16.0.0', name: 'TV+ Keşif',
    description: 'Türkiye platformlarında yeni çıkanlar, popüler yerli yapımlar ve öne çıkan filmler ile diziler. Türkçe bilgiler, IMDb kimlikleri.',
    logo: 'https://tv-plus-wine.vercel.app/logo.svg', resources: ['catalog'], types: ['movie', 'series'], idPrefixes: ['tt'],
    catalogs: published.map(({ id, type, name, extra }) => ({ id, type, name, extra, pageSize: 20 })),
    behaviorHints: { adult: false, p2p: false, configurable: false }
  };
  const cache = new Map(), pending = new Map(), lists = new Map();
  const queue = []; let active = 0;
  function waitFor(promise, signal) {
    signal.throwIfAborted();
    return new Promise((resolve, reject) => {
      const abort = () => reject(signal.reason);
      signal.addEventListener('abort', abort, { once: true });
      promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
    });
  }
  async function limited(fn, signal) {
    signal.throwIfAborted();
    if (active >= 8) {
      await new Promise((resolve, reject) => {
        const ticket = () => { signal.removeEventListener('abort', abort); resolve(); };
        const abort = () => { const index = queue.indexOf(ticket); if (index >= 0) queue.splice(index, 1); reject(signal.reason); };
        signal.addEventListener('abort', abort, { once: true }); queue.push(ticket);
      });
    } else active++;
    try { signal.throwIfAborted(); return await fn(); }
    finally { if (queue.length) queue.shift()(); else active--; }
  }
  async function get(path, params = {}, signal) {
    signal.throwIfAborted();
    if (!apiKey) throw new Error('TMDB API key missing');
    const query = new URLSearchParams({ language: 'tr-TR', ...params });
    const key = `${path}?${query}`;
    const hit = cache.get(key);
    if (hit && hit.until > Date.now()) return hit.data;
    if (pending.has(key)) return waitFor(pending.get(key), signal);
    const task = limited(async () => {
      const url = `https://api.themoviedb.org/3${path}?${query}&api_key=${encodeURIComponent(apiKey)}`;
      let response;
      for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetcher(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(6000)]) });
        if (response.ok || ![429, 502, 503, 504].includes(response.status) || attempt) break;
        await waitFor(new Promise(resolve => setTimeout(resolve, 300)), signal);
      }
      if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
      const data = await response.json(); signal.throwIfAborted();
      if (data.success === false) throw new Error('TMDB returned an error');
      if (cache.size >= 3000) cache.delete(cache.keys().next().value);
      cache.set(key, { data, until: Date.now() + (path.includes('external_ids') ? 86400000 : 1800000) });
      return data;
    }, signal);
    pending.set(key, task);
    try { return await task; } finally { pending.delete(key); }
  }
  function requestFor(def, extras) {
    const tmdbType = def.type === 'movie' ? 'movie' : 'tv';
    const date = now().toISOString().slice(0, 10);
    const params = { include_adult: 'false', ...def.params };
    let path = `/discover/${tmdbType}`;
    if (def.mode === 'trending') path = `/trending/${tmdbType}/week`;
    if (def.mode === 'search') { path = `/search/${tmdbType}`; params.query = extras.search.trim().slice(0, 200); }
    if (def.mode === 'latest') {
      const since = new Date(now()); since.setUTCFullYear(since.getUTCFullYear() - 1);
      Object.assign(params, tmdbType === 'movie'
        ? { sort_by: 'primary_release_date.desc', 'primary_release_date.lte': date, 'primary_release_date.gte': since.toISOString().slice(0, 10) }
        : { sort_by: 'first_air_date.desc', 'first_air_date.lte': date, 'first_air_date.gte': since.toISOString().slice(0, 10) });
    } else if (def.mode === 'discover') params[tmdbType === 'movie' ? 'primary_release_date.lte' : 'first_air_date.lte'] = date;
    if (extras.genre && extras.genre !== 'Tümü') params.with_genres = GENRES[def.type][extras.genre];
    return { path, params, tmdbType };
  }
  async function toMeta(item, type, tmdbType, signal) {
    if (item.adult || !item.poster_path || !(item.title || item.name)) return null;
    const external = await get(`/${tmdbType}/${item.id}/external_ids`, {}, signal);
    if (!/^tt\d+$/.test(external.imdb_id || '')) return null;
    return {
      id: external.imdb_id, type, name: item.title || item.name, poster: `${IMAGE}w500${item.poster_path}`, posterShape: 'poster',
      ...(item.backdrop_path ? { background: `${IMAGE}w1280${item.backdrop_path}` } : {}),
      description: item.overview || 'Bu yapım için henüz Türkçe açıklama bulunmuyor.',
      releaseInfo: (item.release_date || item.first_air_date || '').slice(0, 4)
    };
  }
  async function catalog(type, id, extras = {}) {
    const def = published.find(d => d.id === id) || definitions.find(d => d.id === id) || aliases[id];
    const skip = Number(extras.skip || 0);
    if (!def || def.type !== type || !Number.isInteger(skip) || skip < 0 || skip >= MAX_RESULTS) return { metas: [] };
    if (def.mode === 'search' && !extras.search?.trim()) return { metas: [] };
    if (extras.genre && !Object.hasOwn(GENRES[type], extras.genre)) return { metas: [] };
    const signal = AbortSignal.timeout(requestTimeoutMs);
    const { path, params, tmdbType } = requestFor(def, extras);
    const listKey = JSON.stringify([type, path, params]);
    let list = lists.get(listKey);
    if (!list || list.until < Date.now()) {
      if (lists.size >= 80) lists.delete(lists.keys().next().value);
      list = { metas: [], seen: new Set(), page: 1, done: false, until: Date.now() + 1800000, lock: Promise.resolve() };
      lists.set(listKey, list);
    }
    // Build a stable sequence of playable IMDb entries. Missing IDs never shift offsets.
    const task = list.lock.catch(() => {}).then(async () => {
      signal.throwIfAborted();
      while (list.metas.length < skip + 20 && !list.done) {
        signal.throwIfAborted();
        const data = await get(path, { ...params, page: list.page }, signal);
        const items = data.results || [];
        const metas = await Promise.all(items.map(item => toMeta(item, type, tmdbType, signal)));
        for (const meta of metas) if (meta && !list.seen.has(meta.id)) { list.seen.add(meta.id); list.metas.push(meta); }
        list.done = !items.length || list.page >= Math.min(data.total_pages || 1, MAX_SOURCE_PAGES) || list.metas.length >= MAX_RESULTS;
        list.page++;
      }
      return { metas: list.metas.slice(skip, Math.min(skip + 20, MAX_RESULTS)) };
    });
    list.lock = task;
    return waitFor(task, signal);
  }
  return { manifest, catalog };
}

module.exports = { createCatalogService };
