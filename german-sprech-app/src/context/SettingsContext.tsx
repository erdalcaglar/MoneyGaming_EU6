import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { palettes, Scheme, Theme } from '../theme';

export type ThemeMode = 'system' | 'light' | 'dark';

interface StoredSettings {
  themeMode: ThemeMode;
  showTranslations: boolean;
}

interface SettingsContextValue extends StoredSettings {
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  setShowTranslations: (value: boolean) => void;
}

const STORAGE_KEY = 'deutsch-sprechen:settings:v1';
const defaults: StoredSettings = { themeMode: 'system', showTranslations: true };

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [settings, setSettings] = useState<StoredSettings>(defaults);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings({ ...defaults, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [settings, loaded]);

  const scheme: Scheme = settings.themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.themeMode;
  const theme = useMemo<Theme>(() => ({ scheme, c: palettes[scheme] }), [scheme]);

  // On the web the page behind the app should follow the theme too.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    document.body.style.backgroundColor = theme.c.bg;
    document.documentElement.style.colorScheme = scheme;
  }, [theme, scheme]);

  const setThemeMode = useCallback((themeMode: ThemeMode) => setSettings((s) => ({ ...s, themeMode })), []);
  const setShowTranslations = useCallback((showTranslations: boolean) => setSettings((s) => ({ ...s, showTranslations })), []);

  const value = useMemo(() => ({ ...settings, theme, setThemeMode, setShowTranslations }), [settings, theme, setThemeMode, setShowTranslations]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function useTheme(): Theme {
  return useSettings().theme;
}

/** Theme-aware StyleSheet: `const s = useStyles(makeStyles)`. */
export function useStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => StyleSheet.create(factory(theme)), [factory, theme]);
}
