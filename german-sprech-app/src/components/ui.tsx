import React from 'react';
import { Modal, Pressable, PressableStateCallbackType, ScrollView, StyleProp, Text, TextInput, useWindowDimensions, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStyles, useTheme } from '../context/SettingsContext';
import { CONTENT_MAX_WIDTH, fonts, radius, space, Theme, WIDE_BREAKPOINT } from '../theme';
import { Icon, IconName } from './Icon';

/** react-native-web also reports hover/focus to Pressable style callbacks. */
type PressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

export function useIsWide(): boolean {
  return useWindowDimensions().width >= WIDE_BREAKPOINT;
}

// --- Page -------------------------------------------------------------------

/** Full-screen themed background with a centred, width-capped content column. */
export const Page: React.FC<{ children: React.ReactNode; edges?: ('top' | 'bottom')[] }> = ({ children, edges = ['top'] }) => {
  const s = useStyles(pageStyles);
  return (
    <SafeAreaView style={s.root} edges={edges}>
      <View style={s.column}>{children}</View>
    </SafeAreaView>
  );
};
const pageStyles = (t: Theme) => ({
  root: { flex: 1, backgroundColor: t.c.bg, alignItems: 'center' as const },
  column: { flex: 1, width: '100%' as const, maxWidth: CONTENT_MAX_WIDTH },
});

// --- Headings ---------------------------------------------------------------

export const ScreenTitle: React.FC<{ title: string; subtitle?: string; right?: React.ReactNode }> = ({ title, subtitle, right }) => {
  const s = useStyles(titleStyles);
  return (
    <View style={s.row}>
      <View style={s.texts}>
        <Text style={s.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
};
const titleStyles = (t: Theme) => ({
  row: { flexDirection: 'row' as const, alignItems: 'flex-start' as const, gap: space(3), paddingTop: space(4), paddingBottom: space(4) },
  texts: { flex: 1, gap: space(1) },
  title: { fontFamily: fonts.deBold, fontSize: 30, lineHeight: 36, color: t.c.text },
  subtitle: { fontSize: 15, lineHeight: 21, color: t.c.textMuted },
});

export const TopBar: React.FC<{ title: string; onBack: () => void; right?: React.ReactNode }> = ({ title, onBack, right }) => {
  const s = useStyles(topBarStyles);
  const t = useTheme();
  return (
    <View style={s.bar}>
      <IconButton icon="chevronLeft" label="Geri" onPress={onBack} />
      <Text style={s.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View style={s.right}>{right ?? <View style={{ width: 40 }} />}</View>
      <View style={[s.rule, { backgroundColor: t.c.border }]} />
    </View>
  );
};
const topBarStyles = (t: Theme) => ({
  bar: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: space(2), paddingHorizontal: space(2), height: 52 },
  title: { flex: 1, fontSize: 17, fontWeight: '600' as const, color: t.c.text },
  right: { minWidth: 40, alignItems: 'flex-end' as const },
  rule: { position: 'absolute' as const, left: 0, right: 0, bottom: 0, height: 1 },
});

export const SectionLabel: React.FC<{ children: string }> = ({ children }) => {
  const t = useTheme();
  return <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: t.c.textMuted }}>{children}</Text>;
};

// --- Buttons ----------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export const Button: React.FC<{
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}> = ({ label, onPress, variant = 'primary', icon, disabled, style }) => {
  const t = useTheme();
  const bg = { primary: t.c.primary, secondary: t.c.surfaceAlt, ghost: 'transparent', danger: 'transparent' }[variant];
  const fg = { primary: t.c.onPrimary, secondary: t.c.text, ghost: t.c.textMuted, danger: t.c.error }[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={(state: PressState) => [
        {
          minHeight: 48,
          paddingHorizontal: space(5),
          borderRadius: radius.control,
          backgroundColor: bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space(2),
          borderWidth: 2,
          borderColor: 'transparent',
          opacity: disabled ? 0.4 : state.pressed ? 0.75 : state.hovered ? 0.9 : 1,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={{ color: fg, fontSize: 16, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
};

export const IconButton: React.FC<{ icon: IconName; label: string; onPress: () => void; color?: string; filled?: boolean; size?: number }> = ({
  icon,
  label,
  onPress,
  color,
  filled,
  size = 22,
}) => {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={(state: PressState) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: state.pressed || state.hovered ? t.c.surfaceAlt : 'transparent',
        borderWidth: 2,
        borderColor: 'transparent',
      })}
    >
      <Icon name={icon} size={size} color={color ?? t.c.textMuted} filled={filled} />
    </Pressable>
  );
};

// --- Inputs -----------------------------------------------------------------

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; icon?: IconName }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: t.c.surfaceAlt, borderRadius: radius.control, padding: 3, gap: 3 }} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={(state: PressState) => ({
              flex: 1,
              minHeight: 40,
              paddingHorizontal: space(2),
              borderRadius: radius.control - 3,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space(1.5),
              backgroundColor: active ? t.c.surface : 'transparent',
              borderWidth: 2,
              borderColor: 'transparent',
            })}
          >
            {o.icon ? <Icon name={o.icon} size={16} color={active ? t.c.text : t.c.textMuted} /> : null}
            <Text style={{ fontSize: 14, fontWeight: active ? '700' : '500', color: active ? t.c.text : t.c.textMuted }} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Horizontally scrolling filter pills, for more options than a segmented control can hold. */
export function Pills<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const t = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space(2), paddingHorizontal: space(4) }} style={{ flexGrow: 0, marginHorizontal: -space(4) }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={(state: PressState) => ({
              minHeight: 38,
              paddingHorizontal: space(4),
              borderRadius: 19,
              justifyContent: 'center',
              backgroundColor: active ? t.c.text : t.c.surface,
              borderWidth: 1,
              borderColor: active ? t.c.text : t.c.border,
            })}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: active ? t.c.bg : t.c.textMuted }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export const SearchField: React.FC<{ value: string; onChangeText: (v: string) => void; placeholder: string }> = ({ value, onChangeText, placeholder }) => {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space(2),
        backgroundColor: t.c.surface,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: t.c.border,
        paddingHorizontal: space(3),
        minHeight: 44,
      }}
    >
      <Icon name="search" size={18} color={t.c.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.c.textMuted}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ flex: 1, color: t.c.text, fontSize: 15, paddingVertical: space(2) }}
      />
      {value ? <IconButton icon="close" label="Aramayı temizle" onPress={() => onChangeText('')} size={16} /> : null}
    </View>
  );
};

// --- Sheet ------------------------------------------------------------------

/** Bottom sheet on phones, centred dialog on wide screens. */
export const Sheet: React.FC<{ visible: boolean; onClose: () => void; children: React.ReactNode }> = ({ visible, onClose, children }) => {
  const t = useTheme();
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  return (
    <Modal visible transparent animationType={wide ? 'fade' : 'slide'} onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: wide ? 'center' : 'flex-end', alignItems: 'center' }}>
        <Pressable accessibilityLabel="Kapat" onPress={onClose} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.c.overlay }} />
        <View
          style={{
            width: '100%',
            maxWidth: wide ? 520 : CONTENT_MAX_WIDTH,
            maxHeight: '88%',
            backgroundColor: t.c.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            borderBottomLeftRadius: wide ? radius.sheet : 0,
            borderBottomRightRadius: wide ? radius.sheet : 0,
            padding: space(5),
            paddingBottom: space(5) + (wide ? 0 : insets.bottom),
          }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
};
