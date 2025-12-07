import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../../hooks/useAuth';
import { masterProfileService } from '../../../../services/masterProfiles';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';
import { SERVICE_TYPES } from '../../../../config/services';
import { DISTRICTS } from '../../../../config/districts';

export default function MasterSetupScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    services?: string;
    districts?: string;
    hourlyRate?: string;
  }>({});

  const toggleService = (service: string) => {
    if (services.includes(service)) {
      setServices(services.filter((s) => s !== service));
    } else {
      setServices([...services, service]);
    }
  };

  const toggleDistrict = (district: string) => {
    if (districts.includes(district)) {
      setDistricts(districts.filter((d) => d !== district));
    } else {
      setDistricts([...districts, district]);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (services.length === 0) {
      newErrors.services = 'Select at least one service';
    }
    if (districts.length === 0) {
      newErrors.districts = 'Select at least one district';
    }
    if (hourlyRate && (isNaN(parseFloat(hourlyRate)) || parseFloat(hourlyRate) < 0)) {
      newErrors.hourlyRate = 'Hourly rate must be a valid number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setLoading(true);
    const { data: existing } = await masterProfileService.getById(user.id);

    const input = {
      services,
      districts,
      hourly_rate: hourlyRate ? parseFloat(hourlyRate) : undefined,
      bio: bio.trim() || undefined,
    };

    const { error } = existing
      ? await masterProfileService.update(user.id, input)
      : await masterProfileService.create({ ...input, id: user.id });

    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } else {
      Alert.alert('Success', 'Profile saved successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Master Profile Setup</Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Services Offered *</Text>
          <View className="flex-row flex-wrap gap-2">
            {SERVICE_TYPES.map((service) => (
              <TouchableOpacity
                key={service}
                onPress={() => toggleService(service)}
                className={`px-4 py-2 rounded-full border ${
                  services.includes(service)
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text
                  className={services.includes(service) ? 'text-white font-semibold' : 'text-gray-700'}
                >
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.services && <Text className="text-red-500 text-sm mt-2">{errors.services}</Text>}
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-700 mb-3">Districts Served *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row flex-wrap gap-2">
              {DISTRICTS.map((district) => (
                <TouchableOpacity
                  key={district}
                  onPress={() => toggleDistrict(district)}
                  className={`px-4 py-2 rounded-full border ${
                    districts.includes(district)
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text
                    className={districts.includes(district) ? 'text-white font-semibold' : 'text-gray-700'}
                  >
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {errors.districts && <Text className="text-red-500 text-sm mt-2">{errors.districts}</Text>}
        </View>

        <Input
          label="Hourly Rate (BGN)"
          value={hourlyRate}
          onChangeText={setHourlyRate}
          placeholder="e.g., 25"
          keyboardType="numeric"
          error={errors.hourlyRate}
        />

        <Input
          label="Bio (Optional)"
          value={bio}
          onChangeText={setBio}
          placeholder="Tell clients about your experience..."
          multiline
          numberOfLines={4}
        />

        <Button
          title="Save Profile"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
