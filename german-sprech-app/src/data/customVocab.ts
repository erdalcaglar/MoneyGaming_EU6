import { VerbEntry, NounEntry, AdjectiveEntry } from './types';
import { verbs } from './verbs';
import { nouns } from './nouns';
import { adjectives } from './adjectives';
import { allVerbs } from './index';

/**
 * Pure, framework-free mutators that splice user-added words directly into
 * the SAME arrays the rest of the app (UI banks + the grammar engine) reads
 * from. Because `verbs`/`nouns`/`adjectives`/`allVerbs` are shared array
 * references (not copies) everywhere they're imported, pushing/removing
 * here is immediately visible to every consumer — no plumbing needed in
 * engine/grammar.ts or engine/display.ts.
 *
 * Persistence + React re-render triggering lives one layer up, in
 * context/CustomVocabContext.tsx — this module only touches in-memory data.
 */

function removeById<T extends { id: string }>(arr: T[], id: string): void {
  const idx = arr.findIndex((x) => x.id === id);
  if (idx >= 0) arr.splice(idx, 1);
}

export function addCustomVerb(entry: VerbEntry): void {
  verbs.push(entry);
  allVerbs.push(entry);
}
export function removeCustomVerb(id: string): void {
  removeById(verbs, id);
  removeById(allVerbs, id);
}

export function addCustomNoun(entry: NounEntry): void {
  nouns.push(entry);
}
export function removeCustomNoun(id: string): void {
  removeById(nouns, id);
}

export function addCustomAdjective(entry: AdjectiveEntry): void {
  adjectives.push(entry);
}
export function removeCustomAdjective(id: string): void {
  removeById(adjectives, id);
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

let customIdCounter = 0;
export function makeCustomId(prefix: string, text: string): string {
  customIdCounter += 1;
  return `custom_${prefix}_${slugify(text) || 'wort'}_${customIdCounter}`;
}
