const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Orijinal katalog dosyasındaki CORS ve erişim izinlerinin birebir aynısı
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
    next();
});

// İstediğin sıralı tam kategori listesi ve içerikleri (Orijinal veri formatında)
const n_catalog = {
    "populer_karisik": {
        "title": "Popüler - Karışık (Yeni)",
        "items": [
            { "id": "m1", "name": "Fer", "type": "tv", "image": "https://image.tmdb.org/t/p/w500/fer.jpg", "platform": "gain" },
            { "id": "m2", "name": "Daha 17", "type": "tv", "image": "https://image.tmdb.org/t/p/w500/d17.jpg", "platform": "netflix" },
            { "id": "m3", "name": "From", "type": "tv", "image": "https://image.tmdb.org/t/p/w500/from.jpg", "platform": "tod_tv" }
        ]
    },
    "populer_filmler": {
        "title": "Popüler Filmler",
        "items": [
            { "id": "f1", "name": "Dune: Part Two", "type": "movie", "image": "https://image.tmdb.org/t/p/w500/dune2.jpg", "platform": "apple_tv" },
            { "id": "f2", "name": "Gladyatör 2", "type": "movie", "image": "https://image.tmdb.org/t/p/w500/glad2.jpg", "platform": "amazon_prime" }
        ]
    },
    "populer_diziler": {
        "title": "Popüler Diziler",
        "items": [
            { "id": "d1", "name": "Kimler Geldi Kimler Geçti", "type": "tv", "image": "https://image.tmdb.org/t/p/w500/kgkg.jpg", "platform": "netflix" },
            { "id": "d2", "name": "Prens", "type": "tv", "image": "https://image.tmdb.org/t/p/w500/prens.jpg", "platform": "blutv" }
        ]
    },
    "en_iyi_10_tr": {
        "title": "🇹🇷 Türkiye'de En İyi 10",
        "items": [
            { "rank": 1, "name": "A.B.İ.", "type": "tv", "platform": "gain" },
            { "rank": 2, "name": "Kimler Geldi Kimler Geçti", "type": "tv", "platform": "netflix" },
            { "rank": 3, "name": "Prens", "type": "tv", "platform": "blutv" },
            { "rank": 4, "name": "Uzak Şehir", "type": "tv", "platform": "tod_tv" },
            { "rank": 5, "name": "Gibi", "type": "tv", "platform": "exxen" },
            { "rank": 6, "name": "Taşacak Bu Deniz", "type": "tv", "platform": "tabii" },
            { "rank": 7, "name": "Halef: Köklerin Çağrısı", "type": "tv", "platform": "gain" },
            { "rank": 8, "name": "Eşref Rüya", "type": "tv", "platform": "netflix" },
            { "rank": 9, "name": "Güller ve Günahlar", "type": "tv", "platform": "tod_tv" },
            { "rank": 10, "name": "Fer", "type": "tv", "platform": "gain" }
        ]
    },
    "komedi_filmleri": { "title": "En İyi Komedi Filmleri", "items": [] },
    "dramatik_komediler": { "title": "Dramatik Komediler", "items": [] },
    "kore_dizileri": { "title": "Kore Dizileri", "items": [] },
    "animasyon": { "title": "Animasyon", "items": [] },
    "stand_up": { "title": "Stand Up", "items": [] },
    "suc_filmleri": { "title": "En İyi Suç Filmleri", "items": [] },
    "zombiler": { "title": "Zombiler", "items": [] },
    "spor_dramalari": { "title": "Spor Dramaları", "items": [] },
    "aksiyon_macera_dizileri": { "title": "En İyi Aksiyon & Macera Dizileri", "items": [] },
    "bilim_kurgu_filmleri": { "title": "En İyi Bilim Kurgu Filmleri", "items": [] },
    "made_in_europe_diziler": { "title": "En İyi Made in Europe Diziler", "items": [] },
    "epik_fantezi": { "title": "Epik Fantezi", "items": [] },
    "bilim_kurgu_korku": { "title": "Bilim Kurgu Korku", "items": [] },
    "mustehcen_aksiyon_komedi": { "title": "Müstehcen Aksiyon Komedi", "items": [] },
    "tatil_romantik_komedileri": { "title": "Tatil Romantik Komedileri", "items": [] },
    "gizem_gerilim_filmleri": { "title": "En İyi Gizem ve Gerilim Filmleri", "items": [] },
    "true_crime": { "title": "Gerçek Suç Belgeselleri", "items": [] },
    "odullu_yapimlar": { "title": "Ödüllü Yapımlar", "items": [] },
    "genclik_dizileri": { "title": "Gençlik Dizileri", "items": [] },
    "klasikler": { "title": "Nostalji & Klasikler", "items": [] }
};

const n_platforms = ["netflix", "blutv", "amazon_prime", "disney_plus", "gain", "exxen", "tabii", "tod_tv", "apple_tv"];

// Orijinal ana rota (Root Route) mantığı
app.get('/', (req, res) => {
    res.status(200).json({
        status: "success",
        catalog: n_catalog,
        platforms: n_platforms
    });
});

// Vercel ve yerel ortam için dinleme kontrolü
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
