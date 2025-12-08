// ===================================
// Unbond - Interaction Log Screen
// ===================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { colors, spacing, typography, borderRadius, shadows } from '../../utils/theme';
import { Card, EmptyState, Chip } from '../../components';
import { useInteractionLogStore, useSettingsStore } from '../../store';
import { formatDateTime } from '../../utils/helpers';
import { INTERACTION_TYPE_OPTIONS, RED_FLAG_OPTIONS } from '../../utils/constants';
import type { RootStackParamList, InteractionLogEntry } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function InteractionLogScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { entries, loadEntries, getEntriesForDays, getStats } =
    useInteractionLogStore();
  const { updateSettings } = useSettingsStore();
  const [filterDays, setFilterDays] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = filterDays
    ? getEntriesForDays(filterDays)
    : entries;

  const stats = getStats(filterDays || 30);

  const getTypeIcon = (type: string) => {
    return INTERACTION_TYPE_OPTIONS.find((t) => t.value === type)?.icon || '📌';
  };

  const handleLogInteraction = () => {
    navigation.navigate('InteractionDetail', { entryId: undefined });
  };

  const renderEntry = ({ item }: { item: InteractionLogEntry }) => (
    <Card
      style={styles.entryCard}
      onPress={() =>
        navigation.navigate('InteractionDetail', { entryId: item.id })
      }
    >
      <View style={styles.entryHeader}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.interactionType)}</Text>
          <View>
            <Text style={styles.typeLabel}>
              {INTERACTION_TYPE_OPTIONS.find((t) => t.value === item.interactionType)
                ?.label}
            </Text>
            <Text style={styles.entryDate}>{formatDateTime(item.createdAt)}</Text>
          </View>
        </View>
        <View
          style={[
            styles.initiatorBadge,
            item.initiatedBy === 'me'
              ? styles.initiatorMe
              : styles.initiatorThem,
          ]}
        >
          <Text style={styles.initiatorText}>
            {item.initiatedBy === 'me' ? 'You' : 'Them'}
          </Text>
        </View>
      </View>

      {/* Feelings summary */}
      <View style={styles.feelingsRow}>
        <View style={styles.feelingItem}>
          <Text style={styles.feelingLabel}>Before</Text>
          <Text style={styles.feelingValue}>{item.feelingBefore}/10</Text>
        </View>
        <Text style={styles.feelingArrow}>→</Text>
        <View style={styles.feelingItem}>
          <Text style={styles.feelingLabel}>During</Text>
          <Text style={styles.feelingValue}>{item.feelingDuring}/10</Text>
        </View>
        <Text style={styles.feelingArrow}>→</Text>
        <View style={styles.feelingItem}>
          <Text style={styles.feelingLabel}>After</Text>
          <Text style={styles.feelingValue}>{item.feelingAfter}/10</Text>
        </View>
      </View>

      {/* Red flags */}
      {item.redFlags.length > 0 && (
        <View style={styles.redFlagsContainer}>
          <Text style={styles.redFlagsIcon}>🚩</Text>
          <Text style={styles.redFlagsText}>
            {item.redFlags.length} red flag{item.redFlags.length > 1 ? 's' : ''}{' '}
            observed
          </Text>
        </View>
      )}

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

      {/* Quick stats */}
      {entries.length > 0 && (
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.totalInteractions}</Text>
            <Text style={styles.quickStatLabel}>Total</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {stats.percentInitiatedByMe}%
            </Text>
            <Text style={styles.quickStatLabel}>You Initiated</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {stats.mostCommonRedFlags[0]?.count || 0}
            </Text>
            <Text style={styles.quickStatLabel}>Red Flags</Text>
          </View>
        </View>
      )}

      {/* Stats button */}
      {entries.length > 0 && (
        <Pressable
          style={styles.statsButton}
          onPress={() => navigation.navigate('Stats', { type: 'interaction' })}
        >
          <Text style={styles.statsButtonText}>📊 View Detailed Statistics</Text>
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
            icon="📝"
            title="No Interactions Logged"
            message="Logging interactions helps you see patterns and understand the impact of contact."
            actionLabel="Log Interaction"
            onAction={handleLogInteraction}
          />
        }
      />

      {/* FAB */}
      <Pressable style={styles.fab} onPress={handleLogInteraction}>
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
  quickStats: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatValue: {
    ...typography.heading2,
    color: colors.primary,
  },
  quickStatLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  quickStatDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
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
    marginBottom: spacing.sm,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  typeLabel: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  entryDate: {
    ...typography.small,
    color: colors.textSecondary,
  },
  initiatorBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  initiatorMe: {
    backgroundColor: colors.warningLight,
  },
  initiatorThem: {
    backgroundColor: colors.surfaceSecondary,
  },
  initiatorText: {
    ...typography.small,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  feelingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  feelingItem: {
    alignItems: 'center',
  },
  feelingLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
  feelingValue: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  feelingArrow: {
    color: colors.textLight,
    fontSize: 16,
  },
  redFlagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.errorLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  redFlagsIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  redFlagsText: {
    ...typography.caption,
    color: colors.error,
  },
  noteText: {
    ...typography.body,
    color: colors.textSecondary,
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
