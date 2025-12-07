# MasterMatch BG - Project Plan

## Overview
Mobile app MVP for connecting clients with handymen/contractors in Sofia, Bulgaria.

## Tech Stack
- **Mobile**: React Native + Expo (SDK 51)
- **Styling**: NativeWind (Tailwind for React Native)
- **State**: Zustand
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime)
- **Navigation**: Expo Router (file-based)

---

## EPIC 1: Project Setup & Configuration ✅
- [x] 1.1 Create Expo project with TypeScript
- [x] 1.2 Install dependencies (Supabase, Zustand, NativeWind)
- [x] 1.3 Create folder structure (services, stores, types, etc.)
- [x] 1.4 Configure NativeWind/Tailwind
- [x] 1.5 Setup Supabase client configuration
- [x] 1.6 Define TypeScript types for all entities

---

## EPIC 2: Authentication & User Management ✅
- [x] 2.1 Create Supabase auth service (login, register, logout)
- [x] 2.2 Create auth Zustand store
- [x] 2.3 Build Login screen
- [x] 2.4 Build Register screen
- [x] 2.5 Build Role Selection screen (client/master)
- [x] 2.6 Setup protected routes based on auth state
- [x] 2.7 Setup role-based navigation (client vs master tabs)

---

## EPIC 3: Client Flow - Job Management ✅
- [x] 3.1 Create jobs service (CRUD operations)
- [x] 3.2 Build "Create Job" screen with form
- [x] 3.3 Build "My Jobs" list screen
- [x] 3.4 Build Client Home screen
- [x] 3.5 Build Messages placeholder screen
- [x] 3.6 Build Profile screen with settings
- [ ] 3.7 Build "Job Details" screen (shows offers) - Deferred
- [ ] 3.8 Implement image upload for jobs - Deferred
- [ ] 3.9 Implement "Accept Offer" functionality - Deferred

---

## EPIC 4: Master Flow - Job Discovery & Offers ✅
- [x] 4.1 Create offers service
- [x] 4.2 Create master profile service
- [x] 4.3 Build "Master Profile Setup" screen (3-step wizard)
- [x] 4.4 Build "Available Jobs" screen with filters
- [x] 4.5 Build "Send Offer" modal
- [x] 4.6 Build "My Work" screen (offers, active, completed tabs)
- [x] 4.7 Build Master Profile screen

---

## EPIC 5: Chat System (Service Layer Complete)
- [x] 5.1 Create chat service with Supabase Realtime
- [x] 5.2 Build Messages placeholder screens (client & master)
- [ ] 5.3 Build full Chat screen - Deferred
- [ ] 5.4 Implement real-time message updates - Deferred

---

## EPIC 6: Reviews & Ratings (Service Layer Complete)
- [x] 6.1 Create reviews service
- [ ] 6.2 Build "Leave Review" screen - Deferred
- [ ] 6.3 Build "My Reviews" screen - Deferred
- [x] 6.4 Display average rating on master profiles (mock data)

---

## EPIC 7: Database & Backend ✅
- [x] 7.1 Create Supabase database schema (SQL)
- [x] 7.2 Define RLS policies for security
- [x] 7.3 Create storage buckets configuration
- [x] 7.4 Create auto-triggers for updated_at

---

## EPIC 8: Polish & Final Touches
- [x] 8.1 Reusable UI components (Button, Input, Card, Badge)
- [x] 8.2 Form validation on auth screens
- [x] 8.3 Loading states
- [ ] 8.4 Full end-to-end testing - Deferred

---

## Current Progress
**Status**: MVP Core Complete! 🎉

### What's Done:
- ✅ Full project setup with Expo + TypeScript + NativeWind
- ✅ Complete auth flow (login, register, role selection)
- ✅ Client screens (home, create job, my jobs, messages, profile)
- ✅ Master screens (browse jobs, send offers, my work, profile setup, profile)
- ✅ All service layers (auth, jobs, offers, chat, reviews, masterProfile)
- ✅ Database schema with RLS security policies
- ✅ Reusable UI components (Button, Input, Card, Badge)

### Ready for Testing:
The app is ready for development testing. To get it running:
1. Set up a Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Add environment variables to `.env`
4. Run `npx expo start`

### Deferred for Later:
- Job details screen with offer management UI
- Full chat implementation with real-time updates
- Leave review screen
- Image uploads
- Push notifications
