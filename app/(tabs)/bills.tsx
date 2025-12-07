import { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Searchbar, Chip, FAB, useTheme, SegmentedButtons } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore, useBillsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { spacing, colors } from '../../src/theme';
import { EmptyState, LoadingSpinner } from '../../src/components/common';
import { BillCard } from '../../src/components/bills';
import type { BillPaymentWithRelations } from '../../src/types/database';

type FilterType = 'all' | 'upcoming' | 'paid' | 'overdue';

export default function BillsScreen() {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  
  const {
    allPayments,
    isLoadingPayments,
    loadAllPayments,
    markPaymentAsPaid,
    markPaymentAsUnpaid,
  } = useBillsStore();

  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    await loadAllPayments(user.id);
  }, [user, loadAllPayments]);

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

  const handleTogglePaid = async (paymentId: string, isPaid: boolean) => {
    if (isPaid) {
      await markPaymentAsPaid(paymentId);
    } else {
      await markPaymentAsUnpaid(paymentId);
    }
    loadData();
  };

  // Filter and search payments
  const filteredPayments = allPayments
    .filter(payment => {
      // Filter by status
      switch (filter) {
        case 'upcoming':
          return !payment.is_paid && !payment.is_overdue;
        case 'paid':
          return payment.is_paid;
        case 'overdue':
          return payment.is_overdue && !payment.is_paid;
        default:
          return true;
      }
    })
    .filter(payment => {
      // Filter by search
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        payment.title.toLowerCase().includes(query) ||
        payment.category?.name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      // Sort by due date
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const renderItem = ({ item }: { item: BillPaymentWithRelations }) => (
    <BillCard
      payment={item}
      onPress={() => router.push(`/bill/${item.id}`)}
      onTogglePaid={paid => handleTogglePaid(item.id, paid)}
    />
  );

  const filterOptions = [
    { value: 'all', label: t('bills.allBills') },
    { value: 'upcoming', label: t('bills.upcoming') },
    { value: 'paid', label: t('bills.paidBills') },
    { value: 'overdue', label: t('bills.overdueBills') },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      {/* Search and Filter */}
      <View style={styles.header}>
        <Searchbar
          placeholder={t('common.search')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <View style={styles.filterContainer}>
          <FlatList
            horizontal
            data={filterOptions}
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.value}
            renderItem={({ item }) => (
              <Chip
                selected={filter === item.value}
                onPress={() => setFilter(item.value as FilterType)}
                style={styles.filterChip}
                showSelectedCheck={false}
                mode={filter === item.value ? 'flat' : 'outlined'}
              >
                {item.label}
              </Chip>
            )}
            contentContainerStyle={styles.filterList}
          />
        </View>
      </View>

      {/* Bills List */}
      {isLoadingPayments && allPayments.length === 0 ? (
        <LoadingSpinner fullScreen />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          icon="📋"
          title={searchQuery ? 'Няма резултати' : t('empty.noBills')}
          message={searchQuery ? 'Опитай с друга заявка' : t('empty.noBillsHint')}
          actionLabel={!searchQuery ? t('bills.addBill') : undefined}
          onAction={!searchQuery ? () => router.push('/bill/new') : undefined}
        />
      ) : (
        <FlatList
          data={filteredPayments}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* FAB */}
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
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchbar: {
    marginBottom: spacing.sm,
  },
  filterContainer: {
    marginBottom: spacing.sm,
  },
  filterList: {
    gap: spacing.xs,
  },
  filterChip: {
    marginRight: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.lg,
  },
});
