import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  SegmentedButtons,
  Switch,
  HelperText,
} from 'react-native-paper';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths } from 'date-fns';

import { useAuthStore, useBillsStore } from '../../src/store';
import { t } from '../../src/i18n';
import { spacing, borderRadius, colors } from '../../src/theme';
import { CategoryPicker, CategoryChip } from '../../src/components/bills';
import { validateBillForm } from '../../src/utils/validation';
import { generatePaymentInstances } from '../../src/domain/recurrence';
import type { BillCategory, RecurrenceType } from '../../src/types/database';

export default function NewBillScreen() {
  const theme = useTheme();
  const user = useAuthStore(state => state.user);
  
  const {
    categories,
    accounts,
    loadCategories,
    loadAccounts,
    createAccount,
    createRecurringBill,
    createPayment,
  } = useBillsStore();

  const [isRecurring, setIsRecurring] = useState(true);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('15');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('monthly');
  const [notes, setNotes] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadCategories(user.id);
        loadAccounts(user.id);
      }
    }, [user, loadCategories, loadAccounts])
  );

  const handleCategorySelect = (category: BillCategory) => {
    setSelectedCategory(category);
    if (!title && category) {
      setTitle(`Сметка за ${category.name.toLowerCase()}`);
    }
  };

  const validate = (): boolean => {
    const result = validateBillForm({
      title,
      categoryId: selectedCategory?.id || '',
      amount: amount || undefined,
      dueDay: isRecurring ? parseInt(dueDay) : undefined,
      dueDate: !isRecurring ? dueDate : undefined,
    });
    
    setErrors(result.errors);
    return result.isValid;
  };

  const handleSave = async () => {
    if (!validate() || !user || !selectedCategory) return;
    
    setLoading(true);
    
    try {
      // Create or find account
      let accountId: string;
      
      const existingAccount = accounts.find(
        a => a.category_id === selectedCategory.id && a.provider_name === (providerName || selectedCategory.name)
      );
      
      if (existingAccount) {
        accountId = existingAccount.id;
      } else {
        const newAccount = await createAccount(user.id, {
          category_id: selectedCategory.id,
          name: title || `${providerName || selectedCategory.name}`,
          provider_name: providerName || selectedCategory.name,
        });
        
        if (!newAccount) {
          setErrors({ general: t('errors.generic') });
          setLoading(false);
          return;
        }
        
        accountId = newAccount.id;
      }
      
      if (isRecurring) {
        // Create recurring bill
        const recurringBill = await createRecurringBill(user.id, {
          bill_account_id: accountId,
          category_id: selectedCategory.id,
          title,
          expected_amount: amount ? parseFloat(amount) : undefined,
          recurrence_type: recurrenceType,
          due_day_of_month: parseInt(dueDay),
          notes: notes || undefined,
        });
        
        if (!recurringBill) {
          setErrors({ general: t('errors.generic') });
          setLoading(false);
          return;
        }
        
        // Generate payment instances for next 3 months
        const instances = generatePaymentInstances(recurringBill, 3);
        
        for (const instance of instances) {
          await createPayment(user.id, {
            recurring_bill_id: recurringBill.id,
            bill_account_id: accountId,
            category_id: selectedCategory.id,
            title,
            amount: instance.amount,
            due_date: instance.due_date,
            notes: notes || undefined,
          });
        }
      } else {
        // Create one-off payment
        await createPayment(user.id, {
          bill_account_id: accountId,
          category_id: selectedCategory.id,
          title,
          amount: amount ? parseFloat(amount) : 0,
          due_date: dueDate,
          notes: notes || undefined,
        });
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving bill:', error);
      setErrors({ general: t('errors.generic') });
    } finally {
      setLoading(false);
    }
  };

  const recurrenceOptions = [
    { value: 'monthly', label: 'Месечно' },
    { value: 'bi_monthly', label: 'На 2 мес.' },
    { value: 'quarterly', label: 'На 3 мес.' },
    { value: 'yearly', label: 'Годишно' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Button onPress={() => router.back()}>{t('common.cancel')}</Button>
          <Text style={[styles.headerTitle, { color: theme.colors.onBackground }]}>
            {t('bills.newBill')}
          </Text>
          <Button onPress={handleSave} loading={loading} disabled={loading}>
            {t('common.save')}
          </Button>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Bill Type Toggle */}
          <View style={styles.section}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: theme.colors.onBackground }]}>
                Периодична сметка
              </Text>
              <Switch value={isRecurring} onValueChange={setIsRecurring} />
            </View>
            <Text style={[styles.toggleHint, { color: theme.colors.onSurfaceVariant }]}>
              {isRecurring
                ? 'Ще се генерират автоматично плащания всеки месец'
                : 'Еднократно плащане'}
            </Text>
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.onBackground }]}>
              {t('billForm.category')} *
            </Text>
            <CategoryChip
              category={selectedCategory}
              onPress={() => setCategoryPickerVisible(true)}
            />
            {errors.categoryId && <HelperText type="error">{errors.categoryId}</HelperText>}
          </View>

          {/* Title */}
          <View style={styles.section}>
            <TextInput
              label={t('billForm.title')}
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              placeholder={t('billForm.titlePlaceholder')}
              error={!!errors.title}
            />
            {errors.title && <HelperText type="error">{errors.title}</HelperText>}
          </View>

          {/* Provider Name */}
          <View style={styles.section}>
            <TextInput
              label={t('billForm.providerName')}
              value={providerName}
              onChangeText={setProviderName}
              mode="outlined"
              placeholder={t('billForm.providerPlaceholder')}
            />
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <TextInput
              label={isRecurring ? t('billForm.expectedAmount') : t('billForm.amount')}
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="decimal-pad"
              placeholder={t('billForm.amountPlaceholder')}
              right={<TextInput.Affix text="лв." />}
              error={!!errors.amount}
            />
            {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}
          </View>

          {/* Due Date / Day */}
          {isRecurring ? (
            <View style={styles.section}>
              <TextInput
                label={t('billForm.dueDay')}
                value={dueDay}
                onChangeText={setDueDay}
                mode="outlined"
                keyboardType="number-pad"
                placeholder="1-31"
                error={!!errors.dueDay}
              />
              {errors.dueDay && <HelperText type="error">{errors.dueDay}</HelperText>}
            </View>
          ) : (
            <View style={styles.section}>
              <TextInput
                label={t('billForm.dueDate')}
                value={dueDate}
                onChangeText={setDueDate}
                mode="outlined"
                placeholder="YYYY-MM-DD"
                error={!!errors.dueDate}
              />
              {errors.dueDate && <HelperText type="error">{errors.dueDate}</HelperText>}
            </View>
          )}

          {/* Recurrence Type */}
          {isRecurring && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onBackground }]}>
                {t('billForm.recurrence')}
              </Text>
              <SegmentedButtons
                value={recurrenceType}
                onValueChange={value => setRecurrenceType(value as RecurrenceType)}
                buttons={recurrenceOptions}
              />
            </View>
          )}

          {/* Notes */}
          <View style={styles.section}>
            <TextInput
              label={t('billForm.notes')}
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder={t('billForm.notesPlaceholder')}
            />
          </View>

          {/* Error Banner */}
          {errors.general && (
            <View style={[styles.errorBanner, { backgroundColor: colors.errorContainer }]}>
              <Text style={{ color: colors.error }}>{errors.general}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Picker Modal */}
      <CategoryPicker
        categories={categories}
        selectedId={selectedCategory?.id}
        onSelect={handleCategorySelect}
        visible={categoryPickerVisible}
        onDismiss={() => setCategoryPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 50,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleHint: {
    fontSize: 12,
    marginTop: spacing.xs,
  },
  errorBanner: {
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    marginTop: spacing.md,
  },
});
