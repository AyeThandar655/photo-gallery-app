import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { EmptyState, ErrorState } from '@/shared/components/feedback';
import { ScreenContainer } from '@/shared/components/layout';
import { Text } from '@/shared/components/ui';
import { colors, spacing } from '@/shared/theme';
import type { PhotoId } from '@/types';
import { getUserMessage, isRetryableError } from '@/utils';
import { PhotoGrid } from './components';
import { useGallery } from './useGallery';

export function GalleryScreen() {
  const router = useRouter();
  const { items, isLoading, isRefetching, error, refetch, refetchIds } = useGallery();

  // Track only user-initiated pull-to-refresh so the spinner doesn't appear
  // during background refetches triggered by useFocusEffect or mutations.
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  useEffect(() => {
    if (!isRefetching) setIsManualRefreshing(false);
  }, [isRefetching]);

  const handleRefresh = useCallback(() => {
    setIsManualRefreshing(true);
    refetch();
  }, [refetch]);

  // On focus: only refetch photo IDs (to pick up new uploads).
  useFocusEffect(
    useCallback(() => {
      void refetchIds();
    }, [refetchIds]),
  );

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
        refreshing={isManualRefreshing}
        onRefresh={handleRefresh}
        onPressItem={handlePressItem}
      />
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Photo Gallery', headerRight: undefined }} />
      <ScreenContainer scrollable={false} padding={false}>
        {renderContent()}
        <Pressable
          onPress={() => router.push('/upload')}
          accessibilityRole="button"
          accessibilityLabel="Upload a photo"
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed,
          ]}
        >
          <Text style={styles.fabIcon}>+</Text>
        </Pressable>
      </ScreenContainer>
    </>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  centred: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  fabPressed: {
    opacity: 0.8,
  },
  fabIcon: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '300',
  },
});
