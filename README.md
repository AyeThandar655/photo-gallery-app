# Photo Gallery App

A production-quality mobile photo gallery built with React Native and Expo. Browse, upload, tag, and delete photos — with offline support, optimistic UI updates, automatic retry, and full TypeScript coverage throughout.

---

## Features

- **Gallery view** — two-column grid with skeleton loading, pull-to-refresh, and empty state
- **Photo detail** — full-size image with an editable tag form; changes appear instantly via optimistic updates and roll back automatically on failure
- **Upload** — pick a photo from your device library and assign tags before uploading
- **Offline banner** — animated overlay appears whenever the device loses connectivity; React Query pauses and resumes all network requests automatically
- **Error handling** — every API error is normalised to a typed `AppError`; retryable errors (503, 429, network timeouts) trigger exponential backoff with jitter; non-retryable errors (404, 400) surface immediately
- **Accessibility** — `accessibilityRole`, `accessibilityLabel`, `accessibilityHint`, `accessibilityState`, and `accessibilityLiveRegion` on all interactive and status elements

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Runtime | React Native | 0.86.0 |
| Framework | Expo | 57.0.2 |
| Routing | Expo Router | ~57.0.3 |
| Server state | TanStack React Query | ^5.101.2 |
| HTTP client | Axios | ^1.18.1 |
| Schema validation | Zod | ^4.4.3 |
| Forms | React Hook Form + @hookform/resolvers | ^7.81 / ^5.4 |
| Animations | React Native Reanimated | 4.5.0 |
| Network info | @react-native-community/netinfo | ^12.0.1 |
| Image picker | expo-image-picker | ~57.0.2 |
| Language | TypeScript | ~6.0.3 |
| Testing | Jest 29 + React Native Testing Library + MSW v2 | — |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- **Expo Go** (latest from the App Store / Play Store — requires SDK 57)
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
EXPO_PUBLIC_API_BASE_URL=http://<your-server-ip>:3000
```

> **Note:** The `EXPO_PUBLIC_` prefix is required. Expo strips variables without it at build time.

### 3. Start the development server

```bash
npx expo start --clear
```

Then:
- Press **i** to open on iOS simulator
- Press **a** to open on Android emulator
- Press **w** to open in a web browser
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

Shared UI components (`TagInput`, `Button`, etc.) live in `src/shared/components/ui` and are consumed by any feature.

### Error Model

All errors are normalised to a single `AppError` plain object at the Axios interceptor:

```typescript
type AppError = {
  type: AppErrorType;   // 'NETWORK_ERROR' | 'SERVICE_UNAVAILABLE' | 'NOT_FOUND' | ...
  message: string;      // user-facing message
  retryable: boolean;   // drives React Query retry and UI retry button visibility
  statusCode?: number;
};
```

Zod validation failures at API response boundaries are caught by `safeParseResponse` and surfaced as `VALIDATION_ERROR`.

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

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/photos` | Returns `string[]` of photo IDs |
| `GET` | `/photos/:id` | Serves the binary image (used as `Image` `uri`, not fetched via Axios) |
| `POST` | `/photos` | Upload `multipart/form-data` with `photo` file and repeated `tags` fields; returns `{ id, tags, updatedAt }` |
| `DELETE` | `/photos/:id` | Deletes photo and its metadata; returns `204` |
| `GET` | `/metadata` | Returns `Array<{ id, tags, updatedAt }>` |
| `GET` | `/metadata/:id` | Returns `{ tags, updatedAt }` for one photo |
| `PUT` | `/metadata/:id` | Body `{ tags: string[] }`; returns updated `{ tags, updatedAt }` |

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

Coverage threshold: **70 %** branches / functions / lines / statements across all `src/**` files.

### Test architecture

| Layer | Tool | What is tested |
|---|---|---|
| Unit | Jest | `smartRetry`, `retryDelay`, all Zod schemas, `normalizeAxiosError`, `normalizeError`, `safeParseResponse`, all `AppErrorType` mappings |
| Integration | Jest + RTL + MSW v2 | `fetchPhotoIds`, `fetchAllMetadata`, `fetchMetadata`, `updateMetadata`, `deletePhoto` services; `useGallery` hook; `useUpdateMetadata` and `useDeletePhoto` mutations including optimistic update and rollback paths |

MSW v2 uses the native (`msw/native`) interceptor — no ServiceWorker, works in Node.js test environment.

Each integration test suite creates a fresh `QueryClient` per test (`retry: false`, `gcTime: Infinity`) and tears down cache via `queryClient.clear()` in `afterEach`.

---
