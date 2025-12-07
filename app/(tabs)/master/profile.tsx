import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { updateMasterProfile, toggleMasterAvailability } from '@/services/masterProfile';
import { Avatar, Card, Button, MultiSelect, Input, StarRating } from '@/components/ui';
import { SERVICE_CATEGORIES, DISTRICTS, MasterProfileForm } from '@/types';

export default function MasterProfileScreen() {
  const { user, masterProfile, signOut, setMasterProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState<MasterProfileForm>({
    services: [],
    districts: [],
    description: '',
    hourly_rate: undefined,
    experience_years: undefined,
  });

  useEffect(() => {
    if (masterProfile) {
      setForm({
        services: masterProfile.services || [],
        districts: masterProfile.districts || [],
        description: masterProfile.description || '',
        hourly_rate: masterProfile.hourly_rate,
        experience_years: masterProfile.experience_years,
      });
    }
  }, [masterProfile]);

  const handleToggleAvailability = async () => {
    if (!masterProfile) return;
    
    try {
      await toggleMasterAvailability(masterProfile.id, !masterProfile.is_available);
      setMasterProfile({
        ...masterProfile,
        is_available: !masterProfile.is_available,
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
      Alert.alert('Error', 'Failed to update availability');
    }
  };

  const handleSaveProfile = async () => {
    if (!masterProfile) return;
    
    if (form.services.length === 0) {
      Alert.alert('Required', 'Please select at least one service');
      return;
    }
    
    if (form.districts.length === 0) {
      Alert.alert('Required', 'Please select at least one district');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updateMasterProfile(masterProfile.id, form);
      setMasterProfile({ ...masterProfile, ...updated });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!user || !masterProfile) return null;

  const needsSetup = !masterProfile.services?.length || !masterProfile.districts?.length;

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-4 pb-2 flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-secondary-900">Profile</Text>
          {!needsSetup && (
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text className="text-primary-600 font-semibold">
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Setup Warning */}
        {needsSetup && !isEditing && (
          <View className="mx-4 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <View className="flex-row items-center">
              <Ionicons name="warning-outline" size={24} color="#d97706" />
              <Text className="text-amber-800 font-semibold ml-2">
                Complete Your Profile
              </Text>
            </View>
            <Text className="text-amber-700 mt-2">
              Please add your services and service areas to start receiving job offers.
            </Text>
            <TouchableOpacity
              className="bg-amber-600 rounded-lg py-2 mt-3"
              onPress={() => setIsEditing(true)}
            >
              <Text className="text-white font-semibold text-center">
                Complete Profile
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Profile Card */}
        <View className="px-4 mt-4">
          <Card variant="elevated" className="items-center py-6">
            <Avatar source={user.avatar_url} name={user.full_name} size="xl" />
            <Text className="text-xl font-bold text-secondary-900 mt-4">
              {user.full_name}
            </Text>
            <Text className="text-secondary-500 mt-1">{user.email}</Text>
            
            {/* Rating */}
            <View className="flex-row items-center mt-3">
              <StarRating rating={masterProfile.average_rating} size={18} showValue />
              <Text className="text-secondary-500 ml-2">
                ({masterProfile.total_reviews} reviews)
              </Text>
            </View>

            {/* Availability Toggle */}
            <View className="flex-row items-center mt-4 bg-secondary-50 rounded-xl px-4 py-3">
              <View className="flex-1">
                <Text className="text-secondary-800 font-medium">Available for Work</Text>
                <Text className="text-secondary-500 text-xs">
                  {masterProfile.is_available
                    ? 'Clients can see your profile'
                    : 'Hidden from job searches'}
                </Text>
              </View>
              <Switch
                value={masterProfile.is_available}
                onValueChange={handleToggleAvailability}
                trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
                thumbColor={masterProfile.is_available ? '#2563eb' : '#f1f5f9'}
              />
            </View>
          </Card>
        </View>

        {/* Profile Details / Edit Form */}
        <View className="px-4 mt-6">
          <Card variant="outlined">
            {isEditing ? (
              <View className="space-y-4">
                <MultiSelect
                  label="Services Offered"
                  placeholder="Select your services"
                  values={form.services}
                  options={SERVICE_CATEGORIES}
                  onChange={(values) => setForm({ ...form, services: values as any })}
                />

                <View className="mt-4">
                  <MultiSelect
                    label="Service Areas (Districts)"
                    placeholder="Select your service areas"
                    values={form.districts}
                    options={DISTRICTS.map((d) => ({ value: d, label: d }))}
                    onChange={(values) => setForm({ ...form, districts: values })}
                  />
                </View>

                <View className="mt-4">
                  <Input
                    label="About Me"
                    placeholder="Describe your experience and skills..."
                    value={form.description || ''}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View className="flex-row space-x-3 mt-4">
                  <View className="flex-1">
                    <Input
                      label="Hourly Rate (BGN)"
                      placeholder="e.g., 25"
                      value={form.hourly_rate?.toString() || ''}
                      onChangeText={(text) =>
                        setForm({ ...form, hourly_rate: text ? parseInt(text) : undefined })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                  <View className="w-3" />
                  <View className="flex-1">
                    <Input
                      label="Years Experience"
                      placeholder="e.g., 5"
                      value={form.experience_years?.toString() || ''}
                      onChangeText={(text) =>
                        setForm({ ...form, experience_years: text ? parseInt(text) : undefined })
                      }
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View className="mt-6">
                  <Button
                    title="Save Profile"
                    onPress={handleSaveProfile}
                    isLoading={isLoading}
                    fullWidth
                    size="lg"
                  />
                </View>
              </View>
            ) : (
              <View>
                <ProfileSection
                  icon="construct-outline"
                  title="Services"
                  content={
                    masterProfile.services?.length
                      ? masterProfile.services
                          .map((s) => SERVICE_CATEGORIES.find((c) => c.value === s)?.label || s)
                          .join(', ')
                      : 'Not set'
                  }
                />
                <ProfileSection
                  icon="location-outline"
                  title="Service Areas"
                  content={masterProfile.districts?.length ? masterProfile.districts.join(', ') : 'Not set'}
                />
                {masterProfile.description && (
                  <ProfileSection
                    icon="information-circle-outline"
                    title="About"
                    content={masterProfile.description}
                  />
                )}
                <View className="flex-row">
                  {masterProfile.hourly_rate && (
                    <View className="flex-1">
                      <ProfileSection
                        icon="cash-outline"
                        title="Hourly Rate"
                        content={`${masterProfile.hourly_rate} BGN`}
                      />
                    </View>
                  )}
                  {masterProfile.experience_years && (
                    <View className="flex-1">
                      <ProfileSection
                        icon="time-outline"
                        title="Experience"
                        content={`${masterProfile.experience_years} years`}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Sign Out Button */}
        <View className="px-4 mt-6">
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

interface ProfileSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  content: string;
}

function ProfileSection({ icon, title, content }: ProfileSectionProps) {
  return (
    <View className="py-3 border-b border-secondary-100 last:border-b-0">
      <View className="flex-row items-center mb-1">
        <Ionicons name={icon} size={16} color="#64748b" />
        <Text className="text-secondary-500 text-sm ml-1">{title}</Text>
      </View>
      <Text className="text-secondary-800 font-medium">{content}</Text>
    </View>
  );
}
