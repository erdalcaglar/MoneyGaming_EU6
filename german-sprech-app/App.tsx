import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ProgressProvider } from './src/context/ProgressContext';
import { CustomVocabProvider } from './src/context/CustomVocabContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <CustomVocabProvider>
        <ProgressProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </ProgressProvider>
      </CustomVocabProvider>
    </SafeAreaProvider>
  );
}
