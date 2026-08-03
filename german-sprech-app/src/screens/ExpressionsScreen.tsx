import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { expressions } from '../data/expressions';
import { ExpressionEntry } from '../data/types';
import { colors, spacing } from '../theme';

const CATEGORY_LABEL: Record<ExpressionEntry['category'], string> = {
  ueberraschung: '😲 Şaşırma',
  zustimmung: '👍 Onay',
  ablehnung: '👎 Ret',
  begruessung: '👋 Selamlama',
  alltag: '☕ Günlük',
  fueller: '💭 Dolgu kelimeler',
};

const ExpressionCard: React.FC<{ item: ExpressionEntry }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <Pressable style={styles.card} onPress={() => setOpen((o) => !o)}>
      <View style={styles.headRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.de}>{item.de}</Text>
          <Text style={styles.tr}>{item.tr}</Text>
        </View>
        <Pressable onPress={() => Speech.speak(item.de, { language: 'de-DE' })}>
          <Text style={styles.speakIcon}>🔊</Text>
        </Pressable>
      </View>
      {open && <Text style={styles.note}>{item.note}</Text>}
      <Text style={styles.toggle}>{open ? '▲' : '▼ neden böyle kullanılır?'}</Text>
    </Pressable>
  );
};

export const ExpressionsScreen: React.FC = () => {
  const categories = Array.from(new Set(expressions.map((e) => e.category)));
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c}
        contentContainerStyle={{ padding: spacing(2) }}
        renderItem={({ item: cat }) => (
          <View style={{ marginBottom: spacing(2) }}>
            <Text style={styles.sectionTitle}>{CATEGORY_LABEL[cat]}</Text>
            {expressions
              .filter((e) => e.category === cat)
              .map((e) => (
                <ExpressionCard key={e.id} item={e} />
              ))}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: spacing(1) },
  card: { backgroundColor: colors.card, borderRadius: 14, padding: spacing(1.5), marginBottom: spacing(1) },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  de: { color: colors.text, fontSize: 16, fontWeight: '700' },
  tr: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  speakIcon: { fontSize: 18 },
  note: { color: colors.text, fontSize: 13, lineHeight: 19, marginTop: spacing(1) },
  toggle: { color: colors.accent, fontSize: 11, marginTop: spacing(0.5), fontWeight: '600' },
});
