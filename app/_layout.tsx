import { Stack } from 'expo-router';
import { QueryProvider } from '@/shared/providers/QueryProvider';

export default function RootLayout() {
  return (
    <QueryProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerBackButtonDisplayMode: 'minimal',
          animation: 'slide_from_right',
        }}
      />
    </QueryProvider>
  );
}
