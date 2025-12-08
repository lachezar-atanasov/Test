# Unbond - Trauma Bond Recovery Companion

A mobile app built with React Native and Expo to help users understand, track, and heal from trauma-bond relationships.

## Overview

Unbond is a companion app designed to support individuals who are navigating toxic or trauma-bond relationships. The app provides:

- **Educational Resources**: Psychoeducational content about trauma bonds, manipulation patterns, and healing
- **Emotional Tracking**: Log cravings, emotional states, and track patterns over time
- **Interaction Logging**: Document interactions with the toxic partner, including red flags and emotional responses
- **Structured Healing Plan**: Step-by-step escape plan with actionable tasks
- **SOS Tools**: Grounding exercises and coping strategies for moments of crisis
- **Pattern Recognition**: Visualizations and statistics to identify patterns

## Important Disclaimer

**This app is NOT a substitute for professional mental health care.** If you are in danger or experiencing severe distress, contact local emergency services or a licensed professional.

This app provides educational resources, tracking tools, and support strategies. It does not provide diagnosis, treatment, or crisis intervention.

## Features

### Home Dashboard
- Daily greeting and emotional check-in
- Quick shortcuts to log interactions, cravings, and access SOS tools
- Statistics: days since last contact, no-contact streak, weekly mood trends
- Daily insights from psychoeducational content

### Emotional Log & Craving Tracker
- Log emotional states with intensity (1-10) and emotion type
- View entries in chronological list
- Visualize craving intensity over time with charts
- Filter and analyze patterns

### Interaction Log
- Document interactions with the toxic partner
- Track interaction type, who initiated, and emotional states (before/during/after)
- Identify and log red flags (gaslighting, blame-shifting, etc.)
- View timeline and statistics

### Psychoeducation Library
- Articles about trauma bonds, manipulation patterns, and healing
- Searchable content organized by categories
- Offline access to all educational materials

### Escape Plan
- 6-step structured recovery plan:
  1. Education Phase
  2. Boundary Setting
  3. Preparing Environment & Support
  4. Executing Distance / No-Contact
  5. Stabilization Phase
  6. Building New Life Pillars
- Progress tracking with checklists
- Customizable tasks

### SOS / Grounding Tools
- Quick access when feeling the urge to contact
- Grounding exercises (5-4-3-2-1, box breathing, body scan)
- Affirmations and coping scripts
- Reminders of past negative outcomes
- Delay action logging

### Settings
- Choose contact mode (No-Contact vs Low-Contact)
- Export data as JSON
- View app information and disclaimer

## Tech Stack

- **React Native** with **Expo** (SDK ~54)
- **TypeScript** for type safety
- **React Navigation** for navigation (tabs + stacks)
- **Zustand** for state management
- **AsyncStorage** for local data persistence
- **React Native Chart Kit** for data visualization

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── store/           # Zustand state management
├── services/        # Storage and other services
├── data/            # Static content (articles, scripts, default plan)
├── types/           # TypeScript type definitions
└── utils/           # Utilities (theme, helpers)
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (installed globally or via npx)
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd unbond
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - **iOS**: Press `i` in the terminal or scan the QR code with your camera (iOS)
   - **Android**: Press `a` in the terminal or scan the QR code with Expo Go app (Android)
   - **Web**: Press `w` in the terminal

### Building for Production

```bash
# For Android
npm run android

# For iOS (requires macOS)
npm run ios

# For web
npm run web
```

## Data Storage

All data is stored locally on the device using AsyncStorage. Data includes:
- Emotional log entries
- Interaction log entries
- Plan steps and task completion
- User settings

Data can be exported as JSON from the Settings screen.

## Future Improvements

Potential enhancements for future versions:

- [ ] Push notifications for reminders and check-ins
- [ ] Cloud sync and backup
- [ ] Advanced analytics and pattern detection
- [ ] Integration with crisis hotlines and local resources
- [ ] Community support features (with privacy safeguards)
- [ ] Therapist/provider sharing capabilities
- [ ] Customizable plan templates
- [ ] Journaling with prompts
- [ ] Meditation and breathing exercise timers
- [ ] Dark mode support

## Development Notes

### Adding New Content

- **Articles**: Add to `src/data/psychoeducation.ts`
- **Coping Scripts**: Add to `src/data/copingScripts.ts`
- **Plan Steps**: Modify `src/data/defaultPlan.ts`

### State Management

The app uses Zustand for state management. The main store is in `src/store/useAppStore.ts`. All data operations go through the store, which syncs with AsyncStorage.

### Navigation

Navigation uses React Navigation with:
- Bottom tabs for main sections
- Stack navigators for nested screens
- Modal presentation for SOS screen

### Styling

The app uses a centralized theme (`src/utils/theme.ts`) with:
- Consistent color palette
- Typography system
- Spacing and border radius constants

## Contributing

This is a personal project, but suggestions and feedback are welcome. Please ensure any contributions maintain the app's supportive, non-clinical tone and respect user privacy.

## License

[Add your license here]

## Support

If you're using this app and need professional support:
- Contact local emergency services if you're in immediate danger
- Reach out to a licensed mental health professional
- Contact crisis hotlines in your area
- Seek support from trusted friends and family

Remember: You are not alone, and healing is possible.
