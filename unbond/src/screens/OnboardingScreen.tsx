import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';
import { Button } from '../components/Button';
import { Disclaimer } from '../components/Disclaimer';
import { ContactMode } from '../types';

export const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [contactMode, setContactMode] = useState<ContactMode>('no-contact');
  const { updateSettings } = useAppStore();

  const handleComplete = async () => {
    await updateSettings({
      contactMode,
      hasCompletedOnboarding: true,
      notificationsEnabled: false,
    });
  };

  if (step === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Unbond</Text>
          <Text style={styles.subtitle}>
            A companion app to help you understand, track, and heal from trauma-bond relationships
          </Text>
        </View>

        <Disclaimer />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This App Does</Text>
          <Text style={styles.text}>
            • Provides educational resources about trauma bonds and toxic relationship patterns
          </Text>
          <Text style={styles.text}>
            • Helps you track your emotional states and interactions
          </Text>
          <Text style={styles.text}>
            • Offers a structured escape and healing plan
          </Text>
          <Text style={styles.text}>
            • Provides grounding tools and coping strategies
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What This App Does NOT Do</Text>
          <Text style={styles.text}>
            • Provide professional mental health treatment or diagnosis
          </Text>
          <Text style={styles.text}>
            • Replace therapy or professional support
          </Text>
          <Text style={styles.text}>
            • Provide crisis intervention or emergency services
          </Text>
        </View>

        <Button title="Continue" onPress={() => setStep(1)} style={styles.button} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Contact Mode</Text>
        <Text style={styles.subtitle}>
          This helps us personalize the app experience for your situation
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.option, contactMode === 'no-contact' && styles.optionSelected]}
        onPress={() => setContactMode('no-contact')}
      >
        <Text style={[styles.optionTitle, contactMode === 'no-contact' && styles.optionTitleSelected]}>
          No Contact
        </Text>
        <Text style={styles.optionDescription}>
          Complete cessation of all communication and interaction
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, contactMode === 'low-contact' && styles.optionSelected]}
        onPress={() => setContactMode('low-contact')}
      >
        <Text style={[styles.optionTitle, contactMode === 'low-contact' && styles.optionTitleSelected]}>
          Low Contact
        </Text>
        <Text style={styles.optionDescription}>
          Minimal, structured communication only when necessary (e.g., shared children, legal matters)
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        You can change this setting anytime in Settings.
      </Text>

      <Button title="Get Started" onPress={handleComplete} style={styles.button} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  text: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    lineHeight: 22,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  option: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  optionSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  optionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
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
  note: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
});
