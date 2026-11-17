import { allVerbs } from '../data';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { allArticles } from '../data/articles';
import { VerbEntry, NounEntry, Case, Gender } from '../data/types';
import { conjugatePresent, partizipII, reflexivePronoun, Person } from './conjugate';
import { SentenceToken, VerbToken, ArticleToken, NounToken, AdjectiveToken, PronounToken, ConnectorToken, QuestionToken } from './tokens';

export type Severity = 'error' | 'info';

export interface Issue {
  ruleId: string;
  severity: Severity;
  message: string;
}

export interface CheckResult {
  correct: boolean;
  /** false = the engine could not produce (or verify) a valid correction;
   * correctedSentence should then NOT be shown as "the right answer". */
  correctable: boolean;
  issues: Issue[];
  yourSentence: string;
  correctedSentence: string;
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

function verbById(id: string): VerbEntry {
  const v = allVerbs.find((x) => x.id === id);
  if (!v) throw new Error(`Unknown verb id: ${id}`);
  return v;
}
function nounById(id: string): NounEntry {
  const n = nouns.find((x) => x.id === id);
  if (!n) throw new Error(`Unknown noun id: ${id}`);
  return n;
}
function adjectiveBase(id: string): string {
  return adjectives.find((x) => x.id === id)?.adjective ?? id;
}
function findArticleFor(gender: Gender, caseNeeded: Case, definite: boolean) {
  return allArticles.find((a) => a.gender === gender && a.case === caseNeeded && a.definite === definite);
}

const CASE_TR: Record<Case, string> = { nominativ: 'Nominativ', akkusativ: 'Akkusativ', dativ: 'Dativ' };
const COPULA_INFINITIVES = ['sein', 'werden', 'bleiben'];
const SUBORDINATORS = ['weil', 'dass'];
const COORDINATORS = ['und', 'aber', 'oder', 'denn'];

function isSubordinator(t: SentenceToken | undefined): t is ConnectorToken {
  return !!t && t.kind === 'connector' && SUBORDINATORS.includes(t.word);
}
function isCoordinator(t: SentenceToken | undefined): t is ConnectorToken {
  return !!t && t.kind === 'connector' && COORDINATORS.includes(t.word);
}

// ---------------------------------------------------------------------------
// Adjective declension (attributive: Artikel + Adjektiv + Nomen)
// ---------------------------------------------------------------------------

/** Ending an adjective takes between an article and its noun (singular). */
export function adjectiveEnding(definite: boolean, gender: Gender, kase: Case): string {
  if (kase === 'dativ') return 'en';
  if (definite) {
    if (kase === 'nominativ') return 'e';
    return gender === 'der' ? 'en' : 'e';
  }
  if (gender === 'der') return kase === 'nominativ' ? 'er' : 'en';
  if (gender === 'die') return 'e';
  return 'es';
}

function adjectiveStem(base: string): string {
  if (base === 'hoch') return 'hoh';
  if (base === 'anders') return 'ander';
  if (base.endsWith('el')) return `${base.slice(0, -2)}l`; // dunkel -> dunkl-
  if (base.endsWith('auer') || base.endsWith('euer')) return `${base.slice(0, -2)}r`; // teuer -> teur-
  if (base.endsWith('e')) return base.slice(0, -1);
  return base;
}

export function declineAdjective(base: string, definite: boolean, gender: Gender, kase: Case): string {
  return adjectiveStem(base) + adjectiveEnding(definite, gender, kase);
}

// ---------------------------------------------------------------------------
// Chunking: Artikel (+ Adjektive) + Nomen is ONE sentence element
// ---------------------------------------------------------------------------

/** If tokens[i] is an article that starts "Artikel Adjektiv* Nomen", returns the noun's index, else -1. */
function nounPhraseEnd(tokens: SentenceToken[], i: number): number {
  if (tokens[i]?.kind !== 'article') return -1;
  let j = i + 1;
  while (tokens[j]?.kind === 'adjective') j += 1;
  return tokens[j]?.kind === 'noun' ? j : -1;
}

interface NpChunk {
  type: 'np';
  tokens: SentenceToken[];
  article?: ArticleToken;
  adjectives: AdjectiveToken[];
  noun: NounToken;
  entry: NounEntry;
}
interface SingleChunk {
  type: 'single';
  tokens: SentenceToken[];
  token: SentenceToken;
}
type Chunk = NpChunk | SingleChunk;

function chunkTokens(tokens: SentenceToken[]): Chunk[] {
  const chunks: Chunk[] = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    const end = nounPhraseEnd(tokens, i);
    if (end >= 0) {
      const noun = tokens[end] as NounToken;
      chunks.push({
        type: 'np',
        tokens: tokens.slice(i, end + 1),
        article: t as ArticleToken,
        adjectives: tokens.slice(i + 1, end) as AdjectiveToken[],
        noun,
        entry: nounById(noun.nounId),
      });
      i = end + 1;
    } else if (t.kind === 'noun') {
      chunks.push({ type: 'np', tokens: [t], adjectives: [], noun: t, entry: nounById(t.nounId) });
      i += 1;
    } else {
      chunks.push({ type: 'single', tokens: [t], token: t });
      i += 1;
    }
  }
  return chunks;
}

// ---------------------------------------------------------------------------
// Sentence frame: optional coordinator, optional lead word, then the body
// ---------------------------------------------------------------------------

interface Frame {
  kind: 'main' | 'wfrage' | 'subordinate';
  coordinator?: ConnectorToken;
  lead?: QuestionToken | ConnectorToken;
  body: SentenceToken[];
}

function frameOf(tokens: SentenceToken[]): Frame {
  let rest = tokens;
  let coordinator: ConnectorToken | undefined;
  if (isCoordinator(rest[0])) {
    coordinator = rest[0];
    rest = rest.slice(1);
  }
  const first = rest[0];
  if (first?.kind === 'question') return { kind: 'wfrage', coordinator, lead: first, body: rest.slice(1) };
  if (isSubordinator(first)) return { kind: 'subordinate', coordinator, lead: first, body: rest.slice(1) };
  return { kind: 'main', coordinator, body: rest };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

export interface RenderedToken {
  uid: string;
  text: string;
  /** separable prefix that belongs at the end of the clause ("stehe … auf") */
  tail?: string;
}

/** Person the finite verb follows when the student didn't pick one explicitly. */
function defaultSubjectPerson(tokens: SentenceToken[]): Person {
  const p = tokens.find((t): t is PronounToken => t.kind === 'pronoun');
  return p ? p.person : 'er_sie_es';
}

export function renderTokens(tokens: SentenceToken[]): RenderedToken[] {
  const subjectPerson = defaultSubjectPerson(tokens);
  const subordinate = frameOf(tokens).kind === 'subordinate';
  const out: RenderedToken[] = [];

  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    const end = nounPhraseEnd(tokens, i);
    if (end >= 0) {
      const article = t as ArticleToken;
      out.push({ uid: article.uid, text: article.surface });
      for (let k = i + 1; k < end; k += 1) {
        const adj = tokens[k] as AdjectiveToken;
        out.push({ uid: adj.uid, text: declineAdjective(adjectiveBase(adj.adjectiveId), article.definite, article.gender, article.case) });
      }
      const noun = tokens[end] as NounToken;
      out.push({ uid: noun.uid, text: nouns.find((n) => n.id === noun.nounId)?.noun ?? '?' });
      i = end + 1;
      continue;
    }

    switch (t.kind) {
      case 'pronoun':
        out.push({ uid: t.uid, text: t.text });
        break;
      case 'verb': {
        const verb = allVerbs.find((v) => v.id === t.verbId);
        if (!verb) {
          out.push({ uid: t.uid, text: '?' });
        } else if (t.mode === 'partizip') {
          out.push({ uid: t.uid, text: partizipII(verb) });
        } else if (t.mode === 'infinitiv') {
          out.push({ uid: t.uid, text: verb.infinitive });
        } else {
          const person = t.chosenPerson ?? subjectPerson;
          let finite = conjugatePresent(verb, person);
          let tail: string | undefined;
          if (verb.separablePrefix) {
            if (subordinate) finite = verb.separablePrefix + finite;
            else tail = verb.separablePrefix;
          }
          if (verb.reflexive) {
            finite = subordinate ? `${reflexivePronoun(person)} ${finite}` : `${finite} ${reflexivePronoun(person)}`;
          }
          out.push({ uid: t.uid, text: finite, tail });
        }
        break;
      }
      case 'article':
        out.push({ uid: t.uid, text: t.surface });
        break;
      case 'noun':
        out.push({ uid: t.uid, text: nouns.find((n) => n.id === t.nounId)?.noun ?? '?' });
        break;
      case 'adjective':
        out.push({ uid: t.uid, text: adjectiveBase(t.adjectiveId) });
        break;
      case 'question':
      case 'connector':
        out.push({ uid: t.uid, text: t.word });
        break;
      case 'freetext':
        out.push({ uid: t.uid, text: t.text });
        break;
      default:
        break;
    }
    i += 1;
  }
  return out;
}

/** W-Frage, or a verb-first Ja/Nein-Frage. */
export function isQuestionSentence(tokens: SentenceToken[]): boolean {
  const frame = frameOf(tokens);
  if (frame.kind === 'wfrage') return true;
  const first = frame.body[0];
  return frame.kind === 'main' && first?.kind === 'verb' && first.mode === 'finite';
}

export function renderSentence(tokens: SentenceToken[]): string {
  const parts = renderTokens(tokens);
  const words = parts.map((p) => p.text).filter(Boolean);
  parts.forEach((p) => {
    if (p.tail) words.push(p.tail);
  });
  const text = words.join(' ');
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1) + (isQuestionSentence(tokens) ? '?' : '.');
}

// ---------------------------------------------------------------------------
// Verb shape
// ---------------------------------------------------------------------------

interface Shape {
  kind: 'simple' | 'perfekt' | 'modal' | 'incomplete';
  finiteVerbToken?: VerbToken; // the conjugated verb (aux, modal, or the lone verb)
  secondaryVerbToken?: VerbToken; // Partizip II or infinitive companion
  governingVerb?: VerbEntry; // the verb whose valency (case) governs the objects
}

function detectShape(verbTokens: VerbToken[]): Shape {
  const finite = verbTokens.filter((v) => v.mode === 'finite');
  const partizipien = verbTokens.filter((v) => v.mode === 'partizip');
  const infinitives = verbTokens.filter((v) => v.mode === 'infinitiv');

  const auxFinite = finite.find((v) => ['haben', 'sein'].includes(verbById(v.verbId).infinitive));
  const modalFinite = finite.find((v) => verbById(v.verbId).isModal);

  if (finite.length === 1 && auxFinite && partizipien.length === 1 && infinitives.length === 0) {
    return { kind: 'perfekt', finiteVerbToken: auxFinite, secondaryVerbToken: partizipien[0], governingVerb: verbById(partizipien[0].verbId) };
  }
  if (finite.length === 1 && modalFinite && infinitives.length === 1 && partizipien.length === 0) {
    return { kind: 'modal', finiteVerbToken: modalFinite, secondaryVerbToken: infinitives[0], governingVerb: verbById(infinitives[0].verbId) };
  }
  if (finite.length === 1 && partizipien.length === 0 && infinitives.length === 0) {
    return { kind: 'simple', finiteVerbToken: finite[0], governingVerb: verbById(finite[0].verbId) };
  }
  return { kind: 'incomplete' };
}

// ---------------------------------------------------------------------------
// Subject
// ---------------------------------------------------------------------------

interface Subject {
  /** null when the question word itself ("Wer kommt?") is the subject */
  chunk: Chunk | null;
  person: Person;
  text: string;
}

function npText(c: NpChunk): string {
  return c.article ? `${c.article.surface} ${c.entry.noun}` : c.entry.noun;
}

function resolveSubject(frame: Frame, chunks: Chunk[], issues: Issue[]): { subject: Subject | null; pronounCount: number } {
  const pronounChunks = chunks.filter((c): c is SingleChunk => c.type === 'single' && c.token.kind === 'pronoun');
  const nps = chunks.filter((c): c is NpChunk => c.type === 'np');

  if (pronounChunks.length > 1) {
    issues.push({ ruleId: 'too-many-subjects', severity: 'error', message: 'Bir cümlede yalnızca bir özne zamiri olabilir. Fazla olanı çıkar.' });
  }
  if (pronounChunks.length >= 1) {
    const p = pronounChunks[0].token as PronounToken;
    return { subject: { chunk: pronounChunks[0], person: p.person, text: p.text }, pronounCount: pronounChunks.length };
  }

  const nominative = nps.find((c) => c.article?.case === 'nominativ');
  if (nominative) return { subject: { chunk: nominative, person: 'er_sie_es', text: npText(nominative) }, pronounCount: 0 };

  if (frame.kind === 'wfrage' && ['wer', 'was'].includes((frame.lead as QuestionToken).word)) {
    return { subject: { chunk: null, person: 'er_sie_es', text: (frame.lead as QuestionToken).word }, pronounCount: 0 };
  }

  if (nps.length > 0) {
    const first = nps[0];
    if (first.article) {
      const right = findArticleFor(first.entry.gender, 'nominativ', first.article.definite);
      issues.push({
        ruleId: 'subject-nominativ',
        severity: 'error',
        message: `Özne her zaman Nominativ olur. "${npText(first)}" ${CASE_TR[first.article.case]} hâlinde; özne olarak "${right?.surface ?? first.article.surface} ${first.entry.noun}" olmalı.`,
      });
    }
    return { subject: { chunk: first, person: 'er_sie_es', text: npText(first) }, pronounCount: 0 };
  }

  issues.push({
    ruleId: 'missing-subject',
    severity: 'error',
    message: 'Cümlede özne yok. Bir zamir (ich, du, er…) ya da bir isim (der Mann, die Frau…) ekle.',
  });
  return { subject: null, pronounCount: 0 };
}

// ---------------------------------------------------------------------------
// Rule checks
// ---------------------------------------------------------------------------

const ORDER_RULES = new Set(['v2-word-order', 'subject-position', 'verb-bracket-position', 'w-frage-order', 'weil-verb-final', 'subordinate-subject-position']);

function checkOrder(frame: Frame, chunks: Chunk[], shape: Shape, subject: Subject | null, issues: Issue[]): void {
  const indexOf = (t: SentenceToken | undefined) => (t ? chunks.findIndex((c) => c.tokens.includes(t)) : -1);
  const v = indexOf(shape.finiteVerbToken);
  const sec = indexOf(shape.secondaryVerbToken);
  const s = subject?.chunk ? chunks.indexOf(subject.chunk) : -1;
  const last = chunks.length - 1;

  if (frame.kind === 'main') {
    if (v === 0 && s === 1) {
      issues.push({
        ruleId: 'ja-nein-frage',
        severity: 'info',
        message: 'Fiil başta, özne hemen ardında: bu bir Evet/Hayır sorusu (Ja/Nein-Frage). Düz cümlede fiil 2. sırada olurdu.',
      });
    } else if (v !== 1) {
      issues.push({
        ruleId: 'v2-word-order',
        severity: 'error',
        message: `Düz cümlede çekimli fiil İKİNCİ öğe olmalı (V2 kuralı); şu an ${v + 1}. sırada. Örn. "Ich trinke Wasser." ya da "Heute trinke ich Wasser."`,
      });
    } else if (subject?.chunk && s !== 0 && s !== 2) {
      issues.push({
        ruleId: 'subject-position',
        severity: 'error',
        message: 'Özne ya en başta ya da (başka bir öğe öne alındıysa) fiilden hemen sonra gelir: "Heute gehe ich nach Hause."',
      });
    }
    if (sec >= 0 && sec !== last) {
      issues.push({
        ruleId: 'verb-bracket-position',
        severity: 'error',
        message: 'İkinci fiil parçası (Partizip II ya da mastar) cümlenin EN SONUNA gider: "Ich bin gestern nach Hause gegangen."',
      });
    }
    return;
  }

  if (frame.kind === 'wfrage') {
    if (v !== 0) {
      issues.push({
        ruleId: 'w-frage-order',
        severity: 'error',
        message: 'Soru kelimesinden hemen sonra çekimli fiil gelir, sonra özne: "Wo wohnst du?"',
      });
    } else if (subject?.chunk && s !== 1) {
      issues.push({ ruleId: 'w-frage-order', severity: 'error', message: 'Soru cümlesinde özne fiilden hemen sonra gelir: [Soru kelimesi] + [Fiil] + [Özne].' });
    }
    if (sec >= 0 && sec !== last) {
      issues.push({ ruleId: 'verb-bracket-position', severity: 'error', message: 'İkinci fiil parçası (Partizip II ya da mastar) soruda da en sona gider.' });
    }
    return;
  }

  // subordinate clause
  if (subject?.chunk && s !== 0) {
    issues.push({ ruleId: 'subordinate-subject-position', severity: 'error', message: '"weil/dass" bağlacından hemen sonra özne gelir: "weil ich …"' });
  }
  if (sec >= 0) {
    if (!(sec === last - 1 && v === last)) {
      issues.push({
        ruleId: 'weil-verb-final',
        severity: 'error',
        message: 'Yan cümlede çekimli fiil en sona, çekimsiz parça (Partizip/mastar) onun hemen önüne gider: "…, weil ich spät gekommen bin."',
      });
    }
  } else if (v !== last) {
    issues.push({
      ruleId: 'weil-verb-final',
      severity: 'error',
      message: 'Yan cümlede ("weil/dass…") çekimli fiil 2. sırada değil, cümlenin EN SONUNDA olur: "…, weil ich Deutsch lerne."',
    });
  }
}

function checkAgreement(finite: VerbToken, subject: Subject, issues: Issue[]): void {
  if (!finite.chosenPerson || finite.chosenPerson === subject.person) return;
  const verb = verbById(finite.verbId);
  issues.push({
    ruleId: 'subject-verb-agreement',
    severity: 'error',
    message: `Fiil özneyle uyuşmuyor. "${subject.text}" ile "${conjugatePresent(verb, finite.chosenPerson)}" değil, "${conjugatePresent(verb, subject.person)}" kullanılır.`,
  });
}

function auxVerbEntry(aux: 'haben' | 'sein'): VerbEntry {
  const v = allVerbs.find((x) => x.infinitive === aux);
  if (!v) throw new Error('aux verb missing from data');
  return v;
}

function checkPerfektAux(finite: VerbToken, governingVerb: VerbEntry, subject: Subject | null, issues: Issue[]): void {
  const used = verbById(finite.verbId);
  if (used.infinitive === governingVerb.auxiliary) return;
  const needed = governingVerb.auxiliary;
  const person = subject?.person ?? 'er_sie_es';
  const example = `… ${conjugatePresent(auxVerbEntry(needed), person)} … ${partizipII(governingVerb)}`;
  issues.push({
    ruleId: 'perfekt-aux-choice',
    severity: 'error',
    message:
      needed === 'sein'
        ? `"${governingVerb.infinitive}" yer ya da durum değişikliği bildirir; Perfekt'te "haben" değil "sein" alır: "${example}".`
        : `"${governingVerb.infinitive}" Perfekt'te "sein" değil "haben" alır: "${example}".`,
  });
}

/** How a non-subject noun phrase must be marked, or null when the engine has no opinion. */
function requiredObjectCase(c: NpChunk, objects: NpChunk[], verb: VerbEntry): Case | null {
  if (COPULA_INFINITIVES.includes(verb.infinitive)) return 'nominativ';
  if (!verb.objectCase) return null;
  if (verb.ditransitive && verb.objectCase === 'akkusativ' && c.article?.case === 'dativ') {
    const dativeCount = objects.filter((o) => o.article?.case === 'dativ').length;
    if (dativeCount === 1) return 'dativ'; // "Ich zeige dem Mann das Bild."
  }
  return verb.objectCase;
}

function checkNounPhrases(chunks: Chunk[], subject: Subject | null, verb: VerbEntry | undefined, issues: Issue[]): void {
  const nps = chunks.filter((c): c is NpChunk => c.type === 'np');
  const objects = nps.filter((c) => c !== subject?.chunk);

  nps.forEach((c) => {
    if (!c.article) return;
    if (c.article.gender !== c.entry.gender) {
      const right = findArticleFor(c.entry.gender, c.article.case, c.article.definite);
      issues.push({
        ruleId: 'article-gender-mismatch',
        severity: 'error',
        message: `"${c.entry.noun}" bir ${c.entry.gender}-ismidir; "${c.article.surface}" ona uymuyor. Doğrusu: "${right?.surface ?? c.article.surface} ${c.entry.noun}".`,
      });
      return;
    }
    if (c === subject?.chunk || !verb) return;

    const needed = requiredObjectCase(c, objects, verb);
    if (needed === null) {
      if (c.article.case === 'nominativ') {
        issues.push({
          ruleId: 'extra-nominativ',
          severity: 'error',
          message: `"${npText(c)}" Nominativ, ama cümlenin öznesi zaten "${subject?.text ?? '…'}". Bir cümlede ("sein" hariç) yalnızca özne Nominativ olur.`,
        });
      }
      return;
    }
    if (c.article.case === needed) return;

    const right = findArticleFor(c.entry.gender, needed, c.article.definite);
    const fix = `"${right?.surface ?? c.article.surface} ${c.entry.noun}"`;
    if (needed === 'nominativ') {
      issues.push({
        ruleId: 'copula-nominativ',
        severity: 'error',
        message: `"${verb.infinitive}" nesne almaz, iki tarafı eşitler; bu yüzden ardından gelen isim de Nominativ kalır. Doğrusu: ${fix}.`,
      });
    } else {
      issues.push({
        ruleId: needed === 'akkusativ' ? 'case-akkusativ' : 'case-dativ',
        severity: 'error',
        message: `"${verb.infinitive}" ${CASE_TR[needed]} nesne ister, ama "${c.article.surface}" ${CASE_TR[c.article.case]}. Doğrusu: ${fix}.`,
      });
    }
  });
}

/** sein/werden/bleiben link the subject to ONE thing: a noun or an adjective, not both. */
function checkCopulaPredicates(chunks: Chunk[], subject: Subject | null, verb: VerbEntry | undefined, issues: Issue[]): void {
  if (!verb || !subject || !COPULA_INFINITIVES.includes(verb.infinitive)) return;
  const predicateNps = chunks.filter((c): c is NpChunk => c.type === 'np' && c !== subject.chunk);
  const predicateAdjectives = chunks.filter((c): c is SingleChunk => c.type === 'single' && c.token.kind === 'adjective');
  if (predicateNps.length + predicateAdjectives.length <= 1) return;

  let hint = '';
  if (predicateNps.length === 1 && predicateAdjectives.length === 1) {
    const np = predicateNps[0];
    const article = np.article ? findArticleFor(np.entry.gender, 'nominativ', np.article.definite)?.surface ?? np.article.surface : '';
    const phrase = `${article} ${np.entry.noun}`.trim();
    const adj = adjectiveBase((predicateAdjectives[0].token as AdjectiveToken).adjectiveId);
    hint = ` Belki şunu demek istedin: "${phrase.charAt(0).toUpperCase()}${phrase.slice(1)} ${conjugatePresent(verb, 'er_sie_es')} ${adj}."`;
  }
  issues.push({
    ruleId: 'copula-extra-subject',
    severity: 'error',
    message: `"${verb.infinitive}" özneyi tek bir şeye bağlar: ya bir isme ("Ich bin Lehrer") ya bir sıfata ("Ich bin müde"). Burada "${subject.text}" için birden fazla şey söylenmiş.${hint}`,
  });
}

function noteAttributiveAdjectives(chunks: Chunk[], issues: Issue[]): void {
  const forms: string[] = [];
  chunks.forEach((c) => {
    if (c.type !== 'np' || !c.article) return;
    const article = c.article;
    c.adjectives.forEach((a) => {
      const base = adjectiveBase(a.adjectiveId);
      forms.push(`${base} → ${declineAdjective(base, article.definite, article.gender, article.case)}`);
    });
  });
  if (forms.length === 0) return;
  issues.push({
    ruleId: 'attributive-adjective-info',
    severity: 'info',
    message: `Artikel ile isim arasındaki sıfat ek alır (${forms.join(', ')}). Eki artikelin türü, ismin cinsiyeti ve hâl birlikte belirler; uygulama senin için ekledi.`,
  });
}

// ---------------------------------------------------------------------------
// Analysis pipeline
// ---------------------------------------------------------------------------

interface Analysis {
  issues: Issue[];
  frame: Frame;
  chunks: Chunk[];
  shape: Shape;
  subject: Subject | null;
  pronounCount: number;
  /** structural problem that makes an automatic fix unsafe */
  blocked: boolean;
}

function runChecks(tokens: SentenceToken[]): Analysis {
  const issues: Issue[] = [];
  const frame = frameOf(tokens);
  const chunks = chunkTokens(frame.body);
  let blocked = false;

  if (frame.body.some((t) => t.kind === 'question' || t.kind === 'connector')) {
    issues.push({ ruleId: 'misplaced-lead', severity: 'error', message: 'Soru kelimesi ve bağlaçlar şimdilik yalnızca cümlenin başında kullanılabiliyor.' });
    blocked = true;
  }
  if (chunks.some((c) => c.type === 'single' && c.token.kind === 'article')) {
    issues.push({ ruleId: 'dangling-article', severity: 'error', message: 'Bir artikel tek başına kalmış. Artikelden sonra (araya sıfat girebilir) bir isim gelmeli: "der Mann", "der gute Mann".' });
    blocked = true;
  }

  const shape = detectShape(frame.body.filter((t): t is VerbToken => t.kind === 'verb'));
  if (shape.kind === 'incomplete') {
    issues.push({
      ruleId: 'incomplete-verb-structure',
      severity: 'error',
      message: 'Fiil yapısı tam değil. Ya tek bir çekimli fiil, ya "haben/sein" + Partizip II, ya da modal fiil + mastar kullan.',
    });
    blocked = true;
  }

  const { subject, pronounCount } = resolveSubject(frame, chunks, issues);
  if (!subject || pronounCount > 1) blocked = true;

  if (shape.kind !== 'incomplete' && shape.finiteVerbToken) {
    checkOrder(frame, chunks, shape, subject, issues);
    if (subject) checkAgreement(shape.finiteVerbToken, subject, issues);
    if (shape.kind === 'perfekt' && shape.governingVerb) checkPerfektAux(shape.finiteVerbToken, shape.governingVerb, subject, issues);
  }

  checkNounPhrases(chunks, subject, shape.governingVerb, issues);
  checkCopulaPredicates(chunks, subject, shape.governingVerb, issues);
  noteAttributiveAdjectives(chunks, issues);

  return { issues, frame, chunks, shape, subject, pronounCount, blocked };
}

// ---------------------------------------------------------------------------
// Best-effort correction. The caller re-verifies the result with runChecks()
// before trusting it, so a rule this function can't repair never produces a
// fake "right answer".
// ---------------------------------------------------------------------------

function attemptCorrection(tokens: SentenceToken[], a: Analysis): SentenceToken[] | null {
  const { frame, chunks, shape, subject } = a;
  if (a.blocked || !subject || !shape.finiteVerbToken) return null;

  const patches = new Map<string, SentenceToken>();

  // Verb: agree with the subject; in Perfekt, use the auxiliary the main verb needs.
  let finite: VerbToken = { ...shape.finiteVerbToken, chosenPerson: subject.person };
  if (shape.kind === 'perfekt' && shape.governingVerb) {
    finite = { ...finite, verbId: auxVerbEntry(shape.governingVerb.auxiliary).id };
  }
  patches.set(finite.uid, finite);

  // Noun phrases: right gender, and the case their role calls for.
  const nps = chunks.filter((c): c is NpChunk => c.type === 'np');
  const objects = nps.filter((c) => c !== subject.chunk);
  nps.forEach((c) => {
    if (!c.article) return;
    let needed: Case = c.article.case;
    if (c === subject.chunk) needed = 'nominativ';
    else if (shape.governingVerb) needed = requiredObjectCase(c, objects, shape.governingVerb) ?? c.article.case;
    const right = findArticleFor(c.entry.gender, needed, c.article.definite);
    if (right) patches.set(c.article.uid, { ...c.article, surface: right.surface, gender: right.gender, case: right.case });
  });

  const patched = (t: SentenceToken) => patches.get(t.uid) ?? t;
  const head: SentenceToken[] = [...(frame.coordinator ? [frame.coordinator] : []), ...(frame.lead ? [frame.lead] : [])];

  // Keep the student's own word order unless the order itself was wrong.
  if (!a.issues.some((i) => ORDER_RULES.has(i.ruleId))) return [...head, ...frame.body.map(patched)];

  const finiteChunk = chunks.find((c) => c.tokens.includes(shape.finiteVerbToken as SentenceToken));
  const secondaryChunk = shape.secondaryVerbToken ? chunks.find((c) => c.tokens.includes(shape.secondaryVerbToken as SentenceToken)) : undefined;
  const middle = chunks.filter((c) => c !== subject.chunk && c !== finiteChunk && c !== secondaryChunk);
  const subj = subject.chunk ? [subject.chunk] : [];
  const fin = finiteChunk ? [finiteChunk] : [];
  const sec = secondaryChunk ? [secondaryChunk] : [];

  let ordered: Chunk[];
  if (frame.kind === 'wfrage') ordered = [...fin, ...subj, ...middle, ...sec];
  else if (frame.kind === 'subordinate') ordered = [...subj, ...middle, ...sec, ...fin];
  else ordered = [...subj, ...fin, ...middle, ...sec];

  return [...head, ...ordered.flatMap((c) => c.tokens.map(patched))];
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function checkSentence(tokens: SentenceToken[]): CheckResult {
  if (tokens.length === 0) {
    return {
      correct: false,
      correctable: false,
      issues: [{ ruleId: 'empty', severity: 'error', message: 'Önce birkaç kelime seç.' }],
      yourSentence: '',
      correctedSentence: '',
    };
  }

  const yourSentence = renderSentence(tokens);
  const analysis = runChecks(tokens);
  const hardErrors = analysis.issues.filter((i) => i.severity === 'error');

  if (hardErrors.length === 0) {
    return { correct: true, correctable: true, issues: analysis.issues, yourSentence, correctedSentence: yourSentence };
  }

  let correctedSentence = '';
  let correctable = false;
  const attempt = attemptCorrection(tokens, analysis);
  if (attempt && runChecks(attempt).issues.every((i) => i.severity !== 'error')) {
    correctable = true;
    correctedSentence = renderSentence(attempt);
  }

  return { correct: false, correctable, issues: analysis.issues, yourSentence, correctedSentence };
}
