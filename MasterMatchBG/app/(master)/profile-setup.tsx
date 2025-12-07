import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Input } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { JOB_CATEGORIES, SOFIA_DISTRICTS } from '../../constants/categories';
import { JobCategory, SofiaDistrict } from '../../types';

export default function ProfileSetupScreen() {
  const { user } = useAuthStore();
  
  const [bio, setBio] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<JobCategory[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<SofiaDistrict[]>([]);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const toggleCategory = (category: JobCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleDistrict = (district: SofiaDistrict) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter((d) => d !== district));
    } else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const handleNext = () => {
    if (step === 1 && selectedCategories.length === 0) {
      Alert.alert('Select Services', 'Please select at least one service you provide');
      return;
    }
    if (step === 2 && selectedDistricts.length === 0) {
      Alert.alert('Select Areas', 'Please select at least one area you serve');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // TODO: Save master profile to API
      const profileData = {
        bio,
        categories: selectedCategories,
        districts: selectedDistricts,
        base_price_min: priceMin ? parseInt(priceMin) : null,
        base_price_max: priceMax ? parseInt(priceMax) : null,
        years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      };

      console.log('Saving master profile:', profileData);
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Alert.alert(
        'Profile Saved! 🎉',
        "You're all set! Start browsing available jobs in your area.",
        [
          {
            text: 'Browse Jobs',
            onPress: () => router.replace('/(master)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      {/* Progress Bar */}
      <View className="bg-white px-6 py-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-gray-500 text-sm">Step {step} of 3</Text>
          <Text className="text-primary-600 font-medium text-sm">
            {step === 1 ? 'Services' : step === 2 ? 'Areas' : 'Details'}
          </Text>
        </View>
        <View className="flex-row h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="bg-primary-600 rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Step 1: Select Services */}
        {step === 1 && (
          <View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              What services do you offer?
            </Text>
            <Text className="text-gray-500 mb-6">
              Select all the categories that match your skills
            </Text>

            <View className="flex-row flex-wrap">
              {JOB_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.value);
                return (
                  <TouchableOpacity
                    key={category.value}
                    onPress={() => toggleCategory(category.value)}
                    className={`w-[48%] mr-[2%] mb-3 p-4 rounded-xl border-2 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-3xl">{category.icon}</Text>
                      {isSelected && (
                        <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                          <Ionicons name="checkmark" size={16} color="#fff" />
                        </View>
                      )}
                    </View>
                    <Text
                      className={`mt-2 font-semibold ${
                        isSelected ? 'text-primary-700' : 'text-gray-800'
                      }`}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Step 2: Select Areas */}
        {step === 2 && (
          <View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Where do you work?
            </Text>
            <Text className="text-gray-500 mb-6">
              Select the districts in Sofia where you can provide services
            </Text>

            <View className="flex-row flex-wrap">
              {SOFIA_DISTRICTS.map((district) => {
                const isSelected = selectedDistricts.includes(district.value);
                return (
                  <TouchableOpacity
                    key={district.value}
                    onPress={() => toggleDistrict(district.value)}
                    className={`px-4 py-2 mr-2 mb-2 rounded-full border ${
                      isSelected
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        isSelected ? 'text-white' : 'text-gray-700'
                      }`}
                    >
                      {district.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={() => setSelectedDistricts(SOFIA_DISTRICTS.map((d) => d.value))}
              className="mt-4"
            >
              <Text className="text-primary-600 font-medium">Select All</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Profile Details */}
        {step === 3 && (
          <View>
            <Text className="text-2xl font-bold text-gray-800 mb-2">
              Tell us about yourself
            </Text>
            <Text className="text-gray-500 mb-6">
              Help clients get to know you better
            </Text>

            {/* Bio */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Bio</Text>
              <View className="bg-white border border-gray-300 rounded-xl p-3">
                <TextInput
                  multiline
                  numberOfLines={4}
                  className="text-gray-800 text-base min-h-[100px]"
                  placeholder="Describe your experience, skills, and what makes you a great choice..."
                  placeholderTextColor="#9ca3af"
                  value={bio}
                  onChangeText={setBio}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Experience */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">Years of Experience</Text>
              <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                <TextInput
                  className="flex-1 text-gray-800 text-base"
                  placeholder="e.g., 5"
                  placeholderTextColor="#9ca3af"
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  keyboardType="number-pad"
                />
                <Text className="text-gray-500">years</Text>
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-2">
                Base Price Range (BGN)
              </Text>
              <View className="flex-row">
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                    <Text className="text-gray-400 mr-2">From</Text>
                    <TextInput
                      className="flex-1 text-gray-800 text-base"
                      placeholder="50"
                      placeholderTextColor="#9ca3af"
                      value={priceMin}
                      onChangeText={setPriceMin}
                      keyboardType="number-pad"
                    />
                    <Text className="text-gray-400">лв</Text>
                  </View>
                </View>
                <View className="flex-1 ml-2">
                  <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                    <Text className="text-gray-400 mr-2">To</Text>
                    <TextInput
                      className="flex-1 text-gray-800 text-base"
                      placeholder="200"
                      placeholderTextColor="#9ca3af"
                      value={priceMax}
                      onChangeText={setPriceMax}
                      keyboardType="number-pad"
                    />
                    <Text className="text-gray-400">лв</Text>
                  </View>
                </View>
              </View>
              <Text className="text-gray-500 text-xs mt-1">
                This is just a guide for clients. You can quote specific prices for each job.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View className="bg-white border-t border-gray-100 px-6 py-4">
        <View className="flex-row">
          {step > 1 && (
            <Button
              title="Back"
              variant="outline"
              onPress={() => setStep(step - 1)}
              fullWidth={false}
              className="mr-3 flex-1"
            />
          )}
          <Button
            title={step === 3 ? 'Complete Setup' : 'Continue'}
            onPress={handleNext}
            isLoading={isLoading}
            fullWidth={step === 1}
            className={step > 1 ? 'flex-1' : ''}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
