import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme';

interface Props {
  label: string;
  subLabel?: string;
  color?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const WordChip: React.FC<Props> = ({ label, subLabel, color = colors.chipDefault, onPress, onLongPress, selected, disabled, style }) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: color, opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
        selected && styles.selected,
        style,
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {subLabel ? <Text style={styles.subLabel}>{subLabel}</Text> : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  label: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  subLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 1,
  },
});
