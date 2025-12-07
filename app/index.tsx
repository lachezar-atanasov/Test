import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui';

export default function Index() {
  const { user, isLoading, isInitialized } = useAuth();

  if (!isInitialized || isLoading) {
    return <LoadingSpinner fullScreen text="Loading..." />;
  }

  // If user is logged in, redirect to appropriate tabs
  if (user) {
    if (user.role === 'client') {
      return <Redirect href="/(tabs)/client" />;
    } else {
      return <Redirect href="/(tabs)/master" />;
    }
  }

  // Not logged in, redirect to auth
  return <Redirect href="/(auth)/login" />;
}
