import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { updateProfile, getNotificationSettings, upsertNotificationSettings } from '../../src/api/bills';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { t } from '../../src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function SettingsScreen() {
  const { user, profile, signOut } = useAuthStore();
  const [payday, setPayday] = useState('');
  const [reminderDays, setReminderDays] = useState('3');
  const [enablePush, setEnablePush] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setPayday(profile.payday?.toString() || '');
      setReminderDays(profile.default_reminder_days_before.toString());
    }
    loadNotificationSettings();
  }, [profile]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const settings = await getNotificationSettings(user.id);
      if (settings) {
        setEnablePush(settings.enable_push);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);

    try {
      await Promise.all([
        updateProfile(user.id, {
          payday: payday ? parseInt(payday, 10) : null,
          default_reminder_days_before: parseInt(reminderDays, 10) || 3,
        }),
        upsertNotificationSettings(user.id, {
          enable_push: enablePush,
          days_before: [parseInt(reminderDays, 10) || 3, 0],
          quiet_hours_start: null,
          quiet_hours_end: null,
        }),
      ]);

      Alert.alert('Успех', 'Настройките са запазени');
    } catch (error) {
      Alert.alert('Грешка', 'Неуспешно запазване на настройките');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Изтриване на акаунта',
      'Сигурни ли сте, че искате да изтриете акаунта си? Това действие е необратимо.',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Информация', 'Функцията за изтриване на акаунт ще бъде имплементирана скоро');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Изход', 'Сигурни ли сте, че искате да излезете?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logout'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.profile')}</Text>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>{t('settings.payday')}</Text>
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

          <Input
            label={t('settings.defaultReminderDays')}
            value={reminderDays}
            onChangeText={setReminderDays}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setEnablePush(!enablePush)}
          >
            <Text style={styles.settingLabel}>{t('settings.enablePush')}</Text>
            <Ionicons
              name={enablePush ? 'toggle' : 'toggle-outline'}
              size={24}
              color={enablePush ? '#4A90E2' : '#999'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.data')}</Text>

          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingLabel}>{t('settings.exportData')}</Text>
            <Ionicons name="download-outline" size={24} color="#4A90E2" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow} onPress={handleDeleteAccount}>
            <Text style={[styles.settingLabel, styles.dangerText]}>
              {t('settings.deleteAccount')}
            </Text>
            <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <Button title={t('common.save')} onPress={handleSave} loading={saving} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t('auth.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabel: {
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dangerText: {
    color: '#FF6B6B',
  },
  logoutButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});
