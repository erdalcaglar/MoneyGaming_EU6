import { Person } from '../engine/conjugate';

export interface PronounDef {
  person: Person;
  text: string;
  tr: string;
}

export const pronouns: PronounDef[] = [
  { person: 'ich', text: 'ich', tr: 'ben' },
  { person: 'du', text: 'du', tr: 'sen' },
  { person: 'er_sie_es', text: 'er', tr: 'o (erkek)' },
  { person: 'er_sie_es', text: 'sie', tr: 'o (kadın)' },
  { person: 'er_sie_es', text: 'es', tr: 'o (nötr)' },
  { person: 'wir', text: 'wir', tr: 'biz' },
  { person: 'ihr', text: 'ihr', tr: 'siz (birden çok, samimi)' },
  { person: 'sie_Sie', text: 'sie', tr: 'onlar' },
  { person: 'sie_Sie', text: 'Sie', tr: 'siz (resmi)' },
];
