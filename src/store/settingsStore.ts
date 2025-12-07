import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NotificationSettings } from '../types/database';
import * as notificationsApi from '../api/notifications';

interface SettingsState {
  // App settings
  colorScheme: 'light' | 'dark' | 'system';
  notificationSettings: NotificationSettings | null;

  // Loading
  isLoading: boolean;

  // Actions
  setColorScheme: (scheme: 'light' | 'dark' | 'system') => void;
  setNotificationSettings: (settings: NotificationSettings | null) => void;

  // Async actions
  loadNotificationSettings: (userId: string) => Promise<void>;
  updateNotificationSettings: (
    userId: string,
    settings: Partial<Omit<NotificationSettings, 'id' | 'user_id'>>
  ) => Promise<boolean>;
  savePushToken: (userId: string, token: string, deviceType: 'ios' | 'android' | 'web') => Promise<boolean>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      colorScheme: 'system',
      notificationSettings: null,
      isLoading: false,

      setColorScheme: colorScheme => set({ colorScheme }),
      setNotificationSettings: notificationSettings => set({ notificationSettings }),

      loadNotificationSettings: async userId => {
        set({ isLoading: true });
        const settings = await notificationsApi.getNotificationSettings(userId);
        set({ notificationSettings: settings, isLoading: false });
      },

      updateNotificationSettings: async (userId, settings) => {
        set({ isLoading: true });
        const success = await notificationsApi.updateNotificationSettings(userId, settings);
        if (success) {
          const current = get().notificationSettings;
          set({
            notificationSettings: current
              ? { ...current, ...settings }
              : null,
          });
        }
        set({ isLoading: false });
        return success;
      },

      savePushToken: async (userId, token, deviceType) => {
        return await notificationsApi.savePushToken(userId, token, deviceType);
      },
    }),
    {
      name: 'bg-bills-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        colorScheme: state.colorScheme,
      }),
    }
  )
);
