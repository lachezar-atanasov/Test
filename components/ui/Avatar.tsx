import React from 'react';
import { View, Text, Image, ViewProps, ImageStyle, StyleProp } from 'react-native';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ source, name, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (source) {
    return (
      <View className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
        <Image
          source={{ uri: source }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <View
      className={`${sizeClasses[size]} rounded-full bg-primary-100 items-center justify-center ${className}`}
    >
      <Text className={`${textSizeClasses[size]} font-semibold text-primary-600`}>
        {getInitials(name)}
      </Text>
    </View>
  );
}
