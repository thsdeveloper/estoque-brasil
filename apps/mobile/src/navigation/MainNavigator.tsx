import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors, fontSize } from '@/config/theme';
import type { MainStackParamList } from '@/types/navigation';
import { HomeScreen } from '@/screens/HomeScreen';
import { CountingScreen } from '@/screens/CountingScreen';
import { DivergenceScreen } from '@/screens/DivergenceScreen';
import { CalculatorScreen } from '@/screens/CalculatorScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontSize: fontSize.lg, fontWeight: 'bold' },
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Estoque Brasil', headerShown: false }}
      />
      <Stack.Screen
        name="Counting"
        component={CountingScreen}
        options={{ title: 'Contagem' }}
      />
      <Stack.Screen
        name="Divergence"
        component={DivergenceScreen}
        options={{ title: 'Divergencias' }}
      />
      <Stack.Screen
        name="Calculator"
        component={CalculatorScreen}
        options={{ title: 'Calculadora' }}
      />
    </Stack.Navigator>
  );
}
