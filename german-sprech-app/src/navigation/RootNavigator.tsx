import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer, Theme as NavTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainShell } from '../screens/MainShell';
import { BuilderScreen } from '../screens/BuilderScreen';
import { AddWordScreen } from '../screens/AddWordScreen';
import { useTheme } from '../context/SettingsContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const t = useTheme();
  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: NavTheme = {
    ...base,
    colors: { ...base.colors, background: t.c.bg, card: t.c.surface, text: t.c.text, primary: t.c.accent, border: t.c.border },
  };

  return (
    <NavigationContainer theme={navTheme} documentTitle={{ formatter: () => 'Deutsch Sprechen' }}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.c.bg } }}>
        <Stack.Screen name="Main" component={MainShell} />
        <Stack.Screen name="Builder" component={BuilderScreen} />
        <Stack.Screen name="AddWord" component={AddWordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
