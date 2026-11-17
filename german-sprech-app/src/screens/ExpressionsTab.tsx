import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { expressions } from '../data/expressions';
import { ExpressionEntry } from '../data/types';
import { Icon } from '../components/Icon';
import { IconButton, Pills, ScreenTitle } from '../components/ui';
import { speakGerman } from '../components/speak';
import { useTheme } from '../context/SettingsContext';
import { fonts, radius, space } from '../theme';

type Filter = 'all' | ExpressionEntry['category'];

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Hepsi' },
  { value: 'ueberraschung', label: 'Şaşırma' },
  { value: 'zustimmung', label: 'Onay' },
  { value: 'ablehnung', label: 'Ret' },
  { value: 'begruessung', label: 'Selam' },
  { value: 'alltag', label: 'Günlük' },
  { value: 'fueller', label: 'Dolgu' },
];

const ExpressionCard: React.FC<{ item: ExpressionEntry }> = ({ item }) => {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ backgroundColor: t.c.surface, borderRadius: radius.card, borderWidth: 1, borderColor: t.c.border, padding: space(4), gap: space(2) }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontFamily: fonts.deBold, fontSize: 19, lineHeight: 25, color: t.c.text }}>{item.de}</Text>
          <Text style={{ fontSize: 15, color: t.c.textMuted }}>{item.tr}</Text>
        </View>
        <IconButton icon="volume" label={`"${item.de}" ifadesini dinle`} onPress={() => speakGerman(item.de)} />
      </View>
      <Pressable onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', gap: space(1), minHeight: 32 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: t.c.accent }}>{open ? 'Açıklamayı gizle' : 'Neden böyle denir?'}</Text>
        <Icon name={open ? 'chevronUp' : 'chevronDown'} size={16} color={t.c.accent} />
      </Pressable>
      {open ? <Text style={{ fontSize: 14, lineHeight: 21, color: t.c.text }}>{item.note}</Text> : null}
    </View>
  );
};

export const ExpressionsTab: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const shown = filter === 'all' ? expressions : expressions.filter((e) => e.category === filter);
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: space(4), paddingBottom: space(8), gap: space(3) }}>
      <ScreenTitle title="İfadeler" subtitle="Günlük konuşmada kalıp olarak kullanılan, kelime kelime kurulmayan tepkiler." />
      <View style={{ marginTop: -space(3), marginBottom: space(1) }}>
        <Pills options={FILTERS} value={filter} onChange={setFilter} />
      </View>
      {shown.map((e) => (
        <ExpressionCard key={e.id} item={e} />
      ))}
    </ScrollView>
  );
};
