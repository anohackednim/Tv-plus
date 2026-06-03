const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// TMDB v4 Erişim Tokenı (Gönderdiğin Token)
const TMDB_TOKEN = "EyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNzBlNzFiNTYyNmRjNGQ2NTM1YmM2ZDdhZDFlYTBhOCIsIm5iZiI6MTc3MjQ5MDEzOC45NzEsInN1YiI6IjY5YTYwZDlhYjUzZDBhZmMwYTRmOWUxMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.vJiXbc8_5d8lPUMMu-4gOfqlfOUPJ9Juw-BKckXi3pA";

// CORS Ayarları (Korsan ve erişim engellerini aşmak için)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

// Kategorilerin Listesi
const categories = {
    mixed_popular_new: "Popüler - Karışık (Yeni)",
    popular_movies: "Popüler Filmler",
    popular_series: "Popüler Diziler",
    top_10_tr: "🇹🇷 Türkiye'de En İyi 10 (Canlı Veri)",
    best_comedy_movies: "En İyi Komedi Filmleri",
    dramatic_comedies: "Dramatik Komediler",
    k_dramas: "Kore Dizileri",
    animation: "Animasyon",
    stand_up: "Stand Up",
    best_crime_movies: "En İyi Suç Filmleri",
    zombies: "Zombiler",
    sports_dramas: "Spor Dramaları",
    best_action_adventure_series: "En İyi Aksiyon & Macera Dizileri",
    best_sci_fi_movies: "En İyi Bilim Kurgu Filmleri",
    made_in_europe_series: "En İyi Made in Europe Diziler",
    epic_fantasy: "Epik Fantezi",
    sci_fi_horror: "Bilim Kurgu Korku",
    steamy_action_comedy: "Müstehcen Aksiyon Komedi",
    holiday_rom_coms: "Tatil Romantik Komedileri",
    best_mystery_thriller_movies: "En İyi Gizem ve Gerilim Filmleri",
    true_crime_documentaries: "Gerçek Suç Belgeselleri",
    award_winning: "Ödüllü Yapımlar",
    teen_drama: "Gençlik Dizileri",
    timeless_classics: "Nostalji & Klasikler"
};

// TMDB'den veri çekmek için yardımcı fonksiyon (Harici kütüphane yüklememek için dahili fetch kullandık)
async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    // Varsayılan dil ve bölge ayarlarını Türkiye yapıyoruz
    url.searchParams.append('language', 'tr-TR');
    url.searchParams.append('region', 'TR');
    
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${TMDB_TOKEN}`,
            'accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`TMDB Hatası: ${response.statusText}`);
    }
    return await response.json();
}

// Veriyi Nuvio formatına dönüştüren fonksiyon
function formatData(results) {
    return results.map(item => ({
        id: item.id,
        title: item.title || item.name,
        overview: item.overview || "Bu yapım için henüz Türkçe özet eklenmemiş.",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
        backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null,
        type: item.media_type || (item.title ? 'movie' : 'tv'),
        release_date: item.release_date || item.first_air_date,
        rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 0
    }));
}

// Ana API Katalog Endpoint'i
app.get('/api/v1/catalog', async (req, res) => {
    try {
        // 1. Türkiye'de o an trend olan dizi ve filmleri (Karışık Popüler) anlık çekiyoruz
        const trendingData = await fetchFromTMDB('trending/all/day');
        const mixedPopular = formatData(trendingData.results);

        // 2. Sadece popüler olan filmleri Türkiye verisiyle çekiyoruz
        const movieData = await fetchFromTMDB('movie/popular');
        const popularMovies = formatData(movieData.results);

        // 3. Sadece popüler olan dizileri Türkiye verisiyle çekiyoruz
        const tvData = await fetchFromTMDB('tv/popular');
        const popularSeries = formatData(tvData.results);

        // 4. Türkiye Top 10 Listesi (Trend olanların ilk 10'u)
        const top10TR = mixedPopular.slice(0, 10).map((item, index) => ({
            rank: index + 1,
            ...item
        }));

        // Tüm veriyi birleştirip tek seferde dönüyoruz
        res.status(200).json({
            success: true,
            project: "Nuvio-v9 Live API",
            live_update_time: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
            categories: categories,
            content: {
                mixed_popular_new: mixedPopular,
                popular_movies: popularMovies,
                popular_series: popularSeries,
                top_10_tr: top10TR
                // Diğer kategoriler için de benzer şekilde fetchFromTMDB('discover/movie', { with_genres: '...' }) kullanılabilir.
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Anlık veriler çekilirken bir hata oluştu.",
            error: error.message
        });
    }
});

// Platformlar Listesi
app.get('/api/v1/platforms', (req, res) => {
    res.status(200).json({
        success: true,
        platforms: ["netflix", "blutv", "amazon_prime", "disney_plus", "gain", "exxen", "tabii", "tod_tv", "apple_tv"]
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Nuvio Canlı API ${PORT} portunda aktif...`));
}

module.exports = app;
