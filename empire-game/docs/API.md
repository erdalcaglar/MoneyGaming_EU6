# REST API Sözleşmesi (v1)

Base URL: `/api/v1`. Kimlik doğrulama gereken uçlar `Authorization: Bearer <jwt>` ister.

## Auth
- `POST /auth/register` `{ username, email, password }` → `{ token, player }`
- `POST /auth/login` `{ identifier, password }` (identifier = kullanıcı adı ya da e-posta) → `{ token, player }`
- `GET /auth/me` → `{ player }`

## Catalog (herkese açık, içerik veri kataloğu)
- `GET /catalog` → `{ resources, buildings, units, leveling }`

## Village
- `GET /villages/me` → oyuncunun tüm köyleri (kaynaklar en güncel tick'e göre hesaplanmış)
- `GET /villages/:id` → köy detayı (binalar, işçi atamaları, birimler)
- `POST /villages/:id/buildings/:buildingId/upgrade` → yükseltmeyi başlatır (maliyet kontrolü, süre)
- `POST /villages/:id/buildings/:buildingId/workers` `{ count }` → işçi ata/çek
- `POST /villages/:id/collect` → bekleyen kaynakları tick'e göre tahsil eder (idempotent)

## Army
- `POST /villages/:id/army/train` `{ unitType, count }` → eğitim kuyruğuna ekler
- `GET /villages/:id/army` → mevcut birimler + eğitim kuyruğu

## World / Battle
- `GET /world/map?x=&y=&radius=` → yakın NPC kampları/köyleri (ve ileride oyuncular)
- `POST /battle/attack` `{ attackerVillageId, targetVillageId, units: {type: count} }`
  → `{ result: WIN|LOSS, loot, losses, xpGained, conquered }`
- `GET /battle/log` → oyuncunun son savaşları

## Leaderboard
- `GET /leaderboard?limit=50` → `{ rank, username, score, level }[]`

Tüm yanıtlar `{ data }` ya da hata durumunda `{ error: { code, message } }`
zarfı içinde döner. Zaman damgaları ISO-8601, kaynaklar `number` (ondalık
üretim oranları için).
