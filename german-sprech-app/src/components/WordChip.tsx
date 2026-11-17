import React from 'react';
import { Pressable, PressableStateCallbackType, Text } from 'react-native';
import { useTheme } from '../context/SettingsContext';
import { fonts, radius, space, ToneKey } from '../theme';

type PressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

interface Props {
  label: string;
  /** small Turkish gloss under the word */
  sub?: string;
  /** word-class colour; omit for a plain outlined chip */
  tone?: ToneKey;
  selected?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export const WordChip: React.FC<Props> = ({ label, sub, tone, selected, onPress, accessibilityLabel }) => {
  const t = useTheme();
  const colors = tone ? t.c.tones[tone] : { bg: t.c.surface, fg: t.c.text };
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (sub ? `${label}, ${sub}` : label)}
      accessibilityState={{ selected: !!selected }}
      style={(state: PressState) => ({
        minHeight: 40,
        paddingHorizontal: space(3),
        paddingVertical: space(1.5),
        borderRadius: radius.chip,
        justifyContent: 'center',
        backgroundColor: colors.bg,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? t.c.text : tone ? colors.bg : t.c.border,
        margin: selected ? 0 : 1,
        opacity: state.pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.deBold, fontSize: 16, lineHeight: 20, color: colors.fg }}>{label}</Text>
      {sub ? (
        <Text style={{ fontSize: 12, lineHeight: 15, color: colors.fg, opacity: 0.72 }} numberOfLines={1}>
          {sub}
        </Text>
      ) : null}
    </Pressable>
  );
};
