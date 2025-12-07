import { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../../src/store';
import { t } from '../../src/i18n';
import { isValidEmail } from '../../src/utils/validation';
import { spacing, borderRadius, colors } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [success, setSuccess] = useState(false);

  const resetPassword = useAuthStore(state => state.resetPassword);
  const isLoading = useAuthStore(state => state.isLoading);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t('errors.required');
    } else if (!isValidEmail(email)) {
      newErrors.email = t('auth.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validate()) return;

    const result = await resetPassword(email);

    if (!result.success) {
      setErrors({ general: result.error || t('errors.generic') });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={[styles.successTitle, { color: theme.colors.onBackground }]}>
            Изпратихме имейл!
          </Text>
          <Text style={[styles.successText, { color: theme.colors.onSurfaceVariant }]}>
            {t('auth.resetEmailSent')}
          </Text>
          <Link href="/auth/login" asChild>
            <Button mode="contained" style={styles.successButton}>
              {t('auth.login')}
            </Button>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Back Button */}
          <Link href="/auth/login" asChild>
            <Button mode="text" icon="arrow-left" style={styles.backButton}>
              {t('common.back')}
            </Button>
          </Link>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onBackground }]}>
              {t('auth.forgotPassword')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Въведи имейла си и ще ти изпратим линк за нулиране на паролата
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={isLoading}
              disabled={isLoading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              {t('auth.sendResetLink')}
            </Button>
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
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.xl,
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
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  successButton: {
    minWidth: 200,
  },
});
