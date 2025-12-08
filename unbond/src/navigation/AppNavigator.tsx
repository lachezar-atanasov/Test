// ===================================
// Unbond - App Navigator
// ===================================

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { colors, typography } from '../utils/theme';
import { useSettingsStore } from '../store';
import type { RootStackParamList, MainTabParamList } from '../types';

// Screens
import { OnboardingScreen } from '../screens/Onboarding/OnboardingScreen';
import { HomeScreen } from '../screens/Home/HomeScreen';
import { EmotionalLogScreen } from '../screens/EmotionalLog/EmotionalLogScreen';
import { EmotionalLogDetailScreen } from '../screens/EmotionalLog/EmotionalLogDetailScreen';
import { InteractionLogScreen } from '../screens/InteractionLog/InteractionLogScreen';
import { InteractionDetailScreen } from '../screens/InteractionLog/InteractionDetailScreen';
import { LibraryScreen } from '../screens/Library/LibraryScreen';
import { ArticleDetailScreen } from '../screens/Library/ArticleDetailScreen';
import { PlanScreen } from '../screens/Plan/PlanScreen';
import { SOSScreen } from '../screens/Sos/SOSScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { StatsScreen } from '../screens/Stats/StatsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Journal: '💭',
    Log: '📝',
    Learn: '📚',
    Plan: '🎯',
  };

  return (
    <Text style={{ fontSize: focused ? 24 : 22 }}>
      {icons[name] || '•'}
    </Text>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          ...typography.small,
          marginTop: -4,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: {
          ...typography.heading3,
        },
        headerShadowVisible: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'Unbond',
        }}
      />
      <Tab.Screen
        name="Journal"
        component={EmotionalLogScreen}
        options={{
          title: 'Journal',
          headerTitle: 'Emotional Journal',
        }}
      />
      <Tab.Screen
        name="Log"
        component={InteractionLogScreen}
        options={{
          title: 'Log',
          headerTitle: 'Interaction Log',
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LibraryScreen}
        options={{
          title: 'Learn',
          headerTitle: 'Library',
        }}
      />
      <Tab.Screen
        name="Plan"
        component={PlanScreen}
        options={{
          title: 'Plan',
          headerTitle: 'My Plan',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export function AppNavigator() {
  const { settings, isLoading, loadSettings } = useSettingsStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadSettings();
      setIsReady(true);
    };
    init();
  }, [loadSettings]);

  if (!isReady || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            ...typography.heading3,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {!settings.hasCompletedOnboarding ? (
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SOS"
              component={SOSScreen}
              options={{
                title: 'Grounding Tools',
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: 'Settings' }}
            />
            <Stack.Screen
              name="ArticleDetail"
              component={ArticleDetailScreen}
              options={{ title: 'Article' }}
            />
            <Stack.Screen
              name="EmotionalLogDetail"
              component={EmotionalLogDetailScreen}
              options={{ title: 'Log Entry' }}
            />
            <Stack.Screen
              name="InteractionDetail"
              component={InteractionDetailScreen}
              options={{ title: 'Interaction' }}
            />
            <Stack.Screen
              name="Stats"
              component={StatsScreen}
              options={{ title: 'Statistics' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
