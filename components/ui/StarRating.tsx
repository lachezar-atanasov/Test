import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  showValue?: boolean;
  editable?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  color = '#f59e0b',
  showValue = false,
  editable = false,
  onChange,
}: StarRatingProps) {
  const stars = [];

  for (let i = 1; i <= maxRating; i++) {
    const isFilled = i <= Math.floor(rating);
    const isHalf = i === Math.ceil(rating) && rating % 1 !== 0;

    const StarComponent = editable ? TouchableOpacity : View;

    stars.push(
      <StarComponent
        key={i}
        onPress={editable ? () => onChange?.(i) : undefined}
        className="mr-0.5"
      >
        <Ionicons
          name={isFilled ? 'star' : isHalf ? 'star-half' : 'star-outline'}
          size={size}
          color={isFilled || isHalf ? color : '#cbd5e1'}
        />
      </StarComponent>
    );
  }

  return (
    <View className="flex-row items-center">
      {stars}
      {showValue && (
        <Text className="ml-1 text-secondary-600 text-sm">
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}
