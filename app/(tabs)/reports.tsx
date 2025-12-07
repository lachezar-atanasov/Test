import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Share } from 'react-native';
import { Text, useTheme, SegmentedButtons, Button, Surface, Divider } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useAuthStore, useBillsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { formatCurrency, formatMonth, formatPercentage } from '../../src/utils/format';
import {
  calculateSummary,
  groupByCategory,
  calculateMonthlyTrends,
  generateCSVExport,
} from '../../src/domain/analytics';
import { spacing, colors, borderRadius } from '../../src/theme';
import { LoadingSpinner, EmptyState } from '../../src/components/common';

type PeriodType = 'this_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'this_year';
type GroupByType = 'category' | 'provider';

export default function ReportsScreen() {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  const { allPayments, categories, isLoadingPayments, loadAllPayments, loadCategories } =
    useBillsStore();

  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [groupBy, setGroupBy] = useState<GroupByType>('category');
  const [refreshing, setRefreshing] = useState(false);

  const getDateRange = useCallback(() => {
    const now = new Date();
    let start: Date;
    const end = endOfMonth(now);

    switch (period) {
      case 'this_month':
        start = startOfMonth(now);
        break;
      case 'last_month':
        start = startOfMonth(subMonths(now, 1));
        break;
      case 'last_3_months':
        start = startOfMonth(subMonths(now, 2));
        break;
      case 'last_6_months':
        start = startOfMonth(subMonths(now, 5));
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = startOfMonth(now);
    }

    return {
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    };
  }, [period]);

  const loadData = useCallback(async () => {
    if (!user) return;
    const { startDate, endDate } = getDateRange();
    await Promise.all([
      loadAllPayments(user.id, { startDate, endDate }),
      loadCategories(user.id),
    ]);
  }, [user, getDateRange, loadAllPayments, loadCategories]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Calculate analytics
  const summary = useMemo(() => calculateSummary(allPayments), [allPayments]);
  const categoryBreakdown = useMemo(
    () => groupByCategory(allPayments, categories),
    [allPayments, categories]
  );
  const monthlyTrends = useMemo(
    () =>
      calculateMonthlyTrends(
        allPayments,
        period === 'last_6_months' ? 6 : period === 'last_3_months' ? 3 : 1
      ),
    [allPayments, period]
  );

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const csvContent = generateCSVExport(allPayments, categories);
      const fileName = `bg-bills-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      const file = new File(Paths.cache, fileName);
      
      await file.write(csvContent);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: t('reports.exportCSV'),
        });
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const periodOptions = [
    { value: 'this_month', label: t('reports.thisMonth') },
    { value: 'last_month', label: t('reports.lastMonth') },
    { value: 'last_3_months', label: '3 мес.' },
    { value: 'last_6_months', label: '6 мес.' },
  ];

  if (isLoadingPayments && allPayments.length === 0) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          <SegmentedButtons
            value={period}
            onValueChange={value => setPeriod(value as PeriodType)}
            buttons={periodOptions}
          />
        </View>

        {allPayments.length === 0 ? (
          <EmptyState icon="📊" title={t('reports.noData')} message="Добави сметки за да видиш отчети" />
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summarySection}>
              <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <Text style={[styles.summaryLabel, { color: theme.colors.onSurfaceVariant }]}>
                  {t('reports.totalSpent')}
                </Text>
                <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {formatCurrency(summary.totalPaid)}
                </Text>
                <Text style={[styles.summarySubtext, { color: theme.colors.onSurfaceVariant }]}>
                  от {formatCurrency(summary.totalAmount)} общо
                </Text>
              </Surface>

              <View style={styles.summaryRow}>
                <Surface style={[styles.summaryCardSmall, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Text style={[styles.summaryLabelSmall, { color: theme.colors.onSurfaceVariant }]}>
                    {t('reports.billCount')}
                  </Text>
                  <Text style={[styles.summaryValueSmall, { color: theme.colors.onSurface }]}>
                    {summary.billCount}
                  </Text>
                </Surface>

                <Surface style={[styles.summaryCardSmall, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Text style={[styles.summaryLabelSmall, { color: theme.colors.onSurfaceVariant }]}>
                    Платени
                  </Text>
                  <Text style={[styles.summaryValueSmall, { color: colors.success }]}>
                    {summary.paidCount}
                  </Text>
                </Surface>

                <Surface style={[styles.summaryCardSmall, { backgroundColor: theme.colors.surface }]} elevation={1}>
                  <Text style={[styles.summaryLabelSmall, { color: theme.colors.onSurfaceVariant }]}>
                    Просрочени
                  </Text>
                  <Text style={[styles.summaryValueSmall, { color: colors.error }]}>
                    {summary.overdueCount}
                  </Text>
                </Surface>
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Category Breakdown */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                {t('reports.byCategory')}
              </Text>

              {categoryBreakdown.map(item => (
                <View key={item.categoryId} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryDot, { backgroundColor: item.categoryColor }]} />
                    <Text style={[styles.categoryName, { color: theme.colors.onSurface }]}>
                      {item.categoryName}
                    </Text>
                  </View>
                  <View style={styles.categoryValues}>
                    <Text style={[styles.categoryAmount, { color: theme.colors.onSurface }]}>
                      {formatCurrency(item.total)}
                    </Text>
                    <Text style={[styles.categoryPercent, { color: theme.colors.onSurfaceVariant }]}>
                      {formatPercentage(item.percentage)}
                    </Text>
                  </View>
                </View>
              ))}

              {/* Simple Progress Bars */}
              <View style={styles.chartContainer}>
                {categoryBreakdown.slice(0, 5).map(item => (
                  <View key={item.categoryId} style={styles.barRow}>
                    <View style={styles.barLabel}>
                      <Text style={[styles.barLabelText, { color: theme.colors.onSurfaceVariant }]}>
                        {item.categoryName}
                      </Text>
                    </View>
                    <View style={[styles.barBackground, { backgroundColor: theme.colors.surfaceVariant }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            backgroundColor: item.categoryColor,
                            width: `${Math.min(item.percentage, 100)}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <Divider style={styles.divider} />

            {/* Export Button */}
            <Button
              mode="outlined"
              onPress={handleExportCSV}
              icon="download"
              style={styles.exportButton}
            >
              {t('reports.exportCSV')}
            </Button>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 32,
  },
  periodSelector: {
    marginBottom: spacing.lg,
  },
  summarySection: {
    marginBottom: spacing.lg,
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    marginVertical: spacing.xs,
  },
  summarySubtext: {
    fontSize: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCardSmall: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  summaryLabelSmall: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  summaryValueSmall: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  categoryName: {
    fontSize: 14,
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryPercent: {
    fontSize: 12,
  },
  chartContainer: {
    marginTop: spacing.lg,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  barLabel: {
    width: 80,
  },
  barLabelText: {
    fontSize: 12,
  },
  barBackground: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  exportButton: {
    marginTop: spacing.md,
  },
});
