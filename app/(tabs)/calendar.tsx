import { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, useTheme, IconButton, Surface } from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { bg } from 'date-fns/locale';

import { useAuthStore, useBillsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { formatCurrency, formatMonth } from '../../src/utils/format';
import { spacing, colors, borderRadius } from '../../src/theme';
import { BillCard } from '../../src/components/bills';
import type { BillPaymentWithRelations } from '../../src/types/database';

export default function CalendarScreen() {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  const { allPayments, loadAllPayments } = useBillsStore();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    
    // Load payments for a wider range (current month +/- 1 month)
    const start = format(subMonths(startOfMonth(currentMonth), 1), 'yyyy-MM-dd');
    const end = format(addMonths(endOfMonth(currentMonth), 1), 'yyyy-MM-dd');
    
    await loadAllPayments(user.id, { startDate: start, endDate: end });
  }, [user, currentMonth, loadAllPayments]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Create a map of payments by date
  const paymentsByDate = useMemo(() => {
    const map = new Map<string, BillPaymentWithRelations[]>();
    
    allPayments.forEach(payment => {
      const dateKey = payment.due_date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(payment);
    });
    
    return map;
  }, [allPayments]);

  // Get payments for selected date
  const selectedDatePayments = selectedDate
    ? paymentsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []
    : [];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const weekDays = ['Пон', 'Вто', 'Сря', 'Чет', 'Пет', 'Съб', 'Нед'];

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
    setSelectedDate(null);
  };

  const renderDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const payments = paymentsByDate.get(dateKey) || [];
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const isToday = isSameDay(date, new Date());
    
    const hasOverdue = payments.some(p => p.is_overdue && !p.is_paid);
    const hasUnpaid = payments.some(p => !p.is_paid && !p.is_overdue);
    const allPaid = payments.length > 0 && payments.every(p => p.is_paid);

    const getDotColor = () => {
      if (hasOverdue) return colors.error;
      if (hasUnpaid) return colors.warning;
      if (allPaid) return colors.success;
      return 'transparent';
    };

    return (
      <TouchableOpacity
        key={dateKey}
        style={[
          styles.dayCell,
          isSelected && { backgroundColor: theme.colors.primaryContainer },
          isToday && !isSelected && { borderColor: theme.colors.primary, borderWidth: 2 },
        ]}
        onPress={() => setSelectedDate(date)}
        disabled={!isCurrentMonth}
      >
        <Text
          style={[
            styles.dayText,
            {
              color: isCurrentMonth
                ? isSelected
                  ? theme.colors.onPrimaryContainer
                  : theme.colors.onSurface
                : theme.colors.outlineVariant,
            },
          ]}
        >
          {format(date, 'd')}
        </Text>
        {payments.length > 0 && (
          <View style={[styles.dot, { backgroundColor: getDotColor() }]} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['left', 'right']}>
      {/* Month Navigation */}
      <View style={styles.monthHeader}>
        <IconButton icon="chevron-left" onPress={handlePreviousMonth} />
        <Text style={[styles.monthTitle, { color: theme.colors.onBackground }]}>
          {format(currentMonth, 'LLLL yyyy', { locale: bg })}
        </Text>
        <IconButton icon="chevron-right" onPress={handleNextMonth} />
      </View>

      {/* Week Days Header */}
      <View style={styles.weekHeader}>
        {weekDays.map(day => (
          <Text
            key={day}
            style={[styles.weekDayText, { color: theme.colors.onSurfaceVariant }]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map(day => renderDay(day))}
      </View>

      {/* Selected Day Details */}
      <View style={[styles.detailsSection, { backgroundColor: theme.colors.surfaceVariant }]}>
        {selectedDate ? (
          <>
            <Text style={[styles.detailsTitle, { color: theme.colors.onSurface }]}>
              {format(selectedDate, 'd MMMM yyyy', { locale: bg })}
            </Text>
            
            {selectedDatePayments.length === 0 ? (
              <Text style={[styles.noBills, { color: theme.colors.onSurfaceVariant }]}>
                {t('calendar.noBillsOnDay')}
              </Text>
            ) : (
              <ScrollView style={styles.paymentsList}>
                {selectedDatePayments.map(payment => (
                  <BillCard
                    key={payment.id}
                    payment={payment}
                    onPress={() => router.push(`/bill/${payment.id}`)}
                    compact
                  />
                ))}
              </ScrollView>
            )}
          </>
        ) : (
          <Text style={[styles.selectDayHint, { color: theme.colors.onSurfaceVariant }]}>
            Избери ден за да видиш сметките
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
  detailsSection: {
    flex: 1,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'capitalize',
  },
  noBills: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  selectDayHint: {
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  paymentsList: {
    flex: 1,
  },
});
