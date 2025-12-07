import { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, FAB, useTheme, Divider } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore, useBillsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { formatCurrency, formatMonth } from '../../src/utils/format';
import { spacing, colors, borderRadius } from '../../src/theme';
import { SummaryCard, EmptyState, LoadingSpinner } from '../../src/components/common';
import { BillCard } from '../../src/components/bills';

export default function DashboardScreen() {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  
  const {
    upcomingPayments,
    overduePayments,
    monthlySummary,
    isLoadingPayments,
    loadUpcomingPayments,
    loadOverduePayments,
    loadMonthlySummary,
    markPaymentAsPaid,
    markPaymentAsUnpaid,
    refreshAll,
  } = useBillsStore();

  const loadData = useCallback(async () => {
    if (!user) return;
    
    const now = new Date();
    await Promise.all([
      loadUpcomingPayments(user.id),
      loadOverduePayments(user.id),
      loadMonthlySummary(user.id, now.getFullYear(), now.getMonth() + 1),
    ]);
  }, [user, loadUpcomingPayments, loadOverduePayments, loadMonthlySummary]);

  // Load on focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleTogglePaid = async (paymentId: string, isPaid: boolean) => {
    if (isPaid) {
      await markPaymentAsPaid(paymentId);
    } else {
      await markPaymentAsUnpaid(paymentId);
    }
    loadData();
  };

  const handlePaymentPress = (paymentId: string) => {
    router.push(`/bill/${paymentId}`);
  };

  const currentMonth = formatMonth(new Date().getMonth());

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingPayments}
            onRefresh={loadData}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Monthly Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {currentMonth} {new Date().getFullYear()}
          </Text>
          
          <View style={styles.summaryCards}>
            <SummaryCard
              title={t('dashboard.total')}
              value={formatCurrency(monthlySummary?.total || 0)}
              subtitle={`${monthlySummary?.count || 0} сметки`}
              color={theme.colors.primary}
              style={styles.summaryCard}
            />
            <SummaryCard
              title={t('dashboard.paid')}
              value={formatCurrency(monthlySummary?.paid || 0)}
              subtitle={`${monthlySummary?.paidCount || 0} платени`}
              color={colors.success}
              style={styles.summaryCard}
            />
            <SummaryCard
              title={t('dashboard.remaining')}
              value={formatCurrency(monthlySummary?.remaining || 0)}
              color={colors.warning}
              style={styles.summaryCard}
            />
          </View>
        </View>

        <Divider style={styles.divider} />

        {/* Overdue Bills */}
        {overduePayments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.error }]}>
                {t('dashboard.overdue')}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.error }]}>
                <Text style={styles.badgeText}>{overduePayments.length}</Text>
              </View>
            </View>
            
            {overduePayments.map(payment => (
              <BillCard
                key={payment.id}
                payment={payment}
                onPress={() => handlePaymentPress(payment.id)}
                onTogglePaid={paid => handleTogglePaid(payment.id, paid)}
              />
            ))}
          </View>
        )}

        {/* Upcoming Bills */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t('dashboard.upcomingNext')}
          </Text>
          
          {isLoadingPayments && upcomingPayments.length === 0 ? (
            <LoadingSpinner />
          ) : upcomingPayments.length === 0 && overduePayments.length === 0 ? (
            <EmptyState
              icon="📋"
              title={t('empty.noBills')}
              message={t('empty.noBillsHint')}
              actionLabel={t('bills.addBill')}
              onAction={() => router.push('/bill/new')}
            />
          ) : upcomingPayments.length === 0 ? (
            <View style={[styles.emptyUpcoming, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {t('empty.noUpcoming')}
              </Text>
            </View>
          ) : (
            upcomingPayments.map(payment => (
              <BillCard
                key={payment.id}
                payment={payment}
                onPress={() => handlePaymentPress(payment.id)}
                onTogglePaid={paid => handleTogglePaid(payment.id, paid)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB for adding new bill */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => router.push('/bill/new')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  badge: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryCards: {
    gap: spacing.sm,
  },
  summaryCard: {
    marginBottom: spacing.sm,
  },
  divider: {
    marginVertical: spacing.md,
  },
  emptyUpcoming: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
  },
});
