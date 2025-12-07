import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import {
  getCategories,
  getBillAccounts,
  createBillAccount,
  createRecurringBill,
  createBillPayment,
} from '../../src/api/bills';
import { BillCategory, BillAccount, RecurrenceType } from '../../src/types/database';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { t } from '../../src/utils/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function AddBillScreen() {
  const { user } = useAuthStore();
  const [categories, setCategories] = useState<BillCategory[]>([]);
  const [accounts, setAccounts] = useState<BillAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isOneOff, setIsOneOff] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [providerName, setProviderName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [cats, accs] = await Promise.all([
        getCategories(user.id),
        getBillAccounts(user.id),
      ]);

      setCategories(cats);
      setAccounts(accs);

      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !categoryId) {
      Alert.alert('Грешка', 'Моля, попълнете всички задължителни полета');
      return;
    }

    setSaving(true);

    try {
      let finalAccountId = accountId;

      // Create account if new
      if (!accountId && providerName && accountName) {
        const newAccount = await createBillAccount({
          user_id: user.id,
          category_id: categoryId,
          name: accountName,
          provider_name: providerName,
          account_number: null,
          billing_website: null,
          payment_method_hint: null,
        });
        finalAccountId = newAccount.id;
      }

      if (isOneOff) {
        // Create one-off bill payment
        const dueDate = new Date();
        if (dueDay) {
          dueDate.setDate(parseInt(dueDay, 10));
        }

        await createBillPayment({
          user_id: user.id,
          recurring_bill_id: null,
          bill_account_id: finalAccountId || accounts[0]?.id || '',
          category_id: categoryId,
          title: title || 'Еднократна сметка',
          amount: parseFloat(amount) || 0,
          currency: 'BGN',
          due_date: dueDate.toISOString().split('T')[0],
          is_paid: false,
          paid_date: null,
          is_overdue: false,
          attachment_url: null,
          notes: notes || null,
        });
      } else {
        // Create recurring bill
        await createRecurringBill({
          user_id: user.id,
          bill_account_id: finalAccountId || accounts[0]?.id || '',
          category_id: categoryId,
          title: title || 'Нова сметка',
          expected_amount: amount ? parseFloat(amount) : null,
          currency: 'BGN',
          recurrence_type: recurrenceType,
          due_day_of_month: dueDay ? parseInt(dueDay, 10) : null,
          custom_cron: null,
          is_active: true,
          reminder_days_before: null,
          notes: notes || null,
        });
      }

      router.back();
    } catch (error) {
      console.error('Error saving bill:', error);
      Alert.alert('Грешка', 'Неуспешно запазване на сметката');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggle, !isOneOff && styles.toggleActive]}
            onPress={() => setIsOneOff(false)}
          >
            <Text style={[styles.toggleText, !isOneOff && styles.toggleTextActive]}>
              Повтаряща се
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggle, isOneOff && styles.toggleActive]}
            onPress={() => setIsOneOff(true)}
          >
            <Text style={[styles.toggleText, isOneOff && styles.toggleTextActive]}>
              {t('bills.oneOff')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>{t('bills.category')}</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={categoryId} onValueChange={setCategoryId} style={styles.picker}>
              {categories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        {accounts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Избери акаунт</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={accountId} onValueChange={setAccountId} style={styles.picker}>
                <Picker.Item label="Нов акаунт" value="" />
                {accounts.map((acc) => (
                  <Picker.Item key={acc.id} label={acc.name} value={acc.id} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        {!accountId && (
          <>
            <Input
              label="Име на доставчик"
              value={providerName}
              onChangeText={setProviderName}
              placeholder="Напр. ЧЕЗ, Софийска вода"
            />
            <Input
              label="Име на акаунт"
              value={accountName}
              onChangeText={setAccountName}
              placeholder="Напр. ЧЕЗ – Люлин 6"
            />
          </>
        )}

        <Input
          label="Заглавие"
          value={title}
          onChangeText={setTitle}
          placeholder="Напр. Сметка за ток"
        />

        <Input
          label={t('bills.expectedAmount')}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        {!isOneOff && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>{t('bills.recurrence')}</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={recurrenceType}
                  onValueChange={(value) => setRecurrenceType(value as RecurrenceType)}
                  style={styles.picker}
                >
                  <Picker.Item label="Месечно" value="monthly" />
                  <Picker.Item label="На всеки 2 месеца" value="bi_monthly" />
                  <Picker.Item label="Тримесечно" value="quarterly" />
                  <Picker.Item label="Годишно" value="yearly" />
                </Picker>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Ден на падеж (1-31)</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={dueDay} onValueChange={setDueDay} style={styles.picker}>
                  <Picker.Item label="Не избирам" value="" />
                  {days.map((day) => (
                    <Picker.Item key={day} label={`${day}`} value={String(day)} />
                  ))}
                </Picker>
              </View>
            </View>
          </>
        )}

        {isOneOff && (
          <View style={styles.section}>
            <Text style={styles.label}>{t('bills.dueDate')}</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={dueDay} onValueChange={setDueDay} style={styles.picker}>
                <Picker.Item label="Избери ден" value="" />
                {days.map((day) => (
                  <Picker.Item key={day} label={`${day}`} value={String(day)} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <Input
          label={t('bills.notes')}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholder="Допълнителни бележки..."
        />

        <Button title={t('common.save')} onPress={handleSave} loading={saving} />
      </View>
    </ScrollView>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggle: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#4A90E2',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
});
