# BG Bills - Architecture Documentation

## Overview

BG Bills is a React Native application built with Expo, using Supabase as the backend-as-a-service. The app follows a clean architecture pattern with clear separation between UI, business logic, and data layers.

## Architecture Layers

### 1. Presentation Layer (`app/`)

- **Expo Router**: File-based routing
  - `(auth)/`: Authentication flow (login, register, forgot password)
  - `(tabs)/`: Main app tabs (dashboard, bills, calendar, reports, settings)
  - `bills/`: Bill management screens

- **Components** (`src/components/`): Reusable UI components
  - `Button.tsx`: Standardized button component
  - `Input.tsx`: Form input with validation display

### 2. State Management (`src/store/`)

- **Zustand**: Lightweight state management
  - `authStore.ts`: Authentication state and user profile

### 3. Business Logic (`src/domain/`)

Pure functions for core business logic:

- **Recurrence** (`domain/recurrence/`):
  - `generator.ts`: Generates bill instances based on recurrence patterns
  - Supports: monthly, bi-monthly, quarterly, yearly, custom

- **Analytics** (`domain/analytics/`):
  - `aggregator.ts`: Aggregates payments by category, provider, date range
  - Generates monthly summaries with percentages

### 4. Data Layer (`src/api/`)

- **Supabase Client** (`api/supabase.ts`): Configured Supabase client with AsyncStorage
- **API Functions** (`api/bills.ts`): Typed functions for all database operations
  - Profile management
  - Categories CRUD
  - Bill accounts CRUD
  - Recurring bills with automatic payment generation
  - Bill payments CRUD
  - Notification settings

### 5. Utilities (`src/utils/`)

- **i18n.ts**: Translation system (currently Bulgarian only, ready for expansion)
- **notifications.ts**: Expo Push Notifications wrapper
  - Registration
  - Scheduling reminders
  - Cancellation

## Data Flow

### Creating a Recurring Bill

1. User fills form in `app/bills/add.tsx`
2. Calls `createRecurringBill()` from `src/api/bills.ts`
3. API function:
   - Inserts into `recurring_bills` table
   - Calls `generateBillInstances()` from domain layer
   - Creates `bill_payments` entries for next 3 months
4. UI updates via state/refetch

### Dashboard Display

1. `app/(tabs)/dashboard.tsx` loads on mount
2. Calls `getBillPayments()` with date filters
3. Filters and displays:
   - Upcoming bills (next 14 days)
   - Overdue bills
   - Summary cards (total, paid, remaining)

### Notifications

1. On app start, `registerForPushNotifications()` requests permissions
2. When bills are created/updated, `scheduleBillReminders()` is called
3. Notifications scheduled for configured days before due date
4. Local notifications fire at scheduled times

## Database Schema

### Key Relationships

```
profiles (1) ──< bill_accounts
profiles (1) ──< recurring_bills
profiles (1) ──< bill_payments
bill_categories (1) ──< bill_accounts
bill_categories (1) ──< recurring_bills
bill_categories (1) ──< bill_payments
bill_accounts (1) ──< recurring_bills
bill_accounts (1) ──< bill_payments
recurring_bills (1) ──< bill_payments (optional, for one-off bills)
```

### Row Level Security (RLS)

All tables have RLS enabled:
- Users can only SELECT/INSERT/UPDATE/DELETE their own data
- Default categories are visible to all users
- Policies use `auth.uid()` for user identification

## Recurrence Logic

The recurrence generator (`src/domain/recurrence/generator.ts`) handles:

1. **Monthly**: Same day each month
2. **Bi-monthly**: Every 2 months
3. **Quarterly**: Every 3 months
4. **Yearly**: Same date each year
5. **Custom**: Placeholder for future cron-based scheduling

When a recurring bill is created, instances are generated for the next 3 months. Future enhancements could:
- Generate on-demand when viewing future months
- Use a background job to generate monthly

## Analytics

The analytics module (`src/domain/analytics/aggregator.ts`) provides:

- **By Category**: Sum and percentage of total by category
- **By Provider**: Sum and percentage by provider name
- **Date Range Filtering**: Filter payments by start/end date
- **Monthly Summary**: Complete breakdown with paid/upcoming/overdue totals

All calculations are pure functions, making them easily testable.

## Testing Strategy

- **Unit Tests**: Domain logic (recurrence, analytics)
- **Integration Tests**: API functions with mocked Supabase
- **Component Tests**: UI components (future)

Test files use `.test.ts` suffix and are located next to source files.

## Future Enhancements

1. **Backend Scheduling**: Move notification scheduling to Supabase Edge Functions
2. **Multi-currency**: Support for EUR, USD, etc.
3. **Export**: CSV/PDF export of reports
4. **Attachments**: Photo/PDF upload for bills
5. **Recurring Bill Templates**: Pre-configured common bills
6. **Budgeting**: Set monthly budgets per category
7. **Dark Mode**: Theme support

## Environment Variables

Required:
- `EXPO_PUBLIC_SUPABASE_URL`: Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

Optional (for production):
- Push notification configuration
- Analytics keys

## Security Considerations

1. **RLS Policies**: All data access controlled at database level
2. **No Sensitive Data**: Passwords handled by Supabase Auth
3. **Token Storage**: Auth tokens stored securely in AsyncStorage
4. **Input Validation**: Client-side validation + database constraints

## Performance Optimizations

1. **Caching**: Supabase client caches queries automatically
2. **Pagination**: Future: Implement pagination for large bill lists
3. **Lazy Loading**: Screens load data on demand
4. **Optimistic Updates**: Consider for better UX (future)
