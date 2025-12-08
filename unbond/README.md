# Unbond - Trauma Bond Recovery Companion

<p align="center">
  <img src="https://via.placeholder.com/150/6B8E9F/FFFFFF?text=Unbond" alt="Unbond Logo" width="150" />
</p>

<p align="center">
  <strong>A supportive mobile app for healing from trauma bonds and toxic relationships</strong>
</p>

---

## ⚠️ Important Disclaimer

**This app is NOT a substitute for professional mental health care.** If you are in danger or experiencing severe distress, please contact local emergency services or a licensed mental health professional.

Unbond is designed to provide educational information, journaling tools, and supportive resources. It does not provide medical advice, diagnoses, or treatment.

---

## 📱 Overview

Unbond is a React Native + Expo mobile application designed to help users who are stuck in toxic or trauma-bond relationships. The app provides:

- **Education** about trauma bonds and manipulation patterns
- **Tracking tools** for emotions, cravings, and interactions
- **Visualization** of patterns over time
- **Structured recovery plan** with actionable steps
- **Crisis tools** for moments of weakness
- **Grounding exercises** and affirmations

All data is stored locally on the device for privacy.

---

## ✨ Features

### 🏠 Home Dashboard
- Daily mood check-in with emoji scale
- Quick access to logging and SOS tools
- No-contact/low-contact streak tracking
- Weekly mood trend visualization
- Daily educational insights

### 💭 Emotional Journal
- Track craving intensity (1-10 scale)
- Log primary emotions with predefined options
- Add personal notes
- Filter by date range (7/30/90 days)
- View statistics and trends

### 📝 Interaction Log
- Document interactions with the toxic person
- Track interaction type (call, text, in-person, etc.)
- Log who initiated contact
- Record feelings before, during, and after
- Identify red flags from preset patterns
- View statistics on interaction patterns

### 📚 Psychoeducation Library
- 12+ comprehensive articles on:
  - Understanding trauma bonds
  - Manipulation patterns
  - Leaving and grief
  - Contact strategies
  - Attachment and nervous system
  - Healing and recovery
- Search and filter functionality
- Key points and "Remember" sections

### 🎯 Recovery Plan
- 6-phase structured plan
- Checklist items for each phase
- Progress tracking
- Visual progress indicators
- Encouraging messages

### 🆘 SOS / Grounding Tools
- "What are you feeling?" quick assessment
- Grounding exercises:
  - 5-4-3-2-1 technique
  - Box breathing
  - Body scan
  - Cold water reset
  - Butterfly hug
- Affirmations for:
  - Self-worth
  - Difficult moments
  - Boundaries
- Reminders about past patterns
- "Delay 10 minutes" feature

### ⚙️ Settings
- Contact mode toggle (No-Contact/Low-Contact)
- Streak reset
- Data export (JSON)
- Clear all data option
- Privacy-focused design

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI (will be installed via npx)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on physical device

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd unbond
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in web browser (limited features)
```

---

## 🏗️ Project Structure

```
unbond/
├── App.tsx                    # Root component
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Chip.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Input.tsx
│   │   ├── MoodChart.tsx
│   │   ├── ScreenWrapper.tsx
│   │   ├── Slider.tsx
│   │   └── index.ts
│   ├── data/                 # Static content
│   │   ├── copingScripts.ts  # Grounding & affirmations
│   │   └── psychoeducation.ts # Educational articles
│   ├── navigation/           # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── screens/              # Screen components
│   │   ├── EmotionalLog/
│   │   ├── Home/
│   │   ├── InteractionLog/
│   │   ├── Library/
│   │   ├── Onboarding/
│   │   ├── Plan/
│   │   ├── Settings/
│   │   ├── Sos/
│   │   └── Stats/
│   ├── services/             # Business logic
│   │   └── storage/          # Data persistence
│   ├── store/                # Zustand state management
│   │   ├── dailyCheckInStore.ts
│   │   ├── emotionalLogStore.ts
│   │   ├── interactionLogStore.ts
│   │   ├── planStore.ts
│   │   ├── settingsStore.ts
│   │   └── index.ts
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   └── utils/                # Utilities
│       ├── constants.ts
│       ├── helpers.ts
│       └── theme.ts
├── DESIGN.md                 # Design documentation
├── package.json
└── tsconfig.json
```

---

## 🎨 Design Principles

### Color Palette
- **Primary**: Calm teal (#6B8E9F) - stability and trust
- **Accent**: Soft coral (#E8B4A0) - warmth without urgency
- **Background**: Light gray (#FAFAFA) - non-stimulating
- **Text**: Dark gray (#2D3436) - readable without harshness

### UX Guidelines
- Calm, non-overstimulating interface
- Validating, supportive microcopy
- No shaming language
- Clear disclaimers about non-clinical nature
- Privacy-first approach (local storage only)

---

## 🛠️ Technology Stack

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation 7 (bottom tabs + native stack)
- **State Management**: Zustand
- **Storage**: AsyncStorage (local only)
- **Charts**: react-native-svg (simple visualizations)
- **Styling**: StyleSheet (React Native)

---

## 📈 Future Improvements

### Near-term
- [ ] Push notifications for check-in reminders
- [ ] Actual timer for "Delay 10 minutes" feature
- [ ] More detailed statistics and insights
- [ ] Dark mode support

### Medium-term
- [ ] Cloud sync with end-to-end encryption
- [ ] Biometric lock for privacy
- [ ] Export to PDF for therapist sharing
- [ ] Localized crisis resources by region
- [ ] More grounding exercises with animations

### Long-term
- [ ] AI-powered pattern recognition and insights
- [ ] Moderated community support feature
- [ ] Integration with therapy apps
- [ ] Multi-language support

---

## 🤝 Contributing

This is a sensitive project dealing with mental health topics. If you'd like to contribute:

1. Be mindful of the target audience and their vulnerabilities
2. Ensure all content is non-clinical and appropriately supportive
3. Test thoroughly before submitting changes
4. Follow existing code style and patterns

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- Inspired by the need for accessible recovery tools
- Thanks to mental health professionals who informed the educational content approach
- Built with love for those on their healing journey

---

<p align="center">
  <strong>💙 You are worthy of healthy, consistent love. 💙</strong>
</p>
