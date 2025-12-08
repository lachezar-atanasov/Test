import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EmotionalLogEntry,
  InteractionLogEntry,
  PlanStep,
  PlanTask,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  EMOTIONAL_LOGS: 'emotionalLogs',
  INTERACTION_LOGS: 'interactionLogs',
  PLAN_STEPS: 'planSteps',
  PLAN_TASKS: 'planTasks',
  SETTINGS: 'settings',
  LAST_CONTACT_DATE: 'lastContactDate',
} as const;

// Helper to serialize/deserialize dates
const serialize = <T>(data: T): string => {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

const deserialize = <T>(json: string): T => {
  return JSON.parse(json, (key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
};

export const storageService = {
  // Emotional Logs
  async getEmotionalLogs(): Promise<EmotionalLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EMOTIONAL_LOGS);
      if (!data) return [];
      return deserialize<EmotionalLogEntry[]>(data);
    } catch (error) {
      console.error('Error getting emotional logs:', error);
      return [];
    }
  },

  async saveEmotionalLogs(logs: EmotionalLogEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.EMOTIONAL_LOGS, serialize(logs));
    } catch (error) {
      console.error('Error saving emotional logs:', error);
      throw error;
    }
  },

  // Interaction Logs
  async getInteractionLogs(): Promise<InteractionLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.INTERACTION_LOGS);
      if (!data) return [];
      return deserialize<InteractionLogEntry[]>(data);
    } catch (error) {
      console.error('Error getting interaction logs:', error);
      return [];
    }
  },

  async saveInteractionLogs(logs: InteractionLogEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.INTERACTION_LOGS, serialize(logs));
    } catch (error) {
      console.error('Error saving interaction logs:', error);
      throw error;
    }
  },

  // Plan Steps
  async getPlanSteps(): Promise<PlanStep[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAN_STEPS);
      if (!data) return [];
      return deserialize<PlanStep[]>(data);
    } catch (error) {
      console.error('Error getting plan steps:', error);
      return [];
    }
  },

  async savePlanSteps(steps: PlanStep[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAN_STEPS, serialize(steps));
    } catch (error) {
      console.error('Error saving plan steps:', error);
      throw error;
    }
  },

  // Plan Tasks
  async getPlanTasks(): Promise<PlanTask[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PLAN_TASKS);
      if (!data) return [];
      return deserialize<PlanTask[]>(data);
    } catch (error) {
      console.error('Error getting plan tasks:', error);
      return [];
    }
  },

  async savePlanTasks(tasks: PlanTask[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PLAN_TASKS, serialize(tasks));
    } catch (error) {
      console.error('Error saving plan tasks:', error);
      throw error;
    }
  },

  // Settings
  async getSettings(): Promise<UserSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return null;
      return deserialize<UserSettings>(data);
    } catch (error) {
      console.error('Error getting settings:', error);
      return null;
    }
  },

  async saveSettings(settings: UserSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, serialize(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  // Last Contact Date
  async getLastContactDate(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CONTACT_DATE);
      if (!data) return null;
      return deserialize<Date>(data);
    } catch (error) {
      console.error('Error getting last contact date:', error);
      return null;
    }
  },

  async saveLastContactDate(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CONTACT_DATE, serialize(date));
    } catch (error) {
      console.error('Error saving last contact date:', error);
      throw error;
    }
  },

  // Clear all data (for testing/reset)
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  },
};
