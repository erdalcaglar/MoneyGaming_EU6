import React from 'react';
import { Pressable, PressableStateCallbackType, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BuilderMode, RootStackParamList } from '../navigation/types';
import { Icon } from '../components/Icon';
import { Button, ScreenTitle, SectionLabel } from '../components/ui';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/SettingsContext';
import { fonts, radius, space } from '../theme';

type PressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

const LESSONS: { mode: BuilderMode; level: string; title: string; example: string }[] = [
  { mode: 'simple', level: 'A1', title: 'Basit cümleler', example: 'Ich trinke Wasser.' },
  { mode: 'question', level: 'A1', title: 'Soru sor', example: 'Wo arbeitest du?' },
  { mode: 'perfekt', level: 'A2', title: 'Geçmiş zaman', example: 'Ich bin gekommen.' },
  { mode: 'modal', level: 'A2', title: 'Modal fiiller', example: 'Ich kann tanzen.' },
  { mode: 'subordinate', level: 'B1', title: 'weil ve dass', example: '…, weil ich glücklich bin.' },
];

export const PracticeTab: React.FC = () => {
  const t = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { correctCount, wrongCount, streak } = useProgress();
  const total = correctCount + wrongCount;

  const stats = [
    { value: String(streak), label: 'gün seri' },
    { value: String(total), label: 'cümle' },
    { value: total > 0 ? `%${Math.round((correctCount / total) * 100)}` : '–', label: 'doğru' },
  ];

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(8), gap: space(6) }}>
      <ScreenTitle title="Hallo!" subtitle="Kelimeleri seç, cümleni kur, gramerini anında gör." />

      <View style={{ backgroundColor: t.c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: t.c.border, padding: space(5), gap: space(4), marginTop: -space(4) }}>
        <View style={{ gap: space(1) }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: t.c.text }}>Serbest pratik</Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: t.c.textMuted }}>Bütün kelimeler açık. İstediğin cümleyi kur; uygulama yapısını kendi anlar.</Text>
        </View>
        <Button label="Cümle kur" icon="practice" onPress={() => navigation.navigate('Builder', { mode: 'free' })} />
      </View>

      <View style={{ gap: space(3) }}>
        <SectionLabel>Adım adım</SectionLabel>
        <View style={{ backgroundColor: t.c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: t.c.border, overflow: 'hidden' }}>
          {LESSONS.map((lesson, i) => (
            <Pressable
              key={lesson.mode}
              onPress={() => navigation.navigate('Builder', { mode: lesson.mode })}
              accessibilityRole="button"
              accessibilityLabel={`${lesson.title}, seviye ${lesson.level}`}
              style={(state: PressState) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space(3),
                paddingHorizontal: space(4),
                minHeight: 68,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: t.c.border,
                backgroundColor: state.pressed || state.hovered ? t.c.surfaceAlt : 'transparent',
              })}
            >
              <Text style={{ width: 28, fontSize: 13, fontWeight: '700', color: t.c.textMuted, fontVariant: ['tabular-nums'] }}>{lesson.level}</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: t.c.text }}>{lesson.title}</Text>
                <Text style={{ fontFamily: fonts.de, fontSize: 14, color: t.c.textMuted }}>{lesson.example}</Text>
              </View>
              <Icon name="chevronRight" size={18} color={t.c.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: space(3) }}>
        <SectionLabel>İlerlemen</SectionLabel>
        <View style={{ flexDirection: 'row', gap: space(3) }}>
          {stats.map((stat) => (
            <View key={stat.label} style={{ flex: 1, backgroundColor: t.c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: t.c.border, padding: space(4), gap: 2 }}>
              <Text style={{ fontFamily: fonts.deBold, fontSize: 24, color: t.c.text, fontVariant: ['tabular-nums'] }}>{stat.value}</Text>
              <Text style={{ fontSize: 13, color: t.c.textMuted }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};
