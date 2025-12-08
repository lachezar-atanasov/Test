// ===================================
// Unbond - Statistics Screen
// ===================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';

import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { Card, Chip, ScreenWrapper } from '../../components';
import { useEmotionalLogStore, useInteractionLogStore } from '../../store';
import { EMOTION_OPTIONS, RED_FLAG_OPTIONS } from '../../utils/constants';
import { getIntensityColor } from '../../utils/helpers';
import type { RootStackParamList } from '../../types';

type RouteProps = RouteProp<RootStackParamList, 'Stats'>;

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - spacing.md * 4;
const CHART_HEIGHT = 200;
const CHART_PADDING = 40;

export function StatsScreen() {
  const route = useRoute<RouteProps>();
  const { type } = route.params;

  const [filterDays, setFilterDays] = useState(30);

  const {
    getEntriesForDays,
    getAverageCravingIntensity,
    getMostCommonEmotion,
    getCravingTrend,
  } = useEmotionalLogStore();

  const { getStats, getInteractionsPerWeek } = useInteractionLogStore();

  if (type === 'emotional') {
    const entries = getEntriesForDays(filterDays);
    const avgIntensity = getAverageCravingIntensity(filterDays);
    const mostCommonEmotion = getMostCommonEmotion(filterDays);
    const cravingTrend = getCravingTrend(filterDays);

    // Count emotions
    const emotionCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    const emotionChartData = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        label: EMOTION_OPTIONS.find((e) => e.value === emotion)?.label || emotion,
        emoji: EMOTION_OPTIONS.find((e) => e.value === emotion)?.emoji || '😐',
      }))
      .sort((a, b) => b.count - a.count);

    // Render simple bar chart for craving trend
    const renderCravingChart = () => {
      if (cravingTrend.length === 0) return null;

      const maxValue = 10;
      const barWidth =
        (CHART_WIDTH - CHART_PADDING) / Math.max(cravingTrend.length, 1);

      return (
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          {/* Y axis labels */}
          <SvgText
            x={5}
            y={CHART_PADDING}
            fill={colors.textSecondary}
            fontSize={10}
          >
            10
          </SvgText>
          <SvgText
            x={5}
            y={CHART_HEIGHT - 20}
            fill={colors.textSecondary}
            fontSize={10}
          >
            1
          </SvgText>

          {/* Bars */}
          <G x={CHART_PADDING}>
            {cravingTrend.map((item, index) => {
              const barHeight =
                (item.intensity / maxValue) * (CHART_HEIGHT - CHART_PADDING - 20);
              return (
                <Rect
                  key={item.date}
                  x={index * barWidth + 2}
                  y={CHART_HEIGHT - 20 - barHeight}
                  width={barWidth - 4}
                  height={barHeight}
                  fill={getIntensityColor(Math.round(item.intensity))}
                  rx={4}
                />
              );
            })}
          </G>

          {/* X axis line */}
          <Line
            x1={CHART_PADDING}
            y1={CHART_HEIGHT - 20}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT - 20}
            stroke={colors.border}
            strokeWidth={1}
          />
        </Svg>
      );
    };

    return (
      <ScreenWrapper>
        {/* Filter */}
        <View style={styles.filterRow}>
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

        {/* Summary stats */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{entries.length}</Text>
            <Text style={styles.summaryLabel}>Entries</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {avgIntensity.toFixed(1)}
            </Text>
            <Text style={styles.summaryLabel}>Avg Intensity</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryEmoji}>
              {EMOTION_OPTIONS.find((e) => e.value === mostCommonEmotion)
                ?.emoji || '—'}
            </Text>
            <Text style={styles.summaryLabel}>Most Common</Text>
          </Card>
        </View>

        {/* Craving Trend Chart */}
        {cravingTrend.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Craving Intensity Over Time</Text>
            <Card style={styles.chartCard}>
              {renderCravingChart()}
              <Text style={styles.chartCaption}>
                Daily average craving intensity
              </Text>
            </Card>
          </>
        )}

        {/* Emotion breakdown */}
        {emotionChartData.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Emotions Breakdown</Text>
            <Card>
              {emotionChartData.map((item) => (
                <View key={item.emotion} style={styles.emotionRow}>
                  <Text style={styles.emotionEmoji}>{item.emoji}</Text>
                  <Text style={styles.emotionLabel}>{item.label}</Text>
                  <View style={styles.emotionBarContainer}>
                    <View
                      style={[
                        styles.emotionBar,
                        {
                          width: `${(item.count / entries.length) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.emotionCount}>{item.count}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* Insight */}
        <Card style={styles.insightCard}>
          <Text style={styles.insightIcon}>💡</Text>
          <Text style={styles.insightText}>
            {avgIntensity > 6
              ? 'Your average craving intensity is high. Consider using grounding tools more frequently and reaching out to support.'
              : avgIntensity > 4
              ? 'Your cravings are moderate. Keep tracking and using your coping strategies. You\'re doing well.'
              : 'Your craving intensity is manageable. Great progress! Keep maintaining your boundaries.'}
          </Text>
        </Card>
      </ScreenWrapper>
    );
  }

  // Interaction stats
  const stats = getStats(filterDays);
  const weeklyData = getInteractionsPerWeek(Math.ceil(filterDays / 7));

  return (
    <ScreenWrapper>
      {/* Filter */}
      <View style={styles.filterRow}>
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

      {/* Summary stats */}
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{stats.totalInteractions}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {stats.percentInitiatedByMe}%
          </Text>
          <Text style={styles.summaryLabel}>You Initiated</Text>
        </Card>
      </View>

      {/* Initiator breakdown */}
      {stats.totalInteractions > 0 && (
        <>
          <Text style={styles.sectionTitle}>Who Initiated</Text>
          <Card>
            <View style={styles.initiatorRow}>
              <Text style={styles.initiatorLabel}>You</Text>
              <View style={styles.initiatorBarContainer}>
                <View
                  style={[
                    styles.initiatorBarYou,
                    { width: `${stats.percentInitiatedByMe}%` },
                  ]}
                />
              </View>
              <Text style={styles.initiatorCount}>{stats.initiatedByMe}</Text>
            </View>
            <View style={styles.initiatorRow}>
              <Text style={styles.initiatorLabel}>Them</Text>
              <View style={styles.initiatorBarContainer}>
                <View
                  style={[
                    styles.initiatorBarThem,
                    { width: `${100 - stats.percentInitiatedByMe}%` },
                  ]}
                />
              </View>
              <Text style={styles.initiatorCount}>{stats.initiatedByThem}</Text>
            </View>
          </Card>
        </>
      )}

      {/* Red flags */}
      {stats.mostCommonRedFlags.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>🚩 Most Common Red Flags</Text>
          <Card>
            {stats.mostCommonRedFlags.map((item) => (
              <View key={item.flag} style={styles.redFlagRow}>
                <Text style={styles.redFlagLabel}>
                  {RED_FLAG_OPTIONS.find((r) => r.value === item.flag)?.label ||
                    item.flag}
                </Text>
                <Text style={styles.redFlagCount}>{item.count}</Text>
              </View>
            ))}
          </Card>
        </>
      )}

      {/* Feeling change */}
      {stats.totalInteractions > 0 && (
        <>
          <Text style={styles.sectionTitle}>How Interactions Affect You</Text>
          <Card style={styles.feelingCard}>
            <View style={styles.feelingComparison}>
              <View style={styles.feelingItem}>
                <Text style={styles.feelingValue}>
                  {stats.averageFeelingBefore}/10
                </Text>
                <Text style={styles.feelingLabel}>Before</Text>
              </View>
              <Text style={styles.feelingArrow}>→</Text>
              <View style={styles.feelingItem}>
                <Text style={styles.feelingValue}>
                  {stats.averageFeelingAfter}/10
                </Text>
                <Text style={styles.feelingLabel}>After</Text>
              </View>
            </View>
            <Text style={styles.feelingInsight}>
              {stats.averageFeelingAfter < stats.averageFeelingBefore
                ? '📉 On average, you feel worse after interactions.'
                : stats.averageFeelingAfter > stats.averageFeelingBefore
                ? '📈 On average, you feel better after interactions.'
                : '➡️ Your feelings tend to stay about the same.'}
            </Text>
          </Card>
        </>
      )}

      {/* Insight */}
      <Card style={styles.insightCard}>
        <Text style={styles.insightIcon}>💡</Text>
        <Text style={styles.insightText}>
          {stats.percentInitiatedByMe > 50
            ? 'You\'re initiating most contacts. Consider whether each interaction aligns with your goals and boundaries.'
            : 'Most contact is initiated by them. This is common in these dynamics. Focus on how you respond.'}
        </Text>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
  },
  summaryValue: {
    ...typography.heading1,
    color: colors.primary,
  },
  summaryEmoji: {
    fontSize: 32,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  chartCard: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  chartCaption: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emotionEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  emotionLabel: {
    ...typography.body,
    color: colors.textPrimary,
    width: 80,
  },
  emotionBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  emotionBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  emotionCount: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  initiatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  initiatorLabel: {
    ...typography.body,
    color: colors.textPrimary,
    width: 50,
  },
  initiatorBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  initiatorBarYou: {
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: borderRadius.full,
  },
  initiatorBarThem: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  initiatorCount: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  redFlagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  redFlagLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  redFlagCount: {
    ...typography.bodyMedium,
    color: colors.error,
  },
  feelingCard: {
    marginBottom: spacing.lg,
  },
  feelingComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  feelingItem: {
    alignItems: 'center',
    padding: spacing.md,
  },
  feelingValue: {
    ...typography.heading2,
    color: colors.primary,
  },
  feelingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  feelingArrow: {
    fontSize: 24,
    color: colors.textLight,
    marginHorizontal: spacing.md,
  },
  feelingInsight: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryFaded,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  insightText: {
    ...typography.body,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 22,
  },
});
