import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, ScreenTitle, SectionLabel, Segmented, Sheet } from '../components/ui';
import { ThemeMode, useSettings, useTheme } from '../context/SettingsContext';
import { useProgress } from '../context/ProgressContext';
import { radius, space } from '../theme';

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useTheme();
  return <View style={{ backgroundColor: t.c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: t.c.border, padding: space(4), gap: space(3) }}>{children}</View>;
};

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void; label: string }> = ({ value, onChange, label }) => {
  const t = useTheme();
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      style={{ width: 52, height: 32, borderRadius: 16, backgroundColor: value ? t.c.primary : t.c.surfaceAlt, borderWidth: 1, borderColor: value ? t.c.primary : t.c.border, padding: 3, alignItems: value ? 'flex-end' : 'flex-start' }}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: value ? t.c.onPrimary : t.c.textMuted }} />
    </Pressable>
  );
};

export const SettingsTab: React.FC = () => {
  const t = useTheme();
  const { themeMode, setThemeMode, showTranslations, setShowTranslations } = useSettings();
  const { correctCount, wrongCount, resetProgress } = useProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const body = { fontSize: 14, lineHeight: 20, color: t.c.textMuted };
  const heading = { fontSize: 16, fontWeight: '600' as const, color: t.c.text };

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(8), gap: space(3) }}>
      <ScreenTitle title="Ayarlar" />

      <View style={{ marginTop: -space(2) }}>
        <SectionLabel>Görünüm</SectionLabel>
      </View>
      <Card>
        <Text style={heading}>Tema</Text>
        <Segmented<ThemeMode>
          value={themeMode}
          onChange={setThemeMode}
          options={[
            { value: 'system', label: 'Sistem', icon: 'monitor' },
            { value: 'light', label: 'Gündüz', icon: 'sun' },
            { value: 'dark', label: 'Gece', icon: 'moon' },
          ]}
        />
        <Text style={body}>"Sistem" telefonunun ya da bilgisayarının ayarını izler.</Text>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3) }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={heading}>Türkçe anlamları göster</Text>
            <Text style={body}>Cümle kurarken kelimelerin altındaki çeviri. Kendini denemek için kapat.</Text>
          </View>
          <Toggle value={showTranslations} onChange={setShowTranslations} label="Türkçe anlamları göster" />
        </View>
      </Card>

      <View style={{ marginTop: space(3) }}>
        <SectionLabel>İlerleme</SectionLabel>
      </View>
      <Card>
        <Text style={body}>
          Şimdiye kadar {correctCount + wrongCount} cümle denedin; {correctCount} tanesi doğruydu. Bu bilgiler yalnızca bu cihazda saklanır.
        </Text>
        <Button label="İlerlemeyi sıfırla" variant="secondary" onPress={() => setConfirmReset(true)} disabled={correctCount + wrongCount === 0} />
      </Card>

      <Text style={[body, { textAlign: 'center', marginTop: space(4) }]}>Deutsch Sprechen 2.0</Text>

      <Sheet visible={confirmReset} onClose={() => setConfirmReset(false)}>
        <View style={{ gap: space(4) }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: t.c.text }}>İlerleme sıfırlansın mı?</Text>
          <Text style={body}>Seri, cümle sayısı ve favori kelimelerin silinir. Kendi eklediğin kelimeler kalır. Bu işlem geri alınamaz.</Text>
          <Button
            label="Sıfırla"
            variant="danger"
            onPress={() => {
              resetProgress();
              setConfirmReset(false);
            }}
          />
          <Button label="Vazgeç" variant="secondary" onPress={() => setConfirmReset(false)} />
        </View>
      </Sheet>
    </ScrollView>
  );
};
