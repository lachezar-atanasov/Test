// ===================================
// Unbond - Type Definitions
// ===================================

// Emotion types for logging
export type EmotionType =
  | 'fear'
  | 'guilt'
  | 'shame'
  | 'longing'
  | 'anger'
  | 'confusion'
  | 'relief'
  | 'sadness'
  | 'hope'
  | 'anxiety';

// Interaction types
export type InteractionType =
  | 'call'
  | 'text'
  | 'in-person'
  | 'social-media'
  | 'email'
  | 'through-others';

// Red flag patterns
export type RedFlagType =
  | 'gaslighting'
  | 'blame-shifting'
  | 'silent-treatment'
  | 'love-bombing'
  | 'threats'
  | 'guilt-tripping'
  | 'manipulation'
  | 'boundary-violation'
  | 'dismissiveness'
  | 'future-faking';

// Article categories
export type ArticleCategory =
  | 'understanding'
  | 'patterns'
  | 'leaving'
  | 'contact-strategies'
  | 'attachment'
  | 'healing';

// Contact mode
export type ContactMode = 'no-contact' | 'low-contact';

// ===================================
// Data Models
// ===================================

export interface UserSettings {
  hasCompletedOnboarding: boolean;
  contactMode: ContactMode;
  region?: string;
  notificationsEnabled: boolean;
  lastContactDate?: string; // ISO date
  streakStartDate?: string; // ISO date
}

export interface EmotionalLogEntry {
  id: string;
  createdAt: string; // ISO datetime
  cravingIntensity: number; // 1-10
  emotion: EmotionType;
  note?: string;
}

export interface InteractionLogEntry {
  id: string;
  createdAt: string; // ISO datetime
  interactionType: InteractionType;
  initiatedBy: 'me' | 'them';
  feelingBefore: number; // 1-10
  feelingDuring: number; // 1-10
  feelingAfter: number; // 1-10
  redFlags: RedFlagType[];
  note?: string;
}

export interface DailyCheckIn {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  moodScore: number; // 1-10
  note?: string;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface PlanTask {
  id: string;
  stepId: string;
  title: string;
  isCompleted: boolean;
  notes?: string;
}

export interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  content: string;
  keyPoints: string[];
  rememberBox?: string;
}

export interface CopingScript {
  id: string;
  title: string;
  content: string;
  category: 'grounding' | 'affirmation' | 'reminder';
}

// ===================================
// UI Types
// ===================================

export interface EmotionOption {
  value: EmotionType;
  label: string;
  emoji: string;
}

export interface InteractionTypeOption {
  value: InteractionType;
  label: string;
  icon: string;
}

export interface RedFlagOption {
  value: RedFlagType;
  label: string;
  description: string;
}

// ===================================
// Navigation Types
// ===================================

export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  SOS: undefined;
  Settings: undefined;
  ArticleDetail: { articleId: string };
  EmotionalLogDetail: { entryId?: string };
  InteractionDetail: { entryId?: string };
  Stats: { type: 'emotional' | 'interaction' };
};

export type MainTabParamList = {
  Home: undefined;
  Journal: undefined;
  Log: undefined;
  Learn: undefined;
  Plan: undefined;
};
