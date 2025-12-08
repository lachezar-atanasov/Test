// ===================================
// Unbond - Plan Store (Zustand)
// ===================================

import { create } from 'zustand';
import type { PlanStep, PlanTask } from '../types';
import * as storage from '../services/storage';

// Default escape plan structure
const DEFAULT_PLAN_STEPS: PlanStep[] = [
  {
    id: 'step-1',
    title: 'Education Phase',
    description: 'Learn about trauma bonds and understand your situation. Knowledge is the first step to freedom.',
    order: 1,
  },
  {
    id: 'step-2',
    title: 'Boundary Setting',
    description: 'Start establishing and practicing boundaries, even small ones. This builds your confidence.',
    order: 2,
  },
  {
    id: 'step-3',
    title: 'Preparing Your Environment',
    description: 'Build your support network and prepare practical aspects for increased independence.',
    order: 3,
  },
  {
    id: 'step-4',
    title: 'Creating Distance',
    description: 'Begin implementing no-contact or low-contact strategies based on your situation.',
    order: 4,
  },
  {
    id: 'step-5',
    title: 'Stabilization Phase',
    description: 'Focus on managing withdrawal symptoms and building daily routines for stability.',
    order: 5,
  },
  {
    id: 'step-6',
    title: 'Building Your New Life',
    description: 'Establish new pillars of your life: purpose, relationships, self-care, and growth.',
    order: 6,
  },
];

const DEFAULT_PLAN_TASKS: PlanTask[] = [
  // Step 1: Education
  { id: 'task-1-1', stepId: 'step-1', title: 'Read about what a trauma bond is', isCompleted: false },
  { id: 'task-1-2', stepId: 'step-1', title: 'Learn about common manipulation patterns', isCompleted: false },
  { id: 'task-1-3', stepId: 'step-1', title: 'Understand why leaving feels so hard', isCompleted: false },
  { id: 'task-1-4', stepId: 'step-1', title: 'Identify which patterns apply to my situation', isCompleted: false },
  
  // Step 2: Boundary Setting
  { id: 'task-2-1', stepId: 'step-2', title: 'Identify one small boundary to set', isCompleted: false },
  { id: 'task-2-2', stepId: 'step-2', title: 'Practice saying "no" in low-stakes situations', isCompleted: false },
  { id: 'task-2-3', stepId: 'step-2', title: 'Notice how it feels when boundaries are crossed', isCompleted: false },
  { id: 'task-2-4', stepId: 'step-2', title: 'Create a list of my non-negotiable boundaries', isCompleted: false },
  
  // Step 3: Environment Prep
  { id: 'task-3-1', stepId: 'step-3', title: 'Identify at least one trusted person to confide in', isCompleted: false },
  { id: 'task-3-2', stepId: 'step-3', title: 'Secure important documents and belongings', isCompleted: false },
  { id: 'task-3-3', stepId: 'step-3', title: 'Research local resources (therapists, support groups)', isCompleted: false },
  { id: 'task-3-4', stepId: 'step-3', title: 'Create a safety plan if needed', isCompleted: false },
  { id: 'task-3-5', stepId: 'step-3', title: 'Build financial independence where possible', isCompleted: false },
  
  // Step 4: Creating Distance
  { id: 'task-4-1', stepId: 'step-4', title: 'Decide on no-contact or low-contact approach', isCompleted: false },
  { id: 'task-4-2', stepId: 'step-4', title: 'Block or limit on social media', isCompleted: false },
  { id: 'task-4-3', stepId: 'step-4', title: 'Prepare responses for potential hoovering', isCompleted: false },
  { id: 'task-4-4', stepId: 'step-4', title: 'Remove or store triggering items', isCompleted: false },
  
  // Step 5: Stabilization
  { id: 'task-5-1', stepId: 'step-5', title: 'Establish a daily routine', isCompleted: false },
  { id: 'task-5-2', stepId: 'step-5', title: 'Identify and use grounding techniques', isCompleted: false },
  { id: 'task-5-3', stepId: 'step-5', title: 'Allow myself to grieve the relationship', isCompleted: false },
  { id: 'task-5-4', stepId: 'step-5', title: 'Track my cravings and emotions in this app', isCompleted: false },
  { id: 'task-5-5', stepId: 'step-5', title: 'Reach out to support when struggling', isCompleted: false },
  
  // Step 6: New Life
  { id: 'task-6-1', stepId: 'step-6', title: 'Reconnect with hobbies or find new ones', isCompleted: false },
  { id: 'task-6-2', stepId: 'step-6', title: 'Nurture healthy relationships', isCompleted: false },
  { id: 'task-6-3', stepId: 'step-6', title: 'Set personal goals for the next 3 months', isCompleted: false },
  { id: 'task-6-4', stepId: 'step-6', title: 'Practice self-compassion daily', isCompleted: false },
  { id: 'task-6-5', stepId: 'step-6', title: 'Celebrate small wins and progress', isCompleted: false },
];

interface PlanState {
  steps: PlanStep[];
  tasks: PlanTask[];
  isLoading: boolean;

  // Actions
  loadPlan: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  updateTaskNotes: (taskId: string, notes: string) => Promise<void>;
  
  // Computed
  getTasksForStep: (stepId: string) => PlanTask[];
  getStepProgress: (stepId: string) => number;
  getOverallProgress: () => number;
  getCurrentStep: () => PlanStep | null;
}

export const usePlanStore = create<PlanState>((set, get) => ({
  steps: DEFAULT_PLAN_STEPS,
  tasks: [],
  isLoading: true,

  loadPlan: async () => {
    set({ isLoading: true });
    try {
      const savedTasks = await storage.getPlanProgress();
      
      // Merge saved tasks with defaults (to handle new tasks added in updates)
      const mergedTasks = DEFAULT_PLAN_TASKS.map((defaultTask) => {
        const savedTask = savedTasks.find((t) => t.id === defaultTask.id);
        return savedTask || defaultTask;
      });

      set({ tasks: mergedTasks, isLoading: false });
    } catch (error) {
      console.error('Failed to load plan:', error);
      set({ tasks: DEFAULT_PLAN_TASKS, isLoading: false });
    }
  },

  toggleTask: async (taskId) => {
    const tasks = get().tasks.map((task) =>
      task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
    );
    set({ tasks });
    await storage.savePlanProgress(tasks);
  },

  updateTaskNotes: async (taskId, notes) => {
    const tasks = get().tasks.map((task) =>
      task.id === taskId ? { ...task, notes } : task
    );
    set({ tasks });
    await storage.savePlanProgress(tasks);
  },

  getTasksForStep: (stepId) => {
    return get().tasks.filter((task) => task.stepId === stepId);
  },

  getStepProgress: (stepId) => {
    const tasks = get().getTasksForStep(stepId);
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.isCompleted).length;
    return Math.round((completed / tasks.length) * 100);
  },

  getOverallProgress: () => {
    const tasks = get().tasks;
    if (tasks.length === 0) return 0;
    const completed = tasks.filter((t) => t.isCompleted).length;
    return Math.round((completed / tasks.length) * 100);
  },

  getCurrentStep: () => {
    const steps = get().steps;
    const tasks = get().tasks;

    for (const step of steps) {
      const stepTasks = tasks.filter((t) => t.stepId === step.id);
      const allCompleted = stepTasks.every((t) => t.isCompleted);
      if (!allCompleted) {
        return step;
      }
    }
    
    return steps[steps.length - 1]; // Return last step if all complete
  },
}));
