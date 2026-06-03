const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Orijinal katalog dosendaki gibi CORS ve Headers ayarları
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        return res.status(200).json({});
    }
    next();
});

// Senin istediğin sıralı tam kategori listesi
const categories = {
    mixed_popular_new: "Popüler - Karışık (Yeni)",
    popular_movies: "Popüler Filmler",
    popular_series: "Popüler Diziler",
    top_10_tr: "🇹🇷 Türkiye'de En İyi 10",
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

// Orijinal dosyandaki gibi veritabanı bağımlılığı olmadan direkt dönen yerel veri havuzu
const catalogData = {
    mixed_popular_new: [
        { id: 101, title: "Fer", type: "tv", poster: "https://image.tmdb.org/t/p/w500/fer_poster.jpg", platform: "gain", year: "2026" },
        { id: 102, title: "Daha 17", type: "tv", poster: "https://image.tmdb.org/t/p/w500/daha17_poster.jpg", platform: "netflix", year: "2026" },
        { id: 103, title: "From - Sezon 3", type: "tv", poster: "https://image.tmdb.org/t/p/w500/from3_poster.jpg", platform: "tod_tv", year: "2025" }
    ],
    popular_movies: [
        { id: 201, title: "Dune: Part Two", poster: "https://image.tmdb.org/t/p/w500/dune2.jpg", rating: 8.6, platform: "apple_tv" },
        { id: 202, title: "Gladyatör 2", poster: "https://image.tmdb.org/t/p/w500/gladiator2.jpg", rating: 7.8, platform: "amazon_prime" }
    ],
    popular_series: [
        { id: 301, title: "Kimler Geldi Kimler Geçti", poster: "https://image.tmdb.org/t/p/w500/kgkg.jpg", platform: "netflix" },
        { id: 302, title: "Prens", poster: "https://image.tmdb.org/t/p/w500/prens.jpg", platform: "blutv" }
    ],
    top_10_tr: [
        { rank: 1, title: "A.B.İ.", type: "Dizi", platform: "gain" },
        { rank: 2, title: "Kimler Geldi Kimler Geçti", type: "Dizi", platform: "netflix" },
        { rank: 3, title: "Prens", type: "Dizi", platform: "blutv" },
        { rank: 4, title: "Uzak Şehir", type: "Dizi", platform: "tod_tv" },
        { rank: 5, title: "Gibi", type: "Dizi", platform: "exxen" },
        { rank: 6, title: "Taşacak Bu Deniz", type: "Dizi", platform: "tabii" },
        { rank: 7, title: "Halef: Köklerin Çağrısı", type: "Dizi", platform: "gain" },
        { rank: 8, title: "Eşref Rüya", type: "Dizi", platform: "netflix" },
        { rank: 9, title: "Güller ve Günahlar", type: "Dizi", platform: "tod_tv" },
        { rank: 10, title: "Fer", type: "Dizi", platform: "gain" }
    ],
    zombies: [
        { id: 401, title: "The Last of Us", type: "tv", poster: "https://image.tmdb.org/t/p/w500/tlou.jpg", platform: "blutv" },
        { id: 402, title: "28 Days Later", type: "movie", poster: "https://image.tmdb.org/t/p/w500/28days.jpg", platform: "disney_plus" }
    ],
    k_dramas: [
        { id: 501, title: "Squid Game - Sezon 2", type: "tv", poster: "https://image.tmdb.org/t/p/w500/sg2.jpg", platform: "netflix" }
    ]
    // İleride diğer kategorilerin array verilerini de buraya aynı formatta ekleyebilirsin.
};

// Ana Katalog Endpoint'i - Tıpkı orijinal katalog dosyasındaki gibi anlık ve lokal çalışır
app.get('/api/v1/catalog', (req, res) => {
    res.status(200).json({
        success: true,
        project: "Nuvio-v9 Local-Powered API",
        live_update_time: new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
        categories: categories,
        content: catalogData
    });
});

// Platformlar Endpoint'i
app.get('/api/v1/platforms', (req, res) => {
    res.status(200).json({
        success: true,
        platforms: ["netflix", "blutv", "amazon_prime", "disney_plus", "gain", "exxen", "tabii", "tod_tv", "apple_tv"]
    });
});

// Orijinal dosendaki sunucu başlatma kontrolü
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Nuvio Kataloğu ${PORT} portunda sorunsuz çalışıyor...`));
}

module.exports = app;
