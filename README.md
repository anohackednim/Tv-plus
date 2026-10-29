# TV+ Keşif

Nuvio ve Stremio için Türkçe film / dizi kataloğu. Haftanın öne çıkanları, yeni çıkanlar, Türk yapımları, yüksek puanlılar, gözden kaçanlar ve Türkiye platform rafları.

**Kurulum:** https://tv-plus-wine.vercel.app/

**Nuvio eklenti adresi:** https://tv-plus-wine.vercel.app/manifest.json

Nuvio'nun Eklentiler bölümünde bu adresi ekleyin. v14'e geçerken eski TV+ Keşif eklentisini kaldırıp aynı adresle yeniden ekleyin. Nuvio'nun katalog sıralama ekranında **Eklenti sırasını takip et / Follow addons order** seçeneğini etkinleştirin. Eklenti ana kimliği korunur; raf kimlikleri bir defaya mahsus yenilenerek Nuvio'da kayıtlı eski raf sırası devre dışı kalır. Önceki katalog adresleri Crunchyroll haricinde yanıt vermeye devam eder. Sürüm numarası tek başına Nuvio'nun cihazda veya hesapta sakladığı sırayı değiştirmez.

## Katalog düzeni

- Yeni Filmler / Yeni Diziler · Türkiye: son bir yılda yayımlanan ve Türkiye'de abonelik, ücretsiz veya reklamlı olarak izlenebilen içerikler; yeniden eskiye.
- Türkiye'de Öne Çıkan Filmler / Diziler: Türkiye'de izlenebilir içerikler; popülerliğe göre.
- Türk Filmleri / Türk Dizileri: orijinal dili Türkçe olan yapımlar.
- İyi ki İzlemişim / Bir Bölüm Daha: yeterli oy sayısı bulunan yüksek TMDB puanlı yapımlar.
- Gözden Kaçan: yüksek puan ve sınırlı oy sayısıyla belirlenen keşif rafları; kişisel öneri motoru değildir.
- Netflix, Prime Video, Disney+, HBO Max, TV+, TOD, MUBI ve puhutv: TMDB / JustWatch Türkiye bulunabilirliği; abonelik, ücretsiz ve reklamlı seçenekler. Kiralama / satın alma listeye dahil edilmez.
- Exxen, GAİN ve tabii Orijinalleri: TMDB'deki doğrulanmış yapım ağı bilgilerine göre listelenir; güncel Türkiye bulunabilirliği garantisi değildir.
- Ruh Haline Göre: tür filtreleriyle film ve dizi keşfi.
- Film Ara / Dizi Ara: Türkçe karakterleri destekleyen arama.

Raflar kaydırıldıkça sayfalanır ve TMDB'nin 500 sayfalık sınırına (en fazla yaklaşık 10.000 kaynak sonucu) kadar devam eder; son sayfa daima veri kaynağının sonudur. IMDb kimliği veya afişi olmayan içerikler atlandığı için gösterilen sonuç sayısı daha az olabilir. Çok derin bir konuma doğrudan atlamak, önceki kayıtların sırayla eşlenmesini gerektirir; en iyi deneyim normal kaydırmadır. İstediğiniz belirli bir yapım için aramayı kullanın.

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
