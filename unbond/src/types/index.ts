export type EmotionType =
  | 'fear'
  | 'guilt'
  | 'shame'
  | 'longing'
  | 'anger'
  | 'confusion'
  | 'relief'
  | 'anxiety'
  | 'sadness'
  | 'hope';

export type RedFlag =
  | 'gaslighting'
  | 'blame-shifting'
  | 'silent-treatment'
  | 'love-bombing'
  | 'threats'
  | 'guilt-tripping'
  | 'isolation'
  | 'financial-control'
  | 'emotional-blackmail'
  | 'other';

export type InteractionType =
  | 'call'
  | 'text'
  | 'in-person'
  | 'social-media'
  | 'other';

export type ContactMode = 'no-contact' | 'low-contact';

export interface EmotionalLogEntry {
  id: string;
  timestamp: Date;
  intensity: number; // 1-10
  emotion: EmotionType;
  note?: string;
}

export interface InteractionLogEntry {
  id: string;
  timestamp: Date;
  type: InteractionType;
  initiatedBy: 'me' | 'them';
  feelingBefore: number; // 1-10
  feelingDuring: number; // 1-10
  feelingAfter: number; // 1-10
  redFlags: RedFlag[];
  notes?: string;
}

export interface PlanTask {
  id: string;
  stepId: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  order: number;
  tasks: PlanTask[];
  notes?: string;
  completedAt?: Date;
}

export interface UserSettings {
  contactMode: ContactMode;
  region?: string;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
  lastContactDate?: Date;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  content: string;
  keyPoints?: string[];
  remember?: string;
}

export interface CopingScript {
  id: string;
  title: string;
  content: string;
  category: 'affirmation' | 'grounding' | 'boundary' | 'safety';
}
