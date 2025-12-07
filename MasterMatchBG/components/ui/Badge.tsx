import React from 'react';
import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'sm',
}) => {
  const variantStyles = {
    default: 'bg-gray-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
  };

  const textVariantStyles = {
    default: 'text-gray-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
  };

  const textSizeStyles = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View className={`rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}>
      <Text className={`font-medium ${textVariantStyles[variant]} ${textSizeStyles[size]}`}>
        {label}
      </Text>
    </View>
  );
};

export default Badge;
