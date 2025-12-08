// ===================================
// Unbond - Mood Chart Component
// ===================================
// A simple visual representation of mood over time

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../utils/theme';
import { MOOD_EMOJIS } from '../utils/constants';

interface MoodChartProps {
  data: Array<{ date: string; mood: number | null }>;
  showLabels?: boolean;
}

export function MoodChart({ data, showLabels = true }: MoodChartProps) {
  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  const getMoodColor = (mood: number | null) => {
    if (mood === null) return colors.surfaceSecondary;
    // Map 1-10 to color spectrum
    const hue = ((mood - 1) / 9) * 120; // 0 (red) to 120 (green)
    return `hsl(${hue}, 60%, 70%)`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartRow}>
        {data.map((item, index) => (
          <View key={index} style={styles.dayColumn}>
            <View
              style={[
                styles.moodDot,
                { backgroundColor: getMoodColor(item.mood) },
              ]}
            >
              {item.mood !== null && (
                <Text style={styles.emoji}>
                  {MOOD_EMOJIS[item.mood - 1]}
                </Text>
              )}
            </View>
            {showLabels && (
              <Text style={styles.dayLabel}>{getDayLabel(item.date)}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.sm,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  moodDot: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  emoji: {
    fontSize: 18,
  },
  dayLabel: {
    ...typography.small,
    color: colors.textSecondary,
  },
});
