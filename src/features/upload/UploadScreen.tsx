import { Stack, useRouter } from 'expo-router';
import { ScreenContainer } from '@/shared/components/layout';
import { UploadForm } from './components';

export function UploadScreen() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Upload Photo' }} />
      <ScreenContainer scrollable padding>
        <UploadForm
          onSuccess={() => {
            router.replace('/');
          }}
        />
      </ScreenContainer>
    </>
  );
}
