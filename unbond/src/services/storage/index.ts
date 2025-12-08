// ===================================
// Unbond - Storage Service
// ===================================
// Abstraction layer for data persistence.
// Currently uses AsyncStorage, can be replaced with SQLite or backend.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';
import type {
  UserSettings,
  EmotionalLogEntry,
  InteractionLogEntry,
  DailyCheckIn,
  PlanTask,
} from '../../types';

// Default settings for new users
const DEFAULT_SETTINGS: UserSettings = {
  hasCompletedOnboarding: false,
  contactMode: 'no-contact',
  notificationsEnabled: false,
};

// ===================================
// User Settings
// ===================================

export async function getSettings(): Promise<UserSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error loading settings:', error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
}

// ===================================
// Emotional Logs
// ===================================

export async function getEmotionalLogs(): Promise<EmotionalLogEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EMOTIONAL_LOGS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading emotional logs:', error);
    return [];
  }
}

export async function saveEmotionalLog(entry: EmotionalLogEntry): Promise<void> {
  try {
    const logs = await getEmotionalLogs();
    const existingIndex = logs.findIndex((log) => log.id === entry.id);
    
    if (existingIndex >= 0) {
      logs[existingIndex] = entry;
    } else {
      logs.unshift(entry); // Add to beginning (newest first)
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.EMOTIONAL_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving emotional log:', error);
    throw error;
  }
}

export async function deleteEmotionalLog(id: string): Promise<void> {
  try {
    const logs = await getEmotionalLogs();
    const filtered = logs.filter((log) => log.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.EMOTIONAL_LOGS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting emotional log:', error);
    throw error;
  }
}

// ===================================
// Interaction Logs
// ===================================

export async function getInteractionLogs(): Promise<InteractionLogEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.INTERACTION_LOGS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading interaction logs:', error);
    return [];
  }
}

export async function saveInteractionLog(entry: InteractionLogEntry): Promise<void> {
  try {
    const logs = await getInteractionLogs();
    const existingIndex = logs.findIndex((log) => log.id === entry.id);
    
    if (existingIndex >= 0) {
      logs[existingIndex] = entry;
    } else {
      logs.unshift(entry); // Add to beginning (newest first)
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.INTERACTION_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving interaction log:', error);
    throw error;
  }
}

export async function deleteInteractionLog(id: string): Promise<void> {
  try {
    const logs = await getInteractionLogs();
    const filtered = logs.filter((log) => log.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.INTERACTION_LOGS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting interaction log:', error);
    throw error;
  }
}

// ===================================
// Daily Check-ins
// ===================================

export async function getDailyCheckIns(): Promise<DailyCheckIn[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_CHECKINS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading daily check-ins:', error);
    return [];
  }
}

export async function saveDailyCheckIn(entry: DailyCheckIn): Promise<void> {
  try {
    const checkIns = await getDailyCheckIns();
    // Replace if same date exists
    const existingIndex = checkIns.findIndex((c) => c.date === entry.date);
    
    if (existingIndex >= 0) {
      checkIns[existingIndex] = entry;
    } else {
      checkIns.unshift(entry);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_CHECKINS, JSON.stringify(checkIns));
  } catch (error) {
    console.error('Error saving daily check-in:', error);
    throw error;
  }
}

// ===================================
// Plan Progress
// ===================================

export async function getPlanProgress(): Promise<PlanTask[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAN_PROGRESS);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading plan progress:', error);
    return [];
  }
}

export async function savePlanProgress(tasks: PlanTask[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PLAN_PROGRESS, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving plan progress:', error);
    throw error;
  }
}

// ===================================
// Data Export
// ===================================

export async function exportAllData(): Promise<string> {
  try {
    const [settings, emotionalLogs, interactionLogs, dailyCheckIns, planProgress] =
      await Promise.all([
        getSettings(),
        getEmotionalLogs(),
        getInteractionLogs(),
        getDailyCheckIns(),
        getPlanProgress(),
      ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      appVersion: '1.0.0',
      data: {
        settings,
        emotionalLogs,
        interactionLogs,
        dailyCheckIns,
        planProgress,
      },
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

// ===================================
// Clear All Data
// ===================================

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SETTINGS,
      STORAGE_KEYS.EMOTIONAL_LOGS,
      STORAGE_KEYS.INTERACTION_LOGS,
      STORAGE_KEYS.DAILY_CHECKINS,
      STORAGE_KEYS.PLAN_PROGRESS,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
    throw error;
  }
}
