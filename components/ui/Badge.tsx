import React from 'react';
import { View, Text, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-secondary-100',
    success: 'bg-green-100',
    warning: 'bg-amber-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
  };

  const textVariantClasses = {
    default: 'text-secondary-700',
    success: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5',
    md: 'px-2.5 py-1',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
  };

  return (
    <View
      className={`rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <Text className={`font-medium ${textVariantClasses[variant]} ${textSizeClasses[size]}`}>
        {label}
      </Text>
    </View>
  );
}
