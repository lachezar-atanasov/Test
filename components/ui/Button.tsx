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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'flex-row items-center justify-center rounded-xl';
  
  const variantClasses = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-600 active:bg-secondary-700',
    outline: 'bg-transparent border-2 border-primary-600 active:bg-primary-50',
    ghost: 'bg-transparent active:bg-secondary-100',
    danger: 'bg-error active:bg-red-600',
  };

  const disabledClasses = {
    primary: 'bg-primary-300',
    secondary: 'bg-secondary-300',
    outline: 'border-secondary-300',
    ghost: 'bg-transparent',
    danger: 'bg-red-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-5 py-3',
    lg: 'px-6 py-4',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-600',
    ghost: 'text-primary-600',
    danger: 'text-white',
  };

  const textDisabledClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-secondary-300',
    ghost: 'text-secondary-300',
    danger: 'text-white',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      className={`
        ${baseClasses}
        ${isDisabled ? disabledClasses[variant] : variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? '#2563eb' : '#ffffff'}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`
              font-semibold
              ${isDisabled ? textDisabledClasses[variant] : textVariantClasses[variant]}
              ${textSizeClasses[size]}
            `}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
}
