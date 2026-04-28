const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const TMDB_KEY = "d70e71b5626dc4d6535bc6d7ad1ea0a8";
const TMDB = "https://api.themoviedb.org/3";

const manifest = {
  id: "tr.nuvio.tmdb.katalog",
  version: "6.0.0",
  name: "🇹🇷 Türkiye Kataloğu",
  description: "TMDB canlı veri — Netflix, Amazon, Disney+, HBO Max, Exxen, Gain, Mubi",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/320px-Flag_of_Turkey.svg.png",
  resources: ["catalog"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [
    { id: "tr-pop-film",     type: "movie",  name: "🇹🇷 Türkiye — Popüler Filmler" },
    { id: "tr-pop-dizi",     type: "series", name: "🇹🇷 Türkiye — Popüler Diziler" },
    { id: "tr-trend-film",   type: "movie",  name: "🔥 Trend Filmler" },
    { id: "tr-trend-dizi",   type: "series", name: "🔥 Trend Diziler" },
    { id: "tr-turk-film",    type: "movie",  name: "🎬 Türk Filmleri" },
    { id: "tr-turk-dizi",    type: "series", name: "📺 Türk Dizileri" },
    { id: "tr-netflix-film", type: "movie",  name: "🔴 Netflix TR — Filmler" },
    { id: "tr-netflix-dizi", type: "series", name: "🔴 Netflix TR — Diziler" },
    { id: "tr-amazon-film",  type: "movie",  name: "🟠 Amazon Prime TR — Filmler" },
    { id: "tr-amazon-dizi",  type: "series", name: "🟠 Amazon Prime TR — Diziler" },
    { id: "tr-disney-film",  type: "movie",  name: "🔵 Disney+ TR — Filmler" },
    { id: "tr-disney-dizi",  type: "series", name: "🔵 Disney+ TR — Diziler" },
    { id: "tr-hbomax-film",  type: "movie",  name: "🟣 HBO Max TR — Filmler" },
    { id: "tr-hbomax-dizi",  type: "series", name: "🟣 HBO Max TR — Diziler" },
    { id: "tr-exxen-film",   type: "movie",  name: "⚡ Exxen — Filmler" },
    { id: "tr-exxen-dizi",   type: "series", name: "⚡ Exxen — Diziler" },
    { id: "tr-gain-film",    type: "movie",  name: "🟢 Gain — Filmler" },
    { id: "tr-gain-dizi",    type: "series", name: "🟢 Gain — Diziler" },
    { id: "tr-mubi-film",    type: "movie",  name: "🎞️ Mubi — Filmler" },
  ],
  behaviorHints: { adult: false, p2p: false }
};

// Watch Provider ID'leri
const PROVIDER = {
  netflix:  8,
  amazon:   9,    // Amazon Prime Video
  amazon2:  119,  // Amazon Prime Video (alternatif)
  disney:   337,
  hbomax:   1899,
  mubi:     11,
};

// Network ID'leri
const NETWORK = {
  exxen: 4405,
  gain:  4585,
};

// Önbellek - 1 saat
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
  for (const item of (results || []).slice(0, 20)) {
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

// Amazon için her iki ID'yi dene, hangisi dolu gelirse onu kullan
async function amazonFetch(tmdbType) {
  const base = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;
  const endpoint = tmdbType === "movie" ? "movie" : "tv";
  
  const r1 = await tmdbGet(`/discover/${endpoint}${base}&with_watch_providers=${PROVIDER.amazon}&watch_region=TR&sort_by=popularity.desc`);
  if (r1.results && r1.results.length > 0) return toMetas(r1.results, tmdbType);
  
  const r2 = await tmdbGet(`/discover/${endpoint}${base}&with_watch_providers=${PROVIDER.amazon2}&watch_region=TR&sort_by=popularity.desc`);
  return toMetas(r2.results || [], tmdbType);
}

const base = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;

async function fetchCatalog(id) {
  switch (id) {

    case "tr-pop-film":
      return toMetas((await tmdbGet(`/movie/popular${base}`)).results, "movie");

    case "tr-pop-dizi":
      return toMetas((await tmdbGet(`/tv/popular${base}`)).results, "tv");

    case "tr-trend-film":
      return toMetas((await tmdbGet(`/trending/movie/week${base}`)).results, "movie");

    case "tr-trend-dizi":
      return toMetas((await tmdbGet(`/trending/tv/week${base}`)).results, "tv");

    case "tr-turk-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc`)).results,
        "movie"
      );

    case "tr-turk-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_original_language=tr&sort_by=popularity.desc`)).results,
        "tv"
      );

    case "tr-netflix-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.netflix}&watch_region=TR&sort_by=popularity.desc`)).results,
        "movie"
      );

    case "tr-netflix-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${PROVIDER.netflix}&watch_region=TR&sort_by=popularity.desc`)).results,
        "tv"
      );

    // Amazon — her iki ID'yi dene
    case "tr-amazon-film":
      return amazonFetch("movie");

    case "tr-amazon-dizi":
      return amazonFetch("tv");

    case "tr-disney-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.disney}&watch_region=TR&sort_by=popularity.desc`)).results,
        "movie"
      );

    case "tr-disney-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${PROVIDER.disney}&watch_region=TR&sort_by=popularity.desc`)).results,
        "tv"
      );

    case "tr-hbomax-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.hbomax}&watch_region=TR&sort_by=popularity.desc`)).results,
        "movie"
      );

    case "tr-hbomax-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${PROVIDER.hbomax}&watch_region=TR&sort_by=popularity.desc`)).results,
        "tv"
      );

    case "tr-exxen-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_networks=${NETWORK.exxen}&sort_by=popularity.desc`)).results,
        "tv"
      );

    case "tr-exxen-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc&vote_count.gte=50`)).results,
        "movie"
      );

    case "tr-gain-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_networks=${NETWORK.gain}&sort_by=popularity.desc`)).results,
        "tv"
      );

    case "tr-gain-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=vote_average.desc&vote_count.gte=100`)).results,
        "movie"
      );

    case "tr-mubi-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${PROVIDER.mubi}&watch_region=TR&sort_by=popularity.desc`)).results,
        "movie"
      );

    default:
      return [];
  }
}

const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id }) => {
  try {
    const metas = await fetchCatalog(id);
    return { metas };
  } catch (err) {
    console.error("Hata:", id, err.message);
    return { metas: [] };
  }
});

const PORT = process.env.PORT || 7777;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`🇹🇷 Çalışıyor → http://localhost:${PORT}/manifest.json`);
