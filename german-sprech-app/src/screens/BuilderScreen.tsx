import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WordChip } from '../components/WordChip';
import { SentenceStrip } from '../components/SentenceStrip';
import { FeedbackModal } from '../components/FeedbackModal';
import { VerbTokenEditor } from '../components/VerbTokenEditor';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { pronouns } from '../data/pronouns';
import { definiteArticles, indefiniteArticles, articleDefToToken } from '../data/articles';
import { questionWords, connectors } from '../data/questionWords';
import { SentenceToken, VerbToken, PronounToken, makeUid } from '../engine/tokens';
import { checkSentence, CheckResult } from '../engine/grammar';
import { useProgress } from '../context/ProgressContext';
import { useCustomVocab } from '../context/CustomVocabContext';
import { colors, spacing } from '../theme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, WordCategory } from '../navigation/types';

type Tab = 'ozne' | 'fiil' | 'artikel' | 'isim' | 'sifat' | 'soru' | 'baglac';

const MODE_INFO: Record<string, { title: string; instruction: string; example: string; showQuestion?: boolean; showConnector?: boolean }> = {
  simple: { title: 'Basit Cümleler', instruction: 'Özne + fiil (+ nesne) seçerek bir cümle kur.', example: 'Örn: Ich trinke Kaffee.' },
  question: {
    title: 'Soru Sor (W-Fragen)',
    instruction: 'Önce bir soru kelimesi, sonra fiil, sonra özne seç.',
    example: 'Örn: Wo wohnst du?',
    showQuestion: true,
  },
  perfekt: {
    title: 'Geçmiş Zaman (Perfekt)',
    instruction: 'Özne + haben/sein + ... + fiilin Partizip II hâli. Fiil çipine dokunup "Partizip II" seç!',
    example: 'Örn: Ich bin gekommen. / Ich habe gegessen.',
  },
  modal: {
    title: 'Modal Fiiller',
    instruction: 'Özne + modal fiil (können, müssen...) + ... + ana fiilin mastar hâli. Fiil çipine dokunup "Mastar" seç!',
    example: 'Örn: Ich kann Deutsch sprechen.',
  },
  subordinate: {
    title: 'weil / dass Cümleleri',
    instruction: 'Önce bağlaç, sonra özne, en sonda fiil.',
    example: 'Örn: ..., weil ich müde bin.',
    showConnector: true,
  },
  free: {
    title: 'Serbest Pratik',
    instruction: 'İstediğin kelimeleri seç, istediğin cümleyi kur — motor otomatik olarak yapıyı anlar.',
    example: 'Her şeyi dene!',
    showQuestion: true,
    showConnector: true,
  },
};

type Props = NativeStackScreenProps<RootStackParamList, 'Builder'>;

export const BuilderScreen: React.FC<Props> = ({ route, navigation }) => {
  const mode = route.params?.mode ?? 'simple';
  const info = MODE_INFO[mode] ?? MODE_INFO.simple;
  const { recordResult } = useProgress();
  const customVocab = useCustomVocab();

  const [tokens, setTokens] = useState<SentenceToken[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('ozne');
  const [search, setSearch] = useState('');
  const [editingVerb, setEditingVerb] = useState<VerbToken | null>(null);
  const [result, setResult] = useState<CheckResult | null>(null);

  const subject = tokens.find((t): t is PronounToken => t.kind === 'pronoun') ?? null;

  // `customVocab.version` forces recomputation after a custom word is added:
  // verbs/nouns/adjectives are mutated in place, so their array reference
  // never changes on its own.
  const verbBank = useMemo(() => (mode === 'free' ? [...verbs, ...verbsC1] : verbs), [mode, customVocab.version]);

  const filteredVerbs = useMemo(
    () => verbBank.filter((v) => v.infinitive.toLowerCase().includes(search.toLowerCase()) || v.tr.toLowerCase().includes(search.toLowerCase())),
    [verbBank, search],
  );
  const filteredNouns = useMemo(
    () => nouns.filter((n) => n.noun.toLowerCase().includes(search.toLowerCase()) || n.tr.toLowerCase().includes(search.toLowerCase())),
    [search, customVocab.version],
  );
  const filteredAdjectives = useMemo(
    () => adjectives.filter((a) => a.adjective.toLowerCase().includes(search.toLowerCase()) || a.tr.toLowerCase().includes(search.toLowerCase())),
    [search, customVocab.version],
  );

  function addToken(t: SentenceToken) {
    setTokens((prev) => [...prev, t]);
  }
  function addFront(t: SentenceToken) {
    setTokens((prev) => [t, ...prev.filter((p) => p.kind !== t.kind)]);
  }
  function removeToken(t: SentenceToken) {
    setTokens((prev) => prev.filter((p) => p.uid !== t.uid));
  }
  function handleTokenPress(t: SentenceToken) {
    if (t.kind === 'verb') {
      setEditingVerb(t);
    } else {
      removeToken(t);
    }
  }
  function updateVerbToken(next: VerbToken) {
    setTokens((prev) => prev.map((t) => (t.uid === next.uid ? next : t)));
    setEditingVerb(next);
  }

  function handleCheck() {
    const r = checkSentence(tokens);
    setResult(r);
    recordResult(r.correct);
  }

  function handleClear() {
    setTokens([]);
    setResult(null);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ozne', label: 'Özne' },
    { key: 'fiil', label: 'Fiil' },
    { key: 'artikel', label: 'Artikel' },
    { key: 'isim', label: 'İsim' },
    { key: 'sifat', label: 'Sıfat' },
    ...(info.showQuestion ? [{ key: 'soru' as Tab, label: 'Soru' }] : []),
    ...(info.showConnector ? [{ key: 'baglac' as Tab, label: 'Bağlaç' }] : []),
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{info.title}</Text>
        <Text style={styles.instruction}>{info.instruction}</Text>
        <Text style={styles.example}>{info.example}</Text>

        <View style={styles.stripBox}>
          <SentenceStrip tokens={tokens} subjectPerson={subject?.person ?? null} onTokenPress={handleTokenPress} onTokenRemove={removeToken} />
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearText}>Temizle</Text>
          </Pressable>
          <Pressable style={styles.checkBtn} onPress={handleCheck} disabled={tokens.length === 0}>
            <Text style={styles.checkText}>Kontrol Et ✓</Text>
          </Pressable>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((t) => (
            <Pressable key={t.key} onPress={() => setActiveTab(t.key)} style={[styles.tab, activeTab === t.key && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {(activeTab === 'fiil' || activeTab === 'isim' || activeTab === 'sifat') && (
          <View style={styles.searchRow}>
            <TextInput
              placeholder="Ara... (Almanca ya da Türkçe)"
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={[styles.search, { flex: 1, marginBottom: 0 }]}
            />
            <Pressable style={styles.addWordBtn} onPress={() => navigation.navigate('AddWord', { initialCategory: activeTab as WordCategory })}>
              <Text style={styles.addWordBtnText}>+ Ekle</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.bankWrap}>
          {activeTab === 'ozne' &&
            pronouns.map((p, i) => (
              <WordChip
                key={`${p.text}_${i}`}
                label={p.text}
                subLabel={p.tr}
                color={colors.chipPronoun}
                onPress={() => addFront({ uid: makeUid('pn'), kind: 'pronoun', text: p.text, person: p.person })}
              />
            ))}

          {activeTab === 'fiil' &&
            filteredVerbs.map((v) => (
              <WordChip
                key={v.id}
                label={v.infinitive}
                subLabel={v.tr}
                color={colors.chipVerb}
                onPress={() =>
                  addToken({ uid: makeUid('vb'), kind: 'verb', verbId: v.id, mode: 'finite', chosenPerson: subject?.person ?? 'ich' })
                }
              />
            ))}

          {activeTab === 'artikel' &&
            [...definiteArticles, ...indefiniteArticles].map((a) => (
              <WordChip key={a.id} label={a.surface} subLabel={a.labelTr} color={colors.chipArticle} onPress={() => addToken(articleDefToToken(a))} />
            ))}

          {activeTab === 'isim' &&
            filteredNouns.map((n) => (
              <WordChip
                key={n.id}
                label={`${n.gender} ${n.noun}`}
                subLabel={n.tr}
                color={colors.chipNoun}
                onPress={() => addToken({ uid: makeUid('nn'), kind: 'noun', nounId: n.id })}
              />
            ))}

          {activeTab === 'sifat' &&
            filteredAdjectives.map((a) => (
              <WordChip
                key={a.id}
                label={a.adjective}
                subLabel={a.tr}
                color={colors.chipAdjective}
                onPress={() => addToken({ uid: makeUid('aj'), kind: 'adjective', adjectiveId: a.id })}
              />
            ))}

          {activeTab === 'soru' &&
            questionWords.map((q) => (
              <WordChip
                key={q.word}
                label={q.word}
                subLabel={q.tr}
                color={colors.chipQuestion}
                onPress={() => addFront({ uid: makeUid('qw'), kind: 'question', word: q.word, tr: q.tr })}
              />
            ))}

          {activeTab === 'baglac' &&
            connectors.map((c) => (
              <WordChip
                key={c.word}
                label={c.word}
                subLabel={c.tr}
                color={colors.chipConnector}
                onPress={() => addFront({ uid: makeUid('cn'), kind: 'connector', word: c.word })}
              />
            ))}
        </View>
      </ScrollView>

      <VerbTokenEditor
        token={editingVerb}
        onClose={() => setEditingVerb(null)}
        onChange={updateVerbToken}
        onRemove={() => {
          if (editingVerb) removeToken(editingVerb);
          setEditingVerb(null);
        }}
      />
      <FeedbackModal result={result} onClose={() => setResult(null)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(2), paddingBottom: spacing(6) },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  instruction: { color: colors.textMuted, marginTop: spacing(0.5), fontSize: 14 },
  example: { color: colors.accent, marginTop: spacing(0.5), fontSize: 13, fontStyle: 'italic', marginBottom: spacing(2) },
  stripBox: { backgroundColor: colors.card, borderRadius: 16, minHeight: 64, justifyContent: 'center' },
  actionRow: { flexDirection: 'row', marginTop: spacing(1.5), gap: spacing(1.5) as unknown as number },
  clearBtn: { flex: 1, backgroundColor: colors.cardAlt, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  clearText: { color: colors.textMuted, fontWeight: '700' },
  checkBtn: { flex: 2, backgroundColor: colors.accentDark, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  checkText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(2.5), marginBottom: spacing(1) },
  tab: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: colors.card, marginRight: 8, marginBottom: 8 },
  tabActive: { backgroundColor: colors.accentDark },
  tabText: { color: colors.textMuted, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  search: { backgroundColor: colors.card, color: colors.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: spacing(1.5) },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(1) as unknown as number, marginBottom: spacing(1.5) },
  addWordBtn: { backgroundColor: colors.cardAlt, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  addWordBtnText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  bankWrap: { flexDirection: 'row', flexWrap: 'wrap' },
});
