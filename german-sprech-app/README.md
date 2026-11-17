# Deutsch Sprechen

Almancayı **kelimelerle cümle kurarak** öğreten uygulama. Tek kod tabanı; iPhone, Android telefon ve web tarayıcısında (Windows, Mac, Linux) çalışır.

Kelime bankaları "Sizi Konuşturacak 100 Fiil / 200 İsim / 100 Sıfat / 100 C1 Fiil" listelerinden temizlenip yapılandırıldı; üzerine cümleyi denetleyen bir gramer motoru yazıldı.

## Ne yapıyor?

- **Cümle kur.** Özne, fiil, artikel, isim, sıfat, soru kelimesi, bağlaç ve zaman/yer kelimelerinden dokunarak bir cümle oluştur. Kelimeyi seçip sola/sağa taşıyabilir, çıkarabilir, fiilin biçimini değiştirebilirsin.
- **Kontrol et.** Motor cümleyi denetler; yanlışsa doğrusunu ve nedenini gösterir. Her hatanın altında "Neden böyle?" ile açılan Türkçe açıklama vardır: kural, mantığı, kökeni, örnek.
- **Kelimeler.** Yaklaşık 100 fiil, 180 isim, 90 sıfat ve 90 C1 fiil; Türkçe anlamı, sesli okuma ve favorilerle. Kendi kelimeni ekleyebilirsin; eklediğin kelime cümle kurarken de kullanılır.
- **İfadeler.** "Echt?", "Na klar!", "Ach du meine Güte!" gibi günlük kalıplar ve neden öyle söylendikleri.
- **Ayarlar.** Gündüz, gece ya da sistem teması; Türkçe anlamları gizleme; ilerlemeyi sıfırlama.

## Tasarım

- **Tema.** Açık ve koyu palet `src/theme/index.ts` içinde. Seçim cihazda saklanır; "Sistem" seçeneği telefonun ya da bilgisayarın ayarını izler.
- **Renk bilgi taşır.** İsimler ve artikeller cinsiyete göre aynı tonu paylaşır (der mavi, die pembe, das yeşil), böylece uyumlu artikel-isim çifti bir bakışta görünür. Fiiller mor, sıfatlar turkuaz. Tek "yüksek sesli" renk bayraktaki altın sarısıdır ve yalnızca ana eylemde kullanılır.
- **Yazı.** Almanca metin Atkinson Hyperlegible ile yazılır (ß/B, l/I, ä/a gibi harfleri ayırt etmek için tasarlanmış bir yazı tipi). Türkçe arayüz metni cihazın kendi sistem yazı tipinde kalır; iki dil her yerde gözle ayrılır.
- **Düzen.** Telefonda alt sekme çubuğu; geniş ekranda (masaüstü tarayıcı, yatay tablet) aynı sekmeler sol kenara geçer ve içerik okunabilir genişlikte bir sütunda kalır.
- **Artikel tablosu.** Artikel bankası, gerçekte olduğu şey gibi çizilir: satırlar hâl, sütunlar cinsiyet.

## Gramer motoru

`src/engine/` ve `src/data/` saf TypeScript'tir, arayüze bağlı değildir; bu yüzden cihaz olmadan birim testleriyle doğrulanır (`npm test`, 48 test).

Motor önce cümleyi öğelere ayırır ("artikel + sıfat + isim" tek öğedir), cümle türünü ve özneyi bulur, sonra kuralları uygular:

| Kural | Örnek |
|---|---|
| Fiil özneye uyar (zamir ya da isim özne) | `Du kommst.` · `Der Mann kommt.` |
| Perfekt'te haben / sein seçimi | `Ich habe gekommen` → `Ich bin gekommen.` |
| Düz cümlede fiil 2. sırada (öne alınan öğeyle birlikte) | `Heute gehe ich nach Hause.` · `Den Mann sehe ich.` |
| Partizip II / mastar cümle sonunda | `Ich kann heute tanzen.` |
| Soru kelimeli soru ve Evet/Hayır sorusu | `Wo arbeitest du?` · `Wer kommt?` · `Kommst du?` |
| weil / dass: fiil en sonda | `…, weil ich gekommen bin.` |
| Özne Nominativ; nesne fiilin istediği hâlde | `Ich sehe den Mann.` · `Ich helfe dem Mann.` |
| İki nesneli fiiller (Dativ kişi + Akkusativ şey) | `Ich zeige dem Mann das Bild.` |
| sein'dan sonra Nominativ; tek yüklem | `Ich bin der Lehrer.` · `Der Weg ist lang.` |
| Artikel ismin cinsiyetine uyar | `die Mann` → `der Mann` |
| Artikel ile isim arasındaki sıfat ek alır (otomatik) | `den großen Mann` · `ein kleines Kind` |
| Ayrılabilir fiilde ek cümle sonuna gider | `Ich stehe heute auf.` |

Motor bir düzeltme önerdiğinde onu aynı kurallardan bir kez daha geçirir. Düzeltme hâlâ hatalıysa "doğrusu" diye gösterilmez; bunun yerine neyin çeliştiği açıklanır.

Açıklama metinleri `src/engine/grammarNotes.ts` içindedir.

## Çalıştırma

```bash
cd german-sprech-app
npm install

npm test            # gramer motoru testleri
npm run typecheck   # TypeScript kontrolü

npm start           # geliştirme sunucusu (telefonda Expo Go ile QR kodu tara)
npm run web         # tarayıcıda aç
npm run ios         # iOS simülatörü (macOS + Xcode gerekir)
npm run android     # Android emülatörü (Android Studio gerekir)
```

Nasıl doğrulandı: iOS, Android ve web paketleri hatasız derleniyor. Web sürümü gerçek bir tarayıcıda telefon ve masaüstü boyutunda, açık ve koyu temada, uçtan uca denendi (cümle kurma, kontrol, kelime ekleme, tema değiştirme). iOS ve Android sürümleri gerçek cihazda ya da simülatörde henüz açılmadı; ilk açılışta küçük düzen ayarları gerekebilir.

## Web'de yayınlama (Windows ve Mac kullanıcıları için)

```bash
npm run build:web   # dist/ klasörünü üretir
```

`dist/` klasörü düz dosyalardan oluşur; herhangi bir statik barındırma hizmetine (Netlify, Vercel, Cloudflare Pages, GitHub Pages…) yüklenebilir. Site alan adının kökünde değil bir alt klasörde yayınlanacaksa (örn. `kullanici.github.io/proje/`), derlemeden önce `app.json` içinde `expo.experiments.baseUrl` değerini o yola ayarla.

`public/manifest.json` sayesinde site Chrome ve Edge'de "Uygulamayı yükle", iPhone'da "Ana Ekrana Ekle" ile uygulama gibi kurulabilir. Çevrimdışı çalışma henüz yok; açmak için internet gerekir.

## Mağazalarda yayınlama (iOS ve Android)

```bash
npm install -g eas-cli
eas login
eas build:configure

eas build --platform ios --profile production
eas build --platform android --profile production

eas submit --platform ios
eas submit --platform android
```

Gerekenler: Apple Developer hesabı (yıllık 99 $), Google Play Console hesabı (tek seferlik 25 $), ve `app.json` içindeki `ios.bundleIdentifier` ile `android.package` değerlerinin kendi hesabına göre güncellenmesi. Uygulama simgesi ve açılış görseli `assets/` içinde hazırdır.

## Klasör yapısı

```
assets/        uygulama simgesi, Android katmanı, açılış görseli, favicon
public/        web sayfası şablonu, kurulum bildirimi, web simgeleri
src/
  data/        kelime bankaları, artikeller, soru kelimeleri, ifadeler
  engine/      gramer motoru: çekim, cümle çözümleme, kurallar, açıklamalar
    __tests__/ birim testleri
  theme/       açık/koyu palet, yazı tipleri, ölçüler
  context/     ayarlar (tema), ilerleme, kullanıcının eklediği kelimeler
  components/  simgeler, düğmeler, kelime çipi, cümle şeridi, artikel tablosu, sayfalar
  screens/     ana kabuk ve sekmeler, cümle kurma, kelime ekleme
  navigation/  ekranlar arası geçiş
```

## Bilinen sınırlar

- Yalnızca tekil isimler; çoğul çekim yok.
- Nesne olarak zamir (ihn, ihr, mich…) yok; nesneler isimle kurulur.
- Edatlar hazır kalıp olarak gelir (nach Hause, in der Schule); edat + isim serbestçe kurulamaz.
- Artikelsiz isimden önceki sıfat çekilmez (`kaltes Wasser` yerine `kalt Wasser` kabul edilir).
- Yalnızca şimdiki zaman ve Perfekt; Präteritum ve gelecek zaman yok.
- Bir cümlede tek yan cümle ya da tek ana cümle; ikisi birlikte kurulamaz.
