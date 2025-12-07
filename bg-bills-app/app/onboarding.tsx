import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { updateProfile } from '../src/api/bills';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { t } from '../src/utils/i18n';

export default function OnboardingScreen() {
  const { user } = useAuthStore();
  const [payday, setPayday] = useState('');
  const [reminderDays, setReminderDays] = useState('3');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await updateProfile(user.id, {
        payday: payday ? parseInt(payday, 10) : null,
        default_reminder_days_before: parseInt(reminderDays, 10) || 3,
      });

      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('onboarding.welcome')}</Text>
      <Text style={styles.subtitle}>Нека настроим вашия профил</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t('onboarding.payday')}</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={payday}
            onValueChange={setPayday}
            style={styles.picker}
            mode="dropdown"
          >
            <Picker.Item label="Не избирам" value="" />
            {days.map((day) => (
              <Picker.Item key={day} label={`${day}`} value={String(day)} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Input
          label={t('onboarding.reminderDays')}
          value={reminderDays}
          onChangeText={setReminderDays}
          keyboardType="number-pad"
          placeholder="3"
        />
      </View>

      <Button title={t('onboarding.continue')} onPress={handleComplete} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});
