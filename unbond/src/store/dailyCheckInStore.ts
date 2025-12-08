// ===================================
// Unbond - Daily Check-in Store (Zustand)
// ===================================

import { create } from 'zustand';
import uuid from 'react-native-uuid';
import type { DailyCheckIn } from '../types';
import * as storage from '../services/storage';
import { getTodayDate, getLastNDays } from '../utils/helpers';

interface DailyCheckInState {
  checkIns: DailyCheckIn[];
  isLoading: boolean;

  // Actions
  loadCheckIns: () => Promise<void>;
  saveCheckIn: (moodScore: number, note?: string) => Promise<void>;
  
  // Computed
  getTodayCheckIn: () => DailyCheckIn | null;
  hasCheckedInToday: () => boolean;
  getWeekMoods: () => Array<{ date: string; mood: number | null }>;
  getAverageMood: (days: number) => number;
}

export const useDailyCheckInStore = create<DailyCheckInState>((set, get) => ({
  checkIns: [],
  isLoading: true,

  loadCheckIns: async () => {
    set({ isLoading: true });
    try {
      const checkIns = await storage.getDailyCheckIns();
      set({ checkIns, isLoading: false });
    } catch (error) {
      console.error('Failed to load daily check-ins:', error);
      set({ isLoading: false });
    }
  },

  saveCheckIn: async (moodScore, note) => {
    const today = getTodayDate();
    const existingCheckIn = get().checkIns.find((c) => c.date === today);

    const checkIn: DailyCheckIn = {
      id: existingCheckIn?.id || (uuid.v4() as string),
      date: today,
      moodScore,
      note,
    };

    let checkIns: DailyCheckIn[];
    if (existingCheckIn) {
      checkIns = get().checkIns.map((c) => (c.date === today ? checkIn : c));
    } else {
      checkIns = [checkIn, ...get().checkIns];
    }

    set({ checkIns });
    await storage.saveDailyCheckIn(checkIn);
  },

  getTodayCheckIn: () => {
    const today = getTodayDate();
    return get().checkIns.find((c) => c.date === today) || null;
  },

  hasCheckedInToday: () => {
    return get().getTodayCheckIn() !== null;
  },

  getWeekMoods: () => {
    const last7Days = getLastNDays(7);
    const checkIns = get().checkIns;

    return last7Days.map((date) => {
      const checkIn = checkIns.find((c) => c.date === date);
      return {
        date,
        mood: checkIn?.moodScore ?? null,
      };
    });
  },

  getAverageMood: (days) => {
    const dates = getLastNDays(days);
    const moods = get()
      .checkIns.filter((c) => dates.includes(c.date))
      .map((c) => c.moodScore);

    if (moods.length === 0) return 0;
    return moods.reduce((a, b) => a + b, 0) / moods.length;
  },
}));
