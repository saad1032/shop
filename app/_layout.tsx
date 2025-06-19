import { Stack } from 'expo-router';
import React from 'react';
import LoadingScreen from '../components/LoadingScreen';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import LoginScreen from './login';

function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();

  console.log('=== ROOT LAYOUT NAV ===');
  console.log('isAuthenticated:', isAuthenticated);
  console.log('loading:', loading);

  if (loading) {
    console.log('Showing loading screen...');
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    console.log('User not authenticated, showing login screen...');
    return <LoginScreen />;
  }

  console.log('User authenticated, showing main app...');
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="category" options={{ headerShown: false }} />
      <Stack.Screen name="product-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}



