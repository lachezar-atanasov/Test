// ===================================
// Unbond - Onboarding Screen
// ===================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Button, Card } from '../../components';
import { DISCLAIMER_TEXT } from '../../utils/constants';
import { useSettingsStore } from '../../store';
import type { ContactMode } from '../../types';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Unbond',
    emoji: '🌱',
    content: `This app is here to support you on your journey toward healing from a trauma bond or toxic relationship.

**What you'll find here:**
• Tools to track your emotions and cravings
• A log to document interactions
• Educational content to understand what you're going through
• A structured plan to guide your recovery
• Grounding tools for difficult moments

This is your private space. Everything stays on your device.`,
  },
  {
    id: 'disclaimer',
    title: 'Important Information',
    emoji: '⚠️',
    content: DISCLAIMER_TEXT,
    requiresAcknowledge: true,
  },
  {
    id: 'mode',
    title: 'Your Approach',
    emoji: '🎯',
    content: `How would you describe your current approach to the relationship?

This helps us tailor the language in the app. You can change this anytime in settings.`,
    isSelection: true,
  },
];

export function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [acknowledged, setAcknowledged] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ContactMode>('no-contact');

  const { updateSettings, completeOnboarding } = useSettingsStore();

  const step = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const canProceed = () => {
    if (step.requiresAcknowledge && !acknowledged) return false;
    return true;
  };

  const handleNext = async () => {
    if (isLastStep) {
      await updateSettings({ contactMode: selectedMode });
      await completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderContent = () => {
    if (step.isSelection) {
      return (
        <View style={styles.selectionContainer}>
          <Text style={styles.contentText}>{step.content}</Text>

          <View style={styles.optionsContainer}>
            <Pressable
              style={[
                styles.option,
                selectedMode === 'no-contact' && styles.optionSelected,
              ]}
              onPress={() => setSelectedMode('no-contact')}
            >
              <Text style={styles.optionEmoji}>🚫</Text>
              <Text style={styles.optionTitle}>No Contact</Text>
              <Text style={styles.optionDescription}>
                I'm working toward or maintaining complete separation
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.option,
                selectedMode === 'low-contact' && styles.optionSelected,
              ]}
              onPress={() => setSelectedMode('low-contact')}
            >
              <Text style={styles.optionEmoji}>📉</Text>
              <Text style={styles.optionTitle}>Low Contact</Text>
              <Text style={styles.optionDescription}>
                I need to maintain some contact (co-parenting, work, etc.)
              </Text>
            </Pressable>
          </View>
        </View>
      );
    }

    return (
      <>
        <Text style={styles.contentText}>{step.content}</Text>

        {step.requiresAcknowledge && (
          <Pressable
            style={styles.acknowledgeContainer}
            onPress={() => setAcknowledged(!acknowledged)}
          >
            <View
              style={[styles.checkbox, acknowledged && styles.checkboxChecked]}
            >
              {acknowledged && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.acknowledgeText}>
              I understand this app is not a substitute for professional help
            </Text>
          </Pressable>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotComplete,
            ]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step content */}
        <View style={styles.stepContainer}>
          <Text style={styles.emoji}>{step.emoji}</Text>
          <Text style={styles.title}>{step.title}</Text>

          <Card style={styles.card}>{renderContent()}</Card>
        </View>
      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <Button
            title="Back"
            onPress={handleBack}
            variant="ghost"
            style={styles.backButton}
          />
        )}
        <Button
          title={isLastStep ? 'Get Started' : 'Continue'}
          onPress={handleNext}
          disabled={!canProceed()}
          style={styles.nextButton}
          fullWidth={currentStep === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: colors.primaryLight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  card: {
    width: width - spacing.md * 2,
    maxWidth: 400,
  },
  contentText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  acknowledgeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.textOnPrimary,
    fontWeight: 'bold',
  },
  acknowledgeText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  selectionContainer: {
    width: '100%',
  },
  optionsContainer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  option: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  optionEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  optionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  optionDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 0,
    minWidth: 80,
  },
  nextButton: {
    flex: 1,
  },
});
