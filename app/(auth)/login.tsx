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
import { VALIDATION } from '@/config/constants';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const { error } = await signIn(email.trim().toLowerCase(), password);

    if (error) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
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
          <View className="flex-1 px-6 pt-8">
            {/* Header */}
            <View className="items-center mb-12">
              <View className="w-20 h-20 bg-primary-100 rounded-2xl items-center justify-center mb-4">
                <Ionicons name="construct" size={40} color="#2563eb" />
              </View>
              <Text className="text-3xl font-bold text-secondary-900">
                MasterMatch
              </Text>
              <Text className="text-secondary-500 mt-1">
                Find the right professional for your job
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
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

              <View className="mt-4">
                <Input
                  label="Password"
                  placeholder="Enter your password"
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
            </View>

            {/* Login Button */}
            <View className="mt-8">
              <Button
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-secondary-500">Don't have an account? </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-600 font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
