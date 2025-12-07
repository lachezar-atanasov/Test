import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { getBillPayments } from '../../src/api/bills';
import { BillPayment } from '../../src/types/database';
import { t } from '../../src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';

export default function CalendarScreen() {
  const { user } = useAuthStore();
  const [bills, setBills] = useState<BillPayment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (user) {
      loadBills();
    }
  }, [user, currentMonth]);

  const loadBills = async () => {
    if (!user) return;

    try {
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const payments = await getBillPayments(user.id, {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      });

      setBills(payments);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getBillsForDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bills.filter((bill) => bill.due_date === dateStr);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentMonth);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentMonth(newDate);
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.toLocaleDateString('bg-BG', { month: 'long', year: 'numeric' });

  const selectedDateBills = getBillsForDate(selectedDate.getDate());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthName}</Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.calendar}>
        <View style={styles.weekDays}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'].map((day) => (
            <Text key={day} style={styles.weekDay}>
              {day}
            </Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
            <View key={`empty-${i}`} style={styles.dayCell} />
          ))}
          {days.map((day) => {
            const dayBills = getBillsForDate(day);
            const isSelected = selectedDate.getDate() === day;
            const isToday =
              day === new Date().getDate() &&
              currentMonth.getMonth() === new Date().getMonth() &&
              currentMonth.getFullYear() === new Date().getFullYear();

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isSelected && styles.dayCellSelected,
                  isToday && styles.dayCellToday,
                ]}
                onPress={() => {
                  const newDate = new Date(currentMonth);
                  newDate.setDate(day);
                  setSelectedDate(newDate);
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    isSelected && styles.dayTextSelected,
                    isToday && styles.dayTextToday,
                  ]}
                >
                  {day}
                </Text>
                {dayBills.length > 0 && (
                  <View style={styles.billDots}>
                    {dayBills.slice(0, 3).map((bill, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.billDot,
                          bill.is_overdue && styles.billDotOverdue,
                          bill.is_paid && styles.billDotPaid,
                        ]}
                      />
                    ))}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.selectedDateBills}>
        <Text style={styles.selectedDateTitle}>
          {selectedDate.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' })}
        </Text>
        {selectedDateBills.length === 0 ? (
          <Text style={styles.emptyText}>Няма сметки за този ден</Text>
        ) : (
          <ScrollView>
            {selectedDateBills.map((bill) => (
              <View key={bill.id} style={styles.billCard}>
                <Text style={styles.billCardTitle}>{bill.title}</Text>
                <Text style={styles.billCardAmount}>
                  {Number(bill.amount).toFixed(2)} лв
                </Text>
                {bill.is_paid && (
                  <Ionicons name="checkmark-circle" size={20} color="#4ECDC4" />
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
  },
  calendar: {
    padding: 16,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  dayCellSelected: {
    backgroundColor: '#4A90E2',
    borderRadius: 20,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#4A90E2',
    borderRadius: 20,
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dayTextToday: {
    fontWeight: 'bold',
  },
  billDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  billDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4A90E2',
  },
  billDotOverdue: {
    backgroundColor: '#FF6B6B',
  },
  billDotPaid: {
    backgroundColor: '#4ECDC4',
  },
  selectedDateBills: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 32,
  },
  billCard: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  billCardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
});
