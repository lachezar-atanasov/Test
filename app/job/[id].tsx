import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getJobById, updateJobStatus } from '@/services/jobs';
import { getJobOffers, createOffer, acceptOffer, hasExistingOffer } from '@/services/offers';
import { getJobReview, createReview, hasReviewed } from '@/services/reviews';
import { JobRequest, Offer, Review, SERVICE_CATEGORIES } from '@/types';
import {
  Card,
  Badge,
  Avatar,
  Button,
  Input,
  LoadingSpinner,
  StarRating,
  PressableCard,
} from '@/components/ui';
import { JOB_STATUS_LABELS, OFFER_STATUS_LABELS } from '@/config/constants';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, masterProfile } = useAuth();
  const [job, setJob] = useState<JobRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUserOffer, setHasUserOffer] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // Modals
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [offerForm, setOfferForm] = useState({ price: '', duration: '', message: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const jobData = await getJobById(id);
      setJob(jobData);

      if (jobData && user?.role === 'client') {
        const offersData = await getJobOffers(id);
        setOffers(offersData);

        if (jobData.status === 'completed') {
          const reviewed = await hasReviewed(id);
          setHasUserReviewed(reviewed);
          if (reviewed) {
            const reviewData = await getJobReview(id);
            setReview(reviewData);
          }
        }
      }

      if (jobData && user?.role === 'master' && masterProfile) {
        const existing = await hasExistingOffer(id, masterProfile.id);
        setHasUserOffer(existing);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleSendOffer = async () => {
    if (!masterProfile || !job) return;

    const price = parseFloat(offerForm.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      await createOffer(job.id, masterProfile.id, {
        price,
        estimated_duration: offerForm.duration || undefined,
        message: offerForm.message || undefined,
      });
      setShowOfferModal(false);
      setOfferForm({ price: '', duration: '', message: '' });
      setHasUserOffer(true);
      Alert.alert('Success', 'Your offer has been sent!');
    } catch (error) {
      console.error('Error sending offer:', error);
      Alert.alert('Error', 'Failed to send offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptOffer = async (offer: Offer) => {
    if (!job) return;

    Alert.alert(
      'Accept Offer',
      `Accept offer of ${offer.price} BGN from ${offer.master?.user?.full_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await acceptOffer(offer.id, job.id, offer.master_id);
              fetchData();
              Alert.alert('Success', 'Offer accepted! The master has been assigned to your job.');
            } catch (error) {
              console.error('Error accepting offer:', error);
              Alert.alert('Error', 'Failed to accept offer');
            }
          },
        },
      ]
    );
  };

  const handleCompleteJob = async () => {
    if (!job) return;

    Alert.alert('Complete Job', 'Mark this job as completed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Complete',
        onPress: async () => {
          try {
            await updateJobStatus(job.id, 'completed');
            fetchData();
          } catch (error) {
            console.error('Error completing job:', error);
            Alert.alert('Error', 'Failed to update job status');
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    if (!job || !job.assigned_master_id) return;

    setIsSubmitting(true);
    try {
      await createReview(job.id, user!.id, job.assigned_master_id, {
        rating: reviewForm.rating,
        comment: reviewForm.comment || undefined,
      });
      setShowReviewModal(false);
      setHasUserReviewed(true);
      fetchData();
      Alert.alert('Success', 'Thank you for your review!');
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const found = SERVICE_CATEGORIES.find((c) => c.value === category);
    return found?.label || category;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'assigned':
      case 'in_progress':
        return 'info';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!job) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 items-center justify-center">
        <Text className="text-secondary-600">Job not found</Text>
      </SafeAreaView>
    );
  }

  const isClient = user?.role === 'client' && user.id === job.client_id;
  const isMaster = user?.role === 'master';
  const isAssignedMaster = masterProfile?.id === job.assigned_master_id;

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: 'Job Details',
          headerShown: true,
        }}
      />
      <ScrollView className="flex-1 bg-secondary-50">
        {/* Header Card */}
        <Card variant="elevated" className="m-4">
          <View className="flex-row justify-between items-start mb-3">
            <Text className="text-xl font-bold text-secondary-900 flex-1 mr-2">
              {job.title}
            </Text>
            <Badge
              label={JOB_STATUS_LABELS[job.status]}
              variant={getStatusBadgeVariant(job.status)}
            />
          </View>

          <View className="flex-row flex-wrap gap-y-2">
            <View className="flex-row items-center mr-4">
              <Ionicons name="construct-outline" size={16} color="#64748b" />
              <Text className="text-secondary-600 ml-1">{getCategoryLabel(job.category)}</Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Ionicons name="location-outline" size={16} color="#64748b" />
              <Text className="text-secondary-600 ml-1">{job.district}</Text>
            </View>
            {job.budget_min || job.budget_max ? (
              <View className="flex-row items-center">
                <Ionicons name="cash-outline" size={16} color="#64748b" />
                <Text className="text-secondary-600 ml-1">
                  {job.budget_min && job.budget_max
                    ? `${job.budget_min} - ${job.budget_max} BGN`
                    : job.budget_min
                    ? `From ${job.budget_min} BGN`
                    : `Up to ${job.budget_max} BGN`}
                </Text>
              </View>
            ) : null}
          </View>

          {job.preferred_date && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text className="text-secondary-600 ml-1">
                Preferred: {new Date(job.preferred_date).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Card>

        {/* Description */}
        <Card variant="outlined" className="mx-4 mb-4">
          <Text className="text-sm text-secondary-500 mb-1">Description</Text>
          <Text className="text-secondary-800">{job.description}</Text>
          {job.address && (
            <View className="mt-3 pt-3 border-t border-secondary-100">
              <Text className="text-sm text-secondary-500 mb-1">Address</Text>
              <Text className="text-secondary-800">{job.address}</Text>
            </View>
          )}
        </Card>

        {/* Images */}
        {job.images && job.images.length > 0 && (
          <View className="mx-4 mb-4">
            <Text className="text-sm text-secondary-500 mb-2">Photos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {job.images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  className="w-32 h-32 rounded-lg mr-2"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Client Info (for masters) */}
        {isMaster && job.client && (
          <Card variant="outlined" className="mx-4 mb-4">
            <Text className="text-sm text-secondary-500 mb-2">Posted by</Text>
            <View className="flex-row items-center">
              <Avatar source={job.client.avatar_url} name={job.client.full_name} size="md" />
              <View className="ml-3">
                <Text className="text-secondary-900 font-semibold">{job.client.full_name}</Text>
                <Text className="text-secondary-500 text-sm">Client</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Assigned Master Info */}
        {job.assigned_master && job.assigned_master.user && (
          <Card variant="outlined" className="mx-4 mb-4">
            <Text className="text-sm text-secondary-500 mb-2">Assigned Master</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push(`/master/${job.assigned_master_id}`)}
            >
              <Avatar
                source={job.assigned_master.user.avatar_url}
                name={job.assigned_master.user.full_name}
                size="md"
              />
              <View className="ml-3 flex-1">
                <Text className="text-secondary-900 font-semibold">
                  {job.assigned_master.user.full_name}
                </Text>
                <StarRating rating={job.assigned_master.average_rating} size={14} showValue />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          </Card>
        )}

        {/* Offers (for clients) */}
        {isClient && job.status === 'open' && (
          <View className="mx-4 mb-4">
            <Text className="text-lg font-semibold text-secondary-900 mb-3">
              Offers ({offers.length})
            </Text>
            {offers.length === 0 ? (
              <Card variant="outlined" className="items-center py-6">
                <Ionicons name="time-outline" size={40} color="#94a3b8" />
                <Text className="text-secondary-500 mt-2">No offers yet</Text>
              </Card>
            ) : (
              offers.map((offer) => (
                <PressableCard
                  key={offer.id}
                  variant="outlined"
                  className="mb-3"
                  onPress={() => router.push(`/master/${offer.master_id}`)}
                >
                  <View className="flex-row items-center mb-3">
                    <Avatar
                      source={offer.master?.user?.avatar_url}
                      name={offer.master?.user?.full_name}
                      size="md"
                    />
                    <View className="ml-3 flex-1">
                      <Text className="text-secondary-900 font-semibold">
                        {offer.master?.user?.full_name}
                      </Text>
                      <StarRating rating={offer.master?.average_rating || 0} size={14} showValue />
                    </View>
                    <View className="items-end">
                      <Text className="text-xl font-bold text-primary-600">{offer.price} BGN</Text>
                      {offer.estimated_duration && (
                        <Text className="text-secondary-500 text-sm">{offer.estimated_duration}</Text>
                      )}
                    </View>
                  </View>
                  {offer.message && (
                    <Text className="text-secondary-600 mb-3">{offer.message}</Text>
                  )}
                  <Button
                    title="Accept Offer"
                    onPress={() => handleAcceptOffer(offer)}
                    fullWidth
                    variant="primary"
                  />
                </PressableCard>
              ))
            )}
          </View>
        )}

        {/* Review */}
        {review && (
          <Card variant="outlined" className="mx-4 mb-4">
            <Text className="text-sm text-secondary-500 mb-2">Your Review</Text>
            <StarRating rating={review.rating} size={20} />
            {review.comment && (
              <Text className="text-secondary-700 mt-2">{review.comment}</Text>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <View className="mx-4 mb-8 space-y-3">
          {/* Chat Button (when job is assigned) */}
          {(isClient || isAssignedMaster) && ['assigned', 'in_progress'].includes(job.status) && (
            <Button
              title="Open Chat"
              variant="outline"
              onPress={() => router.push(`/chat/${job.id}`)}
              fullWidth
              leftIcon={<Ionicons name="chatbubble-outline" size={20} color="#2563eb" />}
            />
          )}

          {/* Master: Send Offer */}
          {isMaster && job.status === 'open' && !hasUserOffer && (
            <View className="mt-3">
              <Button
                title="Send Offer"
                onPress={() => setShowOfferModal(true)}
                fullWidth
                size="lg"
              />
            </View>
          )}

          {isMaster && hasUserOffer && job.status === 'open' && (
            <View className="bg-green-50 border border-green-200 rounded-xl p-4 mt-3">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <Text className="text-green-800 font-semibold ml-2">Offer Sent</Text>
              </View>
              <Text className="text-green-700 mt-1">
                Your offer has been sent. Waiting for client response.
              </Text>
            </View>
          )}

          {/* Client: Complete Job */}
          {isClient && job.status === 'assigned' && (
            <View className="mt-3">
              <Button
                title="Mark as Completed"
                onPress={handleCompleteJob}
                fullWidth
                variant="primary"
              />
            </View>
          )}

          {/* Client: Leave Review */}
          {isClient && job.status === 'completed' && !hasUserReviewed && (
            <View className="mt-3">
              <Button
                title="Leave a Review"
                onPress={() => setShowReviewModal(true)}
                fullWidth
                leftIcon={<Ionicons name="star-outline" size={20} color="#fff" />}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Send Offer Modal */}
      <Modal visible={showOfferModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-secondary-900 mb-4">Send Offer</Text>
            
            <Input
              label="Price (BGN)"
              placeholder="Enter your price"
              value={offerForm.price}
              onChangeText={(text) => setOfferForm({ ...offerForm, price: text })}
              keyboardType="numeric"
            />
            
            <View className="mt-4">
              <Input
                label="Estimated Duration (optional)"
                placeholder="e.g., 2-3 hours"
                value={offerForm.duration}
                onChangeText={(text) => setOfferForm({ ...offerForm, duration: text })}
              />
            </View>
            
            <View className="mt-4">
              <Input
                label="Message (optional)"
                placeholder="Add a note for the client..."
                value={offerForm.message}
                onChangeText={(text) => setOfferForm({ ...offerForm, message: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View className="flex-row mt-6 space-x-3">
              <View className="flex-1">
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowOfferModal(false)}
                  fullWidth
                />
              </View>
              <View className="w-3" />
              <View className="flex-1">
                <Button
                  title="Send Offer"
                  onPress={handleSendOffer}
                  isLoading={isSubmitting}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-xl font-bold text-secondary-900 mb-4">Leave a Review</Text>
            
            <View className="items-center mb-4">
              <StarRating
                rating={reviewForm.rating}
                size={36}
                editable
                onChange={(rating) => setReviewForm({ ...reviewForm, rating })}
              />
            </View>
            
            <Input
              label="Comment (optional)"
              placeholder="Share your experience..."
              value={reviewForm.comment}
              onChangeText={(text) => setReviewForm({ ...reviewForm, comment: text })}
              multiline
              numberOfLines={4}
            />

            <View className="flex-row mt-6 space-x-3">
              <View className="flex-1">
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setShowReviewModal(false)}
                  fullWidth
                />
              </View>
              <View className="w-3" />
              <View className="flex-1">
                <Button
                  title="Submit"
                  onPress={handleSubmitReview}
                  isLoading={isSubmitting}
                  fullWidth
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
