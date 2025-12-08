# Unbond - Trauma Bond Recovery Companion App

## Overview
A mobile app to help users understand, track, and recover from trauma-bond relationships through education, logging, pattern recognition, and structured healing plans.

## Navigation Structure

### Bottom Tab Navigator (Main Navigation)
1. **Home** - Dashboard with quick actions and insights
2. **Log** - Emotional and interaction logging
3. **Library** - Psychoeducation content
4. **Plan** - Escape plan and steps
5. **Settings** - App preferences

### Stack Navigators (Nested)
- **Log Stack**: EmotionalLog, CravingDetail, InteractionLog, InteractionDetail
- **Library Stack**: Library (list), ArticleDetail
- **Plan Stack**: Plan (main), StepDetail (optional)
- **SOS Stack**: Sos (standalone, accessible from Home)

## Data Models

### EmotionalLogEntry
```typescript
{
  id: string;
  timestamp: Date;
  intensity: number; // 1-10
  emotion: EmotionType;
  note?: string;
}
```

### InteractionLogEntry
```typescript
{
  id: string;
  timestamp: Date;
  type: 'call' | 'text' | 'in-person' | 'social-media' | 'other';
  initiatedBy: 'me' | 'them';
  feelingBefore: number; // 1-10
  feelingDuring: number; // 1-10
  feelingAfter: number; // 1-10
  redFlags: RedFlag[];
  notes?: string;
}
```

### PlanStep
```typescript
{
  id: string;
  title: string;
  description: string;
  order: number;
  tasks: PlanTask[];
  notes?: string;
  completedAt?: Date;
}
```

### PlanTask
```typescript
{
  id: string;
  stepId: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}
```

### UserSettings
```typescript
{
  contactMode: 'no-contact' | 'low-contact';
  region?: string;
  hasCompletedOnboarding: boolean;
  notificationsEnabled: boolean;
}
```

### RedFlag (enum/type)
```typescript
'gaslighting' | 'blame-shifting' | 'silent-treatment' | 
'love-bombing' | 'threats' | 'guilt-tripping' | 'isolation' | 
'financial-control' | 'emotional-blackmail' | 'other'
```

### EmotionType
```typescript
'fear' | 'guilt' | 'shame' | 'longing' | 'anger' | 
'confusion' | 'relief' | 'anxiety' | 'sadness' | 'hope'
```

## Storage Architecture

- **Service Layer**: `src/services/storage.ts`
  - Abstracts AsyncStorage operations
  - Provides typed get/set/delete methods
  - Keys: `emotionalLogs`, `interactionLogs`, `planSteps`, `planTasks`, `settings`, `lastContactDate`

- **State Management**: Zustand stores
  - `useAppStore` - Main app state (settings, logs, plan)
  - Provides actions for CRUD operations
  - Syncs with storage service

## Screen Details

### 1. Onboarding
- Welcome screen
- Disclaimer (prominent)
- Contact mode selection
- Completion flag

### 2. Home/Dashboard
- Daily greeting
- Quick emotional check-in (1-10 or emoji)
- Shortcuts: Log Interaction, Log Craving, SOS
- Stats cards:
  - Days since last contact
  - No-contact streak
  - Weekly mood trend (mini chart)
- Today's Insight card

### 3. Emotional Log
- List view with filters (date range, emotion)
- Create entry form
- Detail view with chart visualization

### 4. Interaction Log
- Timeline/list view
- Create entry form
- Detail view
- Stats: interactions/week, initiation %, common red flags

### 5. Library
- Category list
- Article list with search
- Article detail view

### 6. Plan
- Progress overview
- Step list with completion status
- Step detail with tasks checklist

### 7. SOS
- Quick feeling buttons
- Past negative outcomes reminder
- Grounding exercises
- Delay action button
- Coping scripts

### 8. Settings
- Contact mode toggle
- Region selector (future)
- Data export (JSON share)
- About/Disclaimer

## Theme & Design

### Colors
- Primary: Soft blue (#6B9BD2)
- Background: Light gray (#F5F5F5)
- Text: Dark gray (#333333)
- Accent: Warm coral (#E8A87C) for warnings/important
- Success: Soft green (#7FB069)
- Error: Soft red (#D77A61)

### Typography
- Headings: System default, bold
- Body: System default, regular
- Spacing: Generous padding (16-24px)

### Principles
- Calm, non-stimulating
- Supportive, non-shaming language
- Clear hierarchy
- Accessible contrast
