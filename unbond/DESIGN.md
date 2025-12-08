# Unbond - Trauma Bond Recovery Companion

## App Overview

Unbond is a mobile app designed to help users who are stuck in toxic/trauma-bond relationships. The app provides psychoeducation, emotional tracking, interaction logging, escape planning, and crisis tools.

**Important Disclaimer**: This app is NOT a substitute for professional mental health care. If you are in danger or experiencing severe distress, contact local emergency services or a licensed professional.

---

## Navigation Structure

### Bottom Tab Navigator
1. **Home** - Dashboard with daily check-in and quick actions
2. **Journal** - Emotional log and craving tracker
3. **Log** - Interaction log with toxic partner
4. **Learn** - Psychoeducation library
5. **Plan** - Escape plan with steps and checklist

### Additional Screens (Stack Navigation)
- **SOS** - Accessible from Home, grounding tools and crisis support
- **Settings** - App settings and data management
- **Onboarding** - First-run flow (3 screens)
- **ArticleDetail** - Individual article viewer
- **EmotionalLogDetail** - View/edit individual log entry
- **InteractionDetail** - View/edit individual interaction

---

## Data Models

### UserSettings
```typescript
interface UserSettings {
  hasCompletedOnboarding: boolean;
  contactMode: 'no-contact' | 'low-contact';
  region?: string;
  notificationsEnabled: boolean;
  lastContactDate?: string; // ISO date
  streakStartDate?: string; // ISO date
}
```

### EmotionalLogEntry
```typescript
interface EmotionalLogEntry {
  id: string;
  createdAt: string; // ISO datetime
  cravingIntensity: number; // 1-10
  emotion: EmotionType;
  note?: string;
}

type EmotionType = 
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
```

### InteractionLogEntry
```typescript
interface InteractionLogEntry {
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

type InteractionType = 
  | 'call' 
  | 'text' 
  | 'in-person' 
  | 'social-media' 
  | 'email'
  | 'through-others';

type RedFlagType =
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
```

### DailyCheckIn
```typescript
interface DailyCheckIn {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  moodScore: number; // 1-10
  note?: string;
}
```

### PlanStep
```typescript
interface PlanStep {
  id: string;
  title: string;
  description: string;
  order: number;
  tasks: PlanTask[];
}

interface PlanTask {
  id: string;
  stepId: string;
  title: string;
  isCompleted: boolean;
  notes?: string;
}
```

### Article (Static Content)
```typescript
interface Article {
  id: string;
  title: string;
  category: ArticleCategory;
  content: string;
  keyPoints: string[];
  rememberBox?: string;
}

type ArticleCategory =
  | 'understanding'
  | 'patterns'
  | 'leaving'
  | 'contact-strategies'
  | 'attachment'
  | 'healing';
```

---

## Storage Architecture

### Storage Service Interface
```typescript
interface StorageService {
  // User Settings
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: UserSettings): Promise<void>;
  
  // Emotional Logs
  getEmotionalLogs(): Promise<EmotionalLogEntry[]>;
  saveEmotionalLog(entry: EmotionalLogEntry): Promise<void>;
  deleteEmotionalLog(id: string): Promise<void>;
  
  // Interaction Logs
  getInteractionLogs(): Promise<InteractionLogEntry[]>;
  saveInteractionLog(entry: InteractionLogEntry): Promise<void>;
  deleteInteractionLog(id: string): Promise<void>;
  
  // Daily Check-ins
  getDailyCheckIns(): Promise<DailyCheckIn[]>;
  saveDailyCheckIn(entry: DailyCheckIn): Promise<void>;
  
  // Plan Progress
  getPlanProgress(): Promise<PlanTask[]>;
  savePlanProgress(tasks: PlanTask[]): Promise<void>;
  
  // Export
  exportAllData(): Promise<string>; // JSON string
}
```

### Implementation
- MVP uses AsyncStorage
- Data stored as JSON strings under keys:
  - `@unbond/settings`
  - `@unbond/emotional-logs`
  - `@unbond/interaction-logs`
  - `@unbond/daily-checkins`
  - `@unbond/plan-progress`

---

## State Management (Zustand)

### Stores
1. **useSettingsStore** - User preferences and onboarding state
2. **useEmotionalLogStore** - Emotional log entries
3. **useInteractionLogStore** - Interaction log entries
4. **usePlanStore** - Escape plan progress
5. **useDailyCheckInStore** - Daily mood check-ins

---

## Screen Details

### 1. Onboarding (3 screens)
- Welcome & what the app does
- Disclaimer (must acknowledge)
- Contact mode selection (No-Contact vs Low-Contact)

### 2. Home Dashboard
- Daily greeting with mood check-in (if not done today)
- Quick action buttons: Log Craving, Log Interaction, SOS
- Stats card: Days since contact, streak
- Mini mood chart (last 7 days)
- Today's Insight card (random educational tip)

### 3. Emotional Log
- List view with date filters
- FAB to add new entry
- Each entry shows: date, emotion, intensity
- Tap to view/edit details
- Stats button to see charts

### 4. Interaction Log
- Timeline view
- FAB to add new interaction
- Each entry shows: date, type, initiator, red flags count
- Tap to view/edit details
- Stats showing patterns

### 5. Library
- Category tabs or filters
- Search bar
- Article cards with title and preview
- Tap to open full article

### 6. Plan
- Vertical stepper showing phases
- Each phase expands to show tasks
- Checkbox for each task
- Overall progress bar at top
- Notes field per step

### 7. SOS Screen
- Large, calming UI
- "What are you feeling?" quick buttons
- Grounding exercise cards (breathing, 5-4-3-2-1)
- "Remember" section with past negative outcomes
- "Delay 10 minutes" button
- Affirmations carousel

### 8. Settings
- Contact mode toggle
- Region selector
- Export data button
- Clear data option (with confirmation)
- About & disclaimer

---

## UI Theme

### Colors
- Background: `#FAFAFA` (light gray)
- Surface: `#FFFFFF`
- Primary: `#6B8E9F` (calm teal)
- Primary Dark: `#4A6B7A`
- Accent: `#E8B4A0` (soft coral)
- Text Primary: `#2D3436`
- Text Secondary: `#636E72`
- Error: `#D63031`
- Warning: `#FDCB6E`
- Success: `#00B894`

### Typography
- Heading 1: 28px, Semi-bold
- Heading 2: 22px, Semi-bold
- Heading 3: 18px, Medium
- Body: 16px, Regular
- Caption: 14px, Regular
- Small: 12px, Regular

### Spacing
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

---

## Future Enhancements (Post-MVP)
- Push notifications for check-in reminders
- Cloud sync with end-to-end encryption
- AI-powered insights and pattern recognition
- Community support (moderated)
- Therapist connection feature
- Safety planning tools
- Localized crisis resources by region
