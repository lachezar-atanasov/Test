import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../../hooks/useAuth';
import { jobRequestService } from '../../../services/jobRequests';
import { offerService } from '../../../services/offers';
import { JobRequest, Offer } from '../../../types/database';
import { Button } from '../../../components/Button';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<JobRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingOffer, setAcceptingOffer] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    setLoading(true);
    const [jobResult, offersResult] = await Promise.all([
      jobRequestService.getById(id),
      offerService.getByJobId(id),
    ]);

    setLoading(false);

    if (jobResult.error) {
      Alert.alert('Error', 'Failed to load job details');
      router.back();
      return;
    }

    setJob(jobResult.data);
    setOffers(offersResult.data || []);
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!job || !user) return;

    Alert.alert(
      'Accept Offer',
      'Are you sure you want to accept this offer? This will assign the master to your job.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setAcceptingOffer(offerId);
            const offer = offers.find((o) => o.id === offerId);
            if (!offer) return;

            // Update offer status to accepted
            await offerService.updateStatus(offerId, 'accepted');

            // Assign master to job
            const { error } = await jobRequestService.assignMaster(job.id, offer.master_id);

            setAcceptingOffer(null);

            if (error) {
              Alert.alert('Error', 'Failed to accept offer. Please try again.');
            } else {
              Alert.alert('Success', 'Offer accepted! The master has been assigned to your job.', [
                { text: 'OK', onPress: () => loadData() },
              ]);
            }
          },
        },
      ]
    );
  };

  if (loading || !job) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const isClient = profile?.role === 'client' && job.client_id === user?.id;
  const isMaster = profile?.role === 'master';
  const canAcceptOffers = isClient && job.status === 'open';
  const canSendOffer = isMaster && job.status === 'open';

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 py-6">
        <View className="flex-row justify-between items-start mb-4">
          <Text className="text-2xl font-bold text-gray-900 flex-1">{job.title}</Text>
          <View
            className={`px-3 py-1 rounded-full ${
              job.status === 'open'
                ? 'bg-green-100'
                : job.status === 'assigned'
                ? 'bg-blue-100'
                : job.status === 'completed'
                ? 'bg-gray-100'
                : 'bg-red-100'
            }`}
          >
            <Text
              className={`text-xs font-semibold capitalize ${
                job.status === 'open'
                  ? 'text-green-800'
                  : job.status === 'assigned'
                  ? 'text-blue-800'
                  : job.status === 'completed'
                  ? 'text-gray-800'
                  : 'text-red-800'
              }`}
            >
              {job.status}
            </Text>
          </View>
        </View>

        <Text className="text-gray-700 mb-4">{job.description}</Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Location</Text>
          <Text className="text-gray-600">📍 {job.district}</Text>
        </View>

        {(job.budget_min || job.budget_max) && (
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Budget</Text>
            <Text className="text-gray-600">
              {job.budget_min && job.budget_max
                ? `${job.budget_min} - ${job.budget_max} BGN`
                : job.budget_min
                ? `From ${job.budget_min} BGN`
                : `Up to ${job.budget_max} BGN`}
            </Text>
          </View>
        )}

        {job.images && job.images.length > 0 && (
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {job.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    className="w-48 h-48 rounded-lg"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {canSendOffer && (
          <View className="mb-6">
            <Button
              title="Send Offer"
              onPress={() => router.push(`/(tabs)/jobs/${job.id}/offer`)}
              className="mb-4"
            />
          </View>
        )}

        {isClient && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Offers ({offers.length})
            </Text>

            {offers.length === 0 ? (
              <View className="bg-gray-50 rounded-lg p-6 items-center">
                <Text className="text-gray-500">No offers yet</Text>
                <Text className="text-gray-400 text-sm mt-1">
                  Masters will see your job and can send offers
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {offers.map((offer) => (
                  <View
                    key={offer.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <View className="flex-row justify-between items-start mb-2">
                      <Text className="text-xl font-bold text-gray-900">
                        {offer.price} BGN
                      </Text>
                      <View
                        className={`px-2 py-1 rounded ${
                          offer.status === 'accepted'
                            ? 'bg-green-100'
                            : offer.status === 'rejected'
                            ? 'bg-red-100'
                            : 'bg-yellow-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            offer.status === 'accepted'
                              ? 'text-green-800'
                              : offer.status === 'rejected'
                              ? 'text-red-800'
                              : 'text-yellow-800'
                          }`}
                        >
                          {offer.status}
                        </Text>
                      </View>
                    </View>

                    {offer.message && (
                      <Text className="text-gray-600 mb-3">{offer.message}</Text>
                    )}

                    {canAcceptOffers && offer.status === 'pending' && (
                      <Button
                        title={
                          acceptingOffer === offer.id
                            ? 'Accepting...'
                            : 'Accept Offer'
                        }
                        onPress={() => handleAcceptOffer(offer.id)}
                        loading={acceptingOffer === offer.id}
                        className="mt-2"
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <Text className="text-gray-400 text-xs mt-4">
          Created {new Date(job.created_at).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}
