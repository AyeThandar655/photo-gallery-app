# Photo Gallery App

A React Native (Expo) application for uploading, viewing, editing, and managing photos with resilient networking and a production-oriented architecture.

## Overview

The application consumes a REST API that intentionally returns random failures. It demonstrates resilient networking, optimistic UI updates, and a production-oriented architecture built with Expo and TanStack React Query.

---

## Features

- **Gallery view** — two-column grid with skeleton loading, pull-to-refresh, and empty state
- **Photo detail** — full-size image with fade-in and automatic retry for transient server failures on server error; editable tag form with changes appearing instantly via optimistic updates that roll back automatically on failure
- **Upload** — pick a photo from your device library and assign tags before uploading
- **Offline banner** — animated overlay appears whenever the device loses connectivity; React Query pauses and resumes all network requests automatically
- **Error handling** — every API error is normalised to a typed `AppError`; retryable errors (503, 429, network timeouts) trigger exponential backoff with jitter; non-retryable errors (404, 400) surface immediately
- **Accessibility** — `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState`, and `accessibilityLiveRegion` on all interactive and status elements

---

## Tech Stack

| Layer             | Library                                         | Version      |
| ----------------- | ----------------------------------------------- | ------------ |
| Runtime           | React Native                                    | 0.81.5       |
| Framework         | Expo                                            | ~54.0.0      |
| Routing           | Expo Router                                     | ~6.0.24      |
| Server state      | TanStack React Query                            | ^5.101.2     |
| HTTP client       | Axios                                           | ^1.18.1      |
| Schema validation | Zod                                             | ^3.23.8      |
| Forms             | React Hook Form + @hookform/resolvers           | ^7.54 / ^3.9 |
| Animations        | React Native Reanimated                         | ~4.1.1       |
| Network info      | @react-native-community/netinfo                 | 11.4.1       |
| Image picker      | expo-image-picker                               | ~17.0.11     |
| Language          | TypeScript                                      | ~5.9.2       |
| Testing           | Jest 29 + React Native Testing Library + MSW v2 | —            |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Expo Go** (latest from the App Store / Play Store — requires SDK 54)
- A running instance of the backend API (see [Environment Variables](#environment-variables))

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

If you see peer dependency conflicts (e.g. from `react-native-worklets`), use:

```bash
npm install --legacy-peer-deps
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
EXPO_PUBLIC_API_BASE_URL=http://<your-server-ip>:3003
```

> **Note:** The `EXPO_PUBLIC_` prefix is required. Expo strips variables without it at build time.

### 3. Start the development server

```bash
npx expo start --clear
```

Then:

- Press **i** to open on iOS simulator
- Press **a** to open on Android emulator
- Scan the QR code with **Expo Go** on a physical device

---

## Scripts

```bash
npm start              # Start Expo dev server
npm run ios            # Start and open on iOS simulator
npm run android        # Start and open on Android emulator
npm run web            # Start and open in browser
npm test               # Run all Jest tests (single pass)
npm run test:watch     # Run Jest in watch mode
npm run test:coverage  # Run Jest with coverage report
npm run lint           # Run ESLint
npm run lint:fix       # Run ESLint and auto-fix
npm run typecheck      # Run tsc --noEmit
```

---

## Project Structure

```
photo-gallery-app/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout — QueryProvider, ErrorBoundary
│   ├── index.tsx                 # / → GalleryScreen
│   ├── photos/[id].tsx           # /photos/:id → PhotoDetailScreen
│   └── upload.tsx                # /upload → UploadScreen
│
├── src/
│   ├── constants/                # Typed constants (timeouts, retry counts, stale times)
│   ├── features/                 # Feature-slice modules
│   │   ├── gallery/              # Photo list — services, queries, hook, components, screen
│   │   ├── photo/                # Photo detail — services, queries, mutations, components, screen
│   │   └── upload/               # Photo upload — services, mutation, hook, components, screen
│   ├── lib/
│   │   ├── api/                  # Axios client, endpoint constants
│   │   └── queryClient/          # QueryClient, queryKeys, smartRetry, retryDelay
│   ├── schemas/                  # Zod schemas for all API shapes
│   ├── shared/
│   │   ├── components/
│   │   │   ├── feedback/         # Loading, Skeleton, EmptyState, ErrorState, ErrorBoundary, OfflineBanner
│   │   │   ├── layout/           # ScreenContainer
│   │   │   └── ui/               # Text, Button, Input, TagInput
│   │   ├── hooks/                # useNetworkStatus
│   │   ├── providers/            # QueryProvider (wraps QueryClientProvider + onlineManager)
│   │   └── theme.ts              # Design tokens — colors, spacing, radii, typography
│   ├── types/                    # AppError, Result<T>, domain types (derived from schemas)
│   └── utils/                    # errorUtils, schemaUtils
│
└── __tests__/
    ├── __mocks__/                # Global MSW handler stubs
    ├── setup/                    # MSW server, test QueryClient, renderWithProviders
    ├── integration/
    │   ├── gallery/              # services.test.ts, useGallery.test.ts
    │   └── photo/                # services.test.ts, mutations.test.ts
    └── unit/
        ├── lib/queryClient/      # retry.test.ts
        ├── schemas/              # photo.schema.test.ts, metadata.schema.test.ts
        └── utils/                # errorUtils.test.ts, schemaUtils.test.ts
```

---

## Architecture

### Feature Slice

Each feature (`gallery`, `photo`, `upload`) is self-contained:

```
features/<name>/
  services.ts       ← pure async functions, no React — directly testable
  queries.ts        ← useQuery hooks wrapping services
  mutations.ts      ← useMutation hooks with optimistic updates
  useGallery.ts     ← composing hook (gallery only)
  *Screen.tsx       ← screen component, wired to Expo Router
  components/       ← feature-specific UI
  index.ts          ← barrel export
```

Shared UI components are located in `src/shared/components/ui` and reused across all features.

### Error Handling

The provided backend intentionally returns random failures.

To provide a smooth user experience, the application includes:

- Typed `AppError` model
- Automatic retry for retryable errors
- Exponential backoff with jitter
- Optimistic UI updates
- Automatic rollback when mutations fail
- Offline detection with React Query network awareness
- Loading, empty, and error states throughout the application

This approach allows the application to remain responsive and recover gracefully from the backend's intentionally unstable behavior.

### Retry Strategy

React Query is configured with a custom `smartRetry` function:

- Returns `false` immediately for non-retryable `AppError` types (404, 400, 422, validation errors)
- Returns `false` when `failureCount >= MAX_RETRY_COUNT` (5)
- Returns `true` for retryable errors (503, 429, network timeout) and unknown errors

Delay uses exponential backoff capped at 8 s with ±30 % jitter:

```
delay = clamp(500 × 2^(attempt-1), 8000) × (0.7 … 1.0)
```

### Optimistic Updates

`useUpdateMetadata` and `useDeletePhoto` follow the full React Query optimistic pattern:

1. `onMutate` — cancel in-flight queries, snapshot current cache, write optimistic value
2. `onError` — restore snapshot from context
3. `onSettled` — invalidate affected queries so the server state is fetched fresh

---

## API Reference

The app expects a REST backend at `EXPO_PUBLIC_API_BASE_URL`.

| Method   | Path            | Description                                                                                                 |
| -------- | --------------- | ----------------------------------------------------------------------------------------------------------- |
| `GET`    | `/photos`       | Returns `string[]` of photo IDs                                                                             |
| `GET`    | `/photos/:id`   | Serves the binary image (used as `Image` `uri`, not fetched via Axios)                                      |
| `POST`   | `/photos`       | Upload a photo using multipart/form-data with a `photo` file and a `metadata` JSON field. Returns `{ id }`. |
| `DELETE` | `/photos/:id`   | Deletes a photo and its metadata. Returns `200 OK`.                                                         |
| `GET`    | `/metadata`     | Returns `Array<{ id, tags, updatedAt }>`                                                                    |
| `GET`    | `/metadata/:id` | Returns `{ tags, updatedAt }` for one photo                                                                 |
| `PUT`    | `/metadata/:id` | Updates the metadata for a photo. Returns `{ id }`.                                                         |

---

## Testing

### Run all tests

```bash
npm test
```

### Coverage report

```bash
npm run test:coverage
```

### Test architecture

| Layer       | Tool                | What is tested                                                                                                                                                                                                       |
| ----------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit        | Jest                | `smartRetry`, `retryDelay`, all Zod schemas, `normalizeAxiosError`, `normalizeError`, `safeParseResponse`, all `AppErrorType` mappings                                                                               |
| Integration | Jest + RTL + MSW v2 | `fetchPhotoIds`, `fetchAllMetadata`, `fetchMetadata`, `updateMetadata`, `deletePhoto` services; `useGallery` hook; `useUpdateMetadata` and `useDeletePhoto` mutations including optimistic update and rollback paths |

Each integration test suite creates a fresh `QueryClient` per test (`retry: false`, `gcTime: Infinity`) and tears down cache via `queryClient.clear()` in `afterEach`.

---
