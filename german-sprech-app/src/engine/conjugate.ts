import { VerbEntry } from '../data/types';

export type Person = 'ich' | 'du' | 'er_sie_es' | 'wir' | 'ihr' | 'sie_Sie';

export const ALL_PERSONS: Person[] = ['ich', 'du', 'er_sie_es', 'wir', 'ihr', 'sie_Sie'];

export const PERSON_PRONOUN: Record<Person, string> = {
  ich: 'ich',
  du: 'du',
  er_sie_es: 'er/sie/es',
  wir: 'wir',
  ihr: 'ihr',
  sie_Sie: 'sie/Sie',
};

const INSEPARABLE_PREFIXES = ['be', 'ge', 'er', 'ent', 'emp', 'ver', 'zer', 'miss'];

/** infinitive minus the trailing -(e)n, e.g. "sagen" -> "sag", "wandeln" -> "wandel" */
function bareStem(infinitive: string): string {
  if (infinitive.endsWith('en')) return infinitive.slice(0, -2);
  if (infinitive.endsWith('n')) return infinitive.slice(0, -1);
  return infinitive;
}

/** true if the stem needs an -e- inserted before a consonant ending (arbeiten -> arbeitest) */
function needsSchwa(stem: string): boolean {
  if (stem.endsWith('t') || stem.endsWith('d')) return true;
  const last = stem[stem.length - 1];
  const secondLast = stem[stem.length - 2];
  if ((last === 'm' || last === 'n') && secondLast && !'aeioulrhmn'.includes(secondLast)) {
    return true;
  }
  return false;
}

function isEln(infinitive: string): boolean {
  return infinitive.endsWith('eln');
}

function stripPrefix(verb: VerbEntry): { stem: string; hadPrefix: boolean } {
  if (verb.separablePrefix) {
    const withoutPrefix = verb.infinitive.startsWith(verb.separablePrefix)
      ? verb.infinitive.slice(verb.separablePrefix.length)
      : verb.infinitive;
    return { stem: withoutPrefix, hadPrefix: true };
  }
  return { stem: verb.infinitive, hadPrefix: false };
}

function isInseparablePrefixed(infinitive: string): boolean {
  return INSEPARABLE_PREFIXES.some((p) => infinitive.startsWith(p) && infinitive.length > p.length + 2);
}

function isIeren(infinitive: string): boolean {
  return infinitive.endsWith('ieren');
}

/**
 * Returns the finite present-tense form of the verb's own stem (WITHOUT the
 * separable prefix, which the caller/renderer places at clause end).
 */
export function conjugateStemPresent(verb: VerbEntry, person: Person): string {
  const { stem: coreInfinitive } = stripPrefix(verb);
  const bare = bareStem(coreInfinitive);
  const irr = verb.irregular;

  if (person === 'ich') {
    if (irr?.ichForm) return irr.ichForm;
    if (isEln(coreInfinitive)) {
      // ich wandle (drop the e before the final l)
      return bare.slice(0, -1) + 'le';
    }
    return bare + 'e';
  }
  if (person === 'du') {
    if (irr?.duForm) return irr.duForm;
    if (bare.endsWith('s') || bare.endsWith('ß') || bare.endsWith('z') || bare.endsWith('x')) {
      return needsSchwa(bare) ? bare + 'est' : bare + 't';
    }
    return needsSchwa(bare) ? bare + 'est' : bare + 'st';
  }
  if (person === 'er_sie_es') {
    if (irr?.erForm) return irr.erForm;
    return needsSchwa(bare) ? bare + 'et' : bare + 't';
  }
  if (person === 'wir') {
    return irr?.wirForm ?? coreInfinitive;
  }
  if (person === 'sie_Sie') {
    return irr?.sieForm ?? irr?.wirForm ?? coreInfinitive;
  }
  if (person === 'ihr') {
    if (irr?.ihrForm) return irr.ihrForm;
    return needsSchwa(bare) ? bare + 'et' : bare + 't';
  }
  return coreInfinitive;
}

/** The reflexive pronoun that matches a given subject person. */
export function reflexivePronoun(person: Person): string {
  switch (person) {
    case 'ich':
      return 'mich';
    case 'du':
      return 'dich';
    case 'wir':
      return 'uns';
    case 'ihr':
      return 'euch';
    default:
      return 'sich';
  }
}

/**
 * Full finite present-tense form as it appears in FIRST position (i.e. the
 * form conjugated for the subject). For separable verbs this is only the
 * conjugated stem — the caller is responsible for placing the prefix at the
 * end of the clause (that placement rule is taught explicitly, see grammar.ts).
 */
export function conjugatePresent(verb: VerbEntry, person: Person): string {
  return conjugateStemPresent(verb, person);
}

/** Partizip II (past participle), used for Perfekt: "hat/ist ... Partizip II". */
export function partizipII(verb: VerbEntry): string {
  if (verb.irregular?.partizipII) return verb.irregular.partizipII;

  const { stem: coreInfinitive } = stripPrefix(verb);
  const bare = bareStem(coreInfinitive);
  const ending = needsSchwa(bare) ? 'et' : 't';

  let core: string;
  if (isIeren(coreInfinitive)) {
    core = coreInfinitive.slice(0, -2); // drop the trailing "en", keep "-iert"
  } else if (isInseparablePrefixed(coreInfinitive)) {
    core = bare + ending;
  } else {
    core = 'ge' + bare + ending;
  }

  if (verb.separablePrefix) {
    return verb.separablePrefix + core;
  }
  return core;
}

/** Full infinitive as it must appear at the end of a modal-verb / future clause. */
export function fullInfinitive(verb: VerbEntry): string {
  return verb.infinitive;
}
