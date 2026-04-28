const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const TMDB_KEY = "d70e71b5626dc4d6535bc6d7ad1ea0a8";
const TMDB = "https://api.themoviedb.org/3";

const manifest = {
  id: "tr.nuvio.tmdb.katalog",
  version: "3.0.0",
  name: "🇹🇷 Türkiye Kataloğu (Canlı)",
  description: "TMDB ile gerçek zamanlı — Netflix, Amazon, Disney+, HBO Max, Exxen, Gain, Mubi",
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

// TMDB provider ID'leri (TR)
const PROVIDERS = {
  netflix:  8,
  amazon:   9,
  disney:   337,
  hbomax:   1899,
  exxen:    631,
  gain:     651,
  mubi:     11,
};

// Basit önbellek — aynı isteği tekrar tekrar TMDB'ye atmamak için
const cache = {};
const CACHE_TTL = 60 * 60 * 1000; // 1 saat

async function tmdbFetch(path) {
  const now = Date.now();
  if (cache[path] && now - cache[path].time < CACHE_TTL) {
    return cache[path].data;
  }
  const res = await fetch(`${TMDB}${path}`);
  const data = await res.json();
  cache[path] = { data, time: now };
  return data;
}

// TMDB ID → IMDB ID çevirici
async function getImdbId(tmdbId, mediaType) {
  try {
    const data = await tmdbFetch(`/${mediaType}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`);
    return data.imdb_id || null;
  } catch {
    return null;
  }
}

// TMDB sonuçlarını Stremio meta formatına çevir
async function toMetas(results, mediaType) {
  const metas = [];
  for (const item of results.slice(0, 20)) {
    const imdbId = await getImdbId(item.id, mediaType);
    if (!imdbId) continue;
    metas.push({
      id: imdbId,
      type: mediaType === "tv" ? "series" : "movie",
      name: item.title || item.name,
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : `https://images.metahub.space/poster/medium/${imdbId}/img`,
      background: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : undefined,
      description: item.overview,
      releaseInfo: (item.release_date || item.first_air_date || "").substring(0, 4),
    });
  }
  return metas;
}

// Katalog → TMDB endpoint eşleşmeleri
async function fetchCatalog(catalogId) {
  const base = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;

  switch (catalogId) {

    case "tr-pop-film":
      return toMetas((await tmdbFetch(`/movie/popular${base}`)).results || [], "movie");

    case "tr-pop-dizi":
      return toMetas((await tmdbFetch(`/tv/popular${base}`)).results || [], "tv");

    case "tr-trend-film":
      return toMetas((await tmdbFetch(`/trending/movie/week${base}`)).results || [], "movie");

    case "tr-trend-dizi":
      return toMetas((await tmdbFetch(`/trending/tv/week${base}`)).results || [], "tv");

    case "tr-turk-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-turk-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_original_language=tr&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-netflix-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.netflix}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-netflix-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_watch_providers=${PROVIDERS.netflix}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-amazon-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.amazon}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-amazon-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_watch_providers=${PROVIDERS.amazon}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-disney-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.disney}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-disney-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_watch_providers=${PROVIDERS.disney}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-hbomax-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.hbomax}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-hbomax-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_watch_providers=${PROVIDERS.hbomax}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-exxen-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.exxen}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-exxen-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_watch_providers=${PROVIDERS.exxen}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-gain-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.gain}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    case "tr-gain-dizi":
      return toMetas(
        (await tmdbFetch(`/discover/tv${base}&with_watch_providers=${PROVIDERS.gain}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "tv"
      );

    case "tr-mubi-film":
      return toMetas(
        (await tmdbFetch(`/discover/movie${base}&with_watch_providers=${PROVIDERS.mubi}&watch_region=TR&sort_by=popularity.desc`)).results || [],
        "movie"
      );

    default:
      return [];
  }
}

// ─── ADDON ───────────────────────────────────────────────────────────────────
const builder = new addonBuilder(manifest);

builder.defineCatalogHandler(async ({ type, id }) => {
  try {
    const metas = await fetchCatalog(id);
    return { metas };
  } catch (err) {
    console.error("Katalog hatası:", id, err.message);
    return { metas: [] };
  }
});

const PORT = process.env.PORT || 7777;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`🇹🇷 Türkiye Kataloğu çalışıyor → http://localhost:${PORT}/manifest.json`);
