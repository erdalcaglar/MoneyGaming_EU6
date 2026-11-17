import React, { useState } from 'react';
import { Pressable, PressableStateCallbackType, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { useIsWide } from '../components/ui';
import { useTheme } from '../context/SettingsContext';
import { CONTENT_MAX_WIDTH, fonts, radius, space } from '../theme';
import { PracticeTab } from './PracticeTab';
import { WordsTab } from './WordsTab';
import { ExpressionsTab } from './ExpressionsTab';
import { SettingsTab } from './SettingsTab';

type PressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };
type TabKey = 'practice' | 'words' | 'expressions' | 'settings';

const TABS: { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'practice', label: 'Pratik', icon: 'practice' },
  { key: 'words', label: 'Kelimeler', icon: 'book' },
  { key: 'expressions', label: 'İfadeler', icon: 'chat' },
  { key: 'settings', label: 'Ayarlar', icon: 'settings' },
];

/**
 * Home of the app: four destinations. On phones they sit in a bottom tab
 * bar; on wide screens (desktop browsers, tablets in landscape) the same
 * destinations move to a side rail and the content stays a readable column.
 */
export const MainShell: React.FC = () => {
  const t = useTheme();
  const wide = useIsWide();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('practice');

  const content = (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: CONTENT_MAX_WIDTH }}>
        {tab === 'practice' ? <PracticeTab /> : null}
        {tab === 'words' ? <WordsTab /> : null}
        {tab === 'expressions' ? <ExpressionsTab /> : null}
        {tab === 'settings' ? <SettingsTab /> : null}
      </View>
    </View>
  );

  if (wide) {
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: t.c.bg }}>
        <View style={{ width: 256, backgroundColor: t.c.surface, borderRightWidth: 1, borderRightColor: t.c.border, padding: space(4), paddingTop: space(6) + insets.top, gap: space(1) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space(3), paddingHorizontal: space(2), marginBottom: space(6) }}>
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.c.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.deBold, fontSize: 22, lineHeight: 26, color: t.c.onPrimary }}>ß</Text>
            </View>
            <Text style={{ fontFamily: fonts.deBold, fontSize: 17, color: t.c.text }}>Deutsch Sprechen</Text>
          </View>
          {TABS.map((item) => {
            const active = item.key === tab;
            return (
              <Pressable
                key={item.key}
                onPress={() => setTab(item.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={(state: PressState) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space(3),
                  minHeight: 44,
                  paddingHorizontal: space(3),
                  borderRadius: radius.control,
                  backgroundColor: active ? t.c.surfaceAlt : state.hovered ? t.c.bg : 'transparent',
                  borderWidth: 2,
                  borderColor: 'transparent',
                })}
              >
                <Icon name={item.icon} size={20} color={active ? t.c.text : t.c.textMuted} />
                <Text style={{ fontSize: 15, fontWeight: active ? '700' : '500', color: active ? t.c.text : t.c.textMuted }}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1, paddingTop: insets.top }}>{content}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.c.bg, paddingTop: insets.top }}>
      {content}
      <View style={{ flexDirection: 'row', backgroundColor: t.c.surface, borderTopWidth: 1, borderTopColor: t.c.border, paddingBottom: insets.bottom, paddingHorizontal: space(2) }} accessibilityRole="tablist">
        {TABS.map((item) => {
          const active = item.key === tab;
          return (
            <Pressable
              key={item.key}
              onPress={() => setTab(item.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={(state: PressState) => ({
                flex: 1,
                minHeight: 58,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                borderRadius: radius.control,
                borderWidth: 2,
                borderColor: 'transparent',
              })}
            >
              <Icon name={item.icon} size={22} color={active ? t.c.text : t.c.textMuted} strokeWidth={active ? 2.4 : 2} />
              <Text style={{ fontSize: 11, fontWeight: active ? '700' : '500', color: active ? t.c.text : t.c.textMuted }}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
