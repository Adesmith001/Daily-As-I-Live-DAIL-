# DAIL

DAIL (Daily As I Live) is a production-ready mobile-first tracker built with Vite, React, TypeScript, Firebase Authentication, Cloud Firestore, Tailwind CSS, and shadcn/ui-style components.

## Features

- Email/password and Google sign in, sign out, and persisted auth sessions
- Protected routes for Today, Trackers, History, Daily Detail, and Settings
- Protected Exercises route with daily plan tracking and gamified progress
- Private per-user Firestore data with security rules
- Custom trackers with checkbox or 0-10 range scoring
- Fast daily upsert logging with no duplicate daily entry documents
- Daily score calculation out of 10
- History, weekly/monthly filters, daily detail views
- Streaks, charts, and weekly summaries
- Exercise XP, streaks, badges, and weekly adherence summaries
- Soft token-based theme system persisted per user
- Installable PWA with offline app-shell caching and local Firestore persistence

## Tech Stack

- Vite
- React 19
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS v4
- shadcn/ui-compatible component structure
- Recharts
- Sonner

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy the environment template and add your Firebase Web App values:

```bash
cp .env.example .env
```

3. Create a Firebase project and enable:

- Authentication
  - Email/Password provider
  - Google provider
- Cloud Firestore

4. Add the values to `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

5. Run the app:

```bash
pnpm dev
```

## Firestore Deployment

Deploy rules and indexes with the Firebase CLI after connecting your project:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Files:fir

- `firestore.rules`
- `firestore.indexes.json`

## Firestore Data Model

### `users`

- `uid`
- `displayName`
- `email`
- `theme`
- `createdAt`

### `trackers`

- `id`
- `userId`
- `name`
- `type`
- `description`
- `isActive`
- `displayOrder`
- `createdAt`
- `updatedAt`

### `dailyEntries`

- `id`
- `userId`
- `trackerId`
- `entryDate` (`YYYY-MM-DD`)
- `checkboxValue`
- `rangeValue`
- `createdAt`
- `updatedAt`

### `exerciseWorkouts`

- `id`
- `userId`
- `templateItemId`
- `name`
- `weekday`
- `weekdayOrder`
- `category`
- `description`
- `target`
- `videoUrl`
- `videoSearchQuery`
- `isActive`
- `displayOrder`
- `createdAt`
- `updatedAt`

### `exerciseEntries`

- `id`
- `userId`
- `workoutId`
- `entryDate` (`YYYY-MM-DD`)
- `isCompleted`
- `createdAt`
- `updatedAt`

### `exerciseProfiles`

- `id`
- `userId`
- `xpTotal`
- `currentStreak`
- `bestStreak`
- `weeklyAdherence`
- `badges`
- `defaultTemplateVersionImported`
- `createdAt`
- `updatedAt`

## How Scoring Works

- Checkbox checked = `10`
- Checkbox not today = `0`
- Range score = selected integer `0` to `10`
- Daily score = average of logged tracker scores for that date
- Daily score is rounded to 1 decimal place

## Testing Checklist

1. Sign up with a new email and confirm a user document is created.
2. Create a checkbox tracker and a range tracker.
3. Reorder trackers and toggle one inactive.
4. Log values on the Today page and confirm repeat taps update the same entry.
5. Visit History and Daily Detail to confirm score calculations and sorting.
6. Switch theme in Settings and refresh to confirm persistence.
7. Test a second Firebase user to verify data isolation.

## Build Verification

These commands were run successfully:

```bash
pnpm lint
pnpm build
```
