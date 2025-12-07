import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import {
  Text,
  Button,
  useTheme,
  Surface,
  Divider,
  IconButton,
  Menu,
} from 'react-native-paper';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore, useBillsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { formatCurrency, formatDate, formatRelativeDate } from '../../src/utils/format';
import { getDaysUntilDue } from '../../src/domain/recurrence';
import { spacing, colors, borderRadius } from '../../src/theme';
import { LoadingSpinner } from '../../src/components/common';
import { getBillPayment } from '../../src/api/bills';
import type { BillPaymentWithRelations } from '../../src/types/database';

export default function BillDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useAuthStore(state => state.user);
  
  const { markPaymentAsPaid, markPaymentAsUnpaid, deletePayment } = useBillsStore();

  const [payment, setPayment] = useState<BillPaymentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const loadPayment = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    const data = await getBillPayment(id);
    setPayment(data);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPayment();
    }, [loadPayment])
  );

  const handleTogglePaid = async () => {
    if (!payment) return;
    
    setActionLoading(true);
    if (payment.is_paid) {
      await markPaymentAsUnpaid(payment.id);
    } else {
      await markPaymentAsPaid(payment.id);
    }
    await loadPayment();
    setActionLoading(false);
  };

  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('bills.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!payment) return;
            await deletePayment(payment.id);
            router.back();
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!payment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={() => router.back()} />
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            {t('errors.notFound')}
          </Text>
          <View style={{ width: 48 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.colors.onSurfaceVariant }}>
            Сметката не беше намерена
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysUntil = getDaysUntilDue(payment);
  const isOverdue = daysUntil < 0 && !payment.is_paid;
  const categoryColor = payment.category?.color || theme.colors.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="arrow-left" onPress={() => router.back()} />
        <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]} numberOfLines={1}>
          {payment.title}
        </Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton icon="dots-vertical" onPress={() => setMenuVisible(true)} />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              // TODO: Navigate to edit screen
              Alert.alert('Информация', 'Редактирането ще бъде добавено скоро.');
            }}
            title={t('common.edit')}
            leadingIcon="pencil"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              handleDelete();
            }}
            title={t('common.delete')}
            leadingIcon="delete"
            titleStyle={{ color: colors.error }}
          />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <Surface style={styles.statusCard} elevation={2}>
          <View style={[styles.statusIndicator, { backgroundColor: categoryColor }]} />
          
          <View style={styles.statusContent}>
            {/* Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {payment.category?.name || t('categories.other')}
              </Text>
            </View>

            {/* Amount */}
            <Text style={[styles.amount, { color: theme.colors.onSurface }]}>
              {formatCurrency(payment.amount, payment.currency)}
            </Text>

            {/* Status */}
            <View style={styles.statusRow}>
              {payment.is_paid ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.successContainer }]}>
                  <Text style={{ color: colors.success }}>✓ Платена</Text>
                </View>
              ) : isOverdue ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.errorContainer }]}>
                  <Text style={{ color: colors.error }}>
                    Просрочена с {Math.abs(daysUntil)} дни
                  </Text>
                </View>
              ) : (
                <View style={[styles.statusBadge, { backgroundColor: colors.warningContainer }]}>
                  <Text style={{ color: colors.warningDark }}>
                    {formatRelativeDate(payment.due_date)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Surface>

        {/* Details */}
        <Surface style={styles.detailsCard} elevation={1}>
          <Text style={[styles.detailsTitle, { color: theme.colors.onBackground }]}>
            Детайли
          </Text>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
              {t('billForm.dueDate')}
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
              {formatDate(payment.due_date, 'dd MMMM yyyy')}
            </Text>
          </View>

          {payment.paid_date && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Дата на плащане
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {formatDate(payment.paid_date, 'dd MMMM yyyy')}
              </Text>
            </View>
          )}

          {payment.bill_account && (
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Доставчик
              </Text>
              <Text style={[styles.detailValue, { color: theme.colors.onSurface }]}>
                {payment.bill_account.provider_name}
              </Text>
            </View>
          )}

          {payment.notes && (
            <View style={styles.notesSection}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('billForm.notes')}
              </Text>
              <Text style={[styles.notesText, { color: theme.colors.onSurface }]}>
                {payment.notes}
              </Text>
            </View>
          )}
        </Surface>

        {/* Recurring Info */}
        {payment.recurring_bill_id && (
          <Surface style={styles.detailsCard} elevation={1}>
            <Text style={[styles.detailsTitle, { color: theme.colors.onBackground }]}>
              Периодична сметка
            </Text>
            <Text style={[styles.recurringInfo, { color: theme.colors.onSurfaceVariant }]}>
              Това е част от периодична сметка. Плащанията се генерират автоматично.
            </Text>
          </Surface>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={handleTogglePaid}
          loading={actionLoading}
          disabled={actionLoading}
          style={styles.actionButton}
          buttonColor={payment.is_paid ? theme.colors.surfaceVariant : colors.success}
          textColor={payment.is_paid ? theme.colors.onSurface : '#fff'}
        >
          {payment.is_paid ? t('bills.markUnpaid') : t('bills.markPaid')}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  statusCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  statusIndicator: {
    height: 6,
  },
  statusContent: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amount: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  detailsCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: spacing.sm,
  },
  notesText: {
    fontSize: 14,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  recurringInfo: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'transparent',
  },
  actionButton: {
    borderRadius: borderRadius.md,
  },
});
