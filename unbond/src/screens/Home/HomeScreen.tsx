// ===================================
// Unbond - Home Screen
// ===================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { Card, Button, MoodChart, ScreenWrapper } from '../../components';
import {
  useSettingsStore,
  useDailyCheckInStore,
  useEmotionalLogStore,
  useInteractionLogStore,
} from '../../store';
import { getGreeting, daysSince, getTodayDate } from '../../utils/helpers';
import { getTodayInsight } from '../../data/psychoeducation';
import { MOOD_EMOJIS, SHORT_DISCLAIMER } from '../../utils/constants';
import type { RootStackParamList } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { settings } = useSettingsStore();
  const {
    loadCheckIns,
    saveCheckIn,
    hasCheckedInToday,
    getTodayCheckIn,
    getWeekMoods,
  } = useDailyCheckInStore();
  const { loadEntries: loadEmotional, entries: emotionalEntries } =
    useEmotionalLogStore();
  const { loadEntries: loadInteraction, entries: interactionEntries } =
    useInteractionLogStore();

  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  useEffect(() => {
    loadCheckIns();
    loadEmotional();
    loadInteraction();
  }, [loadCheckIns, loadEmotional, loadInteraction]);

  const todayInsight = getTodayInsight();
  const todayCheckIn = getTodayCheckIn();
  const weekMoods = getWeekMoods();

  // Calculate streak
  const streakDays = settings.streakStartDate
    ? daysSince(settings.streakStartDate)
    : 0;

  // Calculate days since last contact
  const daysSinceContact = settings.lastContactDate
    ? daysSince(settings.lastContactDate)
    : null;

  const handleMoodSelect = async (mood: number) => {
    setSelectedMood(mood);
    await saveCheckIn(mood);
    setShowMoodPicker(false);
  };

  const greeting = getGreeting();

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.subtitle}>How are you feeling today?</Text>
        </View>
        <Pressable
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      {/* Daily Check-in */}
      {!hasCheckedInToday() && !showMoodPicker && (
        <Card style={styles.checkInCard} onPress={() => setShowMoodPicker(true)}>
          <Text style={styles.checkInTitle}>Daily Check-in</Text>
          <Text style={styles.checkInSubtitle}>
            Tap to log how you're feeling today
          </Text>
        </Card>
      )}

      {showMoodPicker && (
        <Card style={styles.moodPickerCard}>
          <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.moodRow}
          >
            {MOOD_EMOJIS.map((emoji, index) => (
              <Pressable
                key={index}
                style={[
                  styles.moodButton,
                  selectedMood === index + 1 && styles.moodButtonSelected,
                ]}
                onPress={() => handleMoodSelect(index + 1)}
              >
                <Text style={styles.moodEmoji}>{emoji}</Text>
                <Text style={styles.moodNumber}>{index + 1}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable onPress={() => setShowMoodPicker(false)}>
            <Text style={styles.cancelText}>Maybe later</Text>
          </Pressable>
        </Card>
      )}

      {hasCheckedInToday() && todayCheckIn && (
        <Card style={styles.checkedInCard}>
          <View style={styles.checkedInRow}>
            <Text style={styles.checkedInEmoji}>
              {MOOD_EMOJIS[todayCheckIn.moodScore - 1]}
            </Text>
            <View style={styles.checkedInText}>
              <Text style={styles.checkedInTitle}>Today's Check-in</Text>
              <Text style={styles.checkedInSubtitle}>
                You're at a {todayCheckIn.moodScore}/10
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <Pressable
          style={styles.quickAction}
          onPress={() =>
            navigation.navigate('EmotionalLogDetail', { entryId: undefined })
          }
        >
          <Text style={styles.quickActionIcon}>💭</Text>
          <Text style={styles.quickActionText}>Log Craving</Text>
        </Pressable>

        <Pressable
          style={styles.quickAction}
          onPress={() =>
            navigation.navigate('InteractionDetail', { entryId: undefined })
          }
        >
          <Text style={styles.quickActionIcon}>📝</Text>
          <Text style={styles.quickActionText}>Log Interaction</Text>
        </Pressable>

        <Pressable
          style={[styles.quickAction, styles.sosAction]}
          onPress={() => navigation.navigate('SOS')}
        >
          <Text style={styles.quickActionIcon}>🆘</Text>
          <Text style={styles.quickActionText}>Grounding</Text>
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{streakDays}</Text>
          <Text style={styles.statLabel}>
            {settings.contactMode === 'no-contact'
              ? 'Days NC'
              : 'Days LC Maintained'}
          </Text>
        </Card>

        {daysSinceContact !== null && (
          <Card style={styles.statCard}>
            <Text style={styles.statNumber}>{daysSinceContact}</Text>
            <Text style={styles.statLabel}>Since Last Contact</Text>
          </Card>
        )}

        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{emotionalEntries.length}</Text>
          <Text style={styles.statLabel}>Journal Entries</Text>
        </Card>
      </View>

      {/* Week's Mood Trend */}
      {weekMoods.some((m) => m.mood !== null) && (
        <>
          <Text style={styles.sectionTitle}>This Week's Mood</Text>
          <Card>
            <MoodChart data={weekMoods} />
          </Card>
        </>
      )}

      {/* Today's Insight */}
      <Text style={styles.sectionTitle}>Today's Insight</Text>
      <Card style={styles.insightCard}>
        <Text style={styles.insightIcon}>💡</Text>
        <Text style={styles.insightText}>{todayInsight.text}</Text>
      </Card>

      {/* Disclaimer */}
      <View style={styles.disclaimerContainer}>
        <Text style={styles.disclaimerText}>{SHORT_DISCLAIMER}</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.heading1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  settingsButton: {
    padding: spacing.sm,
  },
  settingsIcon: {
    fontSize: 24,
  },

  // Check-in card
  checkInCard: {
    backgroundColor: colors.primaryFaded,
    marginBottom: spacing.lg,
  },
  checkInTitle: {
    ...typography.heading3,
    color: colors.primaryDark,
  },
  checkInSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Mood picker
  moodPickerCard: {
    marginBottom: spacing.lg,
  },
  moodPickerTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  moodRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  moodButton: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    minWidth: 50,
  },
  moodButtonSelected: {
    backgroundColor: colors.primaryFaded,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodNumber: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },

  // Checked in card
  checkedInCard: {
    marginBottom: spacing.lg,
  },
  checkedInRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkedInEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  checkedInText: {
    flex: 1,
  },
  checkedInTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  checkedInSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Section title
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  // Quick actions
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  sosAction: {
    backgroundColor: colors.accentLight,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  quickActionText: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  statNumber: {
    ...typography.heading1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Insight
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
  },
  insightIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },

  // Disclaimer
  disclaimerContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.md,
  },
  disclaimerText: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
