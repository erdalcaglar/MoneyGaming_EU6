import React from 'react';
import { Text, View } from 'react-native';
import { WordChip } from './WordChip';
import { ArticleDef, definiteArticles, indefiniteArticles } from '../data/articles';
import { Case, Gender } from '../data/types';
import { useTheme } from '../context/SettingsContext';
import { space } from '../theme';

const CASES: { key: Case; label: string }[] = [
  { key: 'nominativ', label: 'Nominativ' },
  { key: 'akkusativ', label: 'Akkusativ' },
  { key: 'dativ', label: 'Dativ' },
];
const GENDERS: { key: Gender; label: string }[] = [
  { key: 'der', label: 'eril' },
  { key: 'die', label: 'dişil' },
  { key: 'das', label: 'nötr' },
];

/**
 * The article bank laid out as the declension table it really is:
 * rows = case, columns = gender. Picking a cell picks that exact form.
 */
export const ArticleTable: React.FC<{ onPick: (def: ArticleDef) => void }> = ({ onPick }) => {
  const t = useTheme();
  const label = { fontSize: 12, fontWeight: '600' as const, color: t.c.textMuted };

  const block = (title: string, defs: ArticleDef[]) => (
    <View style={{ gap: space(2) }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: t.c.text }}>{title}</Text>
      <View style={{ flexDirection: 'row', gap: space(2) }}>
        <View style={{ width: 84 }} />
        {GENDERS.map((g) => (
          <Text key={g.key} style={[label, { flex: 1, textAlign: 'center' }]}>
            {g.label}
          </Text>
        ))}
      </View>
      {CASES.map((c) => (
        <View key={c.key} style={{ flexDirection: 'row', alignItems: 'center', gap: space(2) }}>
          <Text style={[label, { width: 84 }]}>{c.label}</Text>
          {GENDERS.map((g) => {
            const def = defs.find((d) => d.case === c.key && d.gender === g.key);
            return (
              <View key={g.key} style={{ flex: 1 }}>
                {def ? <WordChip label={def.surface} tone={g.key} onPress={() => onPick(def)} accessibilityLabel={def.labelTr} /> : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ gap: space(6) }}>
      {block('Belirli (der / die / das)', definiteArticles)}
      {block('Belirsiz (ein / eine)', indefiniteArticles)}
    </View>
  );
};
