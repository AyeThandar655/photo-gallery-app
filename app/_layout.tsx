import { Stack } from 'expo-router';
import { View } from 'react-native';
import { ErrorBoundary, OfflineBanner } from '@/shared/components/feedback';
import { QueryProvider } from '@/shared/providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <ErrorBoundary>
          <Stack
            screenOptions={{
              headerShown: true,
              headerBackButtonDisplayMode: 'minimal',
              animation: 'slide_from_right',
            }}
          />
        </ErrorBoundary>
      </View>
    </QueryProvider>
  );
}
