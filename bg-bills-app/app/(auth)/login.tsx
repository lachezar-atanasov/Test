import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { t } from '../../src/utils/i18n';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Моля, попълнете всички полета');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace('/(tabs)/dashboard');
    } catch (err) {
      setError('Възникна грешка при влизане');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('auth.login')}</Text>
          <Text style={styles.subtitle}>Влезте в акаунта си</Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Input
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          <Button title={t('auth.loginButton')} onPress={handleLogin} loading={loading} />

          <View style={styles.links}>
            <Link href="/(auth)/forgot-password" asChild>
              <Text style={styles.link}>{t('auth.forgotPassword')}</Text>
            </Link>
          </View>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Нямате акаунт? </Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.signupLink}>{t('auth.register')}</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  links: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
  link: {
    color: '#4A90E2',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
});
