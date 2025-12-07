import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? 'border-red-500'
    : isFocused
    ? 'border-primary-500'
    : 'border-gray-300';

  const bgColor = error ? 'bg-red-50' : 'bg-white';

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-gray-700 font-medium mb-2 text-sm">{label}</Text>
      )}
      
      <View
        className={`flex-row items-center ${bgColor} border ${borderColor} rounded-xl px-4 py-3`}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={error ? '#ef4444' : isFocused ? '#2563eb' : '#9ca3af'}
            style={{ marginRight: 10 }}
          />
        )}
        
        <TextInput
          className="flex-1 text-gray-800 text-base"
          placeholderTextColor="#9ca3af"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !isPassword && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            className="ml-2"
          >
            <Ionicons name={rightIcon} size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
      
      {helper && !error && (
        <Text className="text-gray-500 text-xs mt-1">{helper}</Text>
      )}
    </View>
  );
};

export default Input;
