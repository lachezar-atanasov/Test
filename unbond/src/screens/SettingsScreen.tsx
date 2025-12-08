import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';
import { Disclaimer } from '../components/Disclaimer';
import { ContactMode } from '../types';

export const SettingsScreen: React.FC = () => {
  const { settings, updateSettings, emotionalLogs, interactionLogs } = useAppStore();

  const handleExportData = async () => {
    try {
      const data = {
        emotionalLogs,
        interactionLogs,
        exportedAt: new Date().toISOString(),
      };
      const jsonString = JSON.stringify(data, null, 2);
      await Share.share({
        message: jsonString,
        title: 'Unbond Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleContactModeChange = (mode: ContactMode) => {
    updateSettings({ contactMode: mode });
  };

  if (!settings) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Disclaimer />

      <Card>
        <Text style={styles.sectionTitle}>Contact Mode</Text>
        <Text style={styles.sectionDescription}>
          Choose the mode that best fits your current situation. You can change this anytime.
        </Text>
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.option,
              settings.contactMode === 'no-contact' && styles.optionSelected,
            ]}
            onPress={() => handleContactModeChange('no-contact')}
          >
            <Text
              style={[
                styles.optionTitle,
                settings.contactMode === 'no-contact' && styles.optionTitleSelected,
              ]}
            >
              No Contact
            </Text>
            <Text style={styles.optionDescription}>
              Complete cessation of all communication
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.option,
              settings.contactMode === 'low-contact' && styles.optionSelected,
            ]}
            onPress={() => handleContactModeChange('low-contact')}
          >
            <Text
              style={[
                styles.optionTitle,
                settings.contactMode === 'low-contact' && styles.optionTitleSelected,
              ]}
            >
              Low Contact
            </Text>
            <Text style={styles.optionDescription}>
              Minimal, structured communication only when necessary
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Data</Text>
        <TouchableOpacity style={styles.dataButton} onPress={handleExportData}>
          <Text style={styles.dataButtonText}>Export My Data (JSON)</Text>
          <Text style={styles.dataButtonSubtext}>
            {emotionalLogs.length} emotional logs, {interactionLogs.length} interaction logs
          </Text>
        </TouchableOpacity>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          <Text style={styles.bold}>Unbond</Text> is a companion app designed to help you
          understand, track, and heal from trauma-bond relationships.
        </Text>
        <Text style={styles.aboutText}>
          This app provides educational resources, tracking tools, and support strategies. It does
          not provide professional mental health treatment, diagnosis, or crisis intervention.
        </Text>
        <Text style={styles.aboutText}>
          If you are in immediate danger or experiencing severe distress, please contact local
          emergency services or a licensed mental health professional.
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: theme.spacing.md,
  },
  option: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  optionTitleSelected: {
    color: theme.colors.primary,
  },
  optionDescription: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  dataButton: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dataButtonText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  dataButtonSubtext: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  aboutText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  bold: {
    fontWeight: '600',
  },
  version: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
