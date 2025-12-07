import React, { forwardRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <View className="w-full">
        {label && (
          <Text className="text-secondary-700 font-medium mb-1.5 text-sm">
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center
            bg-white border rounded-xl px-4
            ${error ? 'border-error' : 'border-secondary-200 focus-within:border-primary-500'}
          `}
        >
          {leftIcon && <View className="mr-3">{leftIcon}</View>}
          <TextInput
            ref={ref}
            className={`flex-1 py-3.5 text-secondary-900 text-base ${className}`}
            placeholderTextColor="#94a3b8"
            {...props}
          />
          {rightIcon && <View className="ml-3">{rightIcon}</View>}
        </View>
        {error && (
          <Text className="text-error text-xs mt-1">{error}</Text>
        )}
        {helperText && !error && (
          <Text className="text-secondary-500 text-xs mt-1">{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
