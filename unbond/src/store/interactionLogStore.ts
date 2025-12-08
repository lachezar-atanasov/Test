// ===================================
// Unbond - Interaction Log Store (Zustand)
// ===================================

import { create } from 'zustand';
import uuid from 'react-native-uuid';
import type { InteractionLogEntry, RedFlagType, InteractionType } from '../types';
import * as storage from '../services/storage';
import { getCurrentDateTime, filterByDateRange } from '../utils/helpers';

interface InteractionStats {
  totalInteractions: number;
  initiatedByMe: number;
  initiatedByThem: number;
  percentInitiatedByMe: number;
  mostCommonRedFlags: Array<{ flag: RedFlagType; count: number }>;
  averageFeelingBefore: number;
  averageFeelingAfter: number;
  interactionsByType: Record<InteractionType, number>;
}

interface InteractionLogState {
  entries: InteractionLogEntry[];
  isLoading: boolean;

  // Actions
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<InteractionLogEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<InteractionLogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // Computed/Analytics
  getEntriesForDays: (days: number) => InteractionLogEntry[];
  getStats: (days: number) => InteractionStats;
  getInteractionsPerWeek: (weeks: number) => Array<{ week: string; count: number }>;
}

export const useInteractionLogStore = create<InteractionLogState>((set, get) => ({
  entries: [],
  isLoading: true,

  loadEntries: async () => {
    set({ isLoading: true });
    try {
      const entries = await storage.getInteractionLogs();
      set({ entries, isLoading: false });
    } catch (error) {
      console.error('Failed to load interaction logs:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData) => {
    const entry: InteractionLogEntry = {
      id: uuid.v4() as string,
      createdAt: getCurrentDateTime(),
      ...entryData,
    };

    const entries = [entry, ...get().entries];
    set({ entries });
    await storage.saveInteractionLog(entry);
  },

  updateEntry: async (id, updates) => {
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    set({ entries });

    const updatedEntry = entries.find((e) => e.id === id);
    if (updatedEntry) {
      await storage.saveInteractionLog(updatedEntry);
    }
  },

  deleteEntry: async (id) => {
    const entries = get().entries.filter((entry) => entry.id !== id);
    set({ entries });
    await storage.deleteInteractionLog(id);
  },

  getEntriesForDays: (days) => {
    return filterByDateRange(get().entries, days);
  },

  getStats: (days) => {
    const entries = filterByDateRange(get().entries, days);
    const totalInteractions = entries.length;

    if (totalInteractions === 0) {
      return {
        totalInteractions: 0,
        initiatedByMe: 0,
        initiatedByThem: 0,
        percentInitiatedByMe: 0,
        mostCommonRedFlags: [],
        averageFeelingBefore: 0,
        averageFeelingAfter: 0,
        interactionsByType: {} as Record<InteractionType, number>,
      };
    }

    const initiatedByMe = entries.filter((e) => e.initiatedBy === 'me').length;
    const initiatedByThem = totalInteractions - initiatedByMe;

    // Count red flags
    const flagCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      entry.redFlags.forEach((flag) => {
        flagCounts[flag] = (flagCounts[flag] || 0) + 1;
      });
    });

    const mostCommonRedFlags = Object.entries(flagCounts)
      .map(([flag, count]) => ({ flag: flag as RedFlagType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Calculate averages
    const avgBefore =
      entries.reduce((sum, e) => sum + e.feelingBefore, 0) / totalInteractions;
    const avgAfter =
      entries.reduce((sum, e) => sum + e.feelingAfter, 0) / totalInteractions;

    // Count by type
    const interactionsByType: Record<InteractionType, number> = {} as Record<InteractionType, number>;
    entries.forEach((entry) => {
      interactionsByType[entry.interactionType] =
        (interactionsByType[entry.interactionType] || 0) + 1;
    });

    return {
      totalInteractions,
      initiatedByMe,
      initiatedByThem,
      percentInitiatedByMe: Math.round((initiatedByMe / totalInteractions) * 100),
      mostCommonRedFlags,
      averageFeelingBefore: Math.round(avgBefore * 10) / 10,
      averageFeelingAfter: Math.round(avgAfter * 10) / 10,
      interactionsByType,
    };
  },

  getInteractionsPerWeek: (weeks) => {
    const entries = filterByDateRange(get().entries, weeks * 7);
    const weekCounts: Record<string, number> = {};

    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      // Get the Monday of the week
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(date.setDate(diff));
      const weekKey = monday.toISOString().split('T')[0];
      
      weekCounts[weekKey] = (weekCounts[weekKey] || 0) + 1;
    });

    return Object.entries(weekCounts)
      .map(([week, count]) => ({ week, count }))
      .sort((a, b) => a.week.localeCompare(b.week));
  },
}));
