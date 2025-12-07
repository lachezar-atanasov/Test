import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Card, Button } from '@/components/ui';

export default function ClientProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!user) return null;

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1">
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-secondary-900">Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="px-4 mt-4">
          <Card variant="elevated" className="items-center py-6">
            <Avatar
              source={user.avatar_url}
              name={user.full_name}
              size="xl"
            />
            <Text className="text-xl font-bold text-secondary-900 mt-4">
              {user.full_name}
            </Text>
            <Text className="text-secondary-500 mt-1">{user.email}</Text>
            {user.phone && (
              <Text className="text-secondary-500 mt-1">{user.phone}</Text>
            )}
            <View className="flex-row items-center mt-2 bg-primary-100 px-3 py-1 rounded-full">
              <Ionicons name="briefcase" size={14} color="#2563eb" />
              <Text className="text-primary-700 font-medium ml-1 capitalize">
                {user.role}
              </Text>
            </View>
          </Card>
        </View>

        {/* Menu Items */}
        <View className="px-4 mt-6">
          <Card variant="outlined">
            <MenuItem
              icon="person-outline"
              label="Edit Profile"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
            />
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
            />
            <MenuItem
              icon="help-circle-outline"
              label="Help & Support"
              onPress={() => Alert.alert('Help', 'For support, please contact support@mastermatch.bg')}
            />
            <MenuItem
              icon="information-circle-outline"
              label="About"
              onPress={() => Alert.alert('About', 'MasterMatch BG v1.0.0\nConnect with skilled professionals.')}
              isLast
            />
          </Card>
        </View>

        {/* Sign Out Button */}
        <View className="px-4 mt-6 mb-8">
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            fullWidth
            leftIcon={<Ionicons name="log-out-outline" size={20} color="#2563eb" />}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

function MenuItem({ icon, label, onPress, isLast }: MenuItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row items-center py-4 ${!isLast ? 'border-b border-secondary-100' : ''}`}
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-secondary-100 items-center justify-center">
        <Ionicons name={icon} size={20} color="#64748b" />
      </View>
      <Text className="flex-1 text-secondary-800 font-medium ml-3">{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );
}
