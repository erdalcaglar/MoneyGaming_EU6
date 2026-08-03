import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, BuilderMode } from '../navigation/types';
import { useProgress } from '../context/ProgressContext';
import { colors, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const LEVEL_CARDS: { mode: BuilderMode; title: string; subtitle: string; emoji: string }[] = [
  { mode: 'simple', title: 'Basit Cümleler', subtitle: 'Özne + fiil + nesne (A1)', emoji: '🟢' },
  { mode: 'question', title: 'Soru Sor', subtitle: 'W-Fragen: wo, was, wann... (A2)', emoji: '❓' },
  { mode: 'perfekt', title: 'Geçmiş Zaman', subtitle: 'Perfekt: haben/sein + Partizip (A2-B1)', emoji: '⏱️' },
  { mode: 'modal', title: 'Modal Fiiller', subtitle: 'können, müssen, wollen... (B1)', emoji: '💪' },
  { mode: 'subordinate', title: 'weil / dass', subtitle: 'Yan cümle, fiil sona gider (B1)', emoji: '🔗' },
  { mode: 'free', title: 'Serbest Pratik', subtitle: 'Tüm kelimeler, tüm kurallar', emoji: '🎲' },
];

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { correctCount, wrongCount, streak } = useProgress();
  const total = correctCount + wrongCount;
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.header}>Deutsch Sprechen 🇩🇪</Text>
        <Text style={styles.subheader}>Kelimelerle Almanca cümle kur, gramerini anında öğren.</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>gün serisi</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>cümle denendi</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{accuracy !== null ? `${accuracy}%` : '—'}</Text>
            <Text style={styles.statLabel}>doğruluk</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Cümle Kurma Oyunları</Text>
        {LEVEL_CARDS.map((c) => (
          <Pressable key={c.mode} style={styles.card} onPress={() => navigation.navigate('Builder', { mode: c.mode })}>
            <Text style={styles.cardEmoji}>{c.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardSubtitle}>{c.subtitle}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        <Text style={styles.sectionTitle}>Kelime Bankası</Text>
        <Pressable style={styles.card} onPress={() => navigation.navigate('WordList', {})}>
          <Text style={styles.cardEmoji}>📚</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Fiiller · İsimler · Sıfatlar</Text>
            <Text style={styles.cardSubtitle}>500+ kelime, Türkçe anlamlarıyla</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.card} onPress={() => navigation.navigate('Expressions')}>
          <Text style={styles.cardEmoji}>💬</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Günlük İfadeler</Text>
            <Text style={styles.cardSubtitle}>Şaşırma, onay, ret, günlük konuşma kalıpları</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(2.5), paddingBottom: spacing(6) },
  header: { fontSize: 28, fontWeight: '800', color: colors.text },
  subheader: { color: colors.textMuted, marginTop: spacing(0.5), fontSize: 14, marginBottom: spacing(2) },
  statsRow: { flexDirection: 'row', marginBottom: spacing(3) },
  statBox: { flex: 1, backgroundColor: colors.card, borderRadius: 16, paddingVertical: spacing(2), alignItems: 'center', marginRight: spacing(1) },
  statValue: { color: colors.accent, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing(1.5), marginBottom: spacing(1.5) },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing(2),
    marginBottom: spacing(1.5),
  },
  cardEmoji: { fontSize: 26, marginRight: spacing(1.5) },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.textMuted, fontSize: 24 },
});
