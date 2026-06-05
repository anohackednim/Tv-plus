const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const TMDB_KEY = "d70e71b5626dc4d6535bc6d7ad1ea0a8";
const TMDB = "https://api.themoviedb.org/3";

const manifest = {
  id: "tr.nuvio.tmdb.katalog",
  version: "10.0.0",
  name: "Yahya Veysel Aydoğan",
  description: "Kişisel Türkiye Kataloğu — Güncel, Kalite, Platform ve Tür bazlı tam katalog",
  logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/320px-Flag_of_Turkey.svg.png",
  resources: ["catalog"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: [
    // ── GÜNCEL ──
    { id: "top10-film",       type: "movie",  name: "🔟 Günün TOP 10 Filmi",                   extra: [{ name: "skip", isRequired: false }] },
    { id: "top10-dizi",       type: "series", name: "🔟 Günün TOP 10 Dizisi",                  extra: [{ name: "skip", isRequired: false }] },
    { id: "bu-hafta",         type: "movie",  name: "🆕 Bu Hafta Çıkanlar — Filmler",           extra: [{ name: "skip", isRequired: false }] },
    { id: "bu-hafta-dizi",    type: "series", name: "🆕 Bu Hafta Çıkanlar — Diziler",           extra: [{ name: "skip", isRequired: false }] },

    // ── KALİTE ──
    { id: "oscar",            type: "movie",  name: "🏆 Zarfı Açıyoruz: Oscar Ödüllüler",      extra: [{ name: "skip", isRequired: false }] },
    { id: "imdb7-film",       type: "movie",  name: "⭐ IMDb 7+ Filmler",                       extra: [{ name: "skip", isRequired: false }] },
    { id: "imdb7-dizi",       type: "series", name: "⭐ IMDb 7+ Diziler",                       extra: [{ name: "skip", isRequired: false }] },
    { id: "festival",         type: "movie",  name: "🎭 Festivallerin Gözdesi",                 extra: [{ name: "skip", isRequired: false }] },
    { id: "gizli-mucevher",   type: "movie",  name: "💎 Gizli Kalmış Mücevherler",              extra: [{ name: "skip", isRequired: false }] },

    // ── PLATFORMLAR ──
    { id: "netflix-film",     type: "movie",  name: "🔴 Netflix — Filmler",                    extra: [{ name: "skip", isRequired: false }] },
    { id: "netflix-dizi",     type: "series", name: "🔴 Netflix — Diziler",                    extra: [{ name: "skip", isRequired: false }] },
    { id: "amazon-film",      type: "movie",  name: "🟠 Amazon Prime — Filmler",               extra: [{ name: "skip", isRequired: false }] },
    { id: "amazon-dizi",      type: "series", name: "🟠 Amazon Prime — Diziler",               extra: [{ name: "skip", isRequired: false }] },
    { id: "disney-film",      type: "movie",  name: "🔵 Disney+ — Filmler",                    extra: [{ name: "skip", isRequired: false }] },
    { id: "disney-dizi",      type: "series", name: "🔵 Disney+ — Diziler",                    extra: [{ name: "skip", isRequired: false }] },
    { id: "hbomax-film",      type: "movie",  name: "🟣 HBO Max — Filmler",                    extra: [{ name: "skip", isRequired: false }] },
    { id: "hbomax-dizi",      type: "series", name: "🟣 HBO Max — Diziler",                    extra: [{ name: "skip", isRequired: false }] },
    { id: "exxen-dizi",       type: "series", name: "⚡ Exxen — Diziler",                      extra: [{ name: "skip", isRequired: false }] },
    { id: "exxen-film",       type: "movie",  name: "⚡ Exxen — Filmler",                      extra: [{ name: "skip", isRequired: false }] },
    { id: "gain-dizi",        type: "series", name: "🟢 Gain — Diziler",                       extra: [{ name: "skip", isRequired: false }] },
    { id: "gain-film",        type: "movie",  name: "🟢 Gain — Filmler",                       extra: [{ name: "skip", isRequired: false }] },
    { id: "mubi-film",        type: "movie",  name: "🎞️ Mubi — Filmler",                      extra: [{ name: "skip", isRequired: false }] },
    { id: "puhutv-dizi",      type: "series", name: "🟡 PuhuTV — Diziler",                     extra: [{ name: "skip", isRequired: false }] },
    { id: "tod-dizi",         type: "series", name: "📺 TOD TV — Diziler",                     extra: [{ name: "skip", isRequired: false }] },

    // ── TÜRLER ──
    { id: "gerilim-korku",    type: "movie",  name: "😱 Gerilim ve Korku Seansı",              extra: [{ name: "skip", isRequired: false }] },
    { id: "gercek-hayat",     type: "movie",  name: "📰 Gerçek Hayatın İzleri",                extra: [{ name: "skip", isRequired: false }] },
    { id: "akil-oyunlari",    type: "movie",  name: "🌀 Akıl Oyunları",                        extra: [{ name: "skip", isRequired: false }] },
    { id: "aglama-seansı",    type: "movie",  name: "😭 İyi Bir Ağlama Seansı",                extra: [{ name: "skip", isRequired: false }] },
    { id: "tek-oturum",       type: "movie",  name: "⏱️ Tek Oturuşta Biter",                  extra: [{ name: "skip", isRequired: false }] },
    { id: "kore-dizi",        type: "series", name: "🇰🇷 Kore Dizileri",                       extra: [{ name: "skip", isRequired: false }] },
    { id: "dunya-sinemasi",   type: "movie",  name: "🌍 Dünya Sineması",                       extra: [{ name: "skip", isRequired: false }] },
    { id: "animasyon",        type: "movie",  name: "🎨 Animasyon",                            extra: [{ name: "skip", isRequired: false }] },
    { id: "bilim-kurgu",      type: "movie",  name: "🚀 Bilim Kurgu & Fantezi",                extra: [{ name: "skip", isRequired: false }] },
    { id: "suc-gizem",        type: "movie",  name: "🕵️ Suç & Gizem",                         extra: [{ name: "skip", isRequired: false }] },
    { id: "aksiyon",          type: "movie",  name: "💥 Aksiyon & Macera",                     extra: [{ name: "skip", isRequired: false }] },
  ],
  behaviorHints: { adult: false, p2p: false }
};

// ── PROVIDER ID'LERİ ──────────────────────────────────────────────────────────
const P = {
  netflix:  8,
  amazon:   9,
  amazon2:  119,
  disney:   337,
  hbomax:   1899,
  mubi:     11,
  puhutv:   149,
  tod:      475,
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

function today() {
  return new Date().toISOString().slice(0, 10);
}

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

const base = `?api_key=${TMDB_KEY}&language=tr-TR&region=TR`;

async function fetchCatalog(id, skip) {
  const pg = page(skip);

  switch (id) {

    // ── GÜNCEL (yeni → eski) ──
    case "top10-film":
      return toMetas((await tmdbGet(`/trending/movie/day${base}&page=${pg}`)).results, "movie");

    case "top10-dizi":
      return toMetas((await tmdbGet(`/trending/tv/day${base}&page=${pg}`)).results, "tv");

    case "bu-hafta":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&sort_by=release_date.desc&release_date.lte=${today()}&release_date.gte=${weeksAgo(1)}&page=${pg}`)).results,
        "movie"
      );

    case "bu-hafta-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&sort_by=first_air_date.desc&first_air_date.lte=${today()}&first_air_date.gte=${weeksAgo(1)}&page=${pg}`)).results,
        "tv"
      );

    // ── KALİTE (popülerlik) ──
    case "oscar":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_awards=true&sort_by=vote_average.desc&vote_count.gte=1000&page=${pg}`)).results,
        "movie"
      );

    case "imdb7-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&vote_average.gte=7&vote_count.gte=1000&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "imdb7-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&vote_average.gte=7&vote_count.gte=500&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "festival":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&vote_average.gte=7.5&vote_count.gte=500&with_original_language=fr|de|it|es|ja|ko&sort_by=vote_average.desc&page=${pg}`)).results,
        "movie"
      );

    case "gizli-mucevher":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&vote_average.gte=7.5&vote_count.gte=100&vote_count.lte=5000&sort_by=vote_average.desc&page=${pg}`)).results,
        "movie"
      );

    // ── PLATFORMLAR ──
    case "netflix-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.netflix}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "netflix-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.netflix}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "amazon-film":
      return toMetas(await amazonGet("movie", pg), "movie");

    case "amazon-dizi":
      return toMetas(await amazonGet("tv", pg), "tv");

    case "disney-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.disney}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "disney-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.disney}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "hbomax-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.hbomax}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "hbomax-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.hbomax}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "exxen-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_networks=${NET.exxen}&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "exxen-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc&vote_count.gte=50&page=${pg}`)).results,
        "movie"
      );

    case "gain-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_networks=${NET.gain}&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "gain-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=tr&sort_by=popularity.desc&vote_count.gte=100&page=${pg}`)).results,
        "movie"
      );

    case "mubi-film":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_watch_providers=${P.mubi}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "puhutv-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.puhutv}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "tod-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_watch_providers=${P.tod}&watch_region=TR&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    // ── TÜRLER ──
    case "gerilim-korku":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=27,53&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "gercek-hayat":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=99,36&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "akil-oyunlari":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=9648,53&sort_by=vote_average.desc&vote_count.gte=500&page=${pg}`)).results,
        "movie"
      );

    case "aglama-seansı":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=18,10749&sort_by=vote_average.desc&vote_count.gte=500&page=${pg}`)).results,
        "movie"
      );

    case "tek-oturum":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_runtime.lte=95&vote_average.gte=7&vote_count.gte=500&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "kore-dizi":
      return toMetas(
        (await tmdbGet(`/discover/tv${base}&with_original_language=ko&sort_by=popularity.desc&page=${pg}`)).results,
        "tv"
      );

    case "dunya-sinemasi":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_original_language=fr|de|it|es|ja|ko|pt&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "animasyon":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=16&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "bilim-kurgu":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=878,14&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "suc-gizem":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=80,9648&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    case "aksiyon":
      return toMetas(
        (await tmdbGet(`/discover/movie${base}&with_genres=28,12&sort_by=popularity.desc&page=${pg}`)).results,
        "movie"
      );

    default:
      return [];
  }
}

// ── ADDON ─────────────────────────────────────────────────────────────────────
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
console.log(`✨ Yahya Veysel Aydoğan → http://localhost:${PORT}/manifest.json`);
