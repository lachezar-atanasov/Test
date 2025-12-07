import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';
import { Platform, Text, View } from 'react-native';

import { t } from '../../src/i18n';
import { colors } from '../../src/theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTitleStyle: {
          color: theme.colors.onSurface,
          fontWeight: '600',
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          paddingTop: 4,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.dashboard'),
          tabBarIcon: ({ color, focused }) => <TabIcon icon="📊" focused={focused} />,
          headerTitle: t('dashboard.title'),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          title: t('nav.bills'),
          tabBarIcon: ({ color, focused }) => <TabIcon icon="🧾" focused={focused} />,
          headerTitle: t('bills.title'),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('nav.calendar'),
          tabBarIcon: ({ color, focused }) => <TabIcon icon="📅" focused={focused} />,
          headerTitle: t('calendar.title'),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: t('nav.reports'),
          tabBarIcon: ({ color, focused }) => <TabIcon icon="📈" focused={focused} />,
          headerTitle: t('reports.title'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ color, focused }) => <TabIcon icon="⚙️" focused={focused} />,
          headerTitle: t('settings.title'),
        }}
      />
    </Tabs>
  );
}

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.6 }}>{icon}</Text>
    </View>
  );
}
