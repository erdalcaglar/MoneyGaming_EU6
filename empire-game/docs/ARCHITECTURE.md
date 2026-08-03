# Mimari

```
empire-game/
├── backend/     # Node.js + TypeScript + Express + Prisma REST API
└── app/         # Flutter mobil istemci (Android + iOS, tek kod tabanı)
```

## Neden bu yığın?

- **Flutter + Flame**: Android ve iOS'u tek Dart kod tabanından, native
  performansla hedefler. Flame, 2D "köy sahnesi" (bina grid'i, işçi
  animasyonları) için hafif ve yeterince güçlü bir oyun motorudur. UI
  ekranları (menüler, formlar) standart Flutter widget'larıyla, oyun
  sahnesi Flame `FlameGame` widget'ı ile aynı uygulama içinde birlikte
  çalışır.
- **Node.js + TypeScript + Express + Prisma**: Oyun mantığının otoritesi
  (kaynak üretimi, savaş sonucu, fetih) **sunucuda** çalışır — istemci
  hile yapamaz, ileride gerçek zamanlı PvP eklemek için sağlam bir temel
  olur. Prisma + SQLite geliştirmede sıfır kurulum sağlar; `DATABASE_URL`
  değiştirilerek üretimde PostgreSQL'e geçilir (şema aynı kalır).
- **Veri odaklı içerik**: Binalar, birimler, kaynaklar, seviye eşikleri
  `backend/src/data/*.ts` içinde tek yerde tanımlanır. İstemci bunları
  `GET /catalog` ile sunucudan çeker — yeni bir bina/birim eklemek çoğu
  zaman sadece bir veri kaydı eklemek demektir, iki tarafı da elle
  senkronize etmeye gerek kalmaz.

## Modüller (backend)

`auth` (kayıt/giriş/JWT) · `village` (kaynak tick motoru, inşa/yükseltme)
· `army` (eğitim) · `world` (harita, NPC kampları) · `battle` (savaş
çözümü, fetih) · `leaderboard` · `catalog` (içerik kataloğu).

Her modül kendi router + service + (varsa) test dosyasına sahiptir;
modüller arası bağımlılık `prisma` client ve `data` katalogları
üzerinden kurulur, birbirlerinin iç detaylarına dokunmazlar — bu da yeni
modül eklemeyi (ör. `alliance`, `chat`, `market`) izole hale getirir.

## İstemci durum yönetimi

Riverpod provider'ları: `authProvider`, `villageProvider`,
`worldMapProvider`, `armyProvider`. Tüm sunucu çağrıları `ApiClient`
(dio tabanlı, JWT interceptor'lı) üzerinden geçer.

## Güvenlik

- Şifreler bcrypt ile hashlenir, asla düz metin saklanmaz/loglanmaz.
- JWT `Authorization: Bearer <token>` header'ı ile taşınır, istemcide
  `flutter_secure_storage` (Keychain/Keystore) içinde saklanır.
- Tüm oyun-durumu değiştiren işlemler (inşa, saldırı, eğitim) sunucu
  tarafında doğrulanır; istemci sadece görselleştirir.
