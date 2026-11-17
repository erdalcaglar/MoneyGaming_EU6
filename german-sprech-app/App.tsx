import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold } from '@expo-google-fonts/atkinson-hyperlegible';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProgressProvider } from './src/context/ProgressContext';
import { CustomVocabProvider } from './src/context/CustomVocabContext';
import { SettingsProvider, useTheme } from './src/context/SettingsContext';

const ThemedApp: React.FC = () => {
  const theme = useTheme();
  return (
    <>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  // Render as soon as the fonts load OR fail: a missing font must never block the app.
  const [fontsLoaded, fontError] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CustomVocabProvider>
          <ProgressProvider>
            <ThemedApp />
          </ProgressProvider>
        </CustomVocabProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
