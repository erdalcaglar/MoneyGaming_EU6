# Empire Age

Age of Empires ilhamlı, Android ve iOS için imparatorluk inşa/strateji
oyunu. İşçilerinle kaynak topla, altın biriktir, kale/sur/kule inşa et,
ordu eğit, dünya haritasındaki köyleri fethet ve imparatorluğunu büyüt.

Oynanışın tam kurallarını, savaş formülünü ve genişletilebilirlik
prensiplerini görmek için **`docs/GAME_DESIGN.md`** dosyasına bakın.
Neyin bilinçli olarak sonraya bırakıldığı için **`docs/ROADMAP.md`**
dosyasına bakın.

## Proje yapısı

```
empire-game/
├── backend/   # Node.js + TypeScript + Express + Prisma REST API
├── app/       # Flutter mobil istemci (Android + iOS)
└── docs/      # Tasarım, mimari, API dokümanları
```

## Hızlı başlangıç

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:migrate   # veritabanını oluşturur + NPC köylerini seed'ler
npm run dev               # http://localhost:4000
npm test                  # birim testleri çalıştırır
```

### 2. Mobil istemci

```bash
cd app
flutter pub get
# Android emülatörü host makineye 10.0.2.2 üzerinden erişir (varsayılan).
# Gerçek cihaz/iOS simülatörü için backend'in erişilebilir IP/host'unu geç:
flutter run --dart-define=API_BASE_URL=http://<bilgisayarinin-ip-adresi>:4000/api/v1
```

Bu depoda Flutter SDK ve Android/iOS derleme araç zincirleri
doğrulanamadı (bu geliştirme ortamında Android SDK / Xcode yok);
kod `flutter analyze` (0 hata) ve `flutter test` ile doğrulandı.
Gerçek bir cihazda/emülatörde çalıştırmadan önce kendi makinende
`flutter pub get` sonrası bir kez `flutter run` denemeni öneririm.

## Neler var (v0.1)

- Kullanıcı adı + e-posta + şifre ile kayıt/giriş (JWT)
- Otomatik başkent köy, 6x6 inşa alanı
- İşçi atayarak altın/yiyecek/odun üretimi (çevrimdışıyken de işler)
- Bina inşa/yükseltme (Kale, Ev, Altın Madeni, Çiftlik, Kereste Kampı,
  Depo, Sur, Gözcü Kulesi, Kışla, Okçu Meydanı, Ahır)
- Asker eğitimi (Milis, Kılıçlı Savaşçı, Okçu, Şövalye)
- Dünya haritası, NPC kampları/köyleri, saldırı ve **fetih** (köy
  imparatorluğa eklenir)
- Seviye/XP sistemi, liderlik tablosu
- Flame ile render edilen köy sahnesi, ortaçağ temalı arayüz

## Genişletilebilirlik

Tüm oyun içeriği (bina, birim, kaynak, seviye eşiği, NPC kademesi)
`backend/src/data/*.ts` altında **veri** olarak tanımlı. İstemci bunu
`GET /catalog` ile okur — yeni içerik eklemek genelde sadece bir veri
kaydı eklemek demektir. Detaylar için `docs/ARCHITECTURE.md` ve
`docs/ROADMAP.md`.
