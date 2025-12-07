import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../src/store';
import { t } from '../../src/i18n';
import { isValidEmail } from '../../src/utils/validation';
import { spacing, borderRadius, colors } from '../../src/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const signIn = useAuthStore(state => state.signIn);
  const isLoading = useAuthStore(state => state.isLoading);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t('errors.required');
    } else if (!isValidEmail(email)) {
      newErrors.email = t('auth.invalidEmail');
    }

    if (!password) {
      newErrors.password = t('errors.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const result = await signIn(email, password);

    if (!result.success) {
      setErrors({ general: result.error || t('auth.loginError') });
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.logo, { color: theme.colors.primary }]}>💰</Text>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>BG Bills</Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Следи сметките си лесно
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={[styles.formTitle, { color: theme.colors.onBackground }]}>
              {t('auth.login')}
            </Text>

            {errors.general && (
              <View style={[styles.errorBanner, { backgroundColor: colors.errorContainer }]}>
                <Text style={{ color: colors.error }}>{errors.general}</Text>
              </View>
            )}

            <TextInput
              label={t('auth.email')}
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              error={!!errors.email}
              style={styles.input}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

            <TextInput
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={!!errors.password}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {t('auth.loginButton')}
            </Button>

            <Link href="/auth/forgot-password" asChild>
              <Button mode="text" compact style={styles.forgotButton}>
                {t('auth.forgotPassword')}
              </Button>
            </Link>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('auth.noAccount')} </Text>
            <Link href="/auth/register" asChild>
              <Button mode="text" compact>
                {t('auth.register')}
              </Button>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  errorBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  buttonContent: {
    paddingVertical: spacing.xs,
  },
  forgotButton: {
    marginTop: spacing.sm,
    alignSelf: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
