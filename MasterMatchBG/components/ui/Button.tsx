import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = true,
  disabled,
  style,
  ...props
}) => {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';
  
  const variantStyles = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-gray-200 active:bg-gray-300',
    outline: 'bg-transparent border-2 border-primary-600 active:bg-primary-50',
    ghost: 'bg-transparent active:bg-gray-100',
  };

  const textVariantStyles = {
    primary: 'text-white font-semibold',
    secondary: 'text-gray-800 font-semibold',
    outline: 'text-primary-600 font-semibold',
    ghost: 'text-primary-600 font-medium',
  };

  const sizeStyles = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyles = disabled || isLoading ? 'opacity-50' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <TouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${widthStyles}`}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#2563eb'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`${textVariantStyles[variant]} ${textSizeStyles[size]}`}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Button;
