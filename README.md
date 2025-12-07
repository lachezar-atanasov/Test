# MasterMatch BG

A React Native job matching platform connecting clients with service providers (masters) in Bulgaria.

## Features

- **Authentication**: Email/password authentication with role selection (Client/Master)
- **Client Flow**:
  - Create job requests with images
  - View job status and offers
  - Accept offers from masters
- **Master Flow**:
  - Setup profile (services, districts, pricing)
  - Browse available jobs with district filters
  - Send offers to jobs
  - View assigned/completed jobs

## Tech Stack

- **Frontend**: React Native + Expo
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Supabase
  - Authentication
  - PostgreSQL Database
  - Storage (for images)
  - Row Level Security (RLS)

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration file in Supabase SQL Editor:
   - Copy contents of `lib/migrations/001_initial_schema.sql`
   - Paste and execute in Supabase SQL Editor
3. Create a storage bucket named `job-images`:
   - Go to Storage in Supabase dashboard
   - Create new bucket: `job-images`
   - Set it to public (or configure RLS policies)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under API.

### 4. Run the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## Project Structure

```
/app              - Expo Router pages (screens)
/components       - Reusable UI components
/contexts         - React contexts (Auth)
/hooks            - Custom React hooks
/services         - API wrappers, Supabase services
/lib              - Utilities, helpers, migrations
/types            - TypeScript type definitions
/config           - App configuration, constants
/tests            - Unit tests
```

## Database Schema

The app uses the following main tables:
- `profiles` - User profiles with roles
- `master_profiles` - Extended profiles for masters
- `job_requests` - Job postings
- `offers` - Offers from masters
- `messages` - Chat messages
- `reviews` - Client reviews of masters

See `lib/migrations/001_initial_schema.sql` for the complete schema.

## Key Features Implemented

✅ Authentication & Role Management
✅ Job Request Creation (with image upload)
✅ Job Browsing & Filtering
✅ Offer System
✅ Master Profile Setup
✅ Job Status Management
✅ Role-based Navigation

## Remaining Features

- Chat functionality (data model ready)
- Reviews & Ratings (data model ready)
- Enhanced error handling
- Unit tests
- Image compression optimization

## Development

The project follows these conventions:
- TypeScript for type safety
- NativeWind for styling (Tailwind classes)
- Expo Router for navigation
- Supabase for backend services

## License

MIT
