import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuilderMode, RootStackParamList, WordCategory } from '../navigation/types';
import { ArticleTable } from '../components/ArticleTable';
import { FeedbackSheet } from '../components/FeedbackSheet';
import { SentenceStrip } from '../components/SentenceStrip';
import { VerbTokenEditor } from '../components/VerbTokenEditor';
import { WordChip } from '../components/WordChip';
import { Button, IconButton, Page, Pills, SearchField, TopBar } from '../components/ui';
import { allVerbs } from '../data';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { pronouns } from '../data/pronouns';
import { articleDefToToken } from '../data/articles';
import { connectors, questionWords, timePlaceWords } from '../data/questionWords';
import { VerbEntry } from '../data/types';
import { checkSentence, CheckResult } from '../engine/grammar';
import { makeUid, PronounToken, SentenceToken, VerbToken } from '../engine/tokens';
import { useCustomVocab } from '../context/CustomVocabContext';
import { useProgress } from '../context/ProgressContext';
import { useSettings, useTheme } from '../context/SettingsContext';
import { fonts, space } from '../theme';

type Tab = 'soru' | 'baglac' | 'ozne' | 'fiil' | 'artikel' | 'isim' | 'sifat' | 'ek';

const TAB_LABEL: Record<Tab, string> = { soru: 'Soru', baglac: 'Bağlaç', ozne: 'Özne', fiil: 'Fiil', artikel: 'Artikel', isim: 'İsim', sifat: 'Sıfat', ek: 'Zaman, yer…' };
const BASE_TABS: Tab[] = ['ozne', 'fiil', 'artikel', 'isim', 'sifat', 'ek'];

const MODES: Record<BuilderMode, { title: string; pattern: string; example: string; tabs: Tab[]; pinnedVerbs: string[] }> = {
  simple: { title: 'Basit cümleler', pattern: 'Özne + fiil + nesne', example: 'Ich trinke Wasser.', tabs: BASE_TABS, pinnedVerbs: [] },
  question: { title: 'Soru sor', pattern: 'Soru kelimesi + fiil + özne — ya da fiille başla', example: 'Wo arbeitest du? · Kommst du?', tabs: ['soru', ...BASE_TABS], pinnedVerbs: [] },
  perfekt: { title: 'Geçmiş zaman', pattern: 'Özne + haben/sein + … + Partizip II', example: 'Ich bin gekommen. · Ich habe gegessen.', tabs: BASE_TABS, pinnedVerbs: ['haben', 'sein'] },
  modal: { title: 'Modal fiiller', pattern: 'Özne + modal fiil + … + mastar', example: 'Ich kann tanzen.', tabs: BASE_TABS, pinnedVerbs: ['koennen', 'muessen', 'wollen', 'duerfen', 'sollen', 'moegen'] },
  subordinate: { title: 'weil ve dass', pattern: 'Bağlaç + özne + … + fiil en sonda', example: '…, weil ich glücklich bin.', tabs: ['baglac', ...BASE_TABS], pinnedVerbs: [] },
  free: { title: 'Serbest pratik', pattern: 'İstediğin yapıyı kur', example: 'Heute sehe ich den großen Mann.', tabs: ['soru', 'baglac', ...BASE_TABS], pinnedVerbs: [] },
};

const PAGE_SIZE = 30;

type Props = NativeStackScreenProps<RootStackParamList, 'Builder'>;

export const BuilderScreen: React.FC<Props> = ({ route, navigation }) => {
  const t = useTheme();
  const { showTranslations } = useSettings();
  const { recordResult } = useProgress();
  const customVocab = useCustomVocab();
  const mode = route.params?.mode ?? 'simple';
  const info = MODES[mode] ?? MODES.simple;

  const [tokens, setTokens] = useState<SentenceToken[]>([]);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(info.tabs[0]);
  const [search, setSearch] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [editingVerb, setEditingVerb] = useState<VerbToken | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);

  const selected = tokens.find((x) => x.uid === selectedUid) ?? null;
  const selectedIndex = selected ? tokens.indexOf(selected) : -1;
  const subjectPerson = tokens.find((x): x is PronounToken => x.kind === 'pronoun')?.person ?? 'er_sie_es';
  const gloss = (tr: string) => (showTranslations ? tr : undefined);

  // Drop tokens whose word was deleted from the custom vocabulary meanwhile.
  useEffect(() => {
    setTokens((prev) =>
      prev.filter((x) => {
        if (x.kind === 'verb') return allVerbs.some((v) => v.id === x.verbId);
        if (x.kind === 'noun') return nouns.some((n) => n.id === x.nounId);
        if (x.kind === 'adjective') return adjectives.some((a) => a.id === x.adjectiveId);
        return true;
      }),
    );
  }, [customVocab.version]);

  // `customVocab.version` forces recomputation: the word arrays are mutated in place.
  const verbBank = useMemo<VerbEntry[]>(() => {
    const all = mode === 'free' ? [...verbs, ...verbsC1] : [...verbs];
    const pinned = info.pinnedVerbs.map((id) => all.find((v) => v.id === id)).filter((v): v is VerbEntry => !!v);
    return [...pinned, ...all.filter((v) => !info.pinnedVerbs.includes(v.id))];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, customVocab.version]);

  const q = search.trim().toLowerCase();
  const matches = (de: string, tr: string) => !q || de.toLowerCase().includes(q) || tr.toLowerCase().includes(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredVerbs = useMemo(() => verbBank.filter((v) => matches(v.infinitive, v.tr)), [verbBank, q]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredNouns = useMemo(() => nouns.filter((n) => matches(n.noun, n.tr)), [q, customVocab.version]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredAdjectives = useMemo(() => adjectives.filter((a) => matches(a.adjective, a.tr)), [q, customVocab.version]);

  function append(token: SentenceToken) {
    setTokens((prev) => [...prev, token]);
    setSelectedUid(null);
  }
  /** Question words and conjunctions open the sentence; a new one replaces the old one. */
  function putInFront(token: SentenceToken) {
    setTokens((prev) => [token, ...prev.filter((p) => p.kind !== token.kind)]);
    setSelectedUid(null);
  }
  /** A sentence has one subject pronoun: picking another swaps it in place. */
  function setPronoun(token: PronounToken) {
    setTokens((prev) => (prev.some((p) => p.kind === 'pronoun') ? prev.map((p) => (p.kind === 'pronoun' ? token : p)) : [...prev, token]));
    setSelectedUid(null);
  }
  function remove(uid: string) {
    setTokens((prev) => prev.filter((p) => p.uid !== uid));
    setSelectedUid(null);
  }
  function move(delta: -1 | 1) {
    setTokens((prev) => {
      const i = prev.findIndex((p) => p.uid === selectedUid);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }
  function clear() {
    setTokens([]);
    setSelectedUid(null);
    setResult(null);
    setSearch('');
  }
  function check() {
    try {
      const r = checkSentence(tokens);
      setResult(r);
      recordResult(r.correct);
    } catch {
      clear();
    }
  }
  function changeTab(tab: Tab) {
    setActiveTab(tab);
    setSearch('');
    setShowAll(false);
  }

  const searchable = activeTab === 'fiil' || activeTab === 'isim' || activeTab === 'sifat';
  const listLength = activeTab === 'fiil' ? filteredVerbs.length : activeTab === 'isim' ? filteredNouns.length : activeTab === 'sifat' ? filteredAdjectives.length : 0;
  const limit = showAll || q ? Infinity : PAGE_SIZE;
  const muted = { fontSize: 13, lineHeight: 18, color: t.c.textMuted };

  return (
    <Page edges={['top', 'bottom']}>
      <TopBar title={info.title} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: space(4), gap: space(4) }} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 2 }}>
          <Text style={muted}>{info.pattern}</Text>
          <Text style={{ fontFamily: fonts.de, fontSize: 15, color: t.c.text }}>{info.example}</Text>
        </View>

        <SentenceStrip tokens={tokens} selectedUid={selectedUid} onSelect={(token) => setSelectedUid(token.uid === selectedUid ? null : token.uid)} />

        {selected ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2), flexWrap: 'wrap', marginTop: -space(1) }}>
            <IconButton icon="chevronLeft" label="Sola taşı" onPress={() => move(-1)} color={selectedIndex > 0 ? t.c.text : t.c.border} />
            <IconButton icon="chevronRight" label="Sağa taşı" onPress={() => move(1)} color={selectedIndex < tokens.length - 1 ? t.c.text : t.c.border} />
            {selected.kind === 'verb' ? <Button label="Çekimle" variant="secondary" onPress={() => setEditingVerb(selected)} style={{ minHeight: 40 }} /> : null}
            <Button label="Çıkar" variant="danger" icon="trash" onPress={() => remove(selected.uid)} style={{ minHeight: 40 }} />
          </View>
        ) : tokens.length > 0 ? (
          <Text style={[muted, { marginTop: -space(1) }]}>Bir kelimeye dokun: taşı, çıkar ya da fiilin biçimini değiştir.</Text>
        ) : null}

        <Pills options={info.tabs.map((tab) => ({ value: tab, label: TAB_LABEL[tab] }))} value={activeTab} onChange={changeTab} />

        {searchable ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
            <View style={{ flex: 1 }}>
              <SearchField value={search} onChangeText={setSearch} placeholder="Almanca ya da Türkçe ara" />
            </View>
            <IconButton icon="plus" label="Kendi kelimeni ekle" color={t.c.text} onPress={() => navigation.navigate('AddWord', { initialCategory: activeTab as WordCategory })} />
          </View>
        ) : null}

        {activeTab === 'artikel' ? (
          <ArticleTable onPick={(def) => append(articleDefToToken(def))} />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space(2) }}>
            {activeTab === 'ozne' &&
              pronouns.map((p, i) => <WordChip key={`${p.text}_${i}`} label={p.text} sub={p.tr} onPress={() => setPronoun({ uid: makeUid('pn'), kind: 'pronoun', text: p.text, person: p.person })} />)}

            {activeTab === 'fiil' &&
              filteredVerbs.slice(0, limit).map((v) => <WordChip key={v.id} label={v.infinitive} sub={gloss(v.tr)} onPress={() => append({ uid: makeUid('vb'), kind: 'verb', verbId: v.id, mode: 'finite' })} />)}

            {activeTab === 'isim' &&
              filteredNouns.slice(0, limit).map((n) => (
                <WordChip
                  key={n.id}
                  label={n.noun}
                  sub={showTranslations ? `${n.gender} · ${n.tr}` : n.gender}
                  tone={n.gender}
                  accessibilityLabel={`${n.gender} ${n.noun}, ${n.tr}`}
                  onPress={() => append({ uid: makeUid('nn'), kind: 'noun', nounId: n.id })}
                />
              ))}

            {activeTab === 'sifat' &&
              filteredAdjectives.slice(0, limit).map((a) => <WordChip key={a.id} label={a.adjective} sub={gloss(a.tr)} onPress={() => append({ uid: makeUid('aj'), kind: 'adjective', adjectiveId: a.id })} />)}

            {activeTab === 'ek' && timePlaceWords.map((w) => <WordChip key={w.text} label={w.text} sub={w.tr} onPress={() => append({ uid: makeUid('ft'), kind: 'freetext', text: w.text, tr: w.tr })} />)}

            {activeTab === 'soru' && questionWords.map((w) => <WordChip key={w.word} label={w.word} sub={w.tr} onPress={() => putInFront({ uid: makeUid('qw'), kind: 'question', word: w.word, tr: w.tr })} />)}

            {activeTab === 'baglac' && connectors.map((c) => <WordChip key={c.word} label={c.word} sub={c.tr} onPress={() => putInFront({ uid: makeUid('cn'), kind: 'connector', word: c.word })} />)}
          </View>
        )}

        {searchable && listLength === 0 ? <Text style={muted}>Eşleşen kelime yok. Sağdaki + ile kendi kelimeni ekleyebilirsin.</Text> : null}
        {searchable && listLength > limit ? <Button label={`Hepsini göster (${listLength})`} variant="ghost" onPress={() => setShowAll(true)} /> : null}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: space(3), paddingHorizontal: space(4), paddingVertical: space(3), borderTopWidth: 1, borderTopColor: t.c.border, backgroundColor: t.c.bg }}>
        <Button label="Temizle" variant="secondary" onPress={clear} disabled={tokens.length === 0} />
        <Button label="Kontrol et" icon="check" onPress={check} disabled={tokens.length === 0} style={{ flex: 1 }} />
      </View>

      <VerbTokenEditor token={editingVerb} subjectPerson={subjectPerson} onClose={() => setEditingVerb(null)} onChange={(next) => setTokens((prev) => prev.map((p) => (p.uid === next.uid ? next : p)))} />
      <FeedbackSheet result={result} onClose={() => setResult(null)} onNext={clear} />
    </Page>
  );
};
