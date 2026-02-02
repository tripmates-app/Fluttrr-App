# Fluttrr - Social Event Discovery App

Fluttrr is a location-based social discovery platform that connects people through local events. The app helps users discover events, meet like-minded people nearby, and chat with their connections.

## Features

### For Users
- **Home Feed** - Browse upcoming events with quick filters (Today, This Week, Nearby, Friends Going)
- **Events** - Search, filter, and discover local events with list view
- **Mates** - Discover and connect with people who share your interests
- **Chats** - Direct messages with connections and group chats for events
- **Profile** - Manage your profile, interests, and settings

### For Businesses
- **Dashboard** - View stats, upcoming events, and quick actions
- **Create Events** - Easy event creation with photos, categories, and pricing
- **Manage Events** - Edit, view analytics, and manage attendees
- **Reviews** - View and respond to customer reviews
- **Settings** - Manage business profile and preferences

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation v6
- **State Management:** Redux Toolkit
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Location:** expo-location
- **Images:** expo-image-picker
- **Notifications:** expo-notifications

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/fluttrr-app.git
cd fluttrr-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Storage
   - Copy your config to `src/services/firebase.ts`

4. Create environment variables:
```bash
cp .env.example .env
```

5. Update `.env` with your Firebase configuration:
```
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Running the App

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Basic components (Button, Input, Card, etc.)
│   ├── events/      # Event-specific components
│   ├── chats/       # Chat-specific components
│   └── ...
├── screens/         # Screen components
│   ├── auth/        # Authentication screens
│   ├── home/        # Home feed screens
│   ├── events/      # Event screens
│   ├── mates/       # Mates discovery screens
│   ├── chats/       # Chat screens
│   ├── profile/     # User profile screens
│   └── business/    # Business dashboard screens
├── navigation/      # Navigation configuration
├── services/        # Firebase and API services
├── store/           # Redux store and slices
├── types/           # TypeScript types
├── constants/       # App constants (colors, categories)
├── hooks/           # Custom React hooks
└── utils/           # Utility functions
```

## Firebase Security Rules

Add these security rules to your Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Businesses can be read by anyone, written by owner
    match /businesses/{businessId} {
      allow read: if true;
      allow write: if request.auth.uid == businessId;
    }

    // Events can be read by anyone
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }

    // Chats - participants only
    match /chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read, write: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

## Testing

### Test Accounts

Create test accounts for both user and business types:

**User Account:**
- Email: testuser@fluttrr.com
- Password: Test123!

**Business Account:**
- Email: testbusiness@fluttrr.com
- Password: Test123!

## Known Issues / Limitations

- Map view is not yet implemented (Phase 2)
- Profile verification requires manual approval
- Push notifications require additional setup for production
- Reviews system is basic (Phase 2 will add photos, helpful votes)

## Future Enhancements

- Map view for events
- In-app payment processing
- Event check-ins
- Advanced analytics for businesses
- AI-powered content moderation
- Referral system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary. All rights reserved.

## Support

For support, email support@fluttrr.com or visit our help center.
