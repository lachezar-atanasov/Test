import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMasterProfileById } from '@/services/masterProfile';
import { getMasterReviews } from '@/services/reviews';
import { MasterProfile, Review, SERVICE_CATEGORIES } from '@/types';
import { Card, Avatar, StarRating, LoadingSpinner, Badge } from '@/components/ui';

export default function MasterProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [profile, setProfile] = useState<MasterProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const [profileData, reviewsData] = await Promise.all([
          getMasterProfileById(id),
          getMasterReviews(id),
        ]);
        setProfile(profileData);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading master profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const getCategoryLabel = (category: string) => {
    const found = SERVICE_CATEGORIES.find((c) => c.value === category);
    return found?.label || category;
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!profile || !profile.user) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 items-center justify-center">
        <Text className="text-secondary-600">Profile not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: profile.user.full_name,
          headerShown: true,
        }}
      />
      <ScrollView className="flex-1 bg-secondary-50">
        {/* Profile Header */}
        <Card variant="elevated" className="m-4 items-center py-6">
          <Avatar
            source={profile.user.avatar_url}
            name={profile.user.full_name}
            size="xl"
          />
          <Text className="text-2xl font-bold text-secondary-900 mt-4">
            {profile.user.full_name}
          </Text>
          
          <View className="flex-row items-center mt-2">
            <StarRating rating={profile.average_rating} size={22} showValue />
            <Text className="text-secondary-500 ml-2">
              ({profile.total_reviews} reviews)
            </Text>
          </View>

          {profile.is_available ? (
            <View className="flex-row items-center mt-3 bg-green-100 px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
              <Text className="text-green-700 font-medium">Available</Text>
            </View>
          ) : (
            <View className="flex-row items-center mt-3 bg-secondary-100 px-3 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-secondary-400 mr-2" />
              <Text className="text-secondary-600 font-medium">Not Available</Text>
            </View>
          )}
        </Card>

        {/* About */}
        {profile.description && (
          <Card variant="outlined" className="mx-4 mb-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle-outline" size={18} color="#64748b" />
              <Text className="text-secondary-500 font-medium ml-1">About</Text>
            </View>
            <Text className="text-secondary-700">{profile.description}</Text>
          </Card>
        )}

        {/* Details */}
        <Card variant="outlined" className="mx-4 mb-4">
          <View className="flex-row">
            {profile.hourly_rate && (
              <View className="flex-1 items-center py-4 border-r border-secondary-100">
                <Text className="text-2xl font-bold text-primary-600">
                  {profile.hourly_rate}
                </Text>
                <Text className="text-secondary-500 text-sm">BGN/hour</Text>
              </View>
            )}
            {profile.experience_years && (
              <View className="flex-1 items-center py-4">
                <Text className="text-2xl font-bold text-secondary-800">
                  {profile.experience_years}
                </Text>
                <Text className="text-secondary-500 text-sm">Years exp.</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Services */}
        {profile.services && profile.services.length > 0 && (
          <Card variant="outlined" className="mx-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="construct-outline" size={18} color="#64748b" />
              <Text className="text-secondary-500 font-medium ml-1">Services</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.services.map((service) => (
                <Badge
                  key={service}
                  label={getCategoryLabel(service)}
                  variant="info"
                />
              ))}
            </View>
          </Card>
        )}

        {/* Service Areas */}
        {profile.districts && profile.districts.length > 0 && (
          <Card variant="outlined" className="mx-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="location-outline" size={18} color="#64748b" />
              <Text className="text-secondary-500 font-medium ml-1">Service Areas</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {profile.districts.map((district) => (
                <Badge key={district} label={district} variant="default" />
              ))}
            </View>
          </Card>
        )}

        {/* Reviews */}
        <View className="mx-4 mb-8">
          <Text className="text-lg font-semibold text-secondary-900 mb-3">
            Reviews ({reviews.length})
          </Text>
          
          {reviews.length === 0 ? (
            <Card variant="outlined" className="items-center py-6">
              <Ionicons name="star-outline" size={40} color="#94a3b8" />
              <Text className="text-secondary-500 mt-2">No reviews yet</Text>
            </Card>
          ) : (
            reviews.map((review) => (
              <Card key={review.id} variant="outlined" className="mb-3">
                <View className="flex-row items-center mb-2">
                  <Avatar
                    source={review.client?.avatar_url}
                    name={review.client?.full_name}
                    size="sm"
                  />
                  <View className="ml-2 flex-1">
                    <Text className="text-secondary-900 font-medium">
                      {review.client?.full_name}
                    </Text>
                    <Text className="text-secondary-400 text-xs">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <StarRating rating={review.rating} size={14} />
                </View>
                {review.comment && (
                  <Text className="text-secondary-600">{review.comment}</Text>
                )}
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </>
  );
}
