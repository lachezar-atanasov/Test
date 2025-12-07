import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  error?: string;
}

export function Select({
  label,
  placeholder = 'Select an option',
  value,
  options,
  onChange,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

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
          className={selectedOption ? 'text-secondary-900' : 'text-secondary-400'}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>
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
                  {label || 'Select an option'}
                </Text>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item.value}
                className="max-h-80"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`
                      px-4 py-4 flex-row items-center justify-between
                      ${item.value === value ? 'bg-primary-50' : ''}
                    `}
                    onPress={() => {
                      onChange(item.value);
                      setIsOpen(false);
                    }}
                  >
                    <Text
                      className={`text-base ${
                        item.value === value
                          ? 'text-primary-600 font-medium'
                          : 'text-secondary-900'
                      }`}
                    >
                      {item.label}
                    </Text>
                    {item.value === value && (
                      <Ionicons name="checkmark" size={24} color="#2563eb" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
