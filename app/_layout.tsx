import { Stack } from 'expo-router';
import { ErrorBoundary, OfflineBanner } from '@/shared/components/feedback';
import { QueryProvider } from '@/shared/providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <ErrorBoundary>
        <OfflineBanner />
        <Stack
          screenOptions={{
            headerShown: true,
            headerBackButtonDisplayMode: 'minimal',
            animation: 'slide_from_right',
          }}
        />
      </ErrorBoundary>
    </QueryProvider>
  );
}
