import { Stack, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { EmptyState, ErrorState } from '@/shared/components/feedback';
import { ScreenContainer } from '@/shared/components/layout';
import type { PhotoId } from '@/types';
import { getUserMessage, isRetryableError } from '@/utils';
import { PhotoGrid } from './components';
import { useGallery } from './useGallery';

export function GalleryScreen() {
  const router = useRouter();
  const { items, isLoading, isRefetching, error, refetch } = useGallery();

  const handlePressItem = useCallback(
    (id: PhotoId) => {
      router.push(`/photos/${id}`);
    },
    [router],
  );

  const renderContent = () => {
    if (error !== null && !isLoading) {
      return (
        <View style={styles.centred}>
          <ErrorState
            title="Couldn't load photos"
            message={getUserMessage(error)}
            onRetry={isRetryableError(error) ? refetch : undefined}
          />
        </View>
      );
    }

    if (!isLoading && items.length === 0) {
      return (
        <View style={styles.centred}>
          <EmptyState
            icon="📷"
            title="No photos yet"
            message="Upload your first photo to get started."
          />
        </View>
      );
    }

    return (
      <PhotoGrid
        items={items}
        isLoading={isLoading}
        refreshing={isRefetching}
        onRefresh={refetch}
        onPressItem={handlePressItem}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Gallery',
          headerLargeTitle: true,
        }}
      />
      <ScreenContainer scrollable={false} padding={false}>
        {renderContent()}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  centred: {
    flex: 1,
  },
});
