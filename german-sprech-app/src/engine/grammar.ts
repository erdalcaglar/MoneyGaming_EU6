import { allVerbs } from '../data';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { allArticles } from '../data/articles';
import { VerbEntry, NounEntry, Case } from '../data/types';
import { conjugatePresent, partizipII, reflexivePronoun, Person } from './conjugate';
import { SentenceToken, VerbToken, ArticleToken, NounToken, PronounToken, ConnectorToken } from './tokens';

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
function adjectiveTr(id: string): string {
  return adjectives.find((x) => x.id === id)?.adjective ?? id;
}

function findArticleFor(gender: NounEntry['gender'], caseNeeded: Case, definite: boolean) {
  return allArticles.find((a) => a.gender === gender && a.case === caseNeeded && a.definite === definite);
}

/** Renders a verb token to its surface text, given the actual subject person (for finite mode). */
function renderVerbToken(token: VerbToken, subjectPerson: Person | null): string {
  const verb = verbById(token.verbId);
  if (token.mode === 'partizip') return partizipII(verb);
  if (token.mode === 'infinitiv') return verb.infinitive;
  // finite
  const person = token.chosenPerson ?? subjectPerson ?? 'er_sie_es';
  const finite = conjugatePresent(verb, person);
  if (verb.separablePrefix) {
    return `${finite} ... ${verb.separablePrefix}`; // prefix rendered at clause end by caller in a fuller renderer; kept simple here
  }
  if (verb.reflexive) {
    return `${finite} ${reflexivePronoun(person)}`;
  }
  return finite;
}

function renderToken(token: SentenceToken, subjectPerson: Person | null): string {
  switch (token.kind) {
    case 'pronoun':
      return token.text;
    case 'verb':
      return renderVerbToken(token, subjectPerson);
    case 'article':
      return token.surface;
    case 'noun':
      return nounById(token.nounId).noun;
    case 'adjective':
      return adjectiveTr(token.adjectiveId);
    case 'question':
      return token.word;
    case 'connector':
      return token.word;
    case 'freetext':
      return token.text;
    default:
      return '';
  }
}

function findSubjectPerson(tokens: SentenceToken[]): Person | null {
  const p = tokens.find((t): t is PronounToken => t.kind === 'pronoun');
  return p ? p.person : null;
}

export function renderSentence(tokens: SentenceToken[]): string {
  const subjectPerson = findSubjectPerson(tokens);
  const words = tokens.map((t) => renderToken(t, subjectPerson)).filter(Boolean);
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1) + (tokens[0]?.kind === 'question' ? '?' : '.');
}

// ---------------------------------------------------------------------------
// Governing-verb / shape detection
// ---------------------------------------------------------------------------

interface Shape {
  kind: 'simple' | 'perfekt' | 'modal' | 'incomplete';
  finiteVerbToken?: VerbToken; // the V2 / final finite verb (aux, modal, or the lone verb)
  secondaryVerbToken?: VerbToken; // partizip or infinitiv companion
  governingVerb?: VerbEntry; // the verb whose valency (case) governs the object
}

function detectShape(verbTokens: VerbToken[]): Shape {
  const finite = verbTokens.filter((v) => v.mode === 'finite');
  const partizipien = verbTokens.filter((v) => v.mode === 'partizip');
  const infinitives = verbTokens.filter((v) => v.mode === 'infinitiv');

  const auxFinite = finite.find((v) => {
    const verb = verbById(v.verbId);
    return verb.infinitive === 'haben' || verb.infinitive === 'sein';
  });
  const modalFinite = finite.find((v) => verbById(v.verbId).isModal);

  if (auxFinite && partizipien.length === 1) {
    return {
      kind: 'perfekt',
      finiteVerbToken: auxFinite,
      secondaryVerbToken: partizipien[0],
      governingVerb: verbById(partizipien[0].verbId),
    };
  }
  if (modalFinite && infinitives.length === 1) {
    return {
      kind: 'modal',
      finiteVerbToken: modalFinite,
      secondaryVerbToken: infinitives[0],
      governingVerb: verbById(infinitives[0].verbId),
    };
  }
  if (finite.length === 1 && partizipien.length === 0 && infinitives.length === 0) {
    return { kind: 'simple', finiteVerbToken: finite[0], governingVerb: verbById(finite[0].verbId) };
  }
  return { kind: 'incomplete' };
}

// ---------------------------------------------------------------------------
// Case checking (Artikel + Nomen pairs)
// ---------------------------------------------------------------------------

function checkCases(tokens: SentenceToken[], governingVerb: VerbEntry | undefined, issues: Issue[]): void {
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a.kind === 'article' && b.kind === 'noun') {
      const article = a as ArticleToken;
      const noun = nounById((b as NounToken).nounId);
      if (article.gender !== noun.gender) {
        issues.push({
          ruleId: 'article-gender-mismatch',
          severity: 'error',
          message: `"${noun.noun}" kelimesi ${noun.gender} bir isim, ama "${article.surface}" artikeli ${article.gender} için kullanılıyor. Doğrusu: "${findArticleFor(noun.gender, article.case, article.definite)?.surface ?? article.surface} ${noun.noun}".`,
        });
        continue;
      }
      if (governingVerb?.objectCase && article.case !== governingVerb.objectCase) {
        const correctArticle = findArticleFor(noun.gender, governingVerb.objectCase, article.definite);
        issues.push({
          ruleId: governingVerb.objectCase === 'akkusativ' ? 'case-akkusativ' : 'case-dativ',
          severity: 'error',
          message: `"${governingVerb.infinitive}" fiili ${governingVerb.objectCase === 'akkusativ' ? 'Akkusativ' : 'Dativ'} nesne ister, ama sen ${article.case === 'nominativ' ? 'Nominativ' : article.case === 'akkusativ' ? 'Akkusativ' : 'Dativ'} kullandın ("${article.surface}"). Doğrusu: "${correctArticle?.surface ?? article.surface} ${noun.noun}".`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Copula verbs (sein/werden/bleiben) can only have ONE subject-like element.
// If the student also builds a full Artikel+Nomen(Nominativ) phrase next to
// a pronoun subject, the sentence has two competing subjects and cannot be
// fixed by reordering — flag it explicitly instead of silently guessing.
// ---------------------------------------------------------------------------

const COPULA_INFINITIVES = ['sein', 'werden', 'bleiben'];

function checkCopulaExtraSubject(tokens: SentenceToken[], governingVerb: VerbEntry | undefined, subject: PronounToken | null, issues: Issue[]): boolean {
  if (!governingVerb || !COPULA_INFINITIVES.includes(governingVerb.infinitive) || !subject) return false;
  let found = false;
  for (let i = 0; i < tokens.length - 1; i += 1) {
    const a = tokens[i];
    const b = tokens[i + 1];
    if (a.kind === 'article' && b.kind === 'noun' && (a as ArticleToken).case === 'nominativ') {
      const noun = nounById((b as NounToken).nounId);
      issues.push({
        ruleId: 'copula-extra-subject',
        severity: 'error',
        message: `"${governingVerb.infinitive}" gibi bir fiilde aynı anda hem "${subject.text}" hem "${(a as ArticleToken).surface} ${noun.noun}" özne gibi davranamaz — bir cümlede yalnızca bir özne olur. Ya "${subject.text}" ile devam et (ör. "${subject.text} ${conjugatePresent(governingVerb, subject.person)} müde.") ya da "${(a as ArticleToken).surface} ${noun.noun}"yı özne yap (ör. "${a.surface} ${noun.noun} ${conjugatePresent(governingVerb, 'er_sie_es')} lang.").`,
      });
      found = true;
    }
  }
  return found;
}

function checkAdjectives(tokens: SentenceToken[], issues: Issue[]): void {
  tokens.forEach((t, i) => {
    if (t.kind !== 'adjective') return;
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    const isPredicative = prev?.kind === 'verb' && COPULA_INFINITIVES.includes(verbById((prev as VerbToken).verbId).infinitive);
    const isAttributive = next?.kind === 'article';
    if (isAttributive) {
      issues.push({
        ruleId: 'attributive-adjective-info',
        severity: 'info',
        message: `İpucu: "${adjectiveTr(t.adjectiveId)}" burada bir artikelden önce geldiği için aslında çekim eki almalıdır (örn. "der große Mann"). Bu uygulamada sıfat çekimi henüz derecelendirilmiyor — sadece bil!`,
      });
    } else if (!isPredicative && !isAttributive) {
      issues.push({
        ruleId: 'adjective-placement',
        severity: 'error',
        message: `Sıfatlar ya "sein/werden/bleiben" gibi bir fiilden sonra ("Das ist schön") ya da bir artikelden hemen önce ("der große Mann") kullanılır. "${adjectiveTr(t.adjectiveId)}" burada yalnız kalmış.`,
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Perfekt aux-choice + agreement helpers
// ---------------------------------------------------------------------------

function auxVerbEntry(aux: 'haben' | 'sein'): VerbEntry {
  const v = allVerbs.find((x) => x.infinitive === aux);
  if (!v) throw new Error('aux verb missing from data');
  return v;
}

function checkPerfektAux(finiteVerbToken: VerbToken, governingVerb: VerbEntry, issues: Issue[]): void {
  const auxUsed = verbById(finiteVerbToken.verbId);
  if (auxUsed.infinitive !== governingVerb.auxiliary) {
    const needed = governingVerb.auxiliary;
    issues.push({
      ruleId: 'perfekt-aux-choice',
      severity: 'error',
      message:
        needed === 'sein'
          ? `"${governingVerb.infinitive}" bir hareket/durum değişikliği fiili olduğu için Perfekt'te "sein" ile çekimlenir, "haben" ile değil. Doğrusu: "${governingVerb.infinitive}" → "... ${conjugatePresent(auxVerbEntry('sein'), finiteVerbToken.chosenPerson ?? 'er_sie_es')} ... ${partizipII(governingVerb)}".`
          : `"${governingVerb.infinitive}" fiili Perfekt'te "haben" ile çekimlenir, "sein" ile değil. Doğrusu: "... ${conjugatePresent(auxVerbEntry('haben'), finiteVerbToken.chosenPerson ?? 'er_sie_es')} ... ${partizipII(governingVerb)}".`,
    });
  }
}

// ---------------------------------------------------------------------------
// Agreement + word-order checks
// ---------------------------------------------------------------------------

function checkAgreement(finiteVerbToken: VerbToken, subject: PronounToken | null, issues: Issue[]): void {
  if (!subject) return;
  const verb = verbById(finiteVerbToken.verbId);
  const chosen = finiteVerbToken.chosenPerson ?? subject.person;
  if (chosen !== subject.person) {
    issues.push({
      ruleId: 'subject-verb-agreement',
      severity: 'error',
      message: `Özne "${subject.text}" (${subject.person.replace(/_/g, '/')}) ile fiil çekimi uyuşmuyor. Doğrusu: "${subject.text} ${conjugatePresent(verb, subject.person)}".`,
    });
  }
}

function stripLeadingCoordinator(tokens: SentenceToken[]): SentenceToken[] {
  const first = tokens[0] as ConnectorToken | undefined;
  if (first?.kind === 'connector' && ['und', 'aber', 'oder', 'denn'].includes(first.word)) {
    return tokens.slice(1);
  }
  return tokens;
}

function checkMainClauseOrder(tokens: SentenceToken[], finiteVerbToken: VerbToken, secondaryVerbToken: VerbToken | undefined, issues: Issue[]): PronounToken | null {
  const content = stripLeadingCoordinator(tokens);
  const verbIndex = content.indexOf(finiteVerbToken);
  const subjectIndex = content.findIndex((t) => t.kind === 'pronoun');
  const subject = subjectIndex >= 0 ? (content[subjectIndex] as PronounToken) : null;

  if (verbIndex !== 1) {
    issues.push({
      ruleId: 'v2-word-order',
      severity: 'error',
      message: `Almanca ana cümlede çekimli fiil her zaman İKİNCİ öğe olmalı (V2 kuralı). Şu an fiil ${verbIndex + 1}. sırada. Örn. "Ich trinke Wasser." ya da "Heute trinke ich Wasser." — özne yer değiştirse bile fiil hep 2. sırada kalır.`,
    });
  } else if (subjectIndex !== 0 && subjectIndex !== 2) {
    issues.push({
      ruleId: 'subject-position',
      severity: 'error',
      message: `Özne ya cümlenin en başında ya da (başka bir öğe öne alındıysa) fiilden hemen sonra gelmeli. "Heute gehe ICH nach Hause" gibi.`,
    });
  }

  if (secondaryVerbToken) {
    const lastIndex = content.length - 1;
    if (content[lastIndex] !== secondaryVerbToken) {
      issues.push({
        ruleId: 'verb-bracket-position',
        severity: 'error',
        message: `Almanca ana cümlede ikinci fiil parçası (Partizip II veya mastar) cümlenin EN SONUNA gider — buna "Satzklammer" (fiil kelepçesi) denir. Örn. "Ich bin gestern nach Berlin ${secondaryVerbToken.mode === 'partizip' ? 'gefahren' : 'zu fahren geplant'}."`,
      });
    }
  }

  return subject;
}

function checkQuestionOrder(tokens: SentenceToken[], finiteVerbToken: VerbToken, secondaryVerbToken: VerbToken | undefined, issues: Issue[]): PronounToken | null {
  const rest = tokens.slice(1);
  const verbIndex = rest.indexOf(finiteVerbToken);
  const subjectIndex = rest.findIndex((t) => t.kind === 'pronoun');
  const subject = subjectIndex >= 0 ? (rest[subjectIndex] as PronounToken) : null;

  if (verbIndex !== 0) {
    issues.push({
      ruleId: 'w-frage-order',
      severity: 'error',
      message: `Soru kelimesinden (W-Wort) hemen sonra çekimli fiil gelmeli, sonra özne. Örn. "Wo wohnst du?" — "Wo" + "wohnst" (fiil) + "du" (özne).`,
    });
  } else if (subjectIndex !== 1) {
    issues.push({
      ruleId: 'w-frage-order',
      severity: 'error',
      message: `Özne, soru cümlesinde fiilden hemen sonra gelmeli: [Soru kelimesi] + [Fiil] + [Özne].`,
    });
  }

  if (secondaryVerbToken) {
    const lastIndex = rest.length - 1;
    if (rest[lastIndex] !== secondaryVerbToken) {
      issues.push({
        ruleId: 'verb-bracket-position',
        severity: 'error',
        message: `İkinci fiil parçası (Partizip II veya mastar) burada da cümlenin en sonuna gider.`,
      });
    }
  }
  return subject;
}

function checkSubordinateOrder(tokens: SentenceToken[], finiteVerbToken: VerbToken, secondaryVerbToken: VerbToken | undefined, issues: Issue[]): PronounToken | null {
  const rest = tokens.slice(1);
  const subjectIndex = rest.findIndex((t) => t.kind === 'pronoun');
  const subject = subjectIndex >= 0 ? (rest[subjectIndex] as PronounToken) : null;
  if (subjectIndex !== 0) {
    issues.push({
      ruleId: 'subordinate-subject-position',
      severity: 'error',
      message: `"weil/dass" gibi bir bağlaçtan hemen sonra özne gelir: "weil ich ... "`,
    });
  }

  const lastIndex = rest.length - 1;
  const secondToLastIndex = rest.length - 2;
  if (secondaryVerbToken) {
    const orderOk = rest[secondToLastIndex] === secondaryVerbToken && rest[lastIndex] === finiteVerbToken;
    if (!orderOk) {
      issues.push({
        ruleId: 'weil-verb-final',
        severity: 'error',
        message: `Yan cümlede ("weil/dass...") ÇEKİMLİ fiil cümlenin en sonuna, çekimsiz parça (Partizip/mastar) ise onun hemen önüne gider. Örn. "..., weil ich gestern spät gekommen bin." (önce "gekommen", en sonda "bin").`,
      });
    }
  } else if (rest[lastIndex] !== finiteVerbToken) {
    issues.push({
      ruleId: 'weil-verb-final',
      severity: 'error',
      message: `Yan cümlede ("weil/dass...") çekimli fiil ANA cümledeki gibi ikinci sırada değil, cümlenin EN SONUNDA olur. Örn. "..., weil ich Deutsch lerne."`,
    });
  }
  return subject;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

interface RunChecksResult {
  issues: Issue[];
  subject: PronounToken | null;
  pronounCount: number;
  shape: Shape;
}

/** Runs every rule against a token list and reports issues — no correction attempted here. */
function runChecks(tokens: SentenceToken[]): RunChecksResult {
  const issues: Issue[] = [];

  const pronounTokens = tokens.filter((t): t is PronounToken => t.kind === 'pronoun');
  if (pronounTokens.length === 0) {
    issues.push({ ruleId: 'missing-subject', severity: 'error', message: 'Her cümlede bir özne zamiri (ich, du, er...) olmalı.' });
  } else if (pronounTokens.length > 1) {
    issues.push({ ruleId: 'too-many-subjects', severity: 'error', message: 'Bir cümlede yalnızca bir özne zamiri olabilir.' });
  }

  const verbTokens = tokens.filter((t): t is VerbToken => t.kind === 'verb');
  const shape = detectShape(verbTokens);

  let subject: PronounToken | null = pronounTokens[0] ?? null;

  if (shape.kind === 'incomplete') {
    issues.push({
      ruleId: 'incomplete-verb-structure',
      severity: 'error',
      message: 'Cümlede tam bir fiil yapısı yok. Ya tek bir çekimli fiil, ya "haben/sein" + Partizip II, ya da bir modal fiil + mastar kullanmalısın.',
    });
  } else if (tokens[0]?.kind === 'question') {
    subject = checkQuestionOrder(tokens, shape.finiteVerbToken!, shape.secondaryVerbToken, issues);
  } else if (tokens[0]?.kind === 'connector' && ['weil', 'dass'].includes((tokens[0] as ConnectorToken).word)) {
    subject = checkSubordinateOrder(tokens, shape.finiteVerbToken!, shape.secondaryVerbToken, issues);
  } else {
    subject = checkMainClauseOrder(tokens, shape.finiteVerbToken!, shape.secondaryVerbToken, issues);
  }

  if (shape.kind !== 'incomplete' && shape.finiteVerbToken) {
    checkAgreement(shape.finiteVerbToken, subject, issues);
  }
  if (shape.kind === 'perfekt' && shape.finiteVerbToken && shape.governingVerb) {
    checkPerfektAux(shape.finiteVerbToken, shape.governingVerb, issues);
  }

  checkCases(tokens, shape.governingVerb, issues);
  checkAdjectives(tokens, issues);
  checkCopulaExtraSubject(tokens, shape.governingVerb, subject, issues);

  return { issues, subject, pronounCount: pronounTokens.length, shape };
}

export function checkSentence(tokens: SentenceToken[]): CheckResult {
  const yourSentence = renderSentence(tokens);

  if (tokens.length === 0) {
    return {
      correct: false,
      correctable: false,
      issues: [{ ruleId: 'empty', severity: 'error', message: 'Önce birkaç kelime seç.' }],
      yourSentence: '',
      correctedSentence: '',
    };
  }

  const { issues, subject, pronounCount, shape } = runChecks(tokens);
  const hardErrors = issues.filter((i) => i.severity === 'error');

  if (hardErrors.length === 0) {
    return { correct: true, correctable: true, issues, yourSentence, correctedSentence: yourSentence };
  }

  // Only attempt an automatic fix when the structure is simple enough to
  // reorder/repair safely: exactly one subject pronoun and a recognizable
  // verb shape. Anything else (e.g. two competing subjects, a stranded
  // adjective with no valid slot) cannot be "fixed" by reordering the same
  // tokens, so we say so honestly instead of faking a correction.
  let correctedSentence = '';
  let correctable = false;
  if (pronounCount === 1 && subject && shape.kind !== 'incomplete') {
    const attempt = attemptCorrection(tokens, shape, subject);
    if (attempt) {
      const verify = runChecks(attempt);
      const verifyHardErrors = verify.issues.filter((i) => i.severity === 'error');
      if (verifyHardErrors.length === 0) {
        correctable = true;
        correctedSentence = renderSentence(attempt);
      }
    }
  }

  return {
    correct: false,
    correctable,
    issues,
    yourSentence,
    correctedSentence,
  };
}

// ---------------------------------------------------------------------------
// Best-effort corrected token order (for the "doğrusu" feedback). Returns
// null when it cannot even attempt a reorder; the CALLER still re-verifies
// the result with runChecks() before trusting it (see checkSentence).
// ---------------------------------------------------------------------------

function attemptCorrection(tokens: SentenceToken[], shape: Shape, subject: PronounToken | null): SentenceToken[] | null {
  if (!subject || shape.kind === 'incomplete' || !shape.finiteVerbToken) return null;

  const fixed: SentenceToken[] = tokens.map((t) => ({ ...t }));
  const byUid = (uid: string) => fixed.find((t) => (t as { uid: string }).uid === uid);

  // Fix agreement: force chosenPerson to subject's person on the finite verb.
  let finiteTok = byUid(shape.finiteVerbToken!.uid) as VerbToken;
  finiteTok = { ...finiteTok, chosenPerson: subject.person };

  // Fix aux choice for Perfekt.
  if (shape.kind === 'perfekt' && shape.governingVerb) {
    const correctAux = auxVerbEntry(shape.governingVerb.auxiliary);
    finiteTok = { ...finiteTok, verbId: correctAux.id };
  }

  const secondaryTok = shape.secondaryVerbToken ? (byUid(shape.secondaryVerbToken.uid) as VerbToken) : undefined;

  // Fix article case/gender for every Artikel+Nomen pair.
  for (let i = 0; i < fixed.length - 1; i += 1) {
    const a = fixed[i];
    const b = fixed[i + 1];
    if (a.kind === 'article' && b.kind === 'noun') {
      const noun = nounById((b as NounToken).nounId);
      const neededCase: Case = shape.governingVerb?.objectCase ?? (a as ArticleToken).case;
      const correct = findArticleFor(noun.gender, neededCase, (a as ArticleToken).definite);
      if (correct) {
        fixed[i] = { ...(a as ArticleToken), surface: correct.surface, gender: correct.gender, case: correct.case };
      }
    }
  }

  const subjectUid = subject.uid;
  const finiteUid = shape.finiteVerbToken!.uid;
  const secondaryUid = shape.secondaryVerbToken?.uid;
  const middle = fixed.filter(
    (t) =>
      (t as { uid: string }).uid !== subjectUid &&
      (t as { uid: string }).uid !== finiteUid &&
      (t as { uid: string }).uid !== secondaryUid &&
      t.kind !== 'connector' &&
      t.kind !== 'question',
  );
  const subjectTok = byUid(subjectUid) as PronounToken;

  const isQuestion = tokens[0].kind === 'question';
  const isSubordinate = tokens[0].kind === 'connector' && ['weil', 'dass'].includes((tokens[0] as ConnectorToken).word);

  let ordered: SentenceToken[];
  if (isQuestion) {
    ordered = [tokens[0], finiteTok, subjectTok, ...middle, ...(secondaryTok ? [secondaryTok] : [])];
  } else if (isSubordinate) {
    ordered = [tokens[0], subjectTok, ...middle, ...(secondaryTok ? [secondaryTok] : []), finiteTok];
  } else {
    ordered = [subjectTok, finiteTok, ...middle, ...(secondaryTok ? [secondaryTok] : [])];
  }

  return ordered;
}
