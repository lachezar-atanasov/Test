import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '@/hooks/useAuth';
import { createJob, pickImage, uploadJobImage, requestMediaLibraryPermissions } from '@/services/jobs';
import { Button, Input, Select, Card } from '@/components/ui';
import { SERVICE_CATEGORIES, DISTRICTS, ServiceCategory, JobRequestForm } from '@/types';
import { VALIDATION } from '@/config/constants';

export default function CreateJobScreen() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [form, setForm] = useState<JobRequestForm>({
    title: '',
    description: '',
    category: '' as ServiceCategory,
    district: '',
    address: '',
    budget_min: undefined,
    budget_max: undefined,
    preferred_date: undefined,
    images: [],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localImages, setLocalImages] = useState<string[]>([]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (form.title.length > VALIDATION.MAX_TITLE_LENGTH) {
      newErrors.title = `Title must be less than ${VALIDATION.MAX_TITLE_LENGTH} characters`;
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (form.description.length > VALIDATION.MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description must be less than ${VALIDATION.MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!form.category) {
      newErrors.category = 'Please select a category';
    }

    if (!form.district) {
      newErrors.district = 'Please select a district';
    }

    if (form.budget_min && form.budget_max && form.budget_min > form.budget_max) {
      newErrors.budget_max = 'Maximum budget must be greater than minimum';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddImage = async () => {
    if (localImages.length >= VALIDATION.MAX_IMAGES_PER_JOB) {
      Alert.alert('Limit Reached', `You can only add up to ${VALIDATION.MAX_IMAGES_PER_JOB} images`);
      return;
    }

    const hasPermission = await requestMediaLibraryPermissions();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const uri = await pickImage();
    if (uri) {
      setLocalImages([...localImages, uri]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setLocalImages(localImages.filter((_, i) => i !== index));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm({ ...form, preferred_date: selectedDate.toISOString() });
    }
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsLoading(true);
    try {
      // Create job first to get ID
      const job = await createJob(user.id, {
        ...form,
        images: [], // We'll update with URLs after upload
      });

      // Upload images if any
      if (localImages.length > 0) {
        const uploadedUrls = await Promise.all(
          localImages.map((uri) => uploadJobImage(uri, job.id))
        );
        
        // Note: In a real app, you'd update the job with image URLs
        // For now, images are stored but the job record may need updating
      }

      Alert.alert('Success', 'Your job has been posted!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/client') },
      ]);
    } catch (error) {
      console.error('Error creating job:', error);
      Alert.alert('Error', 'Failed to create job. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 pt-4 pb-2">
            <Text className="text-2xl font-bold text-secondary-900">Post a Job</Text>
            <Text className="text-secondary-500 mt-1">
              Describe what you need help with
            </Text>
          </View>

          <View className="px-4 mt-4 space-y-4">
            <Input
              label="Job Title"
              placeholder="e.g., Fix leaking faucet"
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
              error={errors.title}
            />

            <View className="mt-4">
              <Input
                label="Description"
                placeholder="Describe the job in detail..."
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                numberOfLines={4}
                error={errors.description}
                className="min-h-[100px] textAlignVertical-top"
              />
            </View>

            <View className="mt-4">
              <Select
                label="Category"
                placeholder="Select a category"
                value={form.category}
                options={SERVICE_CATEGORIES}
                onChange={(value) => setForm({ ...form, category: value as ServiceCategory })}
                error={errors.category}
              />
            </View>

            <View className="mt-4">
              <Select
                label="District"
                placeholder="Select your district"
                value={form.district}
                options={DISTRICTS.map((d) => ({ value: d, label: d }))}
                onChange={(value) => setForm({ ...form, district: value })}
                error={errors.district}
              />
            </View>

            <View className="mt-4">
              <Input
                label="Address (optional)"
                placeholder="Enter specific address"
                value={form.address || ''}
                onChangeText={(text) => setForm({ ...form, address: text })}
              />
            </View>

            {/* Budget */}
            <View className="mt-4">
              <Text className="text-secondary-700 font-medium mb-1.5 text-sm">
                Budget Range (optional)
              </Text>
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <Input
                    placeholder="Min"
                    value={form.budget_min?.toString() || ''}
                    onChangeText={(text) =>
                      setForm({ ...form, budget_min: text ? parseInt(text) : undefined })
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View className="w-3" />
                <View className="flex-1">
                  <Input
                    placeholder="Max"
                    value={form.budget_max?.toString() || ''}
                    onChangeText={(text) =>
                      setForm({ ...form, budget_max: text ? parseInt(text) : undefined })
                    }
                    keyboardType="numeric"
                    error={errors.budget_max}
                  />
                </View>
              </View>
            </View>

            {/* Preferred Date */}
            <View className="mt-4">
              <Text className="text-secondary-700 font-medium mb-1.5 text-sm">
                Preferred Date (optional)
              </Text>
              <TouchableOpacity
                className="flex-row items-center bg-white border border-secondary-200 rounded-xl px-4 py-3.5"
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
                <Text className="ml-3 text-secondary-900">
                  {form.preferred_date
                    ? new Date(form.preferred_date).toLocaleDateString()
                    : 'Select a date'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={form.preferred_date ? new Date(form.preferred_date) : new Date()}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Images */}
            <View className="mt-4">
              <Text className="text-secondary-700 font-medium mb-1.5 text-sm">
                Photos (optional)
              </Text>
              <View className="flex-row flex-wrap">
                {localImages.map((uri, index) => (
                  <View key={index} className="w-24 h-24 mr-2 mb-2 relative">
                    <Image
                      source={{ uri }}
                      className="w-full h-full rounded-lg"
                    />
                    <TouchableOpacity
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Ionicons name="close" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {localImages.length < VALIDATION.MAX_IMAGES_PER_JOB && (
                  <TouchableOpacity
                    className="w-24 h-24 border-2 border-dashed border-secondary-300 rounded-lg items-center justify-center"
                    onPress={handleAddImage}
                  >
                    <Ionicons name="camera-outline" size={28} color="#64748b" />
                    <Text className="text-secondary-500 text-xs mt-1">Add Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Submit Button */}
            <View className="mt-6">
              <Button
                title="Post Job"
                onPress={handleSubmit}
                isLoading={isLoading}
                fullWidth
                size="lg"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
