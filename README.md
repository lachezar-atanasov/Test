# MasterMatch BG

A two-sided service marketplace mobile application connecting clients who need services with skilled professionals (masters).

## Features

### For Clients
- 📝 Post job requests with detailed descriptions and images
- 🔍 Browse and manage your job listings
- 💰 Receive and compare offers from masters
- 💬 Chat with assigned professionals
- ⭐ Leave reviews after job completion

### For Masters (Service Professionals)
- 🛠 Create a professional profile with services and areas
- 🔎 Browse available jobs with filters
- 📤 Send offers to clients
- 💬 Communicate with clients via chat
- 📊 Build reputation through reviews

## Tech Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router v3
- **Styling**: NativeWind v4 (Tailwind CSS)
- **Backend**: Supabase
  - PostgreSQL Database
  - Authentication
  - Storage (for images)
  - Realtime (for chat)
- **State Management**: Zustand

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- A Supabase project ([supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mastermatch-bg
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**

   a. Create a new project at [supabase.com](https://supabase.com)
   
   b. Run the database schema:
      - Go to SQL Editor in your Supabase dashboard
      - Copy the contents of `supabase/schema.sql`
      - Execute the SQL

4. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   You can find these values in your Supabase project settings under "API".

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Project Structure

```
mastermatch-bg/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/            # Main tab navigation
│   │   ├── client/        # Client-specific tabs
│   │   └── master/        # Master-specific tabs
│   ├── job/[id].tsx       # Job details screen
│   ├── chat/[jobId].tsx   # Chat screen
│   └── master/[id].tsx    # Master profile view
├── components/
│   └── ui/                # Reusable UI components
├── hooks/
│   └── useAuth.ts         # Authentication state
├── services/              # API service functions
│   ├── jobs.ts
│   ├── offers.ts
│   ├── chat.ts
│   └── reviews.ts
├── lib/
│   └── supabase.ts        # Supabase client
├── types/
│   └── index.ts           # TypeScript definitions
├── config/
│   └── constants.ts       # App constants
└── supabase/
    └── schema.sql         # Database schema
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser
- `npm test` - Run tests
- `npm run lint` - Type check with TypeScript

## Database Schema

The app uses the following main tables:

- **users** - User profiles (clients and masters)
- **master_profiles** - Extended profiles for service providers
- **job_requests** - Job postings from clients
- **offers** - Offers from masters on jobs
- **chat_messages** - Messages between clients and masters
- **reviews** - Reviews from clients to masters

See `supabase/schema.sql` for the complete schema with RLS policies.

## Service Categories

The app supports these service categories:
- Plumbing
- Electrical
- Cleaning
- Painting
- Carpentry
- Appliance Repair
- Moving
- Gardening
- HVAC
- Locksmith
- Pest Control
- Other

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub or contact support@mastermatch.bg
