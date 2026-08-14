import React from 'react';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { BuilderScreen } from '../screens/BuilderScreen';
import { WordListScreen } from '../screens/WordListScreen';
import { ExpressionsScreen } from '../screens/ExpressionsScreen';
import { AddWordScreen } from '../screens/AddWordScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    primary: colors.accent,
    border: colors.border,
  },
};

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.card }, headerTintColor: colors.text }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Deutsch Sprechen' }} />
        <Stack.Screen name="Builder" component={BuilderScreen} options={{ title: 'Cümle Kur' }} />
        <Stack.Screen name="WordList" component={WordListScreen} options={{ title: 'Kelime Bankası' }} />
        <Stack.Screen name="Expressions" component={ExpressionsScreen} options={{ title: 'Günlük İfadeler' }} />
        <Stack.Screen name="AddWord" component={AddWordScreen} options={{ title: 'Kelime Ekle', presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
