import { ExpressionEntry } from './types';

/**
 * Everyday spoken-German expressions: surprise, agreement, disagreement,
 * greetings, filler words and small talk — the "naive"/colloquial layer
 * the grammar engine deliberately does not grade, because native speakers
 * use these as fixed chunks, not built word-by-word.
 */
export const expressions: ExpressionEntry[] = [
  { id: 'echt', de: 'Echt?', tr: 'Gerçekten mi?', category: 'ueberraschung', note: '"Echt" aslında "gerçek/hakiki" sıfatıdır; günlük dilde tek başına "Gerçekten mi?" sorusu olarak kalıplaşmıştır. "Wirklich?" ile eş anlamlıdır ama "Echt?" çok daha günlük/samimi.' },
  { id: 'wasechtjetzt', de: 'Was, echt jetzt?', tr: 'Ne, cidden mi şimdi?', category: 'ueberraschung', note: '"Jetzt" burada zaman anlamı taşımaz, şaşkınlığı pekiştiren bir vurgu edatıdır ("gerçekten şu an inanamıyorum" tonu).' },
  { id: 'nichtdeinernst', de: 'Das ist nicht dein Ernst!', tr: 'Şaka yapıyor olmalısın!', category: 'ueberraschung', note: 'Kelimesi kelimesine "Bu senin ciddiyetin değil" demektir; "Ernst" (ciddiyet) isim olarak kullanılır. Şaşkınlıkla karışık inanmama ifade eder.' },
  { id: 'achdumeinegüte', de: 'Ach du meine Güte!', tr: 'Aman Tanrım! / Vay canına!', category: 'ueberraschung', note: 'Kelimesi kelimesine "Ah sen benim iyiliğim!" — eski bir dini/nazik ünlem kalıbı olan "meine Güte" (Tanrı\'nın lütfu) zamanla laikleşerek günlük şaşkınlık ifadesine dönüşmüştür.' },
  { id: 'krass', de: 'Krass!', tr: 'Çok fena! / Vay be!', category: 'ueberraschung', note: 'Gençlik dilinde hem olumlu hem olumsuz aşırılığı ifade eder ("krass gut" = çok iyi, "krass schlimm" = çok kötü). Aslen "keskin/sert" anlamına gelen "krass" sıfatından günlük argoya geçmiştir.' },
  { id: 'wahnsinn', de: 'Wahnsinn!', tr: 'İnanılmaz! / Çılgınlık!', category: 'ueberraschung', note: 'Asıl anlamı "delilik/çılgınlık" olan isim, tek başına ünlem gibi kullanılır; hem hayranlık hem şok ifade edebilir.' },
  { id: 'nawirklich', de: 'Na, wirklich?', tr: 'Yaa, gerçekten mi?', category: 'ueberraschung', note: '"Na" Almancada çok yönlü bir doldurma edatıdır (hazır ol, hadi, yaa gibi); burada hafif şüpheli şaşkınlık tonu katar.' },
  { id: 'ohmeingott', de: 'Oh mein Gott!', tr: 'Aman Tanrım!', category: 'ueberraschung', note: 'İngilizce "Oh my God"ın birebir çevirisi; gençler arasında Anglicism (İngilizceden ödünçleme) olarak çok yaygınlaşmıştır.' },
  { id: 'natuerlich', de: 'Na klar!', tr: 'Tabii ki!', category: 'zustimmung', note: '"Klar" (açık/net) sıfatı burada "elbette, açıkça öyle" anlamında kullanılır; "Natürlich" ile eş anlamlı ama daha samimi.' },
  { id: 'genau', de: 'Genau!', tr: 'Aynen! / Kesinlikle!', category: 'zustimmung', note: 'Asıl anlamı "tam olarak/hassas" olan zarf, günlük konuşmada tek kelimelik onay ünlemi olarak donmuştur — Türkçedeki "aynen" ile birebir aynı işlevi görür.' },
  { id: 'stimmt', de: 'Stimmt!', tr: 'Doğru! / Haklısın!', category: 'zustimmung', note: '"stimmen" fiili (doğru olmak, uymak) 3. tekil şahıs halinde donmuş; özne (das/es) düşürülerek kullanılır: "(Das) stimmt!"' },
  { id: 'aufjedenfall', de: 'Auf jeden Fall!', tr: 'Kesinlikle / Ne olursa olsun!', category: 'zustimmung', note: 'Kelimesi kelimesine "her durumda" — "Fall" (durum/vaka) isminin akkusativ hali "jeden Fall" ile kalıplaşmış bir zarf öbeğidir.' },
  { id: 'aufkeinenfall', de: 'Auf keinen Fall!', tr: 'Kesinlikle olmaz!', category: 'ablehnung', note: '"Auf jeden Fall"ın olumsuzu; "kein" (hiçbir) akkusativ "keinen Fall" ile.' },
  { id: 'kommtnichtinfrage', de: 'Das kommt nicht infrage!', tr: 'Bu söz konusu bile olamaz!', category: 'ablehnung', note: '"infrage kommen" = gündeme gelmek, seçenek olmak; olumsuzlanınca kesin reddediş anlamı kazanır.' },
  { id: 'keineahnung', de: 'Keine Ahnung!', tr: 'Hiçbir fikrim yok!', category: 'alltag', note: '"Ahnung" (sezgi/fikir) ismiyle "Ich habe keine Ahnung"un kısaltılmış günlük hali; özneyi ve fiili düşürmek konuşma dilinde çok yaygındır.' },
  { id: 'wasgehtab', de: 'Was geht ab?', tr: 'Naber?', category: 'begruessung', note: 'Sokak dilinde "Wie geht es dir?"in çok gündelik/argo hali; "abgehen" (kalkmak/olmak) fiilinin ayrılabilir öneki cümle sonuna gitmiştir.' },
  { id: 'alles klar', de: 'Alles klar?', tr: 'Her şey yolunda mı? / Naber?', category: 'begruessung', note: 'Hem selamlama hem "anlaşıldı mı" onayı olarak iki işlevlidir; bağlama göre anlam değişir.' },
  { id: 'nagut', de: 'Na gut.', tr: 'Peki, tamam o zaman.', category: 'zustimmung', note: 'İsteksiz ama kabul eden bir onay; "Na" + "gut" (iyi) kombinasyonu hafif çekimser bir ton katar.' },
  { id: 'quatsch', de: 'Quatsch!', tr: 'Saçmalık!', category: 'ablehnung', note: 'Asıl anlamı "saçma laf/gevezelik" olan isim, tek başına "Saçmalama!" ünlemi olarak kullanılır.' },
  { id: 'ehrlich', de: 'Ehrlich gesagt...', tr: 'Açıkçası...', category: 'fueller', note: '"Ehrlich" (dürüst) sıfatının zarf hali + "gesagt" (söylenmiş, Partizip II) — bir görüşü yumuşatarak sunmak için kullanılan çok yaygın bir söz başlatıcı.' },
  { id: 'sozusagen', de: 'Sozusagen...', tr: 'Bir bakıma... / Tabiri caizse...', category: 'fueller', note: 'Kelimesi kelimesine "böyle söylemek gerekirse" — "so zu sagen" üç kelimenin tek kelimeye kaynaşmasıyla oluşmuştur.' },
  { id: 'irgendwie', de: 'Irgendwie...', tr: 'Bir şekilde... / Nedense...', category: 'fueller', note: 'Konuşmacının tam ifade edemediği bir hissi yumuşatmak için kullanılan dolgu kelimesi; gençlik dilinde cümle başına sıkça eklenir.' },
  { id: 'weisstduwas', de: 'Weißt du was?', tr: 'Biliyor musun ne var?', category: 'alltag', note: 'Bir konuya dikkat çekmek için kullanılan giriş kalıbı; soru formunda ama gerçek bir cevap beklenmez, dinleyiciyi hazırlar.' },
  { id: 'machnichts', de: 'Macht nichts!', tr: 'Önemli değil!', category: 'alltag', note: '"(Das) macht nichts" = "hiçbir şey yapmaz/etkilemez"; özür kabul ederken kullanılan kalıplaşmış tepki.' },
  { id: 'kannsein', de: 'Kann sein.', tr: 'Olabilir.', category: 'zustimmung', note: '"Das kann sein" kısaltması; "können" modal fiili + "sein" mastarıyla olasılık ifade eder.' },
  { id: 'schongut', de: 'Schon gut.', tr: 'Tamam, sorun değil.', category: 'alltag', note: '"Schon" burada "zaten/çoktan" değil, yatıştırıcı bir vurgu edatıdır; "Schon gut" = "Tamam, boşver artık" tonunda.' },
];
