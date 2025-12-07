import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Card } from '../../components/ui';
import { useAuthStore } from '../../stores/authStore';
import { JOB_CATEGORIES, SOFIA_DISTRICTS } from '../../constants/categories';
import { JobCategory, SofiaDistrict, CreateJobInput } from '../../types';

export default function CreateJobScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<JobCategory | null>(
    (params.category as JobCategory) || null
  );
  const [district, setDistrict] = useState<SofiaDistrict | null>(
    user?.district || null
  );
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Please provide more details (at least 20 characters)';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    if (!district) {
      newErrors.district = 'Please select a district';
    }

    if (budgetMin && budgetMax) {
      if (parseInt(budgetMin) > parseInt(budgetMax)) {
        newErrors.budget = 'Min budget cannot be greater than max';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      const jobData: CreateJobInput = {
        title: title.trim(),
        description: description.trim(),
        category: category!,
        district: district!,
        budget_min: budgetMin ? parseInt(budgetMin) : undefined,
        budget_max: budgetMax ? parseInt(budgetMax) : undefined,
      };

      // TODO: Implement actual API call
      console.log('Creating job:', jobData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert(
        'Job Posted! 🎉',
        'Your job has been posted successfully. Masters in your area will start sending offers.',
        [
          {
            text: 'View My Jobs',
            onPress: () => router.replace('/(client)/my-jobs'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCategory = JOB_CATEGORIES.find(c => c.value === category);
  const selectedDistrict = SOFIA_DISTRICTS.find(d => d.value === district);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Input
            label="Job Title"
            placeholder="e.g., Leak under the sink needs fixing"
            value={title}
            onChangeText={setTitle}
            leftIcon="create-outline"
            error={errors.title}
          />

          {/* Category Picker */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2 text-sm">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
              className={`flex-row items-center bg-white border ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              } rounded-xl px-4 py-3`}
            >
              {selectedCategory ? (
                <>
                  <Text className="text-xl mr-3">{selectedCategory.icon}</Text>
                  <Text className="flex-1 text-gray-800">{selectedCategory.label}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="grid-outline" size={20} color="#9ca3af" style={{ marginRight: 10 }} />
                  <Text className="flex-1 text-gray-400">Select a category</Text>
                </>
              )}
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
            {errors.category && (
              <Text className="text-red-500 text-xs mt-1">{errors.category}</Text>
            )}
          </View>

          {/* Category Options */}
          {showCategoryPicker && (
            <Card className="mb-4">
              <View className="flex-row flex-wrap">
                {JOB_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => {
                      setCategory(cat.value);
                      setShowCategoryPicker(false);
                    }}
                    className={`w-1/2 p-3 ${
                      category === cat.value ? 'bg-primary-50' : ''
                    }`}
                  >
                    <View className="flex-row items-center">
                      <Text className="text-xl mr-2">{cat.icon}</Text>
                      <Text
                        className={`${
                          category === cat.value
                            ? 'text-primary-600 font-semibold'
                            : 'text-gray-700'
                        }`}
                      >
                        {cat.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          )}

          {/* District Picker */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2 text-sm">District</Text>
            <TouchableOpacity
              onPress={() => setShowDistrictPicker(!showDistrictPicker)}
              className={`flex-row items-center bg-white border ${
                errors.district ? 'border-red-500' : 'border-gray-300'
              } rounded-xl px-4 py-3`}
            >
              <Ionicons name="location-outline" size={20} color="#9ca3af" style={{ marginRight: 10 }} />
              <Text className={`flex-1 ${selectedDistrict ? 'text-gray-800' : 'text-gray-400'}`}>
                {selectedDistrict?.label || 'Select your district in Sofia'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#9ca3af" />
            </TouchableOpacity>
            {errors.district && (
              <Text className="text-red-500 text-xs mt-1">{errors.district}</Text>
            )}
          </View>

          {/* District Options */}
          {showDistrictPicker && (
            <Card className="mb-4 max-h-64">
              <ScrollView nestedScrollEnabled>
                {SOFIA_DISTRICTS.map((dist) => (
                  <TouchableOpacity
                    key={dist.value}
                    onPress={() => {
                      setDistrict(dist.value);
                      setShowDistrictPicker(false);
                    }}
                    className={`p-3 border-b border-gray-100 ${
                      district === dist.value ? 'bg-primary-50' : ''
                    }`}
                  >
                    <Text
                      className={`${
                        district === dist.value
                          ? 'text-primary-600 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      {dist.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Card>
          )}

          {/* Description */}
          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-2 text-sm">Description</Text>
            <View
              className={`bg-white border ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              } rounded-xl px-4 py-3`}
            >
              <TextInput
                multiline
                numberOfLines={4}
                className="text-gray-800 text-base min-h-[100px]"
                placeholder="Describe the issue in detail. What needs to be fixed? Any specific requirements?"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>
            {errors.description && (
              <Text className="text-red-500 text-xs mt-1">{errors.description}</Text>
            )}
          </View>

          {/* Budget Range */}
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2 text-sm">
              Budget Range (BGN) - Optional
            </Text>
            <View className="flex-row">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                  <Text className="text-gray-400 mr-2">Min</Text>
                  <TextInput
                    className="flex-1 text-gray-800 text-base"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    value={budgetMin}
                    onChangeText={setBudgetMin}
                    keyboardType="number-pad"
                  />
                  <Text className="text-gray-400">лв</Text>
                </View>
              </View>
              <View className="flex-1 ml-2">
                <View className="flex-row items-center bg-white border border-gray-300 rounded-xl px-4 py-3">
                  <Text className="text-gray-400 mr-2">Max</Text>
                  <TextInput
                    className="flex-1 text-gray-800 text-base"
                    placeholder="0"
                    placeholderTextColor="#9ca3af"
                    value={budgetMax}
                    onChangeText={setBudgetMax}
                    keyboardType="number-pad"
                  />
                  <Text className="text-gray-400">лв</Text>
                </View>
              </View>
            </View>
            {errors.budget && (
              <Text className="text-red-500 text-xs mt-1">{errors.budget}</Text>
            )}
          </View>

          {/* Submit Button */}
          <Button
            title="Post Job"
            onPress={handleSubmit}
            isLoading={isLoading}
            size="lg"
          />

          <Text className="text-center text-gray-500 text-sm mt-4">
            Your job will be visible to masters in {selectedDistrict?.label || 'your area'}
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
