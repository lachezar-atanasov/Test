// ===================================
// Unbond - Settings Store (Zustand)
// ===================================

import { create } from 'zustand';
import type { UserSettings, ContactMode } from '../types';
import * as storage from '../services/storage';

interface SettingsState {
  settings: UserSettings;
  isLoading: boolean;
  
  // Actions
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  setContactMode: (mode: ContactMode) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  updateLastContactDate: (date: string) => Promise<void>;
  resetStreak: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  hasCompletedOnboarding: false,
  contactMode: 'no-contact',
  notificationsEnabled: false,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });
    try {
      const settings = await storage.getSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Failed to load settings:', error);
      set({ isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, ...updates };
    set({ settings: newSettings });
    await storage.saveSettings(newSettings);
  },

  setContactMode: async (mode) => {
    await get().updateSettings({ contactMode: mode });
  },

  completeOnboarding: async () => {
    const today = new Date().toISOString().split('T')[0];
    await get().updateSettings({
      hasCompletedOnboarding: true,
      streakStartDate: today,
    });
  },

  updateLastContactDate: async (date) => {
    await get().updateSettings({
      lastContactDate: date,
      streakStartDate: date, // Reset streak when contact happens
    });
  },

  resetStreak: async () => {
    const today = new Date().toISOString().split('T')[0];
    await get().updateSettings({ streakStartDate: today });
  },
}));
