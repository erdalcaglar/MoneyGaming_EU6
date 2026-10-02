# Empire Age — Geliştirme Geçmişi

Bu doküman, bu proje için şu ana kadar yapılan **her şeyin** baştan sona
özetidir: ilk istekten PR'ın mevcut durumuna kadar. Amaç, ileride
kaldığımız yeri hatırlamak ve yeni bir oturumda (veya başka biri
devraldığında) neyin neden böyle yapıldığını hızlıca anlayabilmek.

- **Branch:** `claude/age-of-empires-strategy-game-da15q4`
- **PR:** [erdalcaglar/MoneyGaming_EU6#1](https://github.com/erdalcaglar/MoneyGaming_EU6/pull/1)
- **Proje klasörü:** `empire-game/` (mevcut repo köküne, alakasız bir
  Selenium/Java test projesinin yanına eklendi — ona dokunulmadı)

---

## 1. İstek neydi?

Kullanıcı, Age of Empires tarzında, Android ve iOS'ta yayınlanabilecek,
kapsamlı bir imparatorluk inşa/strateji oyunu istedi. Belirttiği temel
özellikler:

- İşçiler çalıştırıp puan/kaynak toplama
- Altın biriktirme
- Kale inşa edebilme
- Savunmayı güçlendirebilme
- Saldırıya geçebilme ve saldırıları yönetebilme
- Köy fethederek imparatorluk kurma (köyden köye büyüme)
- Kullanıcı adı + e-posta ile kayıt zorunluluğu
- "Modern bir altyapı" ile hazırlanması
- Renklendirme, dallandırma (tech tree), seviye sistemi gibi kararların
  büyük kısmının bana (Claude'a) bırakılması
- Sonradan kolayca yeni özellik eklenebilecek, genişletilebilir bir
  sistem olması

## 2. Mevcut repo durumu ve karar

Repo (`MoneyGaming_EU6`) aslında alakasız, tamamlanmamış bir Selenium/
TestNG Java otomasyon projesiydi (`pom.xml`, `src/test/java/...`). Bu
içerik silinmedi; oyun tamamen yeni bir `empire-game/` klasöründe,
izole bir monorepo olarak kuruldu.

## 3. Teknoloji seçimi ve gerekçesi

| Katman | Seçim | Neden |
|---|---|---|
| Mobil istemci | **Flutter + Flame** | Android/iOS'u tek Dart kod tabanından, native performansla hedefler. Flame, köy sahnesi (bina grid'i) gibi basit 2D oyun alanları için yeterli ve hafif bir motor. UI ekranları standart Flutter widget'ları, oyun sahnesi Flame ile aynı uygulamada bir arada. |
| Backend | **Node.js + TypeScript + Express + Prisma** | Oyun mantığının otoritesi (kaynak üretimi, savaş sonucu, fetih) sunucuda çalışır — istemci hile yapamaz. Prisma + SQLite geliştirmede sıfır kurulum sağlar, `DATABASE_URL` değiştirilerek üretimde PostgreSQL'e geçilebilir. |
| Veritabanı (dev) | SQLite (Prisma) | Kurulumsuz, hızlı iterasyon. |
| Kimlik doğrulama | JWT + bcrypt | Basit, yaygın, mobil istemciler için uygun. |
| İçerik modeli | **Veri-odaklı** (`backend/src/data/*.ts`) | Kullanıcının "sonradan kolayca eklenebilsin" isteğini doğrudan karşılamak için: bina/birim/kaynak/seviye tanımları kod değil veri. |

`google_fonts` gibi çalışma zamanında internetten font çeken paketler
bilinçli olarak **kullanılmadı** (mobil/offline güvenilirlik riski);
bunun yerine sistem fontları + tipografi ayarlarıyla tema kuruldu.

## 4. Backend (`empire-game/backend`)

### 4.1 Proje iskeleti
- `package.json`, `tsconfig.json`, `.env.example`, `.gitignore`
- Bağımlılıklar: `express`, `@prisma/client`, `bcryptjs`, `jsonwebtoken`,
  `zod`, `cors`, `dotenv`; dev: `prisma`, `tsx`, `vitest`, `typescript`

### 4.2 Veritabanı şeması (`prisma/schema.prisma`)
Modeller: `Player`, `Village`, `Building`, `Unit`, `BattleLog`.
- `Village.ownerId` nullable → hem oyuncu köyleri hem NPC köyleri aynı
  tabloda, hem de ileride gerçek PvP için hazır bir temel.
- `Building` ve `Unit`, `villageId` ile köye bağlı; `Building` seviye +
  `upgradeEndsAt` (inşa/yükseltme zamanlayıcısı) taşır.

### 4.3 Veri-odaklı içerik kataloğu (`src/data/`)
- `types.ts` — ortak tipler (`BuildingDef`, `UnitDef`, `LevelDef`, ...)
- `levelGenerator.ts` — bina seviye tablolarını (maliyet/süre/etki) elle
  tek tek yazmak yerine üstel büyüme formülüyle üreten yardımcı
  fonksiyon (`generateLevels`). Yeni üst seviye eklemek = parametre
  değiştirmek.
- `buildings.ts` — 11 bina: `TOWN_HALL, HOUSE, GOLD_MINE, FARM,
  LUMBER_CAMP, WAREHOUSE, WALL, WATCH_TOWER, BARRACKS, ARCHERY_RANGE,
  STABLE` (her biri 10 seviyeye kadar tanımlı)
- `units.ts` — 4 birim: `MILITIA, SWORDSMAN, ARCHER, KNIGHT`
- `leveling.ts` — 15 seviyelik XP eşik tablosu + seviye başına açılan
  bina/birim listesi + `levelForXp` / `xpToNextLevel` yardımcıları
- `world.ts` — 5 NPC kademesi (`Haydut Kampı` → `Kral Kalesi`),
  mesafeye göre garnizon/sur/yağma aralığı, `conquerable` bayrağı
- `resources.ts` — altın/yiyecek/odun metadata'sı
- `index.ts` — barrel export

### 4.4 Modüller (`src/modules/`)
- **auth** — `POST /auth/register` (kullanıcı adı + e-posta + şifre →
  bcrypt hash, JWT, otomatik başkent köy oluşturma), `POST
  /auth/login`, `GET /auth/me`
- **village** — `service.ts` içinde:
  - `createCapitalVillage` — yeni oyuncuya 6 başlangıç binasıyla
    (TOWN_HALL, HOUSE, GOLD_MINE, FARM, LUMBER_CAMP, WAREHOUSE) bir
    köy + 300 altın/200 yiyecek/200 odun başlangıç kaynağı
  - `computeProduction` — **saf fonksiyon**: bina listesi + geçen süre
    → üretilen kaynak (birim testli)
  - `applyPendingProgress` — son tick'ten bu yana geçen süreye göre
    kaynakları günceller; süresi dolmuş bina yükseltmelerini ve asker
    eğitimlerini **lazy finalization** ile tamamlar (cron gerektirmez,
    her istek anında otomatik senkronize olur, çevrimdışı oynama
    doğru hesaplanır)
  - `getPopulationCap/Used`, `getStorageCap`, `getDefensePower`,
    `getAttackPower` — türetilmiş istatistikler
  - `routes.ts` — `GET /villages/me`, `GET /villages/:id`, `POST
    /villages/:id/collect`, `POST /villages/:id/buildings` (yeni bina
    inşa), `POST /villages/:id/buildings/:id/upgrade`, `POST
    /villages/:id/buildings/:id/workers` (işçi atama)
- **army** — `POST /villages/:id/army/train`, `GET /villages/:id/army`
  (nüfus/kaynak/bina seviyesi kontrolleriyle)
- **world** — `service.ts`: `seedNpcVillages()` (harita genelinde NPC
  kampı/köyü üretir, tekrar çalıştırmak güvenli — var olan koordinatı
  atlar), `getWorldMap(x,y,radius)`; `routes.ts`: `GET /world/map`
- **battle** — `combat.ts` içinde **saf** savaş formülü
  (`resolveBattle`, `isDecisiveVictory`, `applyLossRate` — hepsi birim
  testli); `routes.ts`: `POST /battle/attack` (yağma + asker kaybı +
  XP + **kesin zaferde NPC köyünün fethedilmesi**, fethedilen köye
  otomatik Kale eklenir), `GET /battle/log`
- **leaderboard** — `service.ts`: skor = seviye×1000 + xp + bina
  seviyeleri×20 + (köy sayısı−1)×1000 (fetih bonusu); `GET
  /leaderboard`
- **catalog** — `GET /catalog` (herkese açık, kimlik doğrulama
  gerektirmez) — istemcinin tüm bina/birim/kaynak/seviye verisini
  çektiği tek nokta

### 4.5 Ortak altyapı
- `lib/prisma.ts`, `lib/jwt.ts`, `lib/httpError.ts`
- `middleware/auth.ts` (JWT doğrulama), `middleware/errorHandler.ts`
  (`{error:{code,message}}` zarfı + Zod hata formatlama)
- `app.ts` (Express app + route mount), `index.ts` (sunucu girişi)
- `prisma/seed.ts` — NPC dünyasını doldurma script'i

### 4.6 Testler ve doğrulama
- **28 birim testi** (Vitest): `computeProduction`, `getPopulationCap`,
  `getStorageCap`, `getDefensePower`, `getAttackPower`, `resolveBattle`,
  `isDecisiveVictory`, `applyLossRate`, `levelForXp`, `xpToNextLevel`
  — hepsi geçti.
- `tsc --noEmit` ile tip kontrolü — 0 hata.
- **Gerçek uçtan uca akış** `curl` ile bizzat çalıştırılıp doğrulandı:
  kayıt → giriş → köy listeleme → işçi atama → yeni bina inşa etme →
  asker eğitme → dünya haritasını görüntüleme → NPC kampına saldırma →
  yağma/XP/liderlik tablosu güncellemesi.
- **Bu süreçte bulunan ve düzeltilen gerçek bug:** Yeni inşa edilen bir
  bina `level: 1` olarak oluşturuluyordu (inşaat süresi dolunca
  finalization mantığı `level + 1` yaptığı için) inşaat bitince
  doğrudan **seviye 2**'ye atlıyordu. Düzeltme: yeni binalar `level: 0`
  (temel/inşa halinde) olarak oluşturulacak şekilde değiştirildi, böylece
  inşaat bitince doğru şekilde seviye 1'e geçiyor. `curl` ile tekrar
  test edilip doğrulandı.
- NPC dünyası seed edildiğinde **1344 NPC kampı/köyü** oluşuyor
  (harita sınırı −60..60, adım 3, bazı karolar bilinçli boş bırakılıyor).

## 5. Mobil istemci (`empire-game/app`)

### 5.1 Proje iskeleti
`flutter create --platforms android,ios` ile standart Flutter proje
yapısı. Bağımlılıklar: `flame`, `flutter_riverpod`, `dio`,
`flutter_secure_storage`, `intl`.

### 5.2 Katmanlar
- **theme/** — `AppColors` (ortaçağ/altın-bronz-koyu palet; bina/birim
  `colorKey`'lerine göre tutarlı renk üreten `forKey`, tanınmayan
  tipler için hash-tabanlı deterministik renk — yeni içerik eklense
  bile kod değişmeden çalışır), `AppTheme` (merkezi `ThemeData`)
- **core/** — `ApiClient` (Dio sarmalayıcı, JWT interceptor, hata
  eşleme), `SecureStorage` (Keychain/Keystore üzerinden JWT saklama),
  `constants.dart` (`API_BASE_URL`, `--dart-define` ile geçersiz
  kılınabilir)
- **models/** — `Player`, `Village`/`BuildingInstance`/`UnitStack`,
  `Catalog` (bina/birim/seviye tanımları), `WorldMapEntry`,
  `BattleResult`, `LeaderboardEntry` — hepsi elle yazılmış
  `fromJson` ile
- **services/** — her backend modülü için ince bir istemci
  (`AuthService`, `VillageService`, `ArmyService`, `WorldService`,
  `BattleService`, `LeaderboardService`, `CatalogService`)
- **state/** — Riverpod `StateNotifier` tabanlı `AuthController`
  (bootstrap: açılışta token kontrolü → otomatik giriş), `VillageController`
  (oyuncunun köyleri + seçili köy + tüm mutasyon aksiyonları), ortak
  provider'lar (`providers.dart`)
- **game/** — `VillageGame` (Flame `FlameGame`): 6×6 grid, her kare bir
  `BuildingTile` (`TapCallbacks`), bina varsa `colorKey` rengiyle +
  isim/seviye etiketiyle, yoksa "+" ile çizilir; inşa/eğitim
  zamanlayıcısı aktifse turuncu nokta, işçi atanmışsa yeşil nokta
  gösterir — sprite yokluğunda bile anlamlı bir görsel
- **screens/** — `auth/` (login, register), `village/` (ana ekran +
  bina detay/yükseltme/işçi atama sheet'i), `build/` (yeni bina inşa
  menüsü), `army/` (mevcut ordu + eğitim kartları), `world/` (dünya
  haritası listesi), `battle/` (saldırı birim seçim sheet'i + sonuç
  dialogu), `empire/` (sahip olunan köyler, köy değiştirme), `profile/`
  (profil, XP ilerleme çubuğu, liderlik tablosu)
- **widgets/** — `ResourceBar`, `CountdownText` (canlı geri sayım),
  `TypeIcon` (placeholder ikon sistemi)
- `main.dart` + `AuthGate` (oturum durumuna göre Login/HomeShell),
  `home_shell.dart` (5 sekmeli alt navigasyon: Köyüm, Harita, Ordu,
  İmparatorluk, Profil)

### 5.3 Android/iOS platform ayarları
- `AndroidManifest.xml`: uygulama adı "Empire Age", `INTERNET` izni
  (release build için gerekli — debug manifest'i bunu otomatik
  eklemiyor), `usesCleartextTraffic="true"` (geliştirme backend'i HTTP
  olduğu için; üretimde HTTPS'e geçilince kaldırılmalı)

### 5.4 Doğrulama
- `flutter analyze` → 0 hata, 0 uyarı (sadece 2 kozmetik "info")
- `flutter test` → widget testi geçti
- Bu ortamda Android SDK/Xcode kurulu olmadığı için gerçek
  cihaz/emülatör derlemesi yapılamadı (bu, bu geliştirme kutusunun
  kısıtı — gerçek bir makinede sorun oluşturmaz).

## 6. Doküman seti (`empire-game/docs/`)

- **GAME_DESIGN.md** — oynanış kuralları, kaynaklar, bina/birim
  kataloğu, savaş formülü, seviyeleme, genişletilebilirlik ilkeleri
- **ARCHITECTURE.md** — teknoloji seçimi gerekçeleri, modül haritası,
  state yönetimi, güvenlik notları
- **API.md** — REST sözleşmesi (tüm endpoint'ler, istek/yanıt şekli)
- **ROADMAP.md** — bilinçli olarak sonraya bırakılanlar: gerçek
  zamanlı PvP, ittifaklar/klanlar, çok yollu teknoloji ağacı
  ("dallandırma"), görevler/başarımlar, sezonluk etkinlikler,
  pazar/ticaret, gerçek sprite/animasyon ("renklendirme"), push
  bildirimleri, PostgreSQL'e geçiş, sosyal giriş, mağaza/IAP, CI/CD

## 7. İlk teslim (commit 1)

`663d453` — "Add Empire Age: AoE-inspired empire builder for
Android/iOS". 148 dosya, ~10.600 satır ekleme. Backend + istemci +
dokümanlar tek seferde teslim edildi, `claude/age-of-empires-strategy-
game-da15q4` branch'ine push edildi.

Kullanıcı bu branch'ten **PR #1**'i Claude Code arayüzünden açtı.
Session bu PR'a referans vermeye ve commit pushladıkça otomatik
güncellemeye başladı.

## 8. Canlı önizleme oturumu

Kullanıcı "bana önizleme ver" dediğinde, gerçek cihaz/emülatör
olmadığı için şu yol izlendi:

1. Flutter SDK (3.44.8) bu oturuma indirilip kuruldu.
2. Uygulamaya **geçici olarak** `web` platform desteği eklendi
   (`flutter create --platforms=web .`).
3. `flutter build web --no-web-resources-cdn` ile CanvasKit motorunun
   CDN'den değil yerelden yüklenmesi sağlandı (bu ortamda
   fonts.gstatic.com/storage.googleapis.com gibi adreslere kısıtlı
   erişim var).
4. Build, basit bir statik sunucuyla (`serve`) yerelde servis edildi;
   backend de `npm run dev` ile ayağa kaldırıldı.
5. Önceden kurulu **Playwright + Chromium** ile sayfa otomatik gezildi:
   kayıt olundu, köy oluşturuldu, bina inşa edildi, dünya haritası
   görüntülendi, ordu eğitim ekranı, imparatorluk ve profil/liderlik
   ekranları — hepsinin ekran görüntüsü alınıp kullanıcıya gönderildi.
6. Ekran okuyucu/CanvasKit'in metinleri göstermek için varsayılan
   olarak Google Fonts'tan "Roboto" indirmeye çalıştığı, ağ kısıtlı
   olduğu için metinlerin görünmediği fark edildi; **sadece önizleme
   için** geçici bir yerel font eklenip tema zinciri `apply()` sırası
   düzeltilerek metinler görünür hale getirildi.
7. Önizleme bitince: geçici font, `assets/fonts/`, `web/` klasörü ve
   build çıktısı **tamamen geri alındı/silindi** — bunlar repoya
   committed olmadı. Sadece bu süreçte ortaya çıkan **gerçek, kalıcı
   değeri olan 3 düzeltme** commit edildi (bkz. aşağı).

### Önizlemede bulunan ve düzeltilen gerçek hatalar (commit 2: `eb6387e`)

- **Dünya haritası ekranı sürekli boş kalıyordu.** `WorldMapScreen`,
  `initState()` içinde köy verisi henüz yüklenmeden harita sorgusunu
  atıyor, sonra bir daha hiç denemiyordu (`IndexedStack` tüm sekmeleri
  anında mount ettiği için bu neredeyse her zaman oluşan bir
  yarış-durumuydu, tesadüfi değil). Düzeltme: ekran artık seçili köy
  hazır olduğunda **reaktif olarak** yükleniyor; köy değişirse harita
  da yeniden yükleniyor.
- **AppTheme'de tema metin stilleri için `apply()`/`copyWith()` sırası
  yanlıştı.** `headlineMedium`, `titleLarge`, `titleMedium`,
  `bodyMedium` için yapılan `copyWith` override'ları, `apply()`'den
  **önce** çalıştığı için `apply()`'ün uyguladığı (gelecekte özel bir
  font eklendiğinde devreye girecek olan) ayarları sessizce
  kaybediyordu. Sıra düzeltildi: `copyWith()` → `apply()`.
- **Ordu eğitim kartlarında kilitli birimler için ham İngilizce bina
  anahtarı** (`"BARRACKS seviye 3 gerekli"`) gösteriliyordu; artık
  katalogdan gerçek Türkçe ad çekiliyor (`"Kışla seviye 3 gerekli"`).

Bu commit `claude/age-of-empires-strategy-game-da15q4` branch'ine
pushlandı, PR #1 otomatik güncellendi.

## 9. PR takibi

Kullanıcının isteğiyle PR #1'in GitHub aktivitesine (CI, review
yorumları) abone olundu. İlk kontrolde:

- Repoda tanımlı bir GitHub Actions workflow'u **yok** → kontrol
  edilecek bir CI sonucu yok (durum "pending / 0 check").
- Çözülmemiş review yorumu veya PR yorumu yok.

Abonelik açık; yeni bir CI eklenir, review yorumu gelir ya da
mergeable durumu değişirse (merge conflict, vs.) müdahale edilecek.
Otomatik 1 saatlik kontrol hatırlatıcısı kurma denemesi izin
gerektirdiği için şu an devrede değil.

## 10. Şu anki durum — özet tablo

| Alan | Durum |
|---|---|
| Backend | Çalışıyor, 28/28 test geçiyor, uçtan uca akış doğrulandı |
| Mobil istemci | `flutter analyze`/`test` temiz; gerçek cihazda henüz denenmedi |
| Android/iOS derlemesi | Bu ortamda doğrulanamadı (SDK/Xcode yok) — kullanıcının kendi makinesinde `flutter run` ile bir kez denemesi öneriliyor |
| PR #1 | Açık, CI yok, review yorumu yok, abonelik aktif |
| Genişletilebilirlik | Bina/birim/kaynak/seviye tamamen veri-odaklı (`backend/src/data/*.ts`), istemci `/catalog`'dan okuyor |
| Sonraki adımlar | `docs/ROADMAP.md`'de listeli: PvP, ittifaklar, teknoloji ağacı dallanması, gerçek sprite/sanat, push bildirimleri, PostgreSQL, mağaza/IAP, CI/CD |

## 11. Hızlı başlangıç (hatırlatma)

```bash
# Backend
cd empire-game/backend
npm install
cp .env.example .env
npm run prisma:migrate   # DB oluşturur + NPC dünyasını seed'ler
npm run dev               # http://localhost:4000
npm test

# Mobil istemci
cd empire-game/app
flutter pub get
flutter run --dart-define=API_BASE_URL=http://<ip-adresin>:4000/api/v1
```

Detaylar için: `empire-game/README.md`, `empire-game/docs/*.md`.
