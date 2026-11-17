import { checkSentence } from '../grammar';
import { makeUid, PronounToken, VerbToken, ArticleToken, NounToken, AdjectiveToken, QuestionToken, ConnectorToken, FreeTextToken } from '../tokens';
import { allArticles as definiteArticles } from '../../data/articles';

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
function adjective(adjectiveId: string): AdjectiveToken {
  return { uid: makeUid('aj'), kind: 'adjective', adjectiveId };
}
function free(text: string): FreeTextToken {
  return { uid: makeUid('f'), kind: 'freetext', text, tr: '' };
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
    expect(result.correctable).toBe(true);
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
    expect(result.correctable).toBe(true);
    expect(result.correctedSentence).toBe('Du kommst.');
  });

  it('flags verb not in second position (V2 violation)', () => {
    const tokens = [pronoun('ich', 'ich'), article('def_m_akk'), noun('mann'), verb('sehen', 'finite', 'ich')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'v2-word-order')).toBe(true);
    expect(result.correctedSentence).toBe('Ich sehe den Mann.');
  });

  it('lets the verb follow the subject when no person was picked explicitly', () => {
    const tokens = [verb('kommen', 'finite'), pronoun('du', 'du')];
    // verb was added before the subject: it must still agree automatically
    expect(checkSentence([tokens[1], tokens[0]]).yourSentence).toBe('Du kommst.');
  });

  it('renders a separable verb with its prefix at the end of the clause', () => {
    const result = checkSentence([pronoun('ich', 'ich'), verb('aufstehen', 'finite'), free('heute')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich stehe heute auf.');
  });

  it('accepts an adjective used as an adverb', () => {
    const result = checkSentence([pronoun('ich', 'ich'), verb('lernen', 'finite'), adjective('schnell')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich lerne schnell.');
  });
});

describe('checkSentence — cases (Akkusativ/Dativ)', () => {
  it('flags wrong case for an akkusativ-requiring verb (sehen)', () => {
    const tokens = [pronoun('ich', 'ich'), verb('sehen', 'finite', 'ich'), article('def_m_nom'), noun('mann')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(false);
    expect(result.issues.some((i) => i.ruleId === 'case-akkusativ')).toBe(true);
    expect(result.correctable).toBe(true);
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

describe('checkSentence — never presents a fake "correction" that is still wrong (regression)', () => {
  it('reports the "ich bin der Weg lang" case as uncorrectable instead of echoing the same wrong sentence back', () => {
    // Reported bug: user built ich + bin + der + Weg + lang ("Ich bin der Weg lang.").
    // The app said it was wrong but showed the identical text as "Doğrusu".
    const tokens = [pronoun('ich', 'ich'), verb('sein', 'finite', 'ich'), article('def_m_nom'), noun('weg'), adjective('lang')];
    const result = checkSentence(tokens);

    expect(result.correct).toBe(false);
    expect(result.yourSentence).toBe('Ich bin der Weg lang.');
    // The two competing "subjects" (ich / der Weg) must be flagged explicitly...
    expect(result.issues.some((i) => i.ruleId === 'copula-extra-subject')).toBe(true);
    // ...and since that can't be fixed by reordering, the app must NOT claim a fix.
    expect(result.correctable).toBe(false);
    expect(result.correctedSentence).not.toBe(result.yourSentence);
    expect(result.correctedSentence).toBe('');
  });

  it('accepts a noun as the subject: "Der Weg ist lang."', () => {
    const tokens = [article('def_m_nom'), noun('weg'), verb('sein', 'finite'), adjective('lang')];
    const result = checkSentence(tokens);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Der Weg ist lang.');
  });

  it('never sets correctable=true with an empty correctedSentence, and never correctable=false with a non-empty one', () => {
    const scenarios = [
      [pronoun('ich', 'ich'), verb('haben', 'finite', 'ich'), verb('kommen', 'partizip')],
      [pronoun('du', 'du'), verb('kommen', 'finite', 'ich')],
      [pronoun('ich', 'ich'), verb('sehen', 'finite', 'ich'), article('def_m_nom'), noun('mann')],
      [pronoun('ich', 'ich'), verb('sein', 'finite', 'ich'), article('def_m_nom'), noun('weg'), adjective('lang')],
      [verb('kommen', 'finite', 'ich')],
      [pronoun('ich', 'ich'), pronoun('du', 'du'), verb('kommen', 'finite')],
    ];
    for (const tokens of scenarios) {
      const result = checkSentence(tokens);
      if (result.correct) continue;
      expect(result.correctable).toBe(result.correctedSentence.length > 0);
    }
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

describe('checkSentence — noun subjects, fronting and questions', () => {
  it('conjugates for a noun subject and flags a wrong person', () => {
    const wrong = checkSentence([article('def_m_nom'), noun('mann'), verb('kommen', 'finite', 'ich')]);
    expect(wrong.correct).toBe(false);
    expect(wrong.issues.some((i) => i.ruleId === 'subject-verb-agreement')).toBe(true);
    expect(wrong.correctedSentence).toBe('Der Mann kommt.');
  });

  it('requires the subject to be Nominativ', () => {
    const result = checkSentence([article('def_m_akk'), noun('mann'), verb('kommen', 'finite')]);
    expect(result.issues.some((i) => i.ruleId === 'subject-nominativ')).toBe(true);
    expect(result.correctedSentence).toBe('Der Mann kommt.');
  });

  it('accepts a fronted object: "Den Mann sehe ich."', () => {
    const result = checkSentence([article('def_m_akk'), noun('mann'), verb('sehen', 'finite'), pronoun('ich', 'ich')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Den Mann sehe ich.');
  });

  it('accepts a fronted time word with inversion: "Heute gehe ich nach Hause."', () => {
    const result = checkSentence([free('heute'), verb('gehen', 'finite'), pronoun('ich', 'ich'), free('nach Hause')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Heute gehe ich nach Hause.');
  });

  it('keeps the fronted word when only the case is wrong', () => {
    const result = checkSentence([free('heute'), verb('sehen', 'finite'), pronoun('ich', 'ich'), article('def_m_nom'), noun('mann')]);
    expect(result.correctedSentence).toBe('Heute sehe ich den Mann.');
  });

  it('treats verb-first + subject as a Ja/Nein question', () => {
    const result = checkSentence([verb('kommen', 'finite'), pronoun('du', 'du')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Kommst du?');
    expect(result.issues.some((i) => i.ruleId === 'ja-nein-frage' && i.severity === 'info')).toBe(true);
  });

  it('accepts the question word itself as subject: "Wer kommt?"', () => {
    const result = checkSentence([question('wer'), verb('kommen', 'finite')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Wer kommt?');
  });

  it('reports a sentence with no subject at all', () => {
    const result = checkSentence([verb('kommen', 'finite', 'ich')]);
    expect(result.issues.some((i) => i.ruleId === 'missing-subject')).toBe(true);
    expect(result.correctable).toBe(false);
  });
});

describe('checkSentence — noun phrases', () => {
  it('declines an adjective between article and noun', () => {
    const akk = checkSentence([pronoun('ich', 'ich'), verb('sehen', 'finite'), article('def_m_akk'), adjective('gross'), noun('mann')]);
    expect(akk.correct).toBe(true);
    expect(akk.yourSentence).toBe('Ich sehe den großen Mann.');

    const nom = checkSentence([article('indef_n_nom'), adjective('klein'), noun('kind'), verb('lachen', 'finite')]);
    expect(nom.yourSentence).toBe('Ein kleines Kind lacht.');

    const stem = checkSentence([article('def_m_nom'), adjective('hoch'), noun('berg'), verb('sein', 'finite'), adjective('schoen')]);
    expect(stem.yourSentence).toBe('Der hohe Berg ist schön.');
  });

  it('accepts a predicate noun after sein and keeps it Nominativ', () => {
    const ok = checkSentence([pronoun('ich', 'ich'), verb('sein', 'finite'), article('indef_m_nom'), adjective('gut'), noun('lehrer')]);
    expect(ok.correct).toBe(true);
    expect(ok.yourSentence).toBe('Ich bin ein guter Lehrer.');

    const wrong = checkSentence([pronoun('ich', 'ich'), verb('sein', 'finite'), article('def_m_akk'), noun('lehrer')]);
    expect(wrong.issues.some((i) => i.ruleId === 'copula-nominativ')).toBe(true);
    expect(wrong.correctedSentence).toBe('Ich bin der Lehrer.');
  });

  it('allows Dativ person + Akkusativ thing with a two-object verb', () => {
    const result = checkSentence([pronoun('ich', 'ich'), verb('zeigen', 'finite'), article('def_m_dat'), noun('mann'), article('def_n_akk'), noun('bild')]);
    expect(result.correct).toBe(true);
    expect(result.yourSentence).toBe('Ich zeige dem Mann das Bild.');
  });

  it('accepts a bare noun object and flags an article with no noun', () => {
    expect(checkSentence([pronoun('ich', 'ich'), verb('trinken', 'finite'), noun('wasser')]).correct).toBe(true);
    const dangling = checkSentence([pronoun('ich', 'ich'), verb('trinken', 'finite'), article('def_n_akk')]);
    expect(dangling.issues.some((i) => i.ruleId === 'dangling-article')).toBe(true);
    expect(dangling.correctable).toBe(false);
  });

  it('flags a second Nominativ next to a verb that takes no object', () => {
    const result = checkSentence([pronoun('ich', 'ich'), verb('kommen', 'finite'), article('def_m_nom'), noun('mann')]);
    expect(result.issues.some((i) => i.ruleId === 'extra-nominativ')).toBe(true);
    expect(result.correctable).toBe(false);
  });
});
