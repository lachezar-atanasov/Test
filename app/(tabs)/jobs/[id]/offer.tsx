import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, useSegments } from 'expo-router';
import { useAuth } from '../../../../hooks/useAuth';
import { jobRequestService } from '../../../../services/jobRequests';
import { offerService } from '../../../../services/offers';
import { JobRequest } from '../../../../types/database';
import { Input } from '../../../../components/Input';
import { Button } from '../../../../components/Button';

export default function SendOfferScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();
  const [job, setJob] = useState<JobRequest | null>(null);
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ price?: string }>({});

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    if (!id) return;

    setLoading(true);
    const { data, error } = await jobRequestService.getById(id);
    setLoading(false);

    if (error || !data) {
      Alert.alert('Error', 'Failed to load job details');
      router.back();
      return;
    }

    setJob(data);
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a valid positive number';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user || !job) return;

    setSubmitting(true);
    const { error } = await offerService.create({
      job_request_id: job.id,
      master_id: user.id,
      price: parseFloat(price),
      message: message.trim() || undefined,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation - already sent an offer
        Alert.alert('Error', 'You have already sent an offer for this job');
      } else {
        Alert.alert('Error', 'Failed to send offer. Please try again.');
      }
    } else {
      Alert.alert('Success', 'Offer sent successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }
  };

  if (loading || !job) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">{job.title}</Text>
        <Text className="text-gray-600 mb-6">{job.description}</Text>

        <View className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Job Details</Text>
          <Text className="text-gray-600 mb-1">📍 {job.district}</Text>
          {(job.budget_min || job.budget_max) && (
            <Text className="text-gray-600">
              Budget: {job.budget_min && job.budget_max
                ? `${job.budget_min} - ${job.budget_max} BGN`
                : job.budget_min
                ? `From ${job.budget_min} BGN`
                : `Up to ${job.budget_max} BGN`}
            </Text>
          )}
        </View>

        <Input
          label="Your Price (BGN) *"
          value={price}
          onChangeText={setPrice}
          placeholder="e.g., 150"
          keyboardType="numeric"
          error={errors.price}
        />

        <Input
          label="Message (Optional)"
          value={message}
          onChangeText={setMessage}
          placeholder="Add a message to the client..."
          multiline
          numberOfLines={4}
        />

        <Button
          title="Send Offer"
          onPress={handleSubmit}
          loading={submitting}
          className="mt-4"
        />
      </View>
    </ScrollView>
  );
}
