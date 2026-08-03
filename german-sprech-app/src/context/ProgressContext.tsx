import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProgressState {
  favorites: Record<string, boolean>;
  correctCount: number;
  wrongCount: number;
  streak: number;
  lastPracticeDay: string | null;
}

interface ProgressContextValue extends ProgressState {
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  recordResult: (correct: boolean) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'deutsch-sprechen:progress:v1';

const defaultState: ProgressState = {
  favorites: {},
  correctCount: 0,
  wrongCount: 0,
  streak: 0,
  lastPracticeDay: null,
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgressState>(defaultState);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...defaultState, ...JSON.parse(raw) });
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, loaded]);

  const toggleFavorite = useCallback((id: string) => {
    setState((s) => ({ ...s, favorites: { ...s.favorites, [id]: !s.favorites[id] } }));
  }, []);

  const isFavorite = useCallback((id: string) => !!state.favorites[id], [state.favorites]);

  const recordResult = useCallback((correct: boolean) => {
    setState((s) => {
      const today = todayKey();
      const wasAlreadyToday = s.lastPracticeDay === today;
      const streak = wasAlreadyToday ? s.streak : s.streak + 1;
      return {
        ...s,
        correctCount: s.correctCount + (correct ? 1 : 0),
        wrongCount: s.wrongCount + (correct ? 0 : 1),
        streak,
        lastPracticeDay: today,
      };
    });
  }, []);

  const resetProgress = useCallback(() => setState(defaultState), []);

  const value = useMemo(
    () => ({ ...state, toggleFavorite, isFavorite, recordResult, resetProgress }),
    [state, toggleFavorite, isFavorite, recordResult, resetProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
