// ===================================
// Unbond - Constants
// ===================================

import type {
  EmotionOption,
  InteractionTypeOption,
  RedFlagOption,
} from '../types';

// App configuration
export const APP_NAME = 'Unbond';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  SETTINGS: '@unbond/settings',
  EMOTIONAL_LOGS: '@unbond/emotional-logs',
  INTERACTION_LOGS: '@unbond/interaction-logs',
  DAILY_CHECKINS: '@unbond/daily-checkins',
  PLAN_PROGRESS: '@unbond/plan-progress',
} as const;

// Emotion options for selection
export const EMOTION_OPTIONS: EmotionOption[] = [
  { value: 'longing', label: 'Longing', emoji: '💭' },
  { value: 'anxiety', label: 'Anxiety', emoji: '😰' },
  { value: 'fear', label: 'Fear', emoji: '😨' },
  { value: 'guilt', label: 'Guilt', emoji: '😔' },
  { value: 'shame', label: 'Shame', emoji: '😞' },
  { value: 'anger', label: 'Anger', emoji: '😤' },
  { value: 'confusion', label: 'Confusion', emoji: '😵' },
  { value: 'sadness', label: 'Sadness', emoji: '😢' },
  { value: 'relief', label: 'Relief', emoji: '😌' },
  { value: 'hope', label: 'Hope', emoji: '🌱' },
];

// Interaction type options
export const INTERACTION_TYPE_OPTIONS: InteractionTypeOption[] = [
  { value: 'text', label: 'Text Message', icon: '💬' },
  { value: 'call', label: 'Phone Call', icon: '📞' },
  { value: 'in-person', label: 'In Person', icon: '👤' },
  { value: 'social-media', label: 'Social Media', icon: '📱' },
  { value: 'email', label: 'Email', icon: '📧' },
  { value: 'through-others', label: 'Through Others', icon: '👥' },
];

// Red flag options
export const RED_FLAG_OPTIONS: RedFlagOption[] = [
  {
    value: 'gaslighting',
    label: 'Gaslighting',
    description: 'Making you question your reality or memory',
  },
  {
    value: 'blame-shifting',
    label: 'Blame Shifting',
    description: 'Turning the blame onto you for their behavior',
  },
  {
    value: 'silent-treatment',
    label: 'Silent Treatment',
    description: 'Withdrawing communication as punishment',
  },
  {
    value: 'love-bombing',
    label: 'Love Bombing',
    description: 'Overwhelming affection to regain control',
  },
  {
    value: 'threats',
    label: 'Threats',
    description: 'Threatening harm, leaving, or consequences',
  },
  {
    value: 'guilt-tripping',
    label: 'Guilt Tripping',
    description: 'Making you feel responsible for their emotions',
  },
  {
    value: 'manipulation',
    label: 'Manipulation',
    description: 'Using tactics to control your decisions',
  },
  {
    value: 'boundary-violation',
    label: 'Boundary Violation',
    description: 'Ignoring or disrespecting your boundaries',
  },
  {
    value: 'dismissiveness',
    label: 'Dismissiveness',
    description: 'Minimizing your feelings or concerns',
  },
  {
    value: 'future-faking',
    label: 'Future Faking',
    description: 'Making promises with no intention to keep them',
  },
];

// Mood emoji scale (1-10)
export const MOOD_EMOJIS = ['😭', '😢', '😞', '😔', '😐', '🙂', '😊', '😄', '😁', '🤩'];

// Intensity labels
export const INTENSITY_LABELS = {
  1: 'Very Low',
  2: 'Low',
  3: 'Mild',
  4: 'Moderate-Low',
  5: 'Moderate',
  6: 'Moderate-High',
  7: 'High',
  8: 'Very High',
  9: 'Intense',
  10: 'Overwhelming',
} as const;

// Disclaimer text
export const DISCLAIMER_TEXT = `This app is NOT a substitute for professional mental health care.

If you are in danger or experiencing severe distress, please contact local emergency services or a licensed mental health professional.

Unbond is designed to provide educational information, journaling tools, and supportive resources. It does not provide medical advice, diagnoses, or treatment.

Your safety and wellbeing are the priority. Please seek appropriate professional help for your specific situation.`;

// Short disclaimer for display in various screens
export const SHORT_DISCLAIMER = 'This app is not a substitute for professional mental health care. If you are in danger, please contact emergency services.';
