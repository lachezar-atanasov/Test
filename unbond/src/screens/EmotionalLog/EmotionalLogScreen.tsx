// ===================================
// Unbond - Emotional Log Screen
// ===================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { Card, EmptyState, Chip, Button } from '../../components';
import { useEmotionalLogStore } from '../../store';
import { formatDateTime, getIntensityColor } from '../../utils/helpers';
import { EMOTION_OPTIONS } from '../../utils/constants';
import type { RootStackParamList, EmotionalLogEntry } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function EmotionalLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { entries, loadEntries, getEntriesForDays } = useEmotionalLogStore();
  const [filterDays, setFilterDays] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = filterDays
    ? getEntriesForDays(filterDays)
    : entries;

  const getEmotionLabel = (emotion: string) => {
    return EMOTION_OPTIONS.find((e) => e.value === emotion)?.emoji || '😐';
  };

  const renderEntry = ({ item }: { item: EmotionalLogEntry }) => (
    <Card
      style={styles.entryCard}
      onPress={() =>
        navigation.navigate('EmotionalLogDetail', { entryId: item.id })
      }
    >
      <View style={styles.entryHeader}>
        <View style={styles.emotionContainer}>
          <Text style={styles.emotionEmoji}>{getEmotionLabel(item.emotion)}</Text>
          <View>
            <Text style={styles.emotionLabel}>
              {EMOTION_OPTIONS.find((e) => e.value === item.emotion)?.label}
            </Text>
            <Text style={styles.entryDate}>{formatDateTime(item.createdAt)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.intensityBadge,
            { backgroundColor: getIntensityColor(item.cravingIntensity) },
          ]}
        >
          <Text style={styles.intensityText}>{item.cravingIntensity}</Text>
        </View>
      </View>
      {item.note && (
        <Text style={styles.noteText} numberOfLines={2}>
          {item.note}
        </Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Filter chips */}
      <View style={styles.filterContainer}>
        <Chip
          label="All"
          selected={filterDays === null}
          onPress={() => setFilterDays(null)}
        />
        <Chip
          label="7 days"
          selected={filterDays === 7}
          onPress={() => setFilterDays(7)}
        />
        <Chip
          label="30 days"
          selected={filterDays === 30}
          onPress={() => setFilterDays(30)}
        />
        <Chip
          label="90 days"
          selected={filterDays === 90}
          onPress={() => setFilterDays(90)}
        />
      </View>

      {/* Stats button */}
      {entries.length > 0 && (
        <Pressable
          style={styles.statsButton}
          onPress={() => navigation.navigate('Stats', { type: 'emotional' })}
        >
          <Text style={styles.statsButtonText}>📊 View Statistics</Text>
        </Pressable>
      )}

      {/* Entry list */}
      <FlatList
        data={filteredEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntry}
        contentContainerStyle={[
          styles.listContent,
          filteredEntries.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="💭"
            title="No Journal Entries Yet"
            message="Start tracking your emotions and cravings to understand your patterns better."
            actionLabel="Add First Entry"
            onAction={() =>
              navigation.navigate('EmotionalLogDetail', { entryId: undefined })
            }
          />
        }
      />

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() =>
          navigation.navigate('EmotionalLogDetail', { entryId: undefined })
        }
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
    backgroundColor: colors.primaryFaded,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  statsButtonText: {
    ...typography.bodyMedium,
    color: colors.primaryDark,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
  },
  entryCard: {
    marginBottom: spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emotionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emotionEmoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  emotionLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  entryDate: {
    ...typography.small,
    color: colors.textSecondary,
  },
  intensityBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityText: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  noteText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  fabIcon: {
    fontSize: 32,
    color: colors.textOnPrimary,
    marginTop: -2,
  },
});
