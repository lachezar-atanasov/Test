# BG Bills - Bulgarian Bills & Personal Finance Tracker

A React Native (Expo) mobile application for tracking household bills and personal finances, designed specifically for Bulgarian users.

## Features

- 📊 **Dashboard** - Overview of upcoming and overdue bills
- 🧾 **Bill Management** - Track recurring and one-off bills
- 📅 **Calendar View** - Visual monthly calendar with due dates
- 📈 **Reports & Analytics** - Spending breakdown by category
- 🔔 **Push Notifications** - Reminders before due dates
- 🇧🇬 **Bulgarian Language** - Full Bulgarian localization

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: Zustand
- **UI**: React Native Paper
- **Backend**: Supabase (PostgreSQL + Auth)
- **Notifications**: Expo Push Notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd bg-bills
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Set up the database:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Run the migration in `supabase/migrations/00001_initial_schema.sql`

5. Start the development server:
```bash
npm start
```

6. Run on your device:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
/
├── app/                    # Screens (Expo Router)
├── src/
│   ├── api/               # Supabase client & API
│   ├── components/        # Reusable components
│   ├── domain/            # Business logic
│   ├── hooks/             # Custom hooks
│   ├── i18n/              # Translations
│   ├── store/             # Zustand stores
│   ├── theme/             # Theme config
│   ├── types/             # TypeScript types
│   └── utils/             # Utilities
├── supabase/
│   └── migrations/        # Database migrations
├── docs/                  # Documentation
└── assets/               # Images, icons
```

## Available Scripts

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test
npm run test:watch
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Database Setup

The app uses Supabase as the backend. To set up the database:

1. Create a new Supabase project
2. Run the migration SQL from `supabase/migrations/00001_initial_schema.sql`
3. The migration will:
   - Create all necessary tables
   - Set up RLS policies
   - Seed default Bulgarian categories

## Default Categories (Bulgarian)

- ⚡ Ток (Electricity)
- 🔥 Парно (Heating)
- 💧 Вода (Water)
- 📶 Интернет (Internet)
- 📱 Телефон (Phone)
- 🏠 Наем (Rent)
- 🏷️ Абонаменти (Subscriptions)
- 🧾 Данъци (Taxes)
- 🛡️ Застраховки (Insurance)
- ❓ Други (Other)

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Building for Production

### Using EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for all platforms
eas build --platform all

# Build for specific platform
eas build --platform ios
eas build --platform android
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue.

---

Made with ❤️ for Bulgarian users
