# BG Bills - Bulgarian Bills & Personal Finance Tracker

A React Native (Expo) mobile application for tracking household bills and personal finances, specifically designed for Bulgarian users.

## Features

- 📱 **Track Recurring Bills**: Manage monthly, bi-monthly, quarterly, and yearly bills
- 🔔 **Smart Reminders**: Push notifications before due dates
- 📊 **Analytics & Reports**: Monthly overview with category and provider breakdowns
- 📅 **Calendar View**: Visual calendar with bill due dates
- 💰 **One-off Bills**: Support for one-time expenses
- 🇧🇬 **Bulgarian Language**: Fully localized UI in Bulgarian

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Notifications**: Expo Push Notifications
- **Language**: TypeScript (strict mode)
- **Testing**: Jest

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project
- iOS Simulator (for macOS) or Android Emulator / physical device

## Setup

1. **Clone and install dependencies**:
   ```bash
   cd bg-bills-app
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Setup Supabase database**:
   - Create a new Supabase project
   - Run the migrations in `supabase/migrations/`:
     - `001_initial_schema.sql` - Creates all tables and RLS policies
     - `002_seed_default_categories.sql` - Seeds default Bulgarian categories

4. **Start the development server**:
   ```bash
   npm start
   ```

5. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Project Structure

```
bg-bills-app/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── bills/             # Bill management screens
├── src/
│   ├── api/               # Supabase API functions
│   ├── components/        # Reusable UI components
│   ├── domain/            # Business logic
│   │   ├── analytics/     # Analytics aggregation
│   │   └── recurrence/    # Recurrence generation
│   ├── store/             # Zustand stores
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities (i18n, notifications)
├── supabase/
│   └── migrations/        # Database migrations
└── docs/                  # Documentation
```

## Running Tests

```bash
npm test
```

**Note**: Tests may require additional Jest configuration for Expo modules. The test files are written and the domain logic is fully testable. Tests can be run with proper mocking of Expo dependencies.

## Database Schema

### Core Tables

- **profiles**: User profile settings (payday, language, reminders)
- **bill_categories**: Bill categories (ток, вода, парно, etc.)
- **bill_accounts**: Specific provider accounts (e.g., "ЧЕЗ – Люлин 6")
- **recurring_bills**: Recurring bill patterns
- **bill_payments**: Concrete bill payment instances
- **notification_settings**: User notification preferences

All tables are protected with Row Level Security (RLS) policies.

## Development

### Code Quality

- **ESLint**: Configured with TypeScript rules
- **Prettier**: Code formatting
- **TypeScript**: Strict mode enabled

Run linting:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

### Adding New Features

1. Create types in `src/types/`
2. Add API functions in `src/api/`
3. Create domain logic in `src/domain/`
4. Build UI components in `src/components/`
5. Create screens in `app/`
6. Add translations in `src/utils/i18n.ts`

## Building for Production

### Android
```bash
eas build --platform android
```

### iOS
```bash
eas build --platform ios
```

(Requires EAS CLI: `npm install -g eas-cli`)

## Notifications

The app uses Expo Push Notifications for bill reminders. Notifications are scheduled locally on the device. Future versions may move scheduling to a backend service.

## Contributing

1. Follow TypeScript strict mode
2. Write unit tests for domain logic
3. Use Bulgarian language for UI text
4. Follow the existing code structure

## License

Private project - All rights reserved
