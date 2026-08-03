import { checkSentence } from '../grammar';
import { makeUid, PronounToken, VerbToken, ArticleToken, NounToken, QuestionToken, ConnectorToken } from '../tokens';
import { definiteArticles } from '../../data/articles';

function pronoun(text: string, person: PronounToken['person']): PronounToken {
  return { uid: makeUid('p'), kind: 'pronoun', text, person };
}
function verb(verbId: string, mode: VerbToken['mode'], chosenPerson?: VerbToken['chosenPerson']): VerbToken {
  return { uid: makeUid('v'), kind: 'verb', verbId, mode, chosenPerson };
}
function article(defId: string): ArticleToken {
  const def = definiteArticles.find((a) => a.id === defId)!;
  return { uid: makeUid('a'), kind: 'article', surface: def.surface, gender: def.gender, case: def.case, definite: def.definite, labelTr: def.labelTr };
}
function noun(nounId: string): NounToken {
  return { uid: makeUid('n'), kind: 'noun', nounId };
}
function question(word: string): QuestionToken {
  return { uid: makeUid('q'), kind: 'question', word, tr: '' };
}
function connector(word: ConnectorToken['word']): ConnectorToken {
  return { uid: makeUid('c'), kind: 'connector', word };
}

describe('checkSentence — the flagship example: "Ich habe gekommen" is wrong', () => {
  it('flags haben used with a sein-verb (kommen) in Perfekt', () => {
    const tokens = [pronoun('ich', 'ich'), verb('haben', 'finite', 'ich'), verb('kommen', 'partizip')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'perfekt-aux-choice')).toBe(true);
    expect(result.correctedSentence).toBe('Ich bin gekommen.');
  });

  it('accepts "Ich bin gekommen" as correct', () => {
    const tokens = [pronoun('ich', 'ich'), verb('sein', 'finite', 'ich'), verb('kommen', 'partizip')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich bin gekommen.');
  });

  it('accepts "Ich habe gegessen" (essen is a haben-verb) as correct', () => {
    const tokens = [pronoun('ich', 'ich'), verb('haben', 'finite', 'ich'), verb('essen', 'partizip')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
  });
});

describe('checkSentence — simple present', () => {
  it('accepts a correct simple sentence', () => {
    const tokens = [pronoun('ich', 'ich'), verb('trinken', 'finite', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich trinke.');
  });

  it('accepts "ich komme"', () => {
    const tokens = [pronoun('ich', 'ich'), verb('kommen', 'finite', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich komme.');
  });

  it('flags wrong subject-verb agreement and proposes the fix', () => {
    const tokens = [pronoun('du', 'du'), verb('kommen', 'finite', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'subject-verb-agreement')).toBe(true);
    expect(result.correctedSentence).toBe('Du kommst.');
  });

  it('flags verb not in second position (V2 violation)', () => {
    const tokens = [verb('kommen', 'finite', 'ich'), pronoun('ich', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'v2-word-order')).toBe(true);
  });
});

describe('checkSentence — cases (Akkusativ/Dativ)', () => {
  it('flags wrong case for an akkusativ-requiring verb (sehen)', () => {
    const tokens = [pronoun('ich', 'ich'), verb('sehen', 'finite', 'ich'), article('def_m_nom'), noun('mann')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'case-akkusativ')).toBe(true);
    expect(result.correctedSentence).toBe('Ich sehe den Mann.');
  });

  it('accepts correct Akkusativ case', () => {
    const tokens = [pronoun('ich', 'ich'), verb('sehen', 'finite', 'ich'), article('def_m_akk'), noun('mann')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
  });

  it('flags wrong case for a dativ-requiring verb (helfen)', () => {
    const tokens = [pronoun('ich', 'ich'), verb('helfen', 'finite', 'ich'), article('def_m_akk'), noun('mann')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'case-dativ')).toBe(true);
  });

  it('flags article/noun gender mismatch', () => {
    const tokens = [pronoun('ich', 'ich'), verb('sehen', 'finite', 'ich'), article('def_f_akk'), noun('mann')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'article-gender-mismatch')).toBe(true);
  });
});

describe('checkSentence — W-Fragen', () => {
  it('accepts correct question order', () => {
    const tokens = [question('wo'), verb('gehen', 'finite', 'du'), pronoun('du', 'du')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
  });

  it('flags wrong question order (subject before verb)', () => {
    const tokens = [question('wo'), pronoun('du', 'du'), verb('gehen', 'finite', 'du')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'w-frage-order')).toBe(true);
  });
});

describe('checkSentence — weil/dass (verb-final)', () => {
  it('accepts correct verb-final order', () => {
    const tokens = [connector('weil'), pronoun('ich', 'ich'), verb('lernen', 'finite', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Weil ich lerne.');
  });

  it('flags V2-style order used inside a weil-clause (verb not final)', () => {
    const badOrder = [connector('weil'), verb('lernen', 'finite', 'ich'), pronoun('ich', 'ich')];
    const result = checkSentence(badOrder);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'weil-verb-final' || i.ruleId === 'subordinate-subject-position')).toBe(true);
  });

  it('handles Perfekt inside a weil-clause: partizip then aux at the very end', () => {
    const tokens = [connector('weil'), pronoun('ich', 'ich'), verb('kommen', 'partizip'), verb('sein', 'finite', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Weil ich gekommen bin.');
  });
});

describe('checkSentence — modal verbs', () => {
  it('accepts modal + infinitive at the end', () => {
    const tokens = [pronoun('ich', 'ich'), verb('koennen', 'finite', 'ich'), verb('gehen', 'infinitiv')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich kann gehen.');
  });
});
