import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  values: string[];
  options: SelectOption[];
  onChange: (values: string[]) => void;
  error?: string;
  maxSelections?: number;
}

export function MultiSelect({
  label,
  placeholder = 'Select options',
  values,
  options,
  onChange,
  error,
  maxSelections,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOptions = options.filter((opt) => values.includes(opt.value));

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      if (maxSelections && values.length >= maxSelections) {
        return;
      }
      onChange([...values, value]);
    }
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="text-secondary-700 font-medium mb-1.5 text-sm">
          {label}
        </Text>
      )}
      <TouchableOpacity
        className={`
          flex-row items-center justify-between
          bg-white border rounded-xl px-4 py-3.5
          ${error ? 'border-error' : 'border-secondary-200'}
        `}
        onPress={() => setIsOpen(true)}
      >
        <Text
          className={selectedOptions.length > 0 ? 'text-secondary-900' : 'text-secondary-400'}
          numberOfLines={1}
        >
          {selectedOptions.length > 0
            ? `${selectedOptions.length} selected`
            : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      {selectedOptions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
          <View className="flex-row gap-2">
            {selectedOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className="flex-row items-center bg-primary-100 rounded-full px-3 py-1"
                onPress={() => toggleValue(option.value)}
              >
                <Text className="text-primary-700 text-sm mr-1">{option.label}</Text>
                <Ionicons name="close" size={14} color="#1d4ed8" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {error && <Text className="text-error text-xs mt-1">{error}</Text>}

      <Modal visible={isOpen} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 justify-end">
            <SafeAreaView className="bg-white rounded-t-3xl">
              <View className="p-4 border-b border-secondary-200">
                <View className="w-12 h-1 bg-secondary-300 rounded-full self-center mb-4" />
                <Text className="text-lg font-semibold text-center">
                  {label || 'Select options'}
                </Text>
                {maxSelections && (
                  <Text className="text-sm text-secondary-500 text-center mt-1">
                    Select up to {maxSelections} options
                  </Text>
                )}
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                className="max-h-80"
                renderItem={({ item }) => {
                  const isSelected = values.includes(item.value);
                  const isDisabled =
                    !isSelected && maxSelections && values.length >= maxSelections;

                  return (
                    <TouchableOpacity
                      className={`
                        px-4 py-4 flex-row items-center justify-between
                        ${isSelected ? 'bg-primary-50' : ''}
                        ${isDisabled ? 'opacity-50' : ''}
                      `}
                      onPress={() => !isDisabled && toggleValue(item.value)}
                      disabled={!!isDisabled}
                    >
                      <Text
                        className={`text-base ${
                          isSelected
                            ? 'text-primary-600 font-medium'
                            : 'text-secondary-900'
                        }`}
                      >
                        {item.label}
                      </Text>
                      <View
                        className={`w-6 h-6 rounded-md border-2 items-center justify-center ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-secondary-300'
                        }`}
                      >
                        {isSelected && (
                          <Ionicons name="checkmark" size={16} color="#ffffff" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
              <View className="p-4 border-t border-secondary-200">
                <TouchableOpacity
                  className="bg-primary-600 rounded-xl py-3 items-center"
                  onPress={() => setIsOpen(false)}
                >
                  <Text className="text-white font-semibold">Done</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
