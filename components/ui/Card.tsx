import React from 'react';
import { View, TouchableOpacity, ViewProps, TouchableOpacityProps } from 'react-native';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ variant = 'default', className = '', children, ...props }: CardProps) {
  const variantClasses = {
    default: 'bg-white rounded-2xl p-4',
    elevated: 'bg-white rounded-2xl p-4 shadow-md',
    outlined: 'bg-white rounded-2xl p-4 border border-secondary-200',
  };

  return (
    <View className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </View>
  );
}

interface PressableCardProps extends TouchableOpacityProps {
  variant?: 'default' | 'elevated' | 'outlined';
}

export function PressableCard({
  variant = 'default',
  className = '',
  children,
  ...props
}: PressableCardProps) {
  const variantClasses = {
    default: 'bg-white rounded-2xl p-4 active:bg-secondary-50',
    elevated: 'bg-white rounded-2xl p-4 shadow-md active:bg-secondary-50',
    outlined: 'bg-white rounded-2xl p-4 border border-secondary-200 active:bg-secondary-50',
  };

  return (
    <TouchableOpacity className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </TouchableOpacity>
  );
}
