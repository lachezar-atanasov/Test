import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAppStore } from '../store/useAppStore';
import { theme } from '../utils/theme';
import { Card } from '../components/Card';

const screenWidth = Dimensions.get('window').width;

export const CravingDetailScreen: React.FC = () => {
  const { emotionalLogs } = useAppStore();

  const chartData = useMemo(() => {
    const sorted = [...emotionalLogs]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-30); // Last 30 entries

    if (sorted.length === 0) return null;

    const labels = sorted.map((_, i) => {
      if (sorted.length <= 7) return new Date(sorted[i].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (i % Math.ceil(sorted.length / 7) === 0 || i === sorted.length - 1) {
        return new Date(sorted[i].timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return '';
    });

    const data = sorted.map((log) => log.intensity);

    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(107, 155, 210, ${opacity})`,
          strokeWidth: 2,
        },
      ],
    };
  }, [emotionalLogs]);

  const stats = useMemo(() => {
    if (emotionalLogs.length === 0) return null;

    const intensities = emotionalLogs.map((log) => log.intensity);
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    const max = Math.max(...intensities);
    const min = Math.min(...intensities);

    const last7Days = emotionalLogs.filter(
      (log) => Date.now() - new Date(log.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    );
    const recentAvg =
      last7Days.length > 0
        ? last7Days.reduce((sum, log) => sum + log.intensity, 0) / last7Days.length
        : null;

    return { avg: Math.round(avg * 10) / 10, max, min, recentAvg: recentAvg ? Math.round(recentAvg * 10) / 10 : null };
  }, [emotionalLogs]);

  if (emotionalLogs.length === 0) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card>
          <Text style={styles.emptyText}>
            No data yet. Start logging your cravings to see patterns over time.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {chartData && (
        <Card>
          <Text style={styles.chartTitle}>Craving Intensity Over Time</Text>
          <Text style={styles.chartSubtitle}>Last 30 entries</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={{
              backgroundColor: theme.colors.surface,
              backgroundGradientFrom: theme.colors.surface,
              backgroundGradientTo: theme.colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(107, 155, 210, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: theme.colors.primary,
              },
            }}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </Card>
      )}

      {stats && (
        <View style={styles.stats}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.avg}</Text>
            <Text style={styles.statLabel}>Average Intensity</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.max}</Text>
            <Text style={styles.statLabel}>Highest</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.min}</Text>
            <Text style={styles.statLabel}>Lowest</Text>
          </Card>
          {stats.recentAvg !== null && (
            <Card style={styles.statCard}>
              <Text style={styles.statValue}>{stats.recentAvg}</Text>
              <Text style={styles.statLabel}>Last 7 Days Avg</Text>
            </Card>
          )}
        </View>
      )}
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
  chartTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  chartSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
});
