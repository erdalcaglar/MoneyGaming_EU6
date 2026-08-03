export interface GrammarNote {
  title: string;
  rule: string;
  why: string;
  origin: string;
  example: string;
}

/**
 * Deep-dive explanations shown behind a "Neden?" (Why?) button whenever the
 * corresponding ruleId fires in engine/grammar.ts. These go beyond the inline
 * correction message: they explain the underlying grammatical system and,
 * where useful, WHY German works this way historically/structurally — this
 * is what the user asked for ("kökenine kadar izah").
 */
export const grammarNotes: Record<string, GrammarNote> = {
  'perfekt-aux-choice': {
    title: 'Perfekt: haben mı, sein mi?',
    rule:
      'Almanca geçmiş zamanda (Perfekt) çoğu fiil "haben" ile çekimlenir. Ama BİR YER DEĞİŞTİRME (gehen, kommen, fahren, fliegen...) ya da BİR DURUM DEĞİŞİKLİĞİ (aufwachen, sterben, werden, einschlafen...) bildiren, nesne almayan (geçişsiz) fiiller "sein" ile çekimlenir.',
    why:
      'Bunun mantığı şu: "haben" (sahip olmak) bir eylemi TAMAMLAMIŞ olan özneyi vurgular ("Ich habe gegessen" = yemek yeme eylemini "elimde/üzerimde tamamlanmış" taşıyorum gibi). "sein" (olmak) ise öznenin kendisinin bir DURUMDAN başka bir DURUMA geçtiğini vurgular ("Ich bin gekommen" = ben gelmiş HALE geldim, bir konumdan diğerine geçtim). Yani seçim rastgele değil, fiilin anlamıyla ilgilidir.',
    origin:
      'Bu ayrım Cermen dillerinin ortak mirasıdır (Hollandaca ve eski İngilizcede de vardı — "she is come" gibi kalıplar 17. yüzyıl İngilizcesinde hâlâ görülür). Zamanla İngilizce bu ayrımı kaybedip her şeyi "have" ile birleştirdi, ama Almanca (Fransızca ve İtalyanca gibi) "yer değiştirme/durum değişikliği" mantığını korudu.',
    example: '"Ich habe gegessen" (yedim — haben) ama "Ich bin gekommen" (geldim — sein).',
  },
  'v2-word-order': {
    title: 'V2 kuralı: Fiil hep ikinci sırada',
    rule:
      'Almanca DÜZ CÜMLELERDE (soru ve yan cümle hariç) çekimli fiil MUTLAKA cümlenin 2. öğesidir — ilk sırada özne olsun ya da başka bir şey (zaman, yer, sebep) öne alınsın fark etmez.',
    why:
      'Almanca "V2 dili"dir: sıralama esnektir (özne, nesne, zaman ifadesi öne gelebilir) ama fiilin yeri sabittir. Bu, Türkçenin "fiil hep sonda" mantığından temelden farklıdır — Almancada vurgulamak istediğin öğeyi öne alırsın, fiil yine de 2. sırada kalır, özne ise gerekirse fiilden sonraya kayar.',
    origin:
      'V2 kuralı, İskandinav dilleri ve Felemenkçe dahil bütün Batı Cermen dillerinin ortak bir söz dizimi mirasıdır; İngilizce zamanla bu kısıtı kaybetmiştir ama Almanca katı biçimde korumuştur.',
    example: '"Ich trinke heute Kaffee." / "Heute trinke ich Kaffee." — fiil ("trinke") her ikisinde de 2. sırada.',
  },
  'subject-verb-agreement': {
    title: 'Özne-fiil uyumu',
    rule: 'Fiil, öznenin şahsına (ich/du/er.../wir/ihr/sie) göre çekimlenmelidir.',
    why: 'Almanca, Türkçe gibi zengin bir şahıs çekim sistemine sahiptir: her şahıs için farklı bir fiil sonu vardır (ich -e, du -st, er -t, wir -en, ihr -t, sie -en).',
    origin: 'Bu çekim sonları Hint-Avrupa dillerinin ortak fiil çekim mirasından gelir; Latince, Rusça ve Türkçedeki şahıs ekleriyle işlevsel olarak benzerdir.',
    example: '"ich komme" ama "er kommt" — aynı fiil, farklı şahıs sonu.',
  },
  'verb-bracket-position': {
    title: 'Satzklammer: Fiil kelepçesi',
    rule:
      'Perfekt (haben/sein + Partizip II) veya modal fiil (können/müssen... + mastar) kullanılan cümlelerde, çekimli kısım 2. sırada, çekimSİZ kısım (Partizip II ya da mastar) ise cümlenin EN SONUNDA durur.',
    why:
      'Almancada fiilin iki parçası cümlenin başını ve sonunu sarar, ortada kalan her şey (nesne, zaman, yer) bu "kelepçenin" içine yerleşir. Bu yapı dinleyiciye "cümle bitene kadar bekle, asıl fiil sonda" sinyali verir.',
    origin: 'Almanca dilbiliminde buna "Satzklammer" (cümle kelepçesi) ya da "Verbklammer" denir; Batı Cermen dillerinin karakteristik bir özelliğidir.',
    example: '"Ich bin gestern nach Berlin gefahren." — "bin" 2. sırada, "gefahren" en sonda.',
  },
  'w-frage-order': {
    title: 'W-Frage sırası',
    rule: 'Soru kelimesinden (wer/was/wo/wann/warum/wie...) hemen sonra çekimli fiil gelir, sonra özne.',
    why: 'Soru kelimesi cümlenin 1. sırasını işgal ettiği için fiil yine V2 kuralına uyup 2. sırada kalır — bu da özneyi otomatik olarak 3. sıraya iter.',
    origin: 'Aynı V2 ilkesinin soru cümlelerine uygulanmış hali; İngilizcedeki "Where do you live?" yapısının (do-destekli devrik sıra) Almancadaki daha doğrudan karşılığıdır.',
    example: '"Wo wohnst du?" (Nerede oturuyorsun?) — Wo + wohnst (fiil) + du (özne).',
  },
  'weil-verb-final': {
    title: 'Yan cümlede fiil sona gider',
    rule: '"weil" (çünkü) ve "dass" (ki/-diğini) gibi bağlaçlarla başlayan yan cümlelerde çekimli fiil cümlenin EN SONUNA gider.',
    why: 'Bu bağlaçlar cümleyi "bağımlı" (Nebensatz) yapar; bağımlı cümlelerde Almanca V2 kuralını uygulamaz, bunun yerine fiili tamamen sona iter. Bu, ana cümle ile yan cümleyi kulakla ayırt etmeyi kolaylaştırır.',
    origin: 'Bu "fiil-sonda" yapısı aslında daha eski/tarihsel Cermen söz dizimine (SOV — Özne-Nesne-Fiil) daha yakındır; ana cümleler zamanla V2\'ye kaymış, yan cümleler ise eski sıralamayı korumuştur.',
    example: '"Ich bleibe zu Hause, weil ich krank bin." — "bin" cümlenin en sonunda.',
  },
  'case-akkusativ': {
    title: 'Akkusativ (belirtme hâli)',
    rule: 'Doğrudan nesne alan fiillerde (sehen, kaufen, lieben, nehmen...) nesnenin artikeli Akkusativ olur: der→den, das/die değişmez.',
    why: 'Almancada nesneler Türkçedeki gibi "-i" ekiyle değil, artikelin biçimini değiştirerek işaretlenir. Akkusativ sadece eril (der→den) artikelde değişir, dişil ve nötrde nominativ ile aynıdır.',
    origin: 'Bu, Hint-Avrupa dillerinin eski hâl (case) sisteminden Almancaya kalan bir mirastır — Latince, Rusça ve eski Türkçedeki hâl ekleriyle aynı işlevi görür, sadece isim yerine artikel üzerinde işaretlenir.',
    example: '"Ich sehe den Mann." (Adamı görüyorum.) — "der Mann" → "den Mann".',
  },
  'case-dativ': {
    title: 'Dativ (yönelme hâli)',
    rule: 'Bazı fiiller (helfen, danken, gefallen, glauben, gehören, folgen...) nesnelerini Dativ hâlinde ister: der→dem, die→der, das→dem.',
    why: 'Bu fiiller anlam olarak "birine doğru yönelen" bir eylem taşır (yardım ETMEK birine, inanmak birine) — Türkçedeki "-e/-a" yönelme ekiyle kavramsal olarak örtüşür, ama Almancada bu bilgi artikel üzerinde taşınır.',
    origin: 'Dativ nesne alan fiiller listesi ezbere öğrenilir çünkü tarihsel gelişimi düzensizdir; birçoğu Eski Almancada da dativ yönetiyordu ve bu miras günümüze kadar değişmeden geldi.',
    example: '"Ich helfe dem Mann." (Adama yardım ediyorum.) — "der Mann" → "dem Mann".',
  },
  'article-gender-mismatch': {
    title: 'İsim cinsiyeti (der/die/das)',
    rule: 'Her Alman ismin sabit bir grameri cinsiyeti vardır (der=eril, die=dişil, das=nötr) ve bu, ismin anlamıyla değil, tarihsel gelişimiyle ilgilidir.',
    why: 'Cinsiyet çoğu zaman mantıksal değildir (das Mädchen = "kız" ama nötr!) — bu yüzden her yeni kelimeyi artikeliyle BİRLİKTE ezberlemek gerekir, sonradan tahmin etmeye çalışmak yanıltıcıdır.',
    origin: 'Almanca, Hint-Avrupa dillerinin üç cinsiyetli (eril/dişil/nötr) sistemini büyük ölçüde korumuş nadir dillerden biridir; İngilizce bu sistemi Orta Çağ\'da neredeyse tamamen kaybetmiştir.',
    example: '"der Mann" (eril), "die Frau" (dişil), "das Kind" (nötr).',
  },
  'attributive-adjective-info': {
    title: 'Sıfat çekimi (attributive)',
    rule: 'Bir sıfat doğrudan bir isimden önce kullanıldığında (artikel + sıfat + isim), sıfat isme ve artikelin türüne göre bir son ek alır.',
    why: 'Almancada sıfat, kendisinden önceki artikel bilgiyi zaten taşıyorsa (der/die/das gibi) daha "zayıf" bir ek alır (-e/-en); artikel yoksa ya da belirsizse sıfat kendisi cinsiyet/hâl bilgisini taşımak zorunda kalır ve "güçlü" ek alır.',
    origin: 'Bu "zayıf/güçlü sıfat çekimi" ayrımı Eski Almancadan miras kalan, bilgiyi cümlede bir kez taşıma prensibine dayanan bir sistemdir — modern Almancanın en zor konularından biridir, bu yüzden bu uygulamada şimdilik sadece bilgi notu olarak gösteriliyor.',
    example: '"der große Mann" (büyük adam) — "groß" burada "große" olur.',
  },
  'adjective-placement': {
    title: 'Sıfat nereye konur?',
    rule: 'Bir sıfat ya bir isimden hemen önce (der große Mann) ya da "sein/werden/bleiben" gibi bir fiilden sonra (Das Auto ist groß) kullanılabilir.',
    why: 'İkinci kullanımda ("predicative") sıfat hiç çekim eki almaz — bu, Almancanın öğrenmesi en kolay sıfat kullanımıdır ve bu uygulamada tam olarak derecelendirilir.',
    origin: 'Predicative (yüklem konumundaki) sıfatların çekimsiz kalması, Almancanın sıfat sistemi içinde İngilizceye en çok benzeyen kuraldır.',
    example: '"Das Auto ist schön." (Araba güzel.) — "schön" hiç değişmedi.',
  },
  'missing-subject': {
    title: 'Özne eksik',
    rule: 'Almanca cümlelerde (emir kipi hariç) özne neredeyse hiç düşürülmez — Türkçenin aksine, fiil çekimi özneyi belirtmeye yetmez.',
    why: 'Türkçede "geliyorum" tek başına yeterlidir çünkü çekim eki özneyi taşır; Almancada "komme" tek başına kullanılmaz, "ich komme" denmesi zorunludur.',
    origin: 'Bu, Almancanın "pro-drop olmayan" (özne düşürmeyen) bir dil olmasından kaynaklanır — İngilizce ve Fransızca gibi çoğu Batı Avrupa diliyle ortak bir özelliktir.',
    example: '"komme" ✗ → "ich komme" ✓',
  },
};

export function getGrammarNote(ruleId: string): GrammarNote | undefined {
  return grammarNotes[ruleId];
}
