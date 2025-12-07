import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Button, useTheme, Divider, Dialog, Portal, RadioButton } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paths, File as ExpoFile } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

import { useAuthStore, useBillsStore, useSettingsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { spacing, colors, borderRadius } from '../../src/theme';
import { generateCSVExport } from '../../src/domain/analytics';
import { LoadingSpinner } from '../../src/components/common';
import { formatDayOfMonth } from '../../src/utils/format';

export default function SettingsScreen() {
  const theme = useTheme();
  
  const user = useAuthStore(state => state.user);
  const profile = useAuthStore(state => state.profile);
  const signOut = useAuthStore(state => state.signOut);
  const updateProfile = useAuthStore(state => state.updateProfile);
  
  const { allPayments, categories, loadAllPayments, loadCategories } = useBillsStore();
  
  const {
    colorScheme,
    notificationSettings,
    setColorScheme,
    loadNotificationSettings,
    updateNotificationSettings,
  } = useSettingsStore();

  const [paydayDialogVisible, setPaydayDialogVisible] = useState(false);
  const [reminderDialogVisible, setReminderDialogVisible] = useState(false);
  const [selectedPayday, setSelectedPayday] = useState(profile?.payday || 1);
  const [selectedReminderDays, setSelectedReminderDays] = useState(profile?.default_reminder_days_before || 3);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadNotificationSettings(user.id);
        loadAllPayments(user.id);
        loadCategories(user.id);
      }
    }, [user, loadNotificationSettings, loadAllPayments, loadCategories])
  );

  useEffect(() => {
    if (profile) {
      setSelectedPayday(profile.payday || 1);
      setSelectedReminderDays(profile.default_reminder_days_before || 3);
    }
  }, [profile]);

  const handleSignOut = () => {
    Alert.alert(
      t('auth.logout'),
      'Сигурен ли си, че искаш да излезеш?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.logout'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccount'),
      t('settings.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert('Информация', 'Тази функционалност ще бъде добавена скоро.');
          },
        },
      ]
    );
  };

  const handleSavePayday = async () => {
    setLoading(true);
    await updateProfile({ payday: selectedPayday });
    setPaydayDialogVisible(false);
    setLoading(false);
  };

  const handleSaveReminder = async () => {
    setLoading(true);
    await updateProfile({ default_reminder_days_before: selectedReminderDays });
    setReminderDialogVisible(false);
    setLoading(false);
  };

  const handleTogglePush = async (enabled: boolean) => {
    if (!user) return;
    await updateNotificationSettings(user.id, { enable_push: enabled });
  };

  const handleExportData = async () => {
    try {
      const csvContent = generateCSVExport(allPayments, categories);
      const fileName = `bg-bills-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const file = new ExpoFile(Paths.cache, fileName);
      
      await file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: t('settings.exportData'),
        });
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      Alert.alert(t('common.error'), t('errors.generic'));
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <List.Section>
          <List.Subheader>{t('settings.profile')}</List.Subheader>
          
          <List.Item
            title={t('settings.email')}
            description={user?.email || ''}
            left={props => <List.Icon {...props} icon="email" />}
          />
          
          <List.Item
            title={t('settings.language')}
            description="Български"
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => {
              Alert.alert('Информация', 'В момента се поддържа само български език.');
            }}
          />
          
          <List.Item
            title={t('settings.payday')}
            description={profile?.payday ? formatDayOfMonth(profile.payday) : 'Не е зададен'}
            left={props => <List.Icon {...props} icon="calendar" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setPaydayDialogVisible(true)}
          />
          
          <List.Item
            title={t('settings.currency')}
            description="BGN (лв.)"
            left={props => <List.Icon {...props} icon="currency-eur" />}
          />
        </List.Section>

        <Divider />

        {/* Notifications Section */}
        <List.Section>
          <List.Subheader>{t('settings.notifications')}</List.Subheader>
          
          <List.Item
            title={t('settings.enablePush')}
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationSettings?.enable_push ?? true}
                onValueChange={handleTogglePush}
              />
            )}
          />
          
          <List.Item
            title={t('settings.reminderDays')}
            description={`${selectedReminderDays} ${selectedReminderDays === 1 ? 'ден' : 'дни'} преди`}
            left={props => <List.Icon {...props} icon="clock-alert" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setReminderDialogVisible(true)}
          />
        </List.Section>

        <Divider />

        {/* Data Section */}
        <List.Section>
          <List.Subheader>{t('settings.data')}</List.Subheader>
          
          <List.Item
            title={t('settings.exportData')}
            left={props => <List.Icon {...props} icon="download" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleExportData}
          />
          
          <List.Item
            title={t('settings.deleteAccount')}
            titleStyle={{ color: colors.error }}
            left={props => <List.Icon {...props} icon="delete" color={colors.error} />}
            onPress={handleDeleteAccount}
          />
        </List.Section>

        <Divider />

        {/* About Section */}
        <List.Section>
          <List.Subheader>{t('settings.about')}</List.Subheader>
          
          <List.Item
            title={t('settings.version')}
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
        </List.Section>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            textColor={colors.error}
            style={styles.signOutButton}
          >
            {t('auth.logout')}
          </Button>
        </View>
      </ScrollView>

      {/* Payday Dialog */}
      <Portal>
        <Dialog visible={paydayDialogVisible} onDismiss={() => setPaydayDialogVisible(false)}>
          <Dialog.Title>{t('settings.payday')}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScrollArea}>
            <ScrollView>
              <RadioButton.Group
                onValueChange={value => setSelectedPayday(parseInt(value))}
                value={selectedPayday.toString()}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <RadioButton.Item
                    key={day}
                    label={formatDayOfMonth(day)}
                    value={day.toString()}
                  />
                ))}
              </RadioButton.Group>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setPaydayDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleSavePayday} loading={loading}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Reminder Days Dialog */}
      <Portal>
        <Dialog visible={reminderDialogVisible} onDismiss={() => setReminderDialogVisible(false)}>
          <Dialog.Title>{t('settings.reminderDays')}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={value => setSelectedReminderDays(parseInt(value))}
              value={selectedReminderDays.toString()}
            >
              {[1, 2, 3, 5, 7, 10, 14].map(days => (
                <RadioButton.Item
                  key={days}
                  label={`${days} ${days === 1 ? 'ден' : 'дни'} преди`}
                  value={days.toString()}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReminderDialogVisible(false)}>{t('common.cancel')}</Button>
            <Button onPress={handleSaveReminder} loading={loading}>
              {t('common.save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  dialogScrollArea: {
    maxHeight: 400,
  },
  signOutSection: {
    padding: spacing.lg,
  },
  signOutButton: {
    borderColor: colors.error,
  },
});
