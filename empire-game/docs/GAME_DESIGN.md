# Empire Age — Oyun Tasarım Dokümanı

Age of Empires ilhamlı, mobil (Android/iOS) için tek elden yönetilen bir
imparatorluk inşa/strateji oyunu. Bu doküman oynanış kurallarını ve
genişletme noktalarını tanımlar. Tüm içerik (bina, birim, kaynak, dünya
haritası kademeleri) kod değil **veri** olarak tanımlanır
(`backend/src/data/*.ts`), böylece yeni içerik eklemek uygulamayı yeniden
yazmayı gerektirmez.

## 1. Temel Döngü

1. Oyuncu kayıt olur (kullanıcı adı + e-posta + şifre).
2. Bir başkent köy (capital village) otomatik oluşturulur.
3. Köyde işçiler (workers) kaynak binalarına atanır → zamanla altın,
   yiyecek, odun üretir (çevrimdışıyken de geçen süreye göre hesaplanır).
4. Oyuncu bina inşa eder / yükseltir (Kale, Ev, Altın Madeni, Çiftlik,
   Kereste Kampı, Depo, Sur, Gözcü Kulesi, Kışla, Ahır, Okçu Meydanı).
5. Kışla/Ahır/Okçu Meydanı'nda asker eğitir.
6. Dünya haritasında yakın NPC kampları/köyleri ve (ileride) diğer
   oyuncuları görür, saldırı gönderir.
7. Savaş sunucuda anlık çözülür: saldırı gücü vs savunma gücü
   (sur + kule + garnizon). Kazanılırsa yağma + XP alınır; hedef bir
   "köy" ise ve savunma tamamen kırılırsa **fethedilir** ve oyuncunun
   imparatorluğuna yeni bir köy olarak eklenir.
8. Kazanılan XP ile oyuncu seviye atlar → yeni bina/birim türleri,
   yeni kaynak/nüfus tavanı açılır.
9. Puan tablosu (leaderboard) imparatorluk gücüne göre sıralanır.

## 2. Kaynaklar

| Kaynak | Üretim kaynağı | Kullanım |
|---|---|---|
| Altın (gold) | Altın Madeni, yağma | İnşa, yükseltme, asker eğitimi |
| Yiyecek (food) | Çiftlik | Nüfus/asker bakımı, inşa |
| Odun (wood) | Kereste Kampı | İnşa, yükseltme |
| Nüfus (population) | Ev binaları belirler (tavan) | İşçi + asker sayısı sınırı |
| Zafer Puanı (points) | Bina/asker/fetih değerinden hesaplanır | Sadece skor — harcanamaz, liderlik tablosu |

Depo (Warehouse) kaynak taşma limitini belirler.

## 3. Binalar (başlangıç kataloğu — genişletilebilir)

`TOWN_HALL, HOUSE, GOLD_MINE, FARM, LUMBER_CAMP, WAREHOUSE, WALL,
WATCH_TOWER, BARRACKS, STABLE, ARCHERY_RANGE, MARKET(gelecek)`

Her binanın seviye başına: maliyet, üretim/etkisi, inşa süresi ve
gerektirdiği minimum Kale seviyesi vardır. Yeni bina eklemek için
`buildings.ts` içine bir kayıt eklemek yeterlidir.

## 4. Birimler (başlangıç kataloğu — genişletilebilir)

`MILITIA, SWORDSMAN, ARCHER, KNIGHT` — her biri saldırı/savunma gücü,
eğitim maliyeti/süresi ve gerektirdiği bina seviyesine sahiptir.

## 5. Savaş Formülü (MVP)

```
attackPower  = Σ(unit.attack * count) * moraleFactor
defensePower = Σ(garrison.defense * count) + wallBonus(level) + towerBonus(level)
ratio        = attackPower / max(defensePower, 1)
sonuç        = ratio >= 1 ? KAZANDI : KAYBETTİ
loot         = kazanınca hedefin kaynaklarının %(min(50, 15+ratio*10))'i
kayıplar     = ratio'ya göre orantılı asker kaybı (her iki taraf)
fetih        = KAZANDI && hedef.type == VILLAGE && defensePower sonrası <= 0
```

Gelecekte: birim taş-kağıt-makas bonusları, moral/yorgunluk, casusluk,
gerçek zamanlı PvP eşleştirme.

## 6. Seviyeleme

XP kaynakları: kaynak toplama (küçük oranlarda), inşa/yükseltme
tamamlama, savaş kazanma. Seviye eşiği tablosu `leveling.ts` içinde.
Seviye atlayınca: kaynak/nüfus tavanı artışı + yeni bina/birim
kilitleri açılır.

## 7. Genişletilebilirlik ve Yol Haritası (bkz. `ROADMAP.md`)

Kasıtlı olarak MVP dışında bırakılıp ileride eklenecek alanlar:
gerçek zamanlı PvP eşleştirme, ittifaklar/klanlar, sohbet, görevler
/başarımlar, sezonluk etkinlikler, pazar/ticaret, kozmetik temalar
("renklendirme"), çok yollu teknoloji ağacı ("dallandırma" — bina/birim
başına birden fazla yükseltme dalı), push bildirimleri, mağaza/IAP.

Bu doküman ve `backend/src/data/*` dosyaları, oyunun kod tabanını
değiştirmeden büyütülebilmesi için referans noktasıdır.
