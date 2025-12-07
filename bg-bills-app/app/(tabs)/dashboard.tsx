import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { getBillPayments } from '../../src/api/bills';
import { BillPayment } from '../../src/types/database';
import { t } from '../../src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [upcomingBills, setUpcomingBills] = useState<BillPayment[]>([]);
  const [overdueBills, setOverdueBills] = useState<BillPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const next14Days = new Date();
      next14Days.setDate(today.getDate() + 14);

      const allPayments = await getBillPayments(user.id, {
        startDate: today.toISOString().split('T')[0],
        endDate: next14Days.toISOString().split('T')[0],
      });

      const upcoming = allPayments.filter((p) => !p.is_paid && !p.is_overdue);
      const overdue = allPayments.filter((p) => p.is_overdue);

      setUpcomingBills(upcoming);
      setOverdueBills(overdue);
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBills();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadBills();
  };

  // Calculate totals for current month
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const thisMonthBills = [...upcomingBills, ...overdueBills].filter((bill) => {
    const dueDate = new Date(bill.due_date);
    return dueDate >= startOfMonth && dueDate <= endOfMonth;
  });
  
  const thisMonthTotal = thisMonthBills.reduce((sum, bill) => sum + Number(bill.amount), 0);
  const paidTotal = thisMonthBills.filter((b) => b.is_paid).reduce((sum, bill) => sum + Number(bill.amount), 0);
  const remainingTotal = thisMonthTotal - paidTotal;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <View style={styles.summaryCards}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('dashboard.thisMonth')}</Text>
            <Text style={styles.cardValue}>{thisMonthTotal.toFixed(2)} лв</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('dashboard.paid')}</Text>
            <Text style={[styles.cardValue, styles.paidValue]}>{paidTotal.toFixed(2)} лв</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>{t('dashboard.remaining')}</Text>
            <Text style={[styles.cardValue, styles.remainingValue]}>
              {remainingTotal.toFixed(2)} лв
            </Text>
          </View>
        </View>

        {overdueBills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('dashboard.overdue')}</Text>
            {overdueBills.map((bill) => (
              <BillItem key={bill.id} bill={bill} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('dashboard.upcoming')}</Text>
          {upcomingBills.length === 0 ? (
            <Text style={styles.emptyText}>{t('empty.bills')}</Text>
          ) : (
            upcomingBills.slice(0, 10).map((bill) => <BillItem key={bill.id} bill={bill} />)
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function BillItem({ bill }: { bill: BillPayment }) {
  const dueDate = new Date(bill.due_date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <TouchableOpacity
      style={[styles.billItem, bill.is_overdue && styles.overdueBill]}
      onPress={() => router.push(`/bills/${bill.id}`)}
    >
      <View style={styles.billContent}>
        <Text style={styles.billTitle}>{bill.title}</Text>
        <Text style={styles.billDate}>
          {dueDate.toLocaleDateString('bg-BG')} ({daysUntilDue > 0 ? `след ${daysUntilDue} дни` : 'днес'})
        </Text>
      </View>
      <View style={styles.billAmountContainer}>
        <Text style={[styles.billAmount, bill.is_overdue && styles.overdueAmount]}>
          {Number(bill.amount).toFixed(2)} лв
        </Text>
        {bill.is_paid ? (
          <Ionicons name="checkmark-circle" size={24} color="#4ECDC4" />
        ) : (
          <Ionicons name="ellipse-outline" size={24} color="#999" />
        )}
      </View>
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
  content: {
    padding: 16,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  paidValue: {
    color: '#4ECDC4',
  },
  remainingValue: {
    color: '#FF6B6B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    padding: 32,
  },
});
