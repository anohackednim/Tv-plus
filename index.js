const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const TMDB_KEY = "d70e71b5626dc4d6535bc6d7ad1ea0a8";
const TMDB = "https://api.themoviedb.org/3";

const manifest = {
  id: "tr.nuvio.tmdb.katalog",
  version: "11.0.0",
  name: "Yahya Veysel Aydoğan",
  description: "Kişisel Türkiye Kataloğu — yeniden eskiye, kategori bitene kadar",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/320px-Flag_of_Turkey.svg.png",
  resources: ["catalog"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [
    // ── ARAMA ──
    { id: "tr-search-film", type: "movie",  name: "🔍 Ara — Filmler", extra: [{ name: "search", isRequired: true }] },
    { id: "tr-search-dizi", type: "series", name: "🔍 Ara — Diziler", extra: [{ name: "search", isRequired: true }] },

    // ── GÜNCEL ──
    { id: "tr-yeni-film",   type: "movie",  name: "🆕 Yeni Filmler",  extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-yeni-dizi",   type: "series", name: "🆕 Yeni Diziler",  extra: [{ name: "skip", isRequired: false }] },

    // ── TÜRK ──
    { id: "tr-turk-film",   type: "movie",  name: "🇹🇷 Türk Filmleri", extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-turk-dizi",   type: "series", name: "🇹🇷 Türk Dizileri", extra: [{ name: "skip", isRequired: false }] },

    // ── PLATFORMLAR ──
    { id: "tr-netflix-film",  type: "movie",  name: "🔴 Netflix — Filmler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-netflix-dizi",  type: "series", name: "🔴 Netflix — Diziler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-amazon-film",   type: "movie",  name: "🟠 Prime Video — Filmler",   extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-amazon-dizi",   type: "series", name: "🟠 Prime Video — Diziler",   extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-disney-film",   type: "movie",  name: "🔵 Disney+ — Filmler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-disney-dizi",   type: "series", name: "🔵 Disney+ — Diziler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-hbomax-film",   type: "movie",  name: "🟣 Max — Filmler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-hbomax-dizi",   type: "series", name: "🟣 Max — Diziler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-exxen-dizi",    type: "series", name: "⚡ Exxen — Diziler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-gain-dizi",     type: "series", name: "🟢 Gain — Diziler",          extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-tabii-dizi",    type: "series", name: "🌙 tabii — Diziler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-puhu-dizi",     type: "series", name: "🟡 puhutv — Diziler",        extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-tod-film",      type: "movie",  name: "📺 TOD — Filmler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-tod-dizi",      type: "series", name: "📺 TOD — Diziler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-tvplus-film",   type: "movie",  name: "📡 TV+ — Filmler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-tvplus-dizi",   type: "series", name: "📡 TV+ — Diziler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-blutv-dizi",    type: "series", name: "🔷 BluTV — Diziler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-mubi-film",     type: "movie",  name: "🎞️ Mubi — Filmler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-crunchy-dizi",  type: "series", name: "🟠 Crunchyroll",             extra: [{ name: "skip", isRequired: false }] },

    // ── TÜRLER ──
    { id: "tr-aksiyon-film",  type: "movie",  name: "💥 Aksiyon — Filmler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-aksiyon-dizi",  type: "series", name: "💥 Aksiyon — Diziler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-komedi-film",   type: "movie",  name: "😂 Komedi — Filmler",        extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-komedi-dizi",   type: "series", name: "😂 Komedi — Diziler",        extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-gerilim-film",  type: "movie",  name: "😱 Gerilim — Filmler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-gerilim-dizi",  type: "series", name: "😱 Gerilim — Diziler",       extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-suc-film",      type: "movie",  name: "🕵️ Suç — Filmler",          extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-suc-dizi",      type: "series", name: "🕵️ Suç — Diziler",          extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-romantik-film", type: "movie",  name: "💕 Romantik — Filmler",      extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-romantik-dizi", type: "series", name: "💕 Romantik — Diziler",      extra: [{ name: "skip", isRequired: false }] },
  ],
  behaviorHints: { adult: false, p2p: false }
};

// ── PROVIDER ID'LERİ (TMDB/JustWatch TR) ─────────────────────────────────────
const P = {
  netflix:     8,
  amazon:      9,
  amazon2:     119,
  disney:      337,
  hbomax:      1899,
  exxen:       341,
  gain:        651,
  tabii:       1759,
  puhutv:      149,
  tod:         475,
  tvplus:      1754,
  blutv:       341,
  mubi:        11,
  crunchyroll: 283,
};

const NET = {
  exxen: 4405,
  gain:  4585,
};

// ── ÖNBELLEK ─────────────────────────────────────────────────────────────────
const cache = {};
const TTL = 60 * 60 * 1000;

async function tmdbGet(path) {
  const now = Date.now();
  if (cache[path] && now - cache[path].t < TTL) return cache[path].d;
  const res = await fetch(`${TMDB}${path}`);
  const data = await res.json();
  cache[path] = { d: data, t: now };
  return data;
}

async function getImdb(tmdbId, type) {
  try {
    const d = await tmdbGet(`/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
    return d.imdb_id || null;
  } catch { return null; }
}

async function toMetas(results, tmdbType) {
  const metas = [];
  for (const item of (results || [])) {
    const imdbId = await getImdb(item.id, tmdbType);
    if (!imdbId) continue;
    metas.push({
      id: imdbId,
      type: tmdbType === "tv" ? "series" : "movie",
      name: item.title || item.name,
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : `https://images.metahub.space/poster/medium/${imdbId}/img`,
      background: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : undefined,
      description: item.overview,
      releaseInfo: (item.release_date || item.first_air_date || "").slice(0, 4),
      imdbRating: item.vote_average ? item.vote_average.toFixed(1) : undefined,
    });
  }
  return metas;
}

function page(skip) {
  return Math.floor((parseInt(skip) || 0) / 20) + 1;
}

function today() { return new Date().toISOString().slice(0, 10); }
function weeksAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d.toISOString().slice(0, 10);
}

async function amazonGet(type, pg) {
  const b = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;
  const ep = type === "movie" ? "movie" : "tv";
  const r1 = await tmdbGet(`/discover/${ep}${b}&with_watch_providers=${P.amazon}&watch_region=TR&sort_by=popularity.desc&page=${pg}`);
  if (r1.results?.length > 0) return r1.results;
  const r2 = await tmdbGet(`/discover/${ep}${b}&with_watch_providers=${P.amazon2}&watch_region=TR&sort_by=popularity.desc&page=${pg}`);
  return r2.results || [];
}

// ── ARAMA ────────────────────────────────────────────────────────────────────
async function searchTMDB(query, tmdbType) {
  const ep = tmdbType === "movie" ? "movie" : "tv";
  const data = await tmdbGet(`/search/${ep}?api_key=${TMDB_KEY}&language=tr-TR&query=${encodeURIComponent(query)}&region=TR`);
  return toMetas(data.results || [], tmdbType);
}

const base = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;

async function fetchCatalog(id, skip, search) {
  const pg = page(skip);

  // ── ARAMA ──
  if (id === "tr-search-film") return searchTMDB(search, "movie");
  if (id === "tr-search-dizi") return searchTMDB(search, "tv");

  switch (id) {

    // ── GÜNCEL (yeni → eski) ──
    case "tr-yeni-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&sort_by=release_date.desc&release_date.lte=${today()}&release_date.gte=${weeksAgo(4)}&vote_count.gte=10&page=${pg}`)).results,
        "movie"
      );
    case "tr-yeni-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&sort_by=first_air_date.desc&first_air_date.lte=${today()}&first_air_date.gte=${weeksAgo(4)}&page=${pg}`)).results,
        "tv"
      );

    // ── TÜRK ──
    case "tr-turk-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );
    case "tr-turk-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_original_language=tr&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    // ── PLATFORMLAR ──
    case "tr-netflix-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.netflix}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-netflix-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.netflix}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-amazon-film":
      return toMetas(await amazonGet("movie", pg), "movie");
    case "tr-amazon-dizi":
      return toMetas(await amazonGet("tv", pg), "tv");

    case "tr-disney-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.disney}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-disney-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.disney}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-hbomax-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.hbomax}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-hbomax-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.hbomax}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-exxen-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_networks=${NET.exxen}&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-gain-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_networks=${NET.gain}&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-tabii-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.tabii}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-puhu-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.puhutv}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-tod-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.tod}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-tod-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.tod}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-tvplus-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.tvplus}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-tvplus-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.tvplus}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-blutv-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.blutv}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-mubi-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.mubi}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "movie");

    case "tr-crunchy-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.crunchyroll}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    // ── TÜRLER ──
    case "tr-aksiyon-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_genres=28,12&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-aksiyon-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_genres=10759&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-komedi-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_genres=35&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-komedi-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_genres=35&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-gerilim-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_genres=27,53&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-gerilim-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_genres=9648&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-suc-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_genres=80&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-suc-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_genres=80&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    case "tr-romantik-film":
      return toMetas((await tmdbGet(`/discover/movie${base}&with_genres=10749&sort_by=popularity.desc&page=${pg}`)).results, "movie");
    case "tr-romantik-dizi":
      return toMetas((await tmdbGet(`/discover/tv${base}&with_genres=10766&sort_by=popularity.desc&page=${pg}`)).results, "tv");

    default:
      return [];
  }
}

// ── ADDON ─────────────────────────────────────────────────────────────────────
const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  try {
    const skip = extra?.skip || 0;
    const search = extra?.search || "";
    const metas = await fetchCatalog(id, skip, search);
    return { metas };
  } catch (err) {
    console.error("Hata:", id, err.message);
    return { metas: [] };
  }
});

const PORT = process.env.PORT || 7777;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`✨ Yahya Veysel Aydoğan → http://localhost:${PORT}/manifest.json`);
