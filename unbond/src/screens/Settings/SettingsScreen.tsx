// ===================================
// Unbond - Settings Screen
// ===================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, Share } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Card, Button, ScreenWrapper } from '../../components';
import { useSettingsStore } from '../../store';
import { exportAllData, clearAllData } from '../../services/storage';
import { DISCLAIMER_TEXT, APP_VERSION } from '../../utils/constants';
import type { ContactMode } from '../../types';

export function SettingsScreen() {
  const navigation = useNavigation();
  const { settings, updateSettings, resetStreak } = useSettingsStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleContactModeChange = async (mode: ContactMode) => {
    await updateSettings({ contactMode: mode });
  };

  const handleResetStreak = () => {
    Alert.alert(
      'Reset Streak',
      'This will reset your no-contact/low-contact streak to today. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetStreak();
            Alert.alert('Streak Reset', 'Your streak has been reset to Day 0.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportAllData();
      await Share.share({
        message: data,
        title: 'Unbond Data Export',
      });
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your data including logs, check-ins, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your data will be lost forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Clear All',
                  style: 'destructive',
                  onPress: async () => {
                    await clearAllData();
                    Alert.alert(
                      'Data Cleared',
                      'All data has been deleted. The app will now reset.'
                    );
                    // Force re-render to show onboarding
                    // In production, you'd want to properly reset the app state
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper>
      {/* Contact Mode */}
      <Text style={styles.sectionTitle}>Contact Mode</Text>
      <Card style={styles.section}>
        <Text style={styles.sectionDescription}>
          This affects the language and approach throughout the app.
        </Text>
        <View style={styles.modeOptions}>
          <Pressable
            style={[
              styles.modeOption,
              settings.contactMode === 'no-contact' && styles.modeOptionSelected,
            ]}
            onPress={() => handleContactModeChange('no-contact')}
          >
            <Text style={styles.modeIcon}>🚫</Text>
            <Text
              style={[
                styles.modeLabel,
                settings.contactMode === 'no-contact' &&
                  styles.modeLabelSelected,
              ]}
            >
              No Contact
            </Text>
            <Text style={styles.modeDescription}>
              Complete separation from the person
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeOption,
              settings.contactMode === 'low-contact' && styles.modeOptionSelected,
            ]}
            onPress={() => handleContactModeChange('low-contact')}
          >
            <Text style={styles.modeIcon}>📉</Text>
            <Text
              style={[
                styles.modeLabel,
                settings.contactMode === 'low-contact' &&
                  styles.modeLabelSelected,
              ]}
            >
              Low Contact
            </Text>
            <Text style={styles.modeDescription}>
              Minimal necessary contact only
            </Text>
          </Pressable>
        </View>
      </Card>

      {/* Streak Management */}
      <Text style={styles.sectionTitle}>Progress Tracking</Text>
      <Card style={styles.section}>
        <Text style={styles.settingLabel}>Reset Streak</Text>
        <Text style={styles.settingDescription}>
          Start your no-contact/low-contact streak counter over from today.
        </Text>
        <Button
          title="Reset Streak"
          onPress={handleResetStreak}
          variant="outline"
          size="small"
          style={styles.actionButton}
        />
      </Card>

      {/* Data Management */}
      <Text style={styles.sectionTitle}>Your Data</Text>
      <Card style={styles.section}>
        <Text style={styles.settingLabel}>Export Data</Text>
        <Text style={styles.settingDescription}>
          Download all your data as a JSON file. Useful for backup or sharing
          with a therapist.
        </Text>
        <Button
          title="Export as JSON"
          onPress={handleExportData}
          variant="secondary"
          size="small"
          loading={isExporting}
          style={styles.actionButton}
        />

        <View style={styles.divider} />

        <Text style={styles.settingLabel}>Clear All Data</Text>
        <Text style={styles.settingDescription}>
          Permanently delete all your logs, check-ins, and progress. This cannot
          be undone.
        </Text>
        <Button
          title="Clear All Data"
          onPress={handleClearData}
          variant="danger"
          size="small"
          style={styles.actionButton}
        />
      </Card>

      {/* Privacy Note */}
      <Card style={styles.privacyCard}>
        <Text style={styles.privacyIcon}>🔒</Text>
        <Text style={styles.privacyText}>
          All your data is stored locally on this device only. We never collect,
          transmit, or have access to your personal information.
        </Text>
      </Card>

      {/* Disclaimer */}
      <Text style={styles.sectionTitle}>Important Disclaimer</Text>
      <Card style={styles.disclaimerCard}>
        <Text style={styles.disclaimerText}>{DISCLAIMER_TEXT}</Text>
      </Card>

      {/* About */}
      <Text style={styles.sectionTitle}>About</Text>
      <Card style={styles.section}>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>App Name</Text>
          <Text style={styles.aboutValue}>Unbond</Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={styles.aboutLabel}>Version</Text>
          <Text style={styles.aboutValue}>{APP_VERSION}</Text>
        </View>
        <View style={[styles.aboutRow, styles.noBorder]}>
          <Text style={styles.aboutLabel}>Purpose</Text>
          <Text style={styles.aboutValue}>Trauma Bond Recovery</Text>
        </View>
      </Card>

      {/* Support message */}
      <View style={styles.supportCard}>
        <Text style={styles.supportEmoji}>💙</Text>
        <Text style={styles.supportText}>
          You're not alone in this journey. If you're struggling, please reach
          out to a mental health professional or crisis service.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  modeOptions: {
    gap: spacing.sm,
  },
  modeOption: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeOptionSelected: {
    backgroundColor: colors.primaryFaded,
    borderColor: colors.primary,
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  modeLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  modeLabelSelected: {
    color: colors.primaryDark,
  },
  modeDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  settingLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  actionButton: {
    alignSelf: 'flex-start',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: colors.successLight,
    marginTop: spacing.md,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  privacyText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: colors.warningLight,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  aboutLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  aboutValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  supportCard: {
    backgroundColor: colors.primaryFaded,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  supportEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  supportText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 24,
  },
});
