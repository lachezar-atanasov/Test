import { create } from 'zustand';
import {
  EmotionalLogEntry,
  InteractionLogEntry,
  PlanStep,
  PlanTask,
  UserSettings,
} from '../types';
import { storageService } from '../services/storage';

interface AppState {
  // State
  emotionalLogs: EmotionalLogEntry[];
  interactionLogs: InteractionLogEntry[];
  planSteps: PlanStep[];
  planTasks: PlanTask[];
  settings: UserSettings | null;
  lastContactDate: Date | null;
  isLoading: boolean;

  // Actions
  loadData: () => Promise<void>;
  addEmotionalLog: (entry: EmotionalLogEntry) => Promise<void>;
  updateEmotionalLog: (id: string, entry: Partial<EmotionalLogEntry>) => Promise<void>;
  deleteEmotionalLog: (id: string) => Promise<void>;
  addInteractionLog: (entry: InteractionLogEntry) => Promise<void>;
  updateInteractionLog: (id: string, entry: Partial<InteractionLogEntry>) => Promise<void>;
  deleteInteractionLog: (id: string) => Promise<void>;
  updatePlanStep: (id: string, step: Partial<PlanStep>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  setLastContactDate: (date: Date) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  emotionalLogs: [],
  interactionLogs: [],
  planSteps: [],
  planTasks: [],
  settings: null,
  lastContactDate: null,
  isLoading: false,

  loadData: async () => {
    set({ isLoading: true });
    try {
      const [logs, interactions, steps, tasks, settings, lastContact] = await Promise.all([
        storageService.getEmotionalLogs(),
        storageService.getInteractionLogs(),
        storageService.getPlanSteps(),
        storageService.getPlanTasks(),
        storageService.getSettings(),
        storageService.getLastContactDate(),
      ]);

      set({
        emotionalLogs: logs,
        interactionLogs: interactions,
        planSteps: steps,
        planTasks: tasks,
        settings,
        lastContactDate: lastContact,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  },

  addEmotionalLog: async (entry) => {
    const logs = [...get().emotionalLogs, entry];
    await storageService.saveEmotionalLogs(logs);
    set({ emotionalLogs: logs });
  },

  updateEmotionalLog: async (id, updates) => {
    const logs = get().emotionalLogs.map((log) =>
      log.id === id ? { ...log, ...updates } : log
    );
    await storageService.saveEmotionalLogs(logs);
    set({ emotionalLogs: logs });
  },

  deleteEmotionalLog: async (id) => {
    const logs = get().emotionalLogs.filter((log) => log.id !== id);
    await storageService.saveEmotionalLogs(logs);
    set({ emotionalLogs: logs });
  },

  addInteractionLog: async (entry) => {
    const logs = [...get().interactionLogs, entry];
    await storageService.saveInteractionLogs(logs);
    set({ interactionLogs: logs });
    // Update last contact date if they initiated
    if (entry.initiatedBy === 'me' || entry.initiatedBy === 'them') {
      await get().setLastContactDate(entry.timestamp);
    }
  },

  updateInteractionLog: async (id, updates) => {
    const logs = get().interactionLogs.map((log) =>
      log.id === id ? { ...log, ...updates } : log
    );
    await storageService.saveInteractionLogs(logs);
    set({ interactionLogs: logs });
  },

  deleteInteractionLog: async (id) => {
    const logs = get().interactionLogs.filter((log) => log.id !== id);
    await storageService.saveInteractionLogs(logs);
    set({ interactionLogs: logs });
  },

  updatePlanStep: async (id, updates) => {
    const steps = get().planSteps.map((step) =>
      step.id === id ? { ...step, ...updates } : step
    );
    await storageService.savePlanSteps(steps);
    set({ planSteps: steps });
  },

  toggleTask: async (taskId) => {
    const tasks = get().planTasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            completed: !task.completed,
            completedAt: !task.completed ? new Date() : undefined,
          }
        : task
    );
    await storageService.savePlanTasks(tasks);
    set({ planTasks: tasks });
  },

  updateSettings: async (updates) => {
    const current = get().settings;
    const newSettings: UserSettings = {
      contactMode: 'no-contact',
      hasCompletedOnboarding: false,
      notificationsEnabled: false,
      ...current,
      ...updates,
    };
    await storageService.saveSettings(newSettings);
    set({ settings: newSettings });
  },

  setLastContactDate: async (date) => {
    await storageService.saveLastContactDate(date);
    set({ lastContactDate: date });
  },
}));
