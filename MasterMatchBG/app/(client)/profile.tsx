import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  danger = false,
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-row items-center py-4 border-b border-gray-100"
    activeOpacity={0.7}
  >
    <View
      className={`w-10 h-10 rounded-full items-center justify-center ${
        danger ? 'bg-red-100' : 'bg-gray-100'
      }`}
    >
      <Ionicons
        name={icon}
        size={20}
        color={danger ? '#ef4444' : '#6b7280'}
      />
    </View>
    <View className="flex-1 ml-3">
      <Text className={`font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>
        {title}
      </Text>
      {subtitle && <Text className="text-gray-500 text-sm">{subtitle}</Text>}
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    )}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Profile Header */}
        <View className="bg-white px-6 py-6 border-b border-gray-100">
          <View className="flex-row items-center">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center">
              <Text className="text-primary-600 font-bold text-3xl">
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-gray-800 font-bold text-xl">
                {user?.name || 'User'}
              </Text>
              <Text className="text-gray-500">{user?.email}</Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-green-100 px-2 py-1 rounded-full">
                  <Text className="text-green-700 text-xs font-medium">Client</Text>
                </View>
                <Text className="text-gray-400 text-sm ml-2">Sofia</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View className="px-6 mt-6">
          <Text className="text-gray-500 font-medium text-sm mb-2 uppercase">
            Account
          </Text>
          <Card>
            <MenuItem
              icon="person-outline"
              title="Edit Profile"
              subtitle="Update your name, phone, district"
              onPress={() => console.log('Edit profile')}
            />
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage push notifications"
              onPress={() => console.log('Notifications')}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() => console.log('Privacy')}
            />
          </Card>
        </View>

        {/* Preferences */}
        <View className="px-6 mt-6">
          <Text className="text-gray-500 font-medium text-sm mb-2 uppercase">
            Preferences
          </Text>
          <Card>
            <MenuItem
              icon="language-outline"
              title="Language"
              subtitle="English"
              onPress={() => console.log('Language')}
            />
            <MenuItem
              icon="location-outline"
              title="Default District"
              subtitle={user?.district || 'Not set'}
              onPress={() => console.log('District')}
            />
          </Card>
        </View>

        {/* Support */}
        <View className="px-6 mt-6">
          <Text className="text-gray-500 font-medium text-sm mb-2 uppercase">
            Support
          </Text>
          <Card>
            <MenuItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => console.log('Help')}
            />
            <MenuItem
              icon="chatbox-outline"
              title="Contact Support"
              onPress={() => console.log('Support')}
            />
            <MenuItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => console.log('Terms')}
            />
            <MenuItem
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() => console.log('Privacy')}
            />
          </Card>
        </View>

        {/* Sign Out */}
        <View className="px-6 mt-6">
          <Card>
            <MenuItem
              icon="log-out-outline"
              title="Sign Out"
              onPress={handleSignOut}
              showChevron={false}
              danger
            />
          </Card>
        </View>

        {/* App Version */}
        <Text className="text-center text-gray-400 text-sm mt-6">
          MasterMatch BG v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
