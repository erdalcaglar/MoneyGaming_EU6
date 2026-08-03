import { Case, Gender } from '../data/types';
import { Person } from './conjugate';

export type VerbMode = 'finite' | 'partizip' | 'infinitiv';

export interface PronounToken {
  uid: string;
  kind: 'pronoun';
  person: Person;
  text: string;
}

export interface VerbToken {
  uid: string;
  kind: 'verb';
  verbId: string;
  mode: VerbMode;
  /** which person-conjugation the student picked for a 'finite' verb (may be
   * deliberately wrong — that's exactly what the checker grades) */
  chosenPerson?: Person;
}

export interface ArticleToken {
  uid: string;
  kind: 'article';
  surface: string;
  gender: Gender;
  case: Case;
  definite: boolean;
  labelTr: string;
}

export interface NounToken {
  uid: string;
  kind: 'noun';
  nounId: string;
}

export interface AdjectiveToken {
  uid: string;
  kind: 'adjective';
  adjectiveId: string;
}

export interface QuestionToken {
  uid: string;
  kind: 'question';
  word: string;
  tr: string;
}

export type ConnectorWord = 'weil' | 'dass' | 'und' | 'aber' | 'oder' | 'denn';

export interface ConnectorToken {
  uid: string;
  kind: 'connector';
  word: ConnectorWord;
}

export interface FreeTextToken {
  uid: string;
  kind: 'freetext';
  text: string;
  tr: string;
}

export type SentenceToken =
  | PronounToken
  | VerbToken
  | ArticleToken
  | NounToken
  | AdjectiveToken
  | QuestionToken
  | ConnectorToken
  | FreeTextToken;

let uidCounter = 0;
export function makeUid(prefix: string): string {
  uidCounter += 1;
  return `${prefix}_${uidCounter}_${Date.now().toString(36)}`;
}
