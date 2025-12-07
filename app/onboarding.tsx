import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Button, useTheme, SegmentedButtons, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore } from '../src/store';
import { t } from '../src/i18n';
import { spacing, borderRadius, colors } from '../src/theme';

const REMINDER_OPTIONS = [1, 2, 3, 5, 7];
const PAYDAY_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function OnboardingScreen() {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [payday, setPayday] = useState<number | null>(null);
  const [reminderDays, setReminderDays] = useState<number>(3);

  const updateProfile = useAuthStore(state => state.updateProfile);
  const setHasCompletedOnboarding = useAuthStore(state => state.setHasCompletedOnboarding);
  const isLoading = useAuthStore(state => state.isLoading);

  const handleComplete = async () => {
    await updateProfile({
      payday,
      default_reminder_days_before: reminderDays,
      preferred_language: 'bg',
    });
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    setHasCompletedOnboarding(true);
    router.replace('/(tabs)');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>👋</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              {t('onboarding.welcome')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('onboarding.welcomeSubtitle')}
            </Text>

            <View style={styles.features}>
              <FeatureItem icon="📊" text="Следи всички сметки на едно място" />
              <FeatureItem icon="🔔" text="Получавай напомняния преди падеж" />
              <FeatureItem icon="📈" text="Виж месечни отчети и анализи" />
              <FeatureItem icon="💰" text="Избягвай лихви и глоби" />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>💵</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              {t('onboarding.paydayQuestion')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('onboarding.paydayHint')}
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysScroll}>
              <View style={styles.daysRow}>
                {PAYDAY_OPTIONS.map(day => (
                  <Pressable
                    key={day}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor:
                          payday === day ? theme.colors.primary : theme.colors.surfaceVariant,
                      },
                    ]}
                    onPress={() => setPayday(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: payday === day ? theme.colors.onPrimary : theme.colors.onSurface },
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Button mode="text" onPress={() => setPayday(null)} style={styles.skipDayButton}>
              Не искам да посоча
            </Button>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepIcon}>🔔</Text>
            <Text style={[styles.stepTitle, { color: theme.colors.onBackground }]}>
              {t('onboarding.reminderQuestion')}
            </Text>
            <Text style={[styles.stepSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              {t('onboarding.reminderHint')}
            </Text>

            <View style={styles.reminderOptions}>
              {REMINDER_OPTIONS.map(days => (
                <Chip
                  key={days}
                  selected={reminderDays === days}
                  onPress={() => setReminderDays(days)}
                  style={styles.reminderChip}
                  showSelectedCheck={false}
                  mode={reminderDays === days ? 'flat' : 'outlined'}
                >
                  {days} {days === 1 ? 'ден' : 'дни'} преди
                </Chip>
              ))}
            </View>

            <View
              style={[styles.reminderPreview, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              <Text style={[styles.reminderPreviewText, { color: theme.colors.onSurfaceVariant }]}>
                Ще получаваш напомняне {reminderDays}{' '}
                {reminderDays === 1 ? 'ден' : 'дни'} преди падежа и на самата дата.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const totalSteps = 3;
  const isLastStep = step === totalSteps - 1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              {
                backgroundColor: i <= step ? theme.colors.primary : theme.colors.outlineVariant,
              },
            ]}
          />
        ))}
      </View>

      {/* Step content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>{renderStep()}</ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {step === 0 ? (
          <Button mode="text" onPress={handleSkip}>
            {t('onboarding.skip')}
          </Button>
        ) : (
          <Button mode="text" onPress={() => setStep(step - 1)}>
            {t('common.back')}
          </Button>
        )}

        <Button
          mode="contained"
          onPress={() => {
            if (isLastStep) {
              handleComplete();
            } else {
              setStep(step + 1);
            }
          }}
          loading={isLoading && isLastStep}
          disabled={isLoading}
        >
          {isLastStep ? t('onboarding.getStarted') : t('common.next')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  const theme = useTheme();

  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureText, { color: theme.colors.onBackground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  features: {
    width: '100%',
    marginTop: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    fontSize: 16,
    flex: 1,
  },
  daysScroll: {
    maxHeight: 120,
    width: '100%',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  dayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipDayButton: {
    marginTop: spacing.md,
  },
  reminderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reminderChip: {
    marginBottom: spacing.xs,
  },
  reminderPreview: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    width: '100%',
  },
  reminderPreviewText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
