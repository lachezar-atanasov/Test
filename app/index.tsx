import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { useAuthStore } from '../src/store';

export default function Index() {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  const isInitialized = useAuthStore(state => state.isInitialized);
  const isLoading = useAuthStore(state => state.isLoading);
  const hasCompletedOnboarding = useAuthStore(state => state.hasCompletedOnboarding);

  // Show loading while initializing
  if (!isInitialized || isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Route based on auth state
  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
