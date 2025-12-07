import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { getBillPayments } from '../../src/api/bills';
import { BillPayment } from '../../src/types/database';
import { t } from '../../src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';

type FilterType = 'all' | 'upcoming' | 'paid' | 'overdue';

export default function BillsScreen() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<BillPayment[]>([]);
  const [filteredBills, setFilteredBills] = useState<BillPayment[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = async () => {
    if (!user) return;

    try {
      const allPayments = await getBillPayments(user.id);
      setBills(allPayments);
      applyFilter(allPayments, filter);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilter = (billsList: BillPayment[], filterType: FilterType) => {
    let filtered: BillPayment[];

    switch (filterType) {
      case 'upcoming':
        filtered = billsList.filter((b) => !b.is_paid && !b.is_overdue);
        break;
      case 'paid':
        filtered = billsList.filter((b) => b.is_paid);
        break;
      case 'overdue':
        filtered = billsList.filter((b) => b.is_overdue);
        break;
      default:
        filtered = billsList;
    }

    setFilteredBills(filtered);
  };

  useEffect(() => {
    loadBills();
  }, [user]);

  useEffect(() => {
    applyFilter(bills, filter);
  }, [filter, bills]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBills();
  };

  const renderBillItem = ({ item }: { item: BillPayment }) => {
    const dueDate = new Date(item.due_date);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <TouchableOpacity
        style={[styles.billItem, item.is_overdue && styles.overdueBill]}
        onPress={() => router.push(`/bills/${item.id}`)}
      >
        <View style={styles.billContent}>
          <Text style={styles.billTitle}>{item.title}</Text>
          <Text style={styles.billDate}>
            {dueDate.toLocaleDateString('bg-BG')}
            {daysUntilDue >= 0 && ` (${daysUntilDue === 0 ? 'днес' : `след ${daysUntilDue} дни`})`}
          </Text>
        </View>
        <View style={styles.billAmountContainer}>
          <Text style={[styles.billAmount, item.is_overdue && styles.overdueAmount]}>
            {Number(item.amount).toFixed(2)} лв
          </Text>
          {item.is_paid ? (
            <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
          ) : (
            <Ionicons name="ellipse-outline" size={24} color="#999" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <FilterButton
          title={t('bills.all')}
          active={filter === 'all'}
          onPress={() => setFilter('all')}
        />
        <FilterButton
          title={t('bills.upcoming')}
          active={filter === 'upcoming'}
          onPress={() => setFilter('upcoming')}
        />
        <FilterButton
          title={t('bills.paid')}
          active={filter === 'paid'}
          onPress={() => setFilter('paid')}
        />
        <FilterButton
          title={t('bills.overdue')}
          active={filter === 'overdue'}
          onPress={() => setFilter('overdue')}
        />
      </View>

      <FlatList
        data={filteredBills}
        renderItem={renderBillItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('empty.bills')}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/bills/add')}
            >
              <Ionicons name="add-circle" size={24} color="#4A90E2" />
              <Text style={styles.addButtonText}>{t('bills.add')}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/bills/add')}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function FilterButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.filterButton, active && styles.filterButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#4A90E2',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  billItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  overdueBill: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  billContent: {
    flex: 1,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  billDate: {
    fontSize: 14,
    color: '#666',
  },
  billAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  billAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  overdueAmount: {
    color: '#FF6B6B',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  addButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
