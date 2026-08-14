# Deutsch Sprechen 🇩🇪

Almanca'yı **kelimelerle cümle kurarak** öğreten, iOS ve Android'de yayınlanabilen bir React Native (Expo) uygulaması.

Kaynak: Instagram'daki "Sizi Konuşturacak 100 Fiil / 200 İsim / 100 Sıfat / 100 C1 Fiil" görsellerindeki kelime bankaları temizlenip yapılandırılmış veri hâline getirildi ve bunun üzerine **gerçek bir gramer motoru** inşa edildi.

## Uygulama ne yapıyor?

1. **Kelime seç, cümle kur**: Özne (ich/du/er...), fiil, artikel (der/die/das/den/dem...), isim, sıfat, soru kelimesi ve bağlaç bankalarından dokunarak bir cümle inşa edersin.
2. **"Kontrol Et"e bas**: Dahili gramer motoru cümleni analiz eder:
   - Fiil çekimi özneyle uyuşuyor mu? (ich komme / du kommst / er kommt...)
   - **Perfekt'te haben mi sein mi?** — Tam olarak sorduğun örnek: "Ich habe gekommen" ❌ → motor bunun bir hareket fiili (kommen) olduğunu, dolayısıyla "sein" gerektiğini anlar ve **"Ich bin gekommen"** ✅ düzeltmesini verir.
   - Kelime sırası doğru mu? (V2 kuralı, W-Fragen sırası, weil/dass'ta fiilin sona gitmesi, Modal fiil + mastar sıralaması)
   - Akkusativ/Dativ hâli doğru mu? (den Mann / dem Mann)
   - Artikel ismin cinsiyetiyle uyuşuyor mu? (der/die/das)
3. **Yanlışsa doğrusunu gösterir**, her hata için **"Neden?"** butonuyla açılan derinlemesine açıklama sunar: kural + neden böyle + (istenildiği gibi) **dilin kökenine dair açıklama**, hepsi Türkçe.
4. **Kelime Bankası**: ~90 A1-B1 fiil, ~150 isim (cinsiyetiyle), ~90 sıfat, ~85 C1 seviyesi ileri fiil — hepsi Türkçe anlamıyla, sesli okuma (🔊) ve favorileme ile.
5. **Günlük İfadeler**: "Echt?", "Ach du meine Güte!", "Na klar!" gibi günlük/naif konuşma kalıpları — her biri neden öyle kullanıldığına dair kısa bir köken/kullanım notuyla.
6. **Kelime Ekle**: Kendi fiil/isim/sıfatlarını kelime bankasına ekleyebilirsin (Kelime Bankası ekranından ya da Cümle Kur ekranındaki "+ Ekle" ile). Eklediğin kelimeler cihazda saklanır, hem Kelime Bankası'nda hem Cümle Kur oyunlarında hemen kullanılabilir hale gelir ve gramer motoru onları da diğer kelimeler gibi denetler.

## Neden bu mimari?

- Gramer motoru (`src/engine/`) ve kelime verisi (`src/data/`) **saf TypeScript**, hiçbir React Native bağımlılığı yok. Bu sayede:
  - Simülatör/cihaz olmadan **Jest ile gerçek birim testleriyle** doğrulanabiliyor (`npm test` → 29 test, hepsi geçiyor).
  - İleride web, CLI ya da başka bir arayüze taşınması kolay.
- UI katmanı (`src/screens/`, `src/components/`) Expo + React Navigation ile yazıldı → **tek kod tabanından hem iOS hem Android**.
- Motor, cümlenin "modunu" (basit/soru/Perfekt/Modal/yan cümle) kullanıcının seçtiği token dizisinden **otomatik olarak çıkarır** — yani "Serbest Pratik" ekranında her yapı türü serbestçe denenebilir.

## Gramer motorunun kapsadığı kurallar

| Kural | Dosya | Test |
|---|---|---|
| Özne-fiil uyumu | `engine/grammar.ts` → `checkAgreement` | ✅ |
| Perfekt: haben/sein seçimi | `checkPerfektAux` | ✅ (senin örneğin) |
| V2 kelime sırası (ana cümle) | `checkMainClauseOrder` | ✅ |
| Satzklammer (Partizip/mastar cümle sonu) | `checkMainClauseOrder` / `checkSubordinateOrder` | ✅ |
| W-Fragen sırası | `checkQuestionOrder` | ✅ |
| weil/dass — fiil sona gider | `checkSubordinateOrder` | ✅ |
| Modal fiil + mastar | `detectShape` (modal) | ✅ |
| Akkusativ/Dativ nesne hâli | `checkCases` | ✅ |
| Artikel-isim cinsiyet uyumu | `checkCases` | ✅ |
| Sıfat konumu (predicative/attributive) | `checkAdjectives` | bilgi notu |

Her kural `src/engine/grammarNotes.ts` içinde Türkçe, "kural + neden + köken + örnek" formatında açıklanıyor.

## Geliştirme

```bash
cd german-sprech-app
npm install

npm test          # gramer motoru birim testleri (Jest)
npm run typecheck # TypeScript kontrolü

npm start         # Expo geliştirme sunucusu (Expo Go uygulamasıyla QR kod tara)
npm run ios       # iOS simülatöründe aç (macOS + Xcode gerekir)
npm run android   # Android emülatöründe aç (Android Studio gerekir)
```

> Bu proje bir Linux konteynerinde, simülatörsüz geliştirildi. Kod, `npx expo export --platform ios` ve `--platform android` ile **gerçek Metro bundling'i** üzerinden doğrulandı (her ikisi de hatasız paketlendi) — ama gerçek bir cihaz/simülatörde görsel test yapılmadı. İlk çalıştırmada küçük stil/layout ince ayarları gerekebilir.

## iOS ve Android'de yayınlama (EAS Build)

Bu uygulama Expo Application Services (EAS) ile derlenip App Store / Google Play'e gönderilebilir:

```bash
npm install -g eas-cli
eas login
eas build:configure

# Test/iç dağıtım için:
eas build --platform ios --profile preview
eas build --platform android --profile preview

# Mağaza için:
eas build --platform ios --profile production
eas build --platform android --profile production

eas submit --platform ios
eas submit --platform android
```

Yayınlamadan önce gerekenler:
- Apple Developer hesabı (yıllık $99) ve App Store Connect kaydı.
- Google Play Console hesabı (tek seferlik $25).
- `assets/icon.png` (1024×1024), `assets/adaptive-icon.png` ve splash görseli eklenip `app.json`'da tanımlanmalı (şu an varsayılan Expo ikonuyla geliyor).
- `app.json` içindeki `ios.bundleIdentifier` ve `android.package` değerlerini kendi hesabına göre güncelle.

## Klasör yapısı

```
src/
  data/       # kelime bankaları (verbs, nouns, adjectives, C1, expressions, articles...)
  engine/     # saf TS gramer motoru: conjugate, tokens, grammar, grammarNotes
    __tests__/  # Jest testleri
  components/ # WordChip, SentenceStrip, FeedbackModal, VerbTokenEditor
  screens/    # Home, Builder, WordList, Expressions
  navigation/ # React Navigation stack
  context/    # AsyncStorage tabanlı ilerleme/favori takibi
```

## Bilinen sınırlar (v1)

- Sıfat çekimi (der **große** Mann gibi ek alması) henüz derecelendirilmiyor, sadece bilgi notu veriyor — Almancanın en karmaşık konularından biri, sonraki versiyon için planlandı.
- Nesne olarak sadece artikel+isim ikilisi destekleniyor (zamir nesneler — "ihn/sie/es" gibi — henüz yok).
- Çoğul isim/artikel çekimi MVP'de yok, sadece tekil.
