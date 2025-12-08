// ===================================
// Unbond - SOS / Grounding Tools Screen
// ===================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { Card, Button, ScreenWrapper } from '../../components';
import {
  groundingExercises,
  affirmations,
  contactReminders,
  getRandomQuickTip,
} from '../../data/copingScripts';
import { useEmotionalLogStore, useInteractionLogStore } from '../../store';
import type { CopingScript } from '../../types';

const FEELING_OPTIONS = [
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😤', label: 'Angry' },
  { emoji: '💔', label: 'Longing' },
  { emoji: '😔', label: 'Guilty' },
  { emoji: '😵', label: 'Confused' },
];

export function SOSScreen() {
  const navigation = useNavigation();
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [showExercise, setShowExercise] = useState<CopingScript | null>(null);

  const { entries: emotionalEntries } = useEmotionalLogStore();
  const { entries: interactionEntries } = useInteractionLogStore();

  // Get some context from past logs
  const recentBadInteractions = interactionEntries
    .filter((i) => i.feelingAfter < i.feelingBefore)
    .slice(0, 3);

  const quickTip = getRandomQuickTip();

  const handleDelayContact = () => {
    // In v2, this could start a timer or send a notification
    // For now, just acknowledge
    setShowExercise({
      id: 'delay',
      title: 'Taking a Pause',
      category: 'reminder',
      content: `Great decision. You've chosen to pause.

The urge to reach out often peaks and then fades. By delaying, you're giving yourself a chance to think clearly.

**For the next 10 minutes:**
• Stay here and try a grounding exercise
• Call or text a supportive friend
• Write in your journal
• Go for a short walk
• Do something physical

You can do this. Ten minutes at a time.`,
    });
  };

  const closeModal = () => {
    setShowExercise(null);
  };

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🆘</Text>
        <Text style={styles.headerTitle}>Grounding Tools</Text>
        <Text style={styles.headerSubtitle}>
          You're safe here. Let's work through this together.
        </Text>
      </View>

      {/* Quick tip */}
      <Card style={styles.tipCard}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{quickTip}</Text>
      </Card>

      {/* Feeling selection */}
      <Text style={styles.sectionTitle}>What are you feeling right now?</Text>
      <View style={styles.feelingGrid}>
        {FEELING_OPTIONS.map((feeling) => (
          <Pressable
            key={feeling.label}
            style={[
              styles.feelingButton,
              selectedFeeling === feeling.label && styles.feelingButtonSelected,
            ]}
            onPress={() => setSelectedFeeling(feeling.label)}
          >
            <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
            <Text
              style={[
                styles.feelingLabel,
                selectedFeeling === feeling.label && styles.feelingLabelSelected,
              ]}
            >
              {feeling.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Delay button */}
      <Card style={styles.delayCard}>
        <Text style={styles.delayTitle}>About to reach out?</Text>
        <Text style={styles.delayText}>
          Give yourself 10 minutes before acting on this urge.
        </Text>
        <Button
          title="⏱️ Delay 10 Minutes"
          onPress={handleDelayContact}
          variant="primary"
          fullWidth
        />
      </Card>

      {/* Past context reminder */}
      {recentBadInteractions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Remember Last Time...</Text>
          <Card style={styles.reminderCard}>
            <Text style={styles.reminderText}>
              📉 In your last {recentBadInteractions.length} logged{' '}
              {recentBadInteractions.length === 1 ? 'interaction' : 'interactions'},{' '}
              you felt worse afterward than before.
            </Text>
            <Text style={styles.reminderSubtext}>
              Your feelings matter. Past patterns suggest contact often doesn't
              bring the relief you're hoping for.
            </Text>
          </Card>
        </>
      )}

      {/* Grounding exercises */}
      <Text style={styles.sectionTitle}>Grounding Exercises</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.exerciseRow}
      >
        {groundingExercises.map((exercise) => (
          <Pressable
            key={exercise.id}
            style={styles.exerciseCard}
            onPress={() => setShowExercise(exercise)}
          >
            <Text style={styles.exerciseIcon}>
              {exercise.id === 'ground-1'
                ? '🖐️'
                : exercise.id === 'ground-2'
                ? '📦'
                : exercise.id === 'ground-3'
                ? '🧘'
                : exercise.id === 'ground-4'
                ? '❄️'
                : '🦋'}
            </Text>
            <Text style={styles.exerciseTitle}>{exercise.title}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Reminders */}
      <Text style={styles.sectionTitle}>Reminders</Text>
      {contactReminders.map((reminder) => (
        <Card
          key={reminder.id}
          style={styles.reminderItem}
          onPress={() => setShowExercise(reminder)}
        >
          <Text style={styles.reminderItemTitle}>{reminder.title}</Text>
          <Text style={styles.reminderItemArrow}>→</Text>
        </Card>
      ))}

      {/* Affirmations */}
      <Text style={styles.sectionTitle}>Affirmations</Text>
      {affirmations.map((affirmation) => (
        <Card
          key={affirmation.id}
          style={styles.reminderItem}
          onPress={() => setShowExercise(affirmation)}
        >
          <Text style={styles.reminderItemTitle}>{affirmation.title}</Text>
          <Text style={styles.reminderItemArrow}>→</Text>
        </Card>
      ))}

      {/* Exercise Modal */}
      <Modal
        visible={showExercise !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{showExercise?.title}</Text>
            <Pressable onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalContentInner}
          >
            <Text style={styles.modalText}>{showExercise?.content}</Text>
          </ScrollView>
          <View style={styles.modalFooter}>
            <Button title="Done" onPress={closeModal} fullWidth />
          </View>
        </View>
      </Modal>

      {/* Footer encouragement */}
      <View style={styles.footerCard}>
        <Text style={styles.footerEmoji}>💙</Text>
        <Text style={styles.footerText}>
          You're doing something brave right now. Reaching for tools instead of
          reaching out. That takes real strength.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    ...typography.heading1,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryFaded,
    marginBottom: spacing.lg,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.primaryDark,
    flex: 1,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  feelingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  feelingButton: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    width: '30%',
    ...shadows.sm,
  },
  feelingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  feelingEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  feelingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  feelingLabelSelected: {
    color: colors.primaryDark,
    fontWeight: '500',
  },
  delayCard: {
    backgroundColor: colors.accentLight,
    marginBottom: spacing.lg,
  },
  delayTitle: {
    ...typography.heading3,
    color: colors.accentDark,
    marginBottom: spacing.xs,
  },
  delayText: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  reminderCard: {
    backgroundColor: colors.warningLight,
    marginBottom: spacing.lg,
  },
  reminderText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  reminderSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  exerciseRow: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  exerciseCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    width: 120,
    ...shadows.sm,
  },
  exerciseIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  exerciseTitle: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  reminderItemTitle: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  reminderItemArrow: {
    color: colors.primary,
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.heading2,
    color: colors.textPrimary,
    flex: 1,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  modalContent: {
    flex: 1,
  },
  modalContentInner: {
    padding: spacing.lg,
  },
  modalText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 28,
  },
  modalFooter: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerCard: {
    backgroundColor: colors.primaryFaded,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  footerEmoji: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  footerText: {
    ...typography.body,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 24,
  },
});
