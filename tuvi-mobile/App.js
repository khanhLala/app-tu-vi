import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </CartProvider>
    </SafeAreaProvider>
  );
}
