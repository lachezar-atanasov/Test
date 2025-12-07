import { create } from 'zustand';
import type {
  BillCategory,
  BillAccount,
  RecurringBill,
  BillPayment,
  BillPaymentWithRelations,
  RecurringBillWithRelations,
  CreateBillAccountInput,
  CreateRecurringBillInput,
  CreateBillPaymentInput,
  UpdateBillPaymentInput,
} from '../types/database';
import * as billsApi from '../api/bills';

interface BillsState {
  // Data
  categories: BillCategory[];
  accounts: BillAccount[];
  recurringBills: RecurringBillWithRelations[];
  upcomingPayments: BillPaymentWithRelations[];
  overduePayments: BillPaymentWithRelations[];
  allPayments: BillPaymentWithRelations[];
  monthlySummary: {
    total: number;
    paid: number;
    remaining: number;
    overdue: number;
    count: number;
    paidCount: number;
  } | null;

  // Loading states
  isLoadingCategories: boolean;
  isLoadingAccounts: boolean;
  isLoadingBills: boolean;
  isLoadingPayments: boolean;

  // Selected items
  selectedPayment: BillPaymentWithRelations | null;
  selectedRecurringBill: RecurringBillWithRelations | null;

  // Actions
  setCategories: (categories: BillCategory[]) => void;
  setAccounts: (accounts: BillAccount[]) => void;
  setRecurringBills: (bills: RecurringBillWithRelations[]) => void;
  setUpcomingPayments: (payments: BillPaymentWithRelations[]) => void;
  setOverduePayments: (payments: BillPaymentWithRelations[]) => void;
  setAllPayments: (payments: BillPaymentWithRelations[]) => void;
  setSelectedPayment: (payment: BillPaymentWithRelations | null) => void;
  setSelectedRecurringBill: (bill: RecurringBillWithRelations | null) => void;

  // Async actions
  loadCategories: (userId?: string) => Promise<void>;
  loadAccounts: (userId: string) => Promise<void>;
  loadRecurringBills: (userId: string) => Promise<void>;
  loadUpcomingPayments: (userId: string, days?: number) => Promise<void>;
  loadOverduePayments: (userId: string) => Promise<void>;
  loadAllPayments: (userId: string, options?: Parameters<typeof billsApi.getBillPayments>[1]) => Promise<void>;
  loadMonthlySummary: (userId: string, year: number, month: number) => Promise<void>;

  // CRUD operations
  createCategory: (userId: string, category: Omit<BillCategory, 'id' | 'user_id' | 'is_default'>) => Promise<BillCategory | null>;
  createAccount: (userId: string, account: CreateBillAccountInput) => Promise<BillAccount | null>;
  updateAccount: (accountId: string, updates: Partial<CreateBillAccountInput>) => Promise<boolean>;
  deleteAccount: (accountId: string) => Promise<boolean>;
  createRecurringBill: (userId: string, bill: CreateRecurringBillInput) => Promise<RecurringBill | null>;
  updateRecurringBill: (billId: string, updates: Partial<CreateRecurringBillInput>) => Promise<boolean>;
  deleteRecurringBill: (billId: string) => Promise<boolean>;
  createPayment: (userId: string, payment: CreateBillPaymentInput) => Promise<BillPayment | null>;
  updatePayment: (paymentId: string, updates: UpdateBillPaymentInput) => Promise<boolean>;
  markPaymentAsPaid: (paymentId: string) => Promise<boolean>;
  markPaymentAsUnpaid: (paymentId: string) => Promise<boolean>;
  deletePayment: (paymentId: string) => Promise<boolean>;

  // Utility
  refreshAll: (userId: string) => Promise<void>;
  clearAll: () => void;
}

export const useBillsStore = create<BillsState>()((set, get) => ({
  // Initial state
  categories: [],
  accounts: [],
  recurringBills: [],
  upcomingPayments: [],
  overduePayments: [],
  allPayments: [],
  monthlySummary: null,

  isLoadingCategories: false,
  isLoadingAccounts: false,
  isLoadingBills: false,
  isLoadingPayments: false,

  selectedPayment: null,
  selectedRecurringBill: null,

  // Setters
  setCategories: categories => set({ categories }),
  setAccounts: accounts => set({ accounts }),
  setRecurringBills: recurringBills => set({ recurringBills }),
  setUpcomingPayments: upcomingPayments => set({ upcomingPayments }),
  setOverduePayments: overduePayments => set({ overduePayments }),
  setAllPayments: allPayments => set({ allPayments }),
  setSelectedPayment: selectedPayment => set({ selectedPayment }),
  setSelectedRecurringBill: selectedRecurringBill => set({ selectedRecurringBill }),

  // Load operations
  loadCategories: async userId => {
    set({ isLoadingCategories: true });
    const categories = await billsApi.getCategories(userId);
    set({ categories, isLoadingCategories: false });
  },

  loadAccounts: async userId => {
    set({ isLoadingAccounts: true });
    const accounts = await billsApi.getBillAccounts(userId);
    set({ accounts, isLoadingAccounts: false });
  },

  loadRecurringBills: async userId => {
    set({ isLoadingBills: true });
    const recurringBills = await billsApi.getRecurringBills(userId);
    set({ recurringBills, isLoadingBills: false });
  },

  loadUpcomingPayments: async (userId, days = 14) => {
    set({ isLoadingPayments: true });
    const upcomingPayments = await billsApi.getUpcomingPayments(userId, days);
    set({ upcomingPayments, isLoadingPayments: false });
  },

  loadOverduePayments: async userId => {
    set({ isLoadingPayments: true });
    const overduePayments = await billsApi.getOverduePayments(userId);
    set({ overduePayments, isLoadingPayments: false });
  },

  loadAllPayments: async (userId, options) => {
    set({ isLoadingPayments: true });
    const allPayments = await billsApi.getBillPayments(userId, options);
    set({ allPayments, isLoadingPayments: false });
  },

  loadMonthlySummary: async (userId, year, month) => {
    const monthlySummary = await billsApi.getMonthlySummary(userId, year, month);
    set({ monthlySummary });
  },

  // CRUD operations
  createCategory: async (userId, category) => {
    const newCategory = await billsApi.createCategory(userId, category);
    if (newCategory) {
      set(state => ({ categories: [...state.categories, newCategory] }));
    }
    return newCategory;
  },

  createAccount: async (userId, account) => {
    const newAccount = await billsApi.createBillAccount(userId, account);
    if (newAccount) {
      set(state => ({ accounts: [...state.accounts, newAccount] }));
    }
    return newAccount;
  },

  updateAccount: async (accountId, updates) => {
    const success = await billsApi.updateBillAccount(accountId, updates);
    if (success) {
      set(state => ({
        accounts: state.accounts.map(a =>
          a.id === accountId ? { ...a, ...updates } : a
        ),
      }));
    }
    return success;
  },

  deleteAccount: async accountId => {
    const success = await billsApi.deleteBillAccount(accountId);
    if (success) {
      set(state => ({
        accounts: state.accounts.filter(a => a.id !== accountId),
      }));
    }
    return success;
  },

  createRecurringBill: async (userId, bill) => {
    const newBill = await billsApi.createRecurringBill(userId, bill);
    if (newBill) {
      // Reload to get relations
      await get().loadRecurringBills(userId);
    }
    return newBill;
  },

  updateRecurringBill: async (billId, updates) => {
    const success = await billsApi.updateRecurringBill(billId, updates);
    if (success) {
      set(state => ({
        recurringBills: state.recurringBills.map(b =>
          b.id === billId ? { ...b, ...updates } : b
        ),
      }));
    }
    return success;
  },

  deleteRecurringBill: async billId => {
    const success = await billsApi.deleteRecurringBill(billId);
    if (success) {
      set(state => ({
        recurringBills: state.recurringBills.filter(b => b.id !== billId),
      }));
    }
    return success;
  },

  createPayment: async (userId, payment) => {
    const newPayment = await billsApi.createBillPayment(userId, payment);
    if (newPayment) {
      // Reload payments to get updated lists
      await Promise.all([
        get().loadUpcomingPayments(userId),
        get().loadOverduePayments(userId),
      ]);
    }
    return newPayment;
  },

  updatePayment: async (paymentId, updates) => {
    const success = await billsApi.updateBillPayment(paymentId, updates);
    return success;
  },

  markPaymentAsPaid: async paymentId => {
    const success = await billsApi.markBillAsPaid(paymentId);
    if (success) {
      // Update local state
      set(state => ({
        upcomingPayments: state.upcomingPayments.map(p =>
          p.id === paymentId ? { ...p, is_paid: true, is_overdue: false } : p
        ),
        overduePayments: state.overduePayments.filter(p => p.id !== paymentId),
        allPayments: state.allPayments.map(p =>
          p.id === paymentId ? { ...p, is_paid: true, is_overdue: false } : p
        ),
      }));
    }
    return success;
  },

  markPaymentAsUnpaid: async paymentId => {
    const success = await billsApi.markBillAsUnpaid(paymentId);
    return success;
  },

  deletePayment: async paymentId => {
    const success = await billsApi.deleteBillPayment(paymentId);
    if (success) {
      set(state => ({
        upcomingPayments: state.upcomingPayments.filter(p => p.id !== paymentId),
        overduePayments: state.overduePayments.filter(p => p.id !== paymentId),
        allPayments: state.allPayments.filter(p => p.id !== paymentId),
      }));
    }
    return success;
  },

  // Utility
  refreshAll: async userId => {
    const now = new Date();
    await Promise.all([
      get().loadCategories(userId),
      get().loadAccounts(userId),
      get().loadRecurringBills(userId),
      get().loadUpcomingPayments(userId),
      get().loadOverduePayments(userId),
      get().loadMonthlySummary(userId, now.getFullYear(), now.getMonth() + 1),
    ]);
  },

  clearAll: () => {
    set({
      categories: [],
      accounts: [],
      recurringBills: [],
      upcomingPayments: [],
      overduePayments: [],
      allPayments: [],
      monthlySummary: null,
      selectedPayment: null,
      selectedRecurringBill: null,
    });
  },
}));
