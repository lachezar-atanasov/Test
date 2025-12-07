import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { UserRole } from '@/types';
import { VALIDATION } from '@/config/constants';

export default function RegisterScreen() {
  const { signUp, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const { error } = await signUp(
      email.trim().toLowerCase(),
      password,
      fullName.trim(),
      role,
      phone.trim() || undefined
    );

    if (error) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 px-6 pt-6 pb-8">
            {/* Header */}
            <View className="items-center mb-8">
              <Text className="text-2xl font-bold text-secondary-900">
                Create Account
              </Text>
              <Text className="text-secondary-500 mt-1">
                Join MasterMatch today
              </Text>
            </View>

            {/* Role Selection */}
            <View className="mb-6">
              <Text className="text-secondary-700 font-medium mb-2 text-sm">
                I want to:
              </Text>
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    role === 'client'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200'
                  }`}
                  onPress={() => setRole('client')}
                >
                  <View className="items-center">
                    <Ionicons
                      name="briefcase-outline"
                      size={28}
                      color={role === 'client' ? '#2563eb' : '#64748b'}
                    />
                    <Text
                      className={`mt-2 font-semibold ${
                        role === 'client' ? 'text-primary-600' : 'text-secondary-600'
                      }`}
                    >
                      Hire
                    </Text>
                    <Text className="text-xs text-secondary-500 text-center mt-1">
                      Post jobs & hire masters
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="w-3" />

                <TouchableOpacity
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    role === 'master'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-secondary-200'
                  }`}
                  onPress={() => setRole('master')}
                >
                  <View className="items-center">
                    <Ionicons
                      name="construct-outline"
                      size={28}
                      color={role === 'master' ? '#2563eb' : '#64748b'}
                    />
                    <Text
                      className={`mt-2 font-semibold ${
                        role === 'master' ? 'text-primary-600' : 'text-secondary-600'
                      }`}
                    >
                      Work
                    </Text>
                    <Text className="text-xs text-secondary-500 text-center mt-1">
                      Find jobs & get hired
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form */}
            <View className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                error={errors.fullName}
                leftIcon={<Ionicons name="person-outline" size={20} color="#64748b" />}
              />

              <View className="mt-4">
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  leftIcon={<Ionicons name="mail-outline" size={20} color="#64748b" />}
                />
              </View>

              <View className="mt-4">
                <Input
                  label="Phone (optional)"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  leftIcon={<Ionicons name="call-outline" size={20} color="#64748b" />}
                />
              </View>

              <View className="mt-4">
                <Input
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.password}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#64748b" />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              <View className="mt-4">
                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  error={errors.confirmPassword}
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#64748b" />}
                />
              </View>
            </View>

            {/* Register Button */}
            <View className="mt-8">
              <Button
                title="Create Account"
                onPress={handleRegister}
                isLoading={isLoading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-secondary-500">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-semibold">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
