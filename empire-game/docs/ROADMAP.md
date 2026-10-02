# Yol Haritası — Sonradan Eklenecekler

Bu sürüm (v0.1) kayıt/giriş, tek başkent köy, kaynak toplama, inşa,
asker eğitimi, NPC kamplarına saldırı ve fetih ile çalışan uçtan uca bir
temel sunar. Aşağıdakiler bilinçli olarak sonraya bırakıldı; mimari
bunları eklemeye uygun şekilde kuruldu:

## Oynanış
- [ ] Gerçek zamanlı PvP: diğer oyuncuların köylerine saldırı (şema zaten
      `Village.ownerId` ile buna hazır; eksik olan eşleştirme/saldırı
      penceresi/kalkan mekaniği).
      Skirmish/coop modları.
- [ ] İttifaklar / klanlar, klan savaşları, sohbet.
- [ ] Çok yollu teknoloji ağacı ("dallandırma"): her bina/birim için
      birden fazla yükseltme dalı (ör. Kışla → "Ağır Zırh" ya da "Hız"
      dalı). `data/buildings.ts` içindeki `levels[]` dizisi dallanacak
      şekilde genişletilebilir (`branches: []`).
- [ ] Casusluk, moral/yorgunluk, birim taş-kağıt-makas bonusları.
- [ ] Görevler / başarımlar / günlük ödüller.
- [ ] Sezonluk etkinlikler, dünya haritası resetleri.
- [ ] Pazar/ticaret (Market binası şimdiden veri kataloğunda "coming
      soon" olarak duruyor).

## Görsel / Deneyim ("renklendirme")
- [ ] Gerçek sprite/animasyon seti (şu an düz renkli, tip-bazlı
      placeholder ikonlar kullanılıyor — `AppColors` merkezi paletten
      türetiliyor, tema motoru zaten hazır).
- [ ] Alternatif imparatorluk temaları / cosmetic skin mağazası.
- [ ] Ses efektleri ve müzik.

## Platform / Altyapı
- [ ] Push bildirimleri (inşa/eğitim tamamlandı, saldırıya uğradın vb.).
- [ ] Üretim veritabanı: SQLite → PostgreSQL geçişi (Prisma şeması
      zaten motor-agnostik yazıldı, sadece `DATABASE_URL` değişir).
- [ ] Sosyal giriş (Google/Apple Sign-In) — e-posta/kullanıcı adı akışının
      yanına eklenecek.
- [ ] Mağaza / IAP (opsiyonel kaynak paketleri).
- [ ] CI/CD (fastlane ile App Store / Play Store dağıtımı).

## Yeni içerik eklemek ne kadar kolay?

Yeni bir bina eklemek için: `backend/src/data/buildings.ts` içine bir
kayıt eklenir → istemci `GET /catalog` üzerinden otomatik görür, ikon
yoksa tip adına göre üretilen renkli placeholder kullanılır. Kod
değişikliği gerekmez. Aynısı birimler ve dünya haritası kamp tierları
için de geçerlidir.
