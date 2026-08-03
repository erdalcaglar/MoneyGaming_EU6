import { allVerbs } from '../data';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { conjugatePresent, partizipII, PERSON_PRONOUN, Person } from './conjugate';
import { SentenceToken, VerbToken } from './tokens';

/** Short display label for a token chip inside the sentence strip (UI only). */
export function tokenChipLabel(token: SentenceToken, subjectPerson: Person | null): string {
  switch (token.kind) {
    case 'pronoun':
      return token.text;
    case 'verb': {
      const verb = allVerbs.find((v) => v.id === token.verbId)!;
      if (token.mode === 'partizip') return `${partizipII(verb)} (Partizip II)`;
      if (token.mode === 'infinitiv') return `${verb.infinitive} (Infinitiv)`;
      const person = token.chosenPerson ?? subjectPerson ?? 'er_sie_es';
      const surfacePrefix = verb.separablePrefix ? ` ...${verb.separablePrefix}` : '';
      return `${conjugatePresent(verb, person)}${surfacePrefix} (${PERSON_PRONOUN[person]})`;
    }
    case 'article':
      return token.surface;
    case 'noun': {
      const noun = nouns.find((n) => n.id === token.nounId)!;
      return noun.noun;
    }
    case 'adjective': {
      const adj = adjectives.find((a) => a.id === token.adjectiveId)!;
      return adj.adjective;
    }
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

export function verbTokenCyclePerson(token: VerbToken, direction: 1 | -1): Person {
  const order: Person[] = ['ich', 'du', 'er_sie_es', 'wir', 'ihr', 'sie_Sie'];
  const current = token.chosenPerson ?? 'ich';
  const idx = order.indexOf(current);
  const nextIdx = (idx + direction + order.length) % order.length;
  return order[nextIdx];
}
