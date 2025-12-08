// ===================================
// Unbond - Emotional Log Store (Zustand)
// ===================================

import { create } from 'zustand';
import uuid from 'react-native-uuid';
import type { EmotionalLogEntry, EmotionType } from '../types';
import * as storage from '../services/storage';
import { getCurrentDateTime, filterByDateRange, calculateAverage } from '../utils/helpers';

interface EmotionalLogState {
  entries: EmotionalLogEntry[];
  isLoading: boolean;

  // Actions
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<EmotionalLogEntry, 'id' | 'createdAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<EmotionalLogEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // Computed/Analytics
  getEntriesForDays: (days: number) => EmotionalLogEntry[];
  getAverageCravingIntensity: (days: number) => number;
  getMostCommonEmotion: (days: number) => EmotionType | null;
  getCravingTrend: (days: number) => Array<{ date: string; intensity: number }>;
}

export const useEmotionalLogStore = create<EmotionalLogState>((set, get) => ({
  entries: [],
  isLoading: true,

  loadEntries: async () => {
    set({ isLoading: true });
    try {
      const entries = await storage.getEmotionalLogs();
      set({ entries, isLoading: false });
    } catch (error) {
      console.error('Failed to load emotional logs:', error);
      set({ isLoading: false });
    }
  },

  addEntry: async (entryData) => {
    const entry: EmotionalLogEntry = {
      id: uuid.v4() as string,
      createdAt: getCurrentDateTime(),
      ...entryData,
    };
    
    const entries = [entry, ...get().entries];
    set({ entries });
    await storage.saveEmotionalLog(entry);
  },

  updateEntry: async (id, updates) => {
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    set({ entries });
    
    const updatedEntry = entries.find((e) => e.id === id);
    if (updatedEntry) {
      await storage.saveEmotionalLog(updatedEntry);
    }
  },

  deleteEntry: async (id) => {
    const entries = get().entries.filter((entry) => entry.id !== id);
    set({ entries });
    await storage.deleteEmotionalLog(id);
  },

  getEntriesForDays: (days) => {
    return filterByDateRange(get().entries, days);
  },

  getAverageCravingIntensity: (days) => {
    const entries = filterByDateRange(get().entries, days);
    if (entries.length === 0) return 0;
    return calculateAverage(entries.map((e) => e.cravingIntensity));
  },

  getMostCommonEmotion: (days) => {
    const entries = filterByDateRange(get().entries, days);
    if (entries.length === 0) return null;

    const emotionCounts: Record<string, number> = {};
    entries.forEach((entry) => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    let maxCount = 0;
    let mostCommon: EmotionType | null = null;
    
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = emotion as EmotionType;
      }
    });

    return mostCommon;
  },

  getCravingTrend: (days) => {
    const entries = filterByDateRange(get().entries, days);
    
    // Group by date and calculate average intensity per day
    const byDate: Record<string, number[]> = {};
    entries.forEach((entry) => {
      const date = entry.createdAt.split('T')[0];
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push(entry.cravingIntensity);
    });

    return Object.entries(byDate)
      .map(([date, intensities]) => ({
        date,
        intensity: calculateAverage(intensities),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
}));
