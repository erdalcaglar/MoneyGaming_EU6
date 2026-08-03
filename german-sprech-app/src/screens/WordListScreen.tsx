import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { verbs } from '../data/verbs';
import { verbsC1 } from '../data/verbsC1';
import { nouns } from '../data/nouns';
import { adjectives } from '../data/adjectives';
import { useProgress } from '../context/ProgressContext';
import { colors, spacing } from '../theme';

type Category = 'fiil' | 'isim' | 'sifat' | 'c1';

interface Row {
  id: string;
  de: string;
  tr: string;
  extra?: string;
}

function useRows(category: Category): Row[] {
  return useMemo(() => {
    if (category === 'fiil') return verbs.map((v) => ({ id: v.id, de: v.infinitive, tr: v.tr, extra: v.level }));
    if (category === 'c1') return verbsC1.map((v) => ({ id: v.id, de: v.infinitive, tr: v.tr, extra: 'C1' }));
    if (category === 'isim') return nouns.map((n) => ({ id: n.id, de: `${n.gender} ${n.noun}`, tr: n.tr, extra: n.level }));
    return adjectives.map((a) => ({ id: a.id, de: a.adjective, tr: a.tr, extra: a.level }));
  }, [category]);
}

export const WordListScreen: React.FC = () => {
  const [category, setCategory] = useState<Category>('fiil');
  const [search, setSearch] = useState('');
  const { isFavorite, toggleFavorite } = useProgress();
  const rows = useRows(category);

  const filtered = rows.filter((r) => r.de.toLowerCase().includes(search.toLowerCase()) || r.tr.toLowerCase().includes(search.toLowerCase()));

  const tabs: { key: Category; label: string }[] = [
    { key: 'fiil', label: `Fiiller (${verbs.length})` },
    { key: 'isim', label: `İsimler (${nouns.length})` },
    { key: 'sifat', label: `Sıfatlar (${adjectives.length})` },
    { key: 'c1', label: `C1 Fiiller (${verbsC1.length})` },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabRow}>
        {tabs.map((t) => (
          <Pressable key={t.key} onPress={() => setCategory(t.key)} style={[styles.tab, category === t.key && styles.tabActive]}>
            <Text style={[styles.tabText, category === t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
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
              <Text style={styles.de}>
                {item.de} <Text style={styles.speakIcon}>🔊</Text>
              </Text>
              <Text style={styles.tr}>{item.tr}</Text>
            </Pressable>
            <Text style={styles.level}>{item.extra}</Text>
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
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing(2), paddingBottom: 0 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, backgroundColor: colors.card, marginRight: 8, marginBottom: 8 },
  tabActive: { backgroundColor: colors.accentDark },
  tabText: { color: colors.textMuted, fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: '#fff' },
  search: { backgroundColor: colors.card, color: colors.text, borderRadius: 12, marginHorizontal: spacing(2), paddingHorizontal: 14, paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: spacing(1.5), marginBottom: spacing(1) },
  de: { color: colors.text, fontSize: 16, fontWeight: '700' },
  speakIcon: { fontSize: 12 },
  tr: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  level: { color: colors.accent, fontSize: 11, fontWeight: '700', marginRight: spacing(1.5) },
  star: { color: colors.info, fontSize: 22 },
});
