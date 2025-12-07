# BG Bills - Architecture Documentation

## Overview

BG Bills is a React Native (Expo) application for tracking Bulgarian household bills and personal finance. It provides reminders, analytics, and a clean interface for managing recurring and one-off payments.

## Technology Stack

### Frontend
- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **UI Components**: React Native Paper (Material Design 3)
- **Styling**: StyleSheet with custom theme

### Backend (BaaS)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Storage**: Supabase Storage (for attachments)
- **Real-time**: Supabase Realtime (future)

### Additional Services
- **Push Notifications**: Expo Notifications
- **Local Storage**: AsyncStorage + SecureStore

## Project Structure

```
/
├── app/                    # Expo Router screens
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Entry point (redirects)
│   ├── onboarding.tsx     # Onboarding flow
│   ├── auth/              # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Dashboard
│   │   ├── bills.tsx      # Bills list
│   │   ├── calendar.tsx   # Calendar view
│   │   ├── reports.tsx    # Analytics
│   │   └── settings.tsx   # Settings
│   └── bill/              # Bill detail screens
│       ├── new.tsx
│       └── [id].tsx
├── src/
│   ├── api/               # Supabase client & API functions
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   ├── bills.ts
│   │   └── notifications.ts
│   ├── components/        # Reusable UI components
│   │   ├── common/
│   │   └── bills/
│   ├── domain/            # Business logic (pure functions)
│   │   ├── recurrence.ts  # Bill recurrence generation
│   │   └── analytics.ts   # Analytics calculations
│   ├── hooks/             # Custom React hooks
│   │   └── useNotifications.ts
│   ├── i18n/              # Internationalization
│   │   ├── index.ts
│   │   └── translations/
│   │       └── bg.ts
│   ├── store/             # Zustand stores
│   │   ├── authStore.ts
│   │   ├── billsStore.ts
│   │   └── settingsStore.ts
│   ├── theme/             # Theme configuration
│   │   └── index.ts
│   ├── types/             # TypeScript type definitions
│   │   └── database.ts
│   └── utils/             # Utility functions
│       ├── format.ts
│       └── validation.ts
├── supabase/
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
└── assets/               # Images, icons, fonts
```

## Data Architecture

### Database Schema

#### Core Tables
1. **profiles** - User settings (extends auth.users)
2. **bill_categories** - Default and custom categories
3. **bill_accounts** - Provider/account information
4. **recurring_bills** - Recurring bill patterns
5. **bill_payments** - Actual payment instances
6. **notification_settings** - Push notification preferences
7. **push_tokens** - Device push tokens

#### Key Relationships
- User → Profiles (1:1)
- User → Bill Accounts (1:N)
- Bill Account → Recurring Bills (1:N)
- Recurring Bill → Bill Payments (1:N)
- Category → Bill Accounts, Recurring Bills, Payments (1:N)

### Row Level Security (RLS)

All tables are protected with RLS policies ensuring users can only access their own data. Default categories are visible to all users.

## State Management

### Zustand Stores

1. **authStore** - Authentication state, user profile
2. **billsStore** - Bills, payments, categories data
3. **settingsStore** - App settings, notifications

### Data Flow

1. User action triggers store action
2. Store calls API function
3. API function calls Supabase
4. Response updates store state
5. Components re-render via subscriptions

## Key Features

### Bill Recurrence
- Support for monthly, bi-monthly, quarterly, yearly schedules
- Automatic payment instance generation
- Due day adjustment for month lengths

### Notifications
- Local scheduling via Expo Notifications
- Configurable days before due date
- Quiet hours support

### Analytics
- Category-based spending breakdown
- Monthly trends
- CSV export capability

## Localization

All UI text is in Bulgarian by default. The i18n system is designed for easy extension to other languages.

### Translation Keys Structure
```typescript
{
  common: { ... },
  auth: { ... },
  nav: { ... },
  dashboard: { ... },
  bills: { ... },
  calendar: { ... },
  reports: { ... },
  settings: { ... },
  errors: { ... },
  // etc.
}
```

## Security Considerations

1. **Authentication**: Supabase Auth with secure token storage
2. **Data Isolation**: RLS policies on all tables
3. **Token Storage**: Expo SecureStore on mobile, AsyncStorage fallback
4. **Input Validation**: Client-side validation with sanitization

## Performance Considerations

1. **Data Caching**: Zustand persist middleware for offline support
2. **Lazy Loading**: Expo Router automatic code splitting
3. **Optimistic Updates**: UI updates before server confirmation
4. **Efficient Queries**: Indexed database columns

## Testing Strategy

1. **Unit Tests**: Domain logic (recurrence, analytics)
2. **Integration Tests**: API functions with mocks
3. **E2E Tests**: Critical user flows (future)

## Deployment

### Development
```bash
npm install
npm start
```

### Production Build
```bash
eas build --platform all
```

### Environment Variables
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
