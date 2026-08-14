import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { useProgress } from '../context/ProgressContext';
import { useCustomVocab } from '../context/CustomVocabContext';
import { colors, spacing } from '../theme';

type Category = 'fiil' | 'isim' | 'sifat' | 'c1';

interface Row {
  id: string;
  de: string;
  tr: string;
  extra?: string;
  isCustom: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, 'WordList'>;

function useRows(category: Category, customVocab: ReturnType<typeof useCustomVocab>): Row[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    if (category === 'fiil') return verbs.map((v) => ({ id: v.id, de: v.infinitive, tr: v.tr, extra: v.level, isCustom: customVocab.customVerbIds.has(v.id) }));
    if (category === 'c1') return verbsC1.map((v) => ({ id: v.id, de: v.infinitive, tr: v.tr, extra: 'C1', isCustom: customVocab.customVerbIds.has(v.id) }));
    if (category === 'isim')
      return nouns.map((n) => ({ id: n.id, de: `${n.gender} ${n.noun}`, tr: n.tr, extra: n.level, isCustom: customVocab.customNounIds.has(n.id) }));
    return adjectives.map((a) => ({ id: a.id, de: a.adjective, tr: a.tr, extra: a.level, isCustom: customVocab.customAdjectiveIds.has(a.id) }));
    // `version` intentionally drives recomputation: verbs/nouns/adjectives are
    // mutated in place when a custom word is added, so their reference never
    // changes on its own.
  }, [category, customVocab.version]);
}

export const WordListScreen: React.FC<Props> = ({ route, navigation }) => {
  const [category, setCategory] = useState<Category>(route.params?.initialCategory ?? 'fiil');
  const [search, setSearch] = useState('');
  const { isFavorite, toggleFavorite } = useProgress();
  const customVocab = useCustomVocab();
  const rows = useRows(category, customVocab);

  const filtered = rows.filter((r) => r.de.toLowerCase().includes(search.toLowerCase()) || r.tr.toLowerCase().includes(search.toLowerCase()));

  const tabs: { key: Category; label: string }[] = [
    { key: 'fiil', label: `Fiiller (${verbs.length})` },
    { key: 'isim', label: `İsimler (${nouns.length})` },
    { key: 'sifat', label: `Sıfatlar (${adjectives.length})` },
    { key: 'c1', label: `C1 Fiiller (${verbsC1.length})` },
  ];

  function handleRemove(row: Row) {
    if (category === 'isim') customVocab.removeNoun(row.id);
    else if (category === 'sifat') customVocab.removeAdjective(row.id);
    else customVocab.removeVerb(row.id);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.headerRow}>
        <View style={styles.tabRow}>
          {tabs.map((t) => (
            <Pressable key={t.key} onPress={() => setCategory(t.key)} style={[styles.tab, category === t.key && styles.tabActive]}>
              <Text style={[styles.tabText, category === t.key && styles.tabTextActive]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={styles.addBtn} onPress={() => navigation.navigate('AddWord', { initialCategory: category === 'c1' ? 'fiil' : category })}>
          <Text style={styles.addBtnText}>+ Kelime Ekle</Text>
        </Pressable>
      </View>
      <TextInput
        placeholder="Ara..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing(2) }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable style={{ flex: 1 }} onPress={() => Speech.speak(item.de, { language: 'de-DE' })}>
              <View style={styles.deRow}>
                <Text style={styles.de}>{item.de}</Text>
                <Text style={styles.speakIcon}> 🔊</Text>
                {item.isCustom ? <Text style={styles.customBadge}>Özel</Text> : null}
              </View>
              <Text style={styles.tr}>{item.tr}</Text>
            </Pressable>
            <Text style={styles.level}>{item.extra}</Text>
            {item.isCustom ? (
              <Pressable onPress={() => handleRemove(item)}>
                <Text style={styles.trash}>🗑️</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={() => toggleFavorite(item.id)}>
              <Text style={styles.star}>{isFavorite(item.id) ? '★' : '☆'}</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  headerRow: { paddingHorizontal: spacing(2), paddingTop: spacing(2) },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.card, marginRight: 8, marginBottom: 8 },
  tabActive: { backgroundColor: colors.accentDark },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  addBtn: { alignSelf: 'flex-start', backgroundColor: colors.cardAlt, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, marginBottom: spacing(1) },
  addBtnText: { color: colors.accent, fontWeight: '700', fontSize: 12 },
  search: { backgroundColor: colors.card, color: colors.text, borderRadius: 12, marginHorizontal: spacing(2), paddingHorizontal: 14, paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: spacing(1.5), marginBottom: spacing(1) },
  deRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  de: { color: colors.text, fontSize: 16, fontWeight: '700' },
  speakIcon: { fontSize: 12 },
  customBadge: { color: '#fff', fontSize: 10, fontWeight: '800', backgroundColor: colors.accentDark, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginLeft: spacing(1), overflow: 'hidden' },
  tr: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  level: { color: colors.accent, fontSize: 11, fontWeight: '700', marginRight: spacing(1.5) },
  star: { color: colors.info, fontSize: 22 },
  trash: { fontSize: 18, marginRight: spacing(1.5) },
});
