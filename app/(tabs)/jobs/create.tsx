import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../hooks/useAuth';
import { jobRequestService } from '../../../services/jobRequests';
import { storageService } from '../../../services/storage';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import { DISTRICTS } from '../../../config/districts';

export default function CreateJobScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    district?: string;
    budget?: string;
  }>({});

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (images.length === 0) return [];

    const uploadedUrls: string[] = [];
    setUploading(true);

    for (let i = 0; i < images.length; i++) {
      const imageUri = images[i];
      const fileName = `${user?.id}/${Date.now()}_${i}.jpg`;
      const { data, error } = await storageService.uploadImage(imageUri, fileName);

      if (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Upload Error', `Failed to upload image ${i + 1}`);
      } else if (data) {
        uploadedUrls.push(data.path);
      }
    }

    setUploading(false);
    return uploadedUrls;
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    if (!district) {
      newErrors.district = 'District is required';
    }
    if (budgetMin && budgetMax) {
      const min = parseFloat(budgetMin);
      const max = parseFloat(budgetMax);
      if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
        newErrors.budget = 'Budget must be valid numbers';
      } else if (min > max) {
        newErrors.budget = 'Min budget cannot be greater than max budget';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setLoading(true);

    // Upload images first
    const imageUrls = await uploadImages();

    // Create job request
    const { data, error } = await jobRequestService.create(
      {
        title: title.trim(),
        description: description.trim(),
        district,
        budget_min: budgetMin ? parseFloat(budgetMin) : undefined,
        budget_max: budgetMax ? parseFloat(budgetMax) : undefined,
        images: imageUrls,
      },
      user.id
    );

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to create job request. Please try again.');
    } else {
      Alert.alert('Success', 'Job request created successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Create Job Request</Text>

        <Input
          label="Job Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Fix leaking pipe"
          error={errors.title}
        />

        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the job in detail..."
          error={errors.description}
          multiline
          numberOfLines={5}
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">District</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            <View className="flex-row gap-2">
              {DISTRICTS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDistrict(d)}
                  className={`px-4 py-2 rounded-full border ${
                    district === d
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={district === d ? 'text-white font-semibold' : 'text-gray-700'}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {errors.district && <Text className="text-red-500 text-sm">{errors.district}</Text>}
        </View>

        <View className="flex-row gap-4 mb-4">
          <View className="flex-1">
            <Input
              label="Min Budget (BGN)"
              value={budgetMin}
              onChangeText={setBudgetMin}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Max Budget (BGN)"
              value={budgetMax}
              onChangeText={setBudgetMax}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>
        {errors.budget && <Text className="text-red-500 text-sm mb-4">{errors.budget}</Text>}

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-2">Images (Optional)</Text>
          <TouchableOpacity
            onPress={pickImage}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 items-center"
          >
            <Text className="text-blue-500 font-semibold">+ Add Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View className="flex-row flex-wrap gap-2 mt-4">
              {images.map((uri, index) => (
                <View key={index} className="relative">
                  <Image source={{ uri }} className="w-20 h-20 rounded-lg" />
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                  >
                    <Text className="text-white text-xs font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <Button
          title={uploading ? 'Uploading Images...' : loading ? 'Creating...' : 'Create Job'}
          onPress={handleSubmit}
          loading={loading || uploading}
          disabled={uploading}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
