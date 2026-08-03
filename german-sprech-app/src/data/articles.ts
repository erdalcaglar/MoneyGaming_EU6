import { ArticleToken } from '../engine/tokens';
import { makeUid } from '../engine/tokens';

export interface ArticleDef {
  id: string;
  surface: string;
  gender: 'der' | 'die' | 'das';
  case: 'nominativ' | 'akkusativ' | 'dativ';
  definite: boolean;
  labelTr: string;
}

// Definite article (der/die/das) declension table — singular only (MVP).
export const definiteArticles: ArticleDef[] = [
  { id: 'def_m_nom', surface: 'der', gender: 'der', case: 'nominativ', definite: true, labelTr: 'der (Nominativ, eril)' },
  { id: 'def_m_akk', surface: 'den', gender: 'der', case: 'akkusativ', definite: true, labelTr: 'den (Akkusativ, eril)' },
  { id: 'def_m_dat', surface: 'dem', gender: 'der', case: 'dativ', definite: true, labelTr: 'dem (Dativ, eril)' },
  { id: 'def_f_nom', surface: 'die', gender: 'die', case: 'nominativ', definite: true, labelTr: 'die (Nominativ, dişil)' },
  { id: 'def_f_akk', surface: 'die', gender: 'die', case: 'akkusativ', definite: true, labelTr: 'die (Akkusativ, dişil)' },
  { id: 'def_f_dat', surface: 'der', gender: 'die', case: 'dativ', definite: true, labelTr: 'der (Dativ, dişil)' },
  { id: 'def_n_nom', surface: 'das', gender: 'das', case: 'nominativ', definite: true, labelTr: 'das (Nominativ, nötr)' },
  { id: 'def_n_akk', surface: 'das', gender: 'das', case: 'akkusativ', definite: true, labelTr: 'das (Akkusativ, nötr)' },
  { id: 'def_n_dat', surface: 'dem', gender: 'das', case: 'dativ', definite: true, labelTr: 'dem (Dativ, nötr)' },
];

// Indefinite article (ein/eine) declension table — singular only, no plural in German anyway.
export const indefiniteArticles: ArticleDef[] = [
  { id: 'indef_m_nom', surface: 'ein', gender: 'der', case: 'nominativ', definite: false, labelTr: 'ein (Nominativ, eril)' },
  { id: 'indef_m_akk', surface: 'einen', gender: 'der', case: 'akkusativ', definite: false, labelTr: 'einen (Akkusativ, eril)' },
  { id: 'indef_m_dat', surface: 'einem', gender: 'der', case: 'dativ', definite: false, labelTr: 'einem (Dativ, eril)' },
  { id: 'indef_f_nom', surface: 'eine', gender: 'die', case: 'nominativ', definite: false, labelTr: 'eine (Nominativ, dişil)' },
  { id: 'indef_f_akk', surface: 'eine', gender: 'die', case: 'akkusativ', definite: false, labelTr: 'eine (Akkusativ, dişil)' },
  { id: 'indef_f_dat', surface: 'einer', gender: 'die', case: 'dativ', definite: false, labelTr: 'einer (Dativ, dişil)' },
  { id: 'indef_n_nom', surface: 'ein', gender: 'das', case: 'nominativ', definite: false, labelTr: 'ein (Nominativ, nötr)' },
  { id: 'indef_n_akk', surface: 'ein', gender: 'das', case: 'akkusativ', definite: false, labelTr: 'ein (Akkusativ, nötr)' },
  { id: 'indef_n_dat', surface: 'einem', gender: 'das', case: 'dativ', definite: false, labelTr: 'einem (Dativ, nötr)' },
];

export const allArticles: ArticleDef[] = [...definiteArticles, ...indefiniteArticles];

export function articleDefToToken(def: ArticleDef): ArticleToken {
  return {
    uid: makeUid('art'),
    kind: 'article',
    surface: def.surface,
    gender: def.gender,
    case: def.case,
    definite: def.definite,
    labelTr: def.labelTr,
  };
}
