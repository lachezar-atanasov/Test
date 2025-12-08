import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';

// Screens (will be created)
import { HomeScreen } from '../screens/HomeScreen';
import { EmotionalLogScreen } from '../screens/EmotionalLogScreen';
import { CravingDetailScreen } from '../screens/CravingDetailScreen';
import { InteractionLogScreen } from '../screens/InteractionLogScreen';
import { InteractionDetailScreen } from '../screens/InteractionDetailScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { ArticleDetailScreen } from '../screens/ArticleDetailScreen';
import { PlanScreen } from '../screens/PlanScreen';
import { SosScreen } from '../screens/SosScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const LogStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="EmotionalLog"
      component={EmotionalLogScreen}
      options={{ title: 'Emotional Log' }}
    />
    <Stack.Screen
      name="CravingDetail"
      component={CravingDetailScreen}
      options={{ title: 'Log Entry' }}
    />
    <Stack.Screen
      name="InteractionLog"
      component={InteractionLogScreen}
      options={{ title: 'Interaction Log' }}
    />
    <Stack.Screen
      name="InteractionDetail"
      component={InteractionDetailScreen}
      options={{ title: 'Interaction Details' }}
    />
  </Stack.Navigator>
);

const LibraryStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Library" component={LibraryScreen} options={{ title: 'Library' }} />
    <Stack.Screen
      name="ArticleDetail"
      component={ArticleDetailScreen}
      options={{ title: 'Article' }}
    />
  </Stack.Navigator>
);

const PlanStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Plan" component={PlanScreen} options={{ title: 'Escape Plan' }} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      headerStyle: {
        backgroundColor: theme.colors.surface,
      },
      headerTintColor: theme.colors.text,
      headerTitleStyle: {
        fontWeight: '600',
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: 'Home',
        headerTitle: 'Unbond',
      }}
    />
    <Tab.Screen
      name="LogStack"
      component={LogStack}
      options={{
        tabBarLabel: 'Log',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="LibraryStack"
      component={LibraryStack}
      options={{
        tabBarLabel: 'Library',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="PlanStack"
      component={PlanStack}
      options={{
        tabBarLabel: 'Plan',
        headerShown: false,
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: 'Settings',
        headerTitle: 'Settings',
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator: React.FC = () => {
  const { settings, loadData, updateSettings } = useAppStore();

  useEffect(() => {
    loadData();
  }, []);

  // Initialize default plan if needed
  useEffect(() => {
    const initializePlan = async () => {
      const { planSteps } = useAppStore.getState();
      if (planSteps.length === 0) {
        const { defaultPlanSteps, defaultPlanTasks } = await import('../data/defaultPlan');
        const { storageService } = await import('../services/storage');
        await storageService.savePlanSteps(defaultPlanSteps);
        await storageService.savePlanTasks(defaultPlanTasks);
        useAppStore.setState({ planSteps: defaultPlanSteps, planTasks: defaultPlanTasks });
      }
    };
    initializePlan();
  }, []);

  // Initialize default settings if needed
  useEffect(() => {
    if (!settings) {
      updateSettings({
        contactMode: 'no-contact',
        hasCompletedOnboarding: false,
        notificationsEnabled: false,
      });
    }
  }, [settings, updateSettings]);

  if (!settings || !settings.hasCompletedOnboarding) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Sos"
          component={SosScreen}
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'SOS Tools',
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
