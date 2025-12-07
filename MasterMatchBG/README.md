# MasterMatch BG 🔧

A React Native mobile app MVP for connecting clients with handymen/contractors in Sofia, Bulgaria.

## Features

### For Clients
- 📝 Post job requests for home repairs (plumbing, electrical, painting, etc.)
- 📋 Receive and compare offers from local masters
- 💬 Chat with assigned masters
- ⭐ Leave reviews after job completion

### For Masters (Handymen)
- 🔍 Browse available jobs by category and district
- 📨 Send offers with custom pricing
- 💼 Manage your work (pending offers, active jobs, completed)
- 📊 Build your reputation with client reviews

## Tech Stack

- **Mobile App**: React Native + Expo (SDK 51)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Language**: TypeScript

## Project Structure

```
MasterMatchBG/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth screens (login, register, role-select)
│   ├── (client)/          # Client tab screens
│   ├── (master)/          # Master tab screens
│   └── _layout.tsx        # Root layout with auth protection
├── components/            
│   └── ui/                # Reusable UI components
├── services/              # API/data layer
│   ├── supabase.ts        # Supabase client
│   ├── auth.ts            # Authentication
│   ├── jobs.ts            # Job CRUD
│   ├── offers.ts          # Offers management
│   ├── chat.ts            # Real-time chat
│   └── reviews.ts         # Reviews & ratings
├── stores/                # Zustand stores
│   └── authStore.ts       # Auth state management
├── types/                 # TypeScript types
├── constants/             # App constants (categories, districts)
└── supabase/              # Database schema
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### Installation

1. **Clone and install dependencies**
   ```bash
   cd MasterMatchBG
   npm install
   ```

2. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor
   - Create storage buckets: `job-images`, `portfolio-images`, `avatars`

3. **Configure environment variables**
   
   Create a `.env` file:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

## Database Schema

The app uses the following main tables:
- `users` - User profiles (clients and masters)
- `master_profiles` - Extended profile for masters
- `job_requests` - Jobs posted by clients
- `offers` - Offers from masters on jobs
- `chat_messages` - Messages between client and assigned master
- `reviews` - Client reviews for masters

See `supabase/schema.sql` for the complete schema with RLS policies.

## Key User Flows

### Client Flow
1. Register → Select "Client" role
2. Post a job with title, description, category, district, budget
3. Receive offers from masters
4. Accept an offer → Master gets assigned
5. Chat with the assigned master
6. Mark job complete → Leave a review

### Master Flow
1. Register → Select "Master" role
2. Set up profile (services, areas, bio, pricing)
3. Browse available jobs (filter by category/district)
4. Send offers with message and proposed price
5. If accepted, chat with client
6. Complete job → Receive review

## Contributing

This is an MVP project. Key areas for future development:
- Push notifications (Expo Notifications)
- Image uploads for jobs and portfolios
- Payment integration
- Advanced search and filters
- Bulgarian language support

## License

MIT
