# TV+ Keşif

Nuvio ve Stremio için Türkçe film / dizi kataloğu. Haftanın öne çıkanları, yeni çıkanlar, Türk yapımları, yüksek puanlılar, gözden kaçanlar ve Türkiye platform rafları.

**Kurulum:** https://tv-plus-wine.vercel.app/

**Nuvio eklenti adresi:** https://tv-plus-wine.vercel.app/manifest.json

Nuvio'nun Eklentiler bölümünde bu adresi ekleyin. Eski kurulum yeni rafları göstermiyorsa eklentiyi kaldırıp aynı adresle yeniden ekleyin. Mevcut eklenti kimliği korunur; önceki katalog adresleri de yanıt vermeye devam eder.

## Katalog düzeni

- Bu Hafta: film ve dizi trendleri.
- Yeni Çıkan: son bir yıl içinde yayımlanan, oy almış yapımlar; yeniden eskiye.
- Türk Filmleri / Türk Dizileri: orijinal dili Türkçe olan yapımlar.
- İyi ki İzlemişim / Bir Bölüm Daha: yeterli oy sayısı bulunan yüksek TMDB puanlı yapımlar.
- Gözden Kaçan: yüksek puan ve sınırlı oy sayısıyla belirlenen keşif rafları; kişisel öneri motoru değildir.
- Netflix, Prime Video, Disney+, HBO Max, TV+, TOD, MUBI, puhutv ve Crunchyroll: TMDB / JustWatch Türkiye bulunabilirliği; abonelik, ücretsiz ve reklamlı seçenekler. Kiralama / satın alma listeye dahil edilmez.
- Exxen, GAİN ve tabii Orijinalleri: TMDB'deki doğrulanmış yapım ağı bilgilerine göre listelenir; güncel Türkiye bulunabilirliği garantisi değildir.
- Ruh Haline Göre: tür filtreleriyle film ve dizi keşfi.
- Film Ara / Dizi Ara: Türkçe karakterleri destekleyen arama.

Her raf ve filtre en fazla 200 sonuç sunan bir keşif seçkisidir; tam TMDB arşivi değildir. İstediğiniz belirli bir yapım için aramayı kullanın. Bu sınır, soğuk Vercel örneklerinde binlerce IMDb eşlemesinin yeniden hesaplanmasını önler. Bir seçki için en fazla 15 TMDB sonuç sayfası taranır.

Türkçe özeti olmayan yapımlar için açık bir bilgilendirme gösterilir. IMDb kimliği veya afişi olmayan yapımlar listelenmez; TMDB puanı IMDb puanı olarak etiketlenmez. Platformdaki içerik ve bölge bilgisi sağlayıcının verisinin güncelliğine bağlıdır. Exxen, GAİN ve tabii için bulunabilirlik verisi sınırlı olduğundan bu raflar açıkça Orijinaller olarak adlandırılır. BluTV'nin eski adresi HBO Max rafına yönlenir.

## Geliştirme

Node.js 22 gerekir. Harici paket bağımlılığı yoktur.

```sh
npm start
npm test
npm run check
```

Yerel adres: http://localhost:7777

İsteğe bağlı olarak `TMDB_API_KEY` ortam değişkeni tanımlayın. Ortam değeri mevcut dağıtım anahtarının önüne geçer. Anahtar tarayıcıya, manifest yanıtlarına veya hata mesajlarına eklenmez. Projenin önceki sürümündeki anahtar, mevcut Vercel dağıtımını kesintiye uğratmamak için sunucu girişinde korunmuştur. Yeni kurulumlarda ortam değişkeni tercih edilmelidir.

## Teknik davranış

- `/manifest.json`, `/catalog/:type/:id.json`, `/catalog/:type/:id/:extras.json` uçları.
- IMDb sorgularında tüm istekler için paylaşılan en fazla 8 eşzamanlı TMDB çağrısı.
- Aynı API çağrıları birleştirilir; başarılı listeler 30 dakika, IMDb eşlemeleri 24 saat tutulur. Önbellek Vercel örneğine özeldir ve boyutu sınırlıdır.
- Eksik IMDb kimlikleri veya tekrarlı sonuçlar atlandığında kaydırma sırası bozulmaz. Arama da sayfalanır.
- API isteği 6 saniyede, toplam katalog isteği kuyruk beklemesi dahil 20 saniyede zaman aşımına uğrar. Süresi dolan bekleyen işler kuyruktan kaldırılır, devam eden ağ çağrıları iptal edilir. Geçici 429/502/503/504 yanıtlarında bir tekrar yapılır.
- API hataları önbelleğe alınmaz; başarısız istek boş ve başarılı katalog gibi gösterilmez.
- Vercel bir HTTP işleyicisi içe aktarır; sunucu yalnızca doğrudan `npm start` ile port açar.
- Testler HTTP protokolü, filtreler, gerçek sayfalama, eksik IMDb eşlemeleri, önbellek ve hata davranışını kapsar.

Bu eklenti video kaynağı sağlamaz. Film ve dizi bilgileri / afişler [TMDB](https://www.themoviedb.org/) tarafından, izleme bulunabilirliği TMDB'nin JustWatch entegrasyonu üzerinden sağlanır. Bu ürün TMDB API'sini kullanır; TMDB tarafından onaylanmış veya sertifikalandırılmış değildir.
