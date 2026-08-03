export * from './types';
export { verbs } from './verbs';
export { verbsC1 } from './verbsC1';
export { nouns } from './nouns';
export { adjectives } from './adjectives';
export { expressions } from './expressions';

import { verbs } from './verbs';
import { verbsC1 } from './verbsC1';
import { VerbEntry } from './types';

export const allVerbs: VerbEntry[] = [...verbs, ...verbsC1];
