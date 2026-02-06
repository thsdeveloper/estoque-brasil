import React from 'react';
import { StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/contexts/AuthContext';
import { InventarioProvider } from '@/contexts/InventarioContext';
import { AppNavigator } from '@/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <InventarioProvider>
        <StatusBar style="light" />
        <RNStatusBar translucent={false} backgroundColor="#121212" />
        <AppNavigator />
      </InventarioProvider>
    </AuthProvider>
  );
}
