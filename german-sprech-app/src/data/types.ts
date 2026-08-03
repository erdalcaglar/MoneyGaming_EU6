export type Level = 'A1' | 'A2' | 'B1' | 'C1';
export type Gender = 'der' | 'die' | 'das';
export type Case = 'nominativ' | 'akkusativ' | 'dativ';
export type Auxiliary = 'haben' | 'sein';

/**
 * A verb entry. Present-tense forms are derived automatically by the
 * conjugation engine from the infinitive using regular German rules,
 * UNLESS an override is given here (irregular / strong / mixed verbs).
 */
export interface VerbEntry {
  id: string;
  infinitive: string;
  tr: string;
  level: Level;
  auxiliary: Auxiliary;
  /** separable prefix, e.g. "auf" for "aufstehen" -> "steht ... auf" */
  separablePrefix?: string;
  /** full override forms for irregular (strong/mixed) verbs; any field left
   * out falls back to the regular auto-derivation rule */
  irregular?: {
    duForm?: string;
    erForm?: string;
    partizipII?: string;
    /** ich-form override, only needed for sein/haben/wissen-type verbs */
    ichForm?: string;
    /** wir/ihr overrides, only needed for fully irregular verbs like "sein" */
    wirForm?: string;
    ihrForm?: string;
    sieForm?: string;
  };
  /** case the direct/indirect object typically takes, for teaching purposes */
  objectCase?: Case;
  /** true for modal verbs (mögen, können, müssen, dürfen, sollen, wollen, möchten) */
  isModal?: boolean;
  /** true for reflexive verbs (sich nähern, sich beschweren...) */
  reflexive?: boolean;
}

export interface NounEntry {
  id: string;
  gender: Gender;
  noun: string;
  tr: string;
  level: Level;
  pluralHint?: string;
}

export interface AdjectiveEntry {
  id: string;
  adjective: string;
  tr: string;
  level: Level;
}

export interface ExpressionEntry {
  id: string;
  de: string;
  tr: string;
  category: 'ueberraschung' | 'zustimmung' | 'ablehnung' | 'begruessung' | 'alltag' | 'fueller';
  note: string;
}
