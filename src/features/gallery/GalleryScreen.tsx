import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { EmptyState, ErrorState } from '@/shared/components/feedback';
import { ScreenContainer } from '@/shared/components/layout';
import { getUserMessage, isRetryableError } from '@/utils';
import { PhotoGrid } from './components';
import { useGallery } from './useGallery';

export function GalleryScreen() {
  const { items, isLoading, isRefetching, error, refetch } = useGallery();

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
