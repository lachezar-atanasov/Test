import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Checkbox, useTheme, Surface } from 'react-native-paper';
import { BillPaymentWithRelations } from '../../types/database';
import { formatCurrency, formatRelativeDate, formatDate } from '../../utils/format';
import { getDaysUntilDue } from '../../domain/recurrence';
import { colors, spacing, borderRadius } from '../../theme';
import { t } from '../../i18n';

interface BillCardProps {
  payment: BillPaymentWithRelations;
  onPress?: () => void;
  onTogglePaid?: (paid: boolean) => void;
  compact?: boolean;
}

export function BillCard({ payment, onPress, onTogglePaid, compact = false }: BillCardProps) {
  const theme = useTheme();
  const daysUntil = getDaysUntilDue(payment);
  
  const isOverdue = daysUntil < 0 && !payment.is_paid;
  const isDueToday = daysUntil === 0;
  const isDueSoon = daysUntil > 0 && daysUntil <= 3;

  const getStatusColor = () => {
    if (payment.is_paid) return colors.success;
    if (isOverdue) return colors.error;
    if (isDueToday || isDueSoon) return colors.warning;
    return theme.colors.primary;
  };

  const statusColor = getStatusColor();
  const categoryColor = payment.category?.color || theme.colors.primary;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface style={[styles.container, compact && styles.containerCompact]} elevation={1}>
        <View style={styles.content}>
          <View style={styles.leftSection}>
            {/* Category indicator */}
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            
            {/* Main content */}
            <View style={styles.info}>
              <Text 
                style={[
                  styles.title, 
                  { color: theme.colors.onSurface },
                  payment.is_paid && styles.titlePaid
                ]}
                numberOfLines={1}
              >
                {payment.title}
              </Text>
              
              <View style={styles.metaRow}>
                <Text style={[styles.category, { color: theme.colors.onSurfaceVariant }]}>
                  {payment.category?.name || t('categories.other')}
                </Text>
                <Text style={[styles.separator, { color: theme.colors.outlineVariant }]}> • </Text>
                <Text style={[styles.dueDate, { color: statusColor }]}>
                  {formatRelativeDate(payment.due_date)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.rightSection}>
            <Text 
              style={[
                styles.amount, 
                { color: payment.is_paid ? colors.success : theme.colors.onSurface }
              ]}
            >
              {formatCurrency(payment.amount, payment.currency)}
            </Text>
            
            {onTogglePaid && (
              <Checkbox
                status={payment.is_paid ? 'checked' : 'unchecked'}
                onPress={() => onTogglePaid(!payment.is_paid)}
                color={colors.success}
              />
            )}
          </View>
        </View>

        {/* Status bar for overdue/due soon */}
        {(isOverdue || isDueSoon) && !payment.is_paid && (
          <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
        )}
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  containerCompact: {
    marginBottom: spacing.xs,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  titlePaid: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
  },
  separator: {
    fontSize: 12,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  rightSection: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusBar: {
    height: 3,
  },
});
