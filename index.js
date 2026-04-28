const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const TMDB_KEY = "d70e71b5626dc4d6535bc6d7ad1ea0a8";
const TMDB = "https://api.themoviedb.org/3";

const manifest = {
  id: "tr.nuvio.tmdb.katalog",
  version: "8.0.0",
  name: "🇹🇷 Türkiye Kataloğu",
  description: "TMDB canlı veri — Netflix, Amazon, Disney+, HBO Max, Exxen, Gain, Mubi",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/320px-Flag_of_Turkey.svg.png",
  resources: ["catalog"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [
    { id: "tr-pop-film",     type: "movie",  name: "🇹🇷 Türkiye — Popüler Filmler",   extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-pop-dizi",     type: "series", name: "🇹🇷 Türkiye — Popüler Diziler",   extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-trend-film",   type: "movie",  name: "🔥 Trend Filmler",                extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-trend-dizi",   type: "series", name: "🔥 Trend Diziler",                extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-turk-film",    type: "movie",  name: "🎬 Türk Filmleri",                extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-turk-dizi",    type: "series", name: "📺 Türk Dizileri",                extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-netflix-film", type: "movie",  name: "🔴 Netflix TR — Filmler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-netflix-dizi", type: "series", name: "🔴 Netflix TR — Diziler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-amazon-film",  type: "movie",  name: "🟠 Amazon Prime TR — Filmler",    extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-amazon-dizi",  type: "series", name: "🟠 Amazon Prime TR — Diziler",    extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-disney-film",  type: "movie",  name: "🔵 Disney+ TR — Filmler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-disney-dizi",  type: "series", name: "🔵 Disney+ TR — Diziler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-hbomax-film",  type: "movie",  name: "🟣 HBO Max TR — Filmler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-hbomax-dizi",  type: "series", name: "🟣 HBO Max TR — Diziler",         extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-exxen-film",   type: "movie",  name: "⚡ Exxen — Filmler",              extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-exxen-dizi",   type: "series", name: "⚡ Exxen — Diziler",              extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-gain-film",    type: "movie",  name: "🟢 Gain — Filmler",               extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-gain-dizi",    type: "series", name: "🟢 Gain — Diziler",               extra: [{ name: "skip", isRequired: false }] },
    { id: "tr-mubi-film",    type: "movie",  name: "🎞️ Mubi — Filmler",              extra: [{ name: "skip", isRequired: false }] },
  ],
  behaviorHints: { adult: false, p2p: false }
};

const PROVIDER = {
  netflix:  8,
  amazon:   9,
  amazon2:  119,
  disney:   337,
  hbomax:   1899,
  mubi:     11,
};

const NETWORK = {
  exxen: 4405,
  gain:  4585,
};

// Önbellek
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

async function imdb(tmdbId, type) {
  try {
    const d = await tmdbGet(`/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
    return d.imdb_id || null;
  } catch { return null; }
}

async function toMetas(results, tmdbType) {
  const metas = [];
  for (const item of (results || [])) {
    const imdbId = await imdb(item.id, tmdbType);
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
    });
  }
  return metas;
}

// skip → TMDB sayfa numarası (her sayfada 20 içerik)
function page(skip) {
  return Math.floor((parseInt(skip) || 0) / 20) + 1;
}

// Amazon için her iki ID'yi dene
async function amazonResults(tmdbType, pg) {
  const b = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;
  const ep = tmdbType === "movie" ? "movie" : "tv";
  const r1 = await tmdbGet(`/discover/${ep}${b}&with_watch_providers=${PROVIDER.amazon}&watch_region=TR&sort_by=popularity.desc&page=${pg}`);
  if (r1.results && r1.results.length > 0) return r1.results;
  const r2 = await tmdbGet(`/discover/${ep}${b}&with_watch_providers=${PROVIDER.amazon2}&watch_region=TR&sort_by=popularity.desc&page=${pg}`);
  return r2.results || [];
}

const base = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;

async function fetchCatalog(id, skip) {
  const pg = page(skip);

  switch (id) {

    case "tr-pop-film":
      return toMetas((await tmdbGet(`/movie/popular${base}&page=${pg}`)).results, "movie");

    case "tr-pop-dizi":
      return toMetas((await tmdbGet(`/tv/popular${base}&page=${pg}`)).results, "tv");

    case "tr-trend-film":
      return toMetas((await tmdbGet(`/trending/movie/week${base}&page=${pg}`)).results, "movie");

    case "tr-trend-dizi":
      return toMetas((await tmdbGet(`/trending/tv/week${base}&page=${pg}`)).results, "tv");

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

    case "tr-netflix-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.netflix}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "tr-netflix-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${PROVIDER.netflix}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "tr-amazon-film":
      return toMetas(await amazonResults("movie", pg), "movie");

    case "tr-amazon-dizi":
      return toMetas(await amazonResults("tv", pg), "tv");

    case "tr-disney-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.disney}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "tr-disney-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${PROVIDER.disney}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "tr-hbomax-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.hbomax}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "tr-hbomax-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${PROVIDER.hbomax}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "tr-exxen-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_networks=${NETWORK.exxen}&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "tr-exxen-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc&vote_count.gte=50&page=${pg}`)).results,
        "movie"
      );

    case "tr-gain-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_networks=${NETWORK.gain}&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "tr-gain-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc&vote_count.gte=100&page=${pg}`)).results,
        "movie"
      );

    case "tr-mubi-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.mubi}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    default:
      return [];
  }
}

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id, extra }) => {
  try {
    const skip = extra?.skip || 0;
    const metas = await fetchCatalog(id, skip);
    return { metas };
  } catch (err) {
    console.error("Hata:", id, err.message);
    return { metas: [] };
  }
});

const PORT = process.env.PORT || 7777;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`🇹🇷 Çalışıyor → http://localhost:${PORT}/manifest.json`);
