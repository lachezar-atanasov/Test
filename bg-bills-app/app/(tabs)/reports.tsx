import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { getBillPayments, getCategories, getBillAccounts } from '../../src/api/bills';
import { generateMonthlySummary, filterByDateRange } from '../../src/domain/analytics/aggregator';
import { t } from '../../src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';

type PeriodType = 'thisMonth' | 'lastMonth' | 'custom';

export default function ReportsScreen() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<PeriodType>('thisMonth');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadReport();
    }
  }, [user, period]);

  const loadReport = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const today = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (period) {
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case 'lastMonth':
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }

      const [payments, categories, accounts] = await Promise.all([
        getBillPayments(user.id),
        getCategories(user.id),
        getBillAccounts(user.id),
      ]);

      const filteredPayments = filterByDateRange(payments, startDate, endDate);
      const monthlySummary = generateMonthlySummary(filteredPayments, categories, accounts);

      setSummary(monthlySummary);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Няма данни за избрания период</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.periodSelector}>
          <PeriodButton
            title={t('reports.thisMonth')}
            active={period === 'thisMonth'}
            onPress={() => setPeriod('thisMonth')}
          />
          <PeriodButton
            title={t('reports.lastMonth')}
            active={period === 'lastMonth'}
            onPress={() => setPeriod('lastMonth')}
          />
        </View>

        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('reports.total')}</Text>
            <Text style={styles.summaryValue}>
              {(summary.totalPaid + summary.totalUpcoming).toFixed(2)} лв
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('dashboard.paid')}</Text>
            <Text style={[styles.summaryValue, styles.paidValue]}>
              {summary.totalPaid.toFixed(2)} лв
            </Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>{t('dashboard.remaining')}</Text>
            <Text style={[styles.summaryValue, styles.remainingValue]}>
              {summary.totalUpcoming.toFixed(2)} лв
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reports.byCategory')}</Text>
          {summary.byCategory.map((cat: any) => (
            <View key={cat.categoryId} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{cat.categoryName}</Text>
                <Text style={styles.categoryCount}>{cat.count} сметки</Text>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.categoryTotal}>{cat.total.toFixed(2)} лв</Text>
                <Text style={styles.categoryPercentage}>{cat.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('reports.byProvider')}</Text>
          {summary.byProvider.map((provider: any, idx: number) => (
            <View key={idx} style={styles.categoryRow}>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{provider.providerName}</Text>
                <Text style={styles.categoryCount}>{provider.count} сметки</Text>
              </View>
              <View style={styles.categoryAmount}>
                <Text style={styles.categoryTotal}>{provider.total.toFixed(2)} лв</Text>
                <Text style={styles.categoryPercentage}>{provider.percentage.toFixed(1)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function PeriodButton({
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
      style={[styles.periodButton, active && styles.periodButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.periodButtonText, active && styles.periodButtonTextActive]}>
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
  content: {
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  periodButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
  },
  periodButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
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
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  summaryValue: {
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
  categoryRow: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: '#666',
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 32,
  },
});
