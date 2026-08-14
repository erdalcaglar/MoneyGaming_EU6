import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VerbEntry, NounEntry, AdjectiveEntry } from '../data/types';
import {
  addCustomVerb,
  removeCustomVerb,
  addCustomNoun,
  removeCustomNoun,
  addCustomAdjective,
  removeCustomAdjective,
  makeCustomId,
} from '../data/customVocab';

const STORAGE_KEY = 'deutsch-sprechen:customVocab:v1';

interface StoredVocab {
  verbs: VerbEntry[];
  nouns: NounEntry[];
  adjectives: AdjectiveEntry[];
}

const emptyVocab: StoredVocab = { verbs: [], nouns: [], adjectives: [] };

export type NewVerbInput = Omit<VerbEntry, 'id'>;
export type NewNounInput = Omit<NounEntry, 'id'>;
export type NewAdjectiveInput = Omit<AdjectiveEntry, 'id'>;

interface CustomVocabContextValue {
  loaded: boolean;
  /** bumps on every add/remove so lists derived (via useMemo) from the
   * shared verbs/nouns/adjectives arrays know to recompute */
  version: number;
  customVerbIds: Set<string>;
  customNounIds: Set<string>;
  customAdjectiveIds: Set<string>;
  addVerb: (input: NewVerbInput) => VerbEntry;
  addNoun: (input: NewNounInput) => NounEntry;
  addAdjective: (input: NewAdjectiveInput) => AdjectiveEntry;
  removeVerb: (id: string) => void;
  removeNoun: (id: string) => void;
  removeAdjective: (id: string) => void;
}

const CustomVocabContext = createContext<CustomVocabContextValue | undefined>(undefined);

export const CustomVocabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stored, setStored] = useState<StoredVocab>(emptyVocab);
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed: StoredVocab = { ...emptyVocab, ...JSON.parse(raw) };
        parsed.verbs.forEach(addCustomVerb);
        parsed.nouns.forEach(addCustomNoun);
        parsed.adjectives.forEach(addCustomAdjective);
        setStored(parsed);
        setVersion((v) => v + 1);
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
  }, [stored, loaded]);

  const addVerb = useCallback((input: NewVerbInput): VerbEntry => {
    const entry: VerbEntry = { ...input, id: makeCustomId('verb', input.infinitive) };
    addCustomVerb(entry);
    setStored((s) => ({ ...s, verbs: [...s.verbs, entry] }));
    setVersion((v) => v + 1);
    return entry;
  }, []);

  const addNoun = useCallback((input: NewNounInput): NounEntry => {
    const entry: NounEntry = { ...input, id: makeCustomId('noun', input.noun) };
    addCustomNoun(entry);
    setStored((s) => ({ ...s, nouns: [...s.nouns, entry] }));
    setVersion((v) => v + 1);
    return entry;
  }, []);

  const addAdjective = useCallback((input: NewAdjectiveInput): AdjectiveEntry => {
    const entry: AdjectiveEntry = { ...input, id: makeCustomId('adj', input.adjective) };
    addCustomAdjective(entry);
    setStored((s) => ({ ...s, adjectives: [...s.adjectives, entry] }));
    setVersion((v) => v + 1);
    return entry;
  }, []);

  const removeVerb = useCallback((id: string) => {
    removeCustomVerb(id);
    setStored((s) => ({ ...s, verbs: s.verbs.filter((v) => v.id !== id) }));
    setVersion((v) => v + 1);
  }, []);
  const removeNoun = useCallback((id: string) => {
    removeCustomNoun(id);
    setStored((s) => ({ ...s, nouns: s.nouns.filter((n) => n.id !== id) }));
    setVersion((v) => v + 1);
  }, []);
  const removeAdjective = useCallback((id: string) => {
    removeCustomAdjective(id);
    setStored((s) => ({ ...s, adjectives: s.adjectives.filter((a) => a.id !== id) }));
    setVersion((v) => v + 1);
  }, []);

  const customVerbIds = useMemo(() => new Set(stored.verbs.map((v) => v.id)), [stored.verbs]);
  const customNounIds = useMemo(() => new Set(stored.nouns.map((n) => n.id)), [stored.nouns]);
  const customAdjectiveIds = useMemo(() => new Set(stored.adjectives.map((a) => a.id)), [stored.adjectives]);

  const value = useMemo(
    () => ({
      loaded,
      version,
      customVerbIds,
      customNounIds,
      customAdjectiveIds,
      addVerb,
      addNoun,
      addAdjective,
      removeVerb,
      removeNoun,
      removeAdjective,
    }),
    [loaded, version, customVerbIds, customNounIds, customAdjectiveIds, addVerb, addNoun, addAdjective, removeVerb, removeNoun, removeAdjective],
  );

  return <CustomVocabContext.Provider value={value}>{children}</CustomVocabContext.Provider>;
};

export function useCustomVocab(): CustomVocabContextValue {
  const ctx = useContext(CustomVocabContext);
  if (!ctx) throw new Error('useCustomVocab must be used within CustomVocabProvider');
  return ctx;
}
