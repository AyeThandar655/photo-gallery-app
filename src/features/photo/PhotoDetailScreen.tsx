import { Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/shared/components/ui';
import { ErrorState, Loading } from '@/shared/components/feedback';
import { ScreenContainer } from '@/shared/components/layout';
import { colors, radii, spacing } from '@/shared/theme';
import { getUserMessage, isRetryableError } from '@/utils';
import { getPhotoImageUri } from '@/features/gallery/services';
import type { PhotoId } from '@/types';
import { MetadataForm } from './components';
import { useDeletePhoto } from './mutations';
import { usePhotoMetadata } from './queries';

interface PhotoDetailScreenProps {
  id: PhotoId;
}

export function PhotoDetailScreen({ id }: PhotoDetailScreenProps) {
  const router = useRouter();
  const metadataQuery = usePhotoMetadata(id);
  const deleteMutation = useDeletePhoto();

  const imageUri = getPhotoImageUri(id);

  // Image retry — same pattern as PhotoCard.
  const IMAGE_RETRY_DELAY_MS = 1500;
  const MAX_IMAGE_RETRIES = 3;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const retryCount = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [imageKey, setImageKey] = useState(0);

  useEffect(() => {
    return () => {
      if (retryTimerRef.current !== null) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const revealImage = useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  const handleImageError = useCallback(() => {
    if (retryCount.current < MAX_IMAGE_RETRIES) {
      retryCount.current += 1;
      imageOpacity.setValue(0);
      retryTimerRef.current = setTimeout(() => {
        setImageKey(k => k + 1);
      }, IMAGE_RETRY_DELAY_MS);
    }
  }, [imageOpacity]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Photo',
      'This photo and its tags will be permanently deleted. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(id, {
              onSuccess: () => {
                router.back();
              },
              onError: (error) => {
                Alert.alert(
                  'Delete Failed',
                  getUserMessage(error),
                  [{ text: 'OK' }],
                );
              },
            });
          },
        },
      ],
    );
  }, [deleteMutation, id, router]);

  const renderMetadata = () => {
    if (metadataQuery.isLoading) {
      return (
        <View style={styles.metadataPlaceholder}>
          <Loading size="small" />
        </View>
      );
    }

    if (metadataQuery.error != null) {
      return (
        <ErrorState
          title="Couldn't load tags"
          message={getUserMessage(metadataQuery.error)}
          onRetry={isRetryableError(metadataQuery.error)
            ? () => void metadataQuery.refetch()
            : undefined}
          style={styles.errorState}
        />
      );
    }

    const initialTags = metadataQuery.data?.tags ?? [];
    const updatedAt = metadataQuery.data?.updatedAt;

    return (
      <View style={styles.formSection}>
        {updatedAt !== undefined && updatedAt !== '' && (
          <Text variant="caption" color="secondary">
            Last updated: {new Date(updatedAt).toLocaleString()}
          </Text>
        )}
        <MetadataForm
          photoId={id}
          initialTags={initialTags}
          onSuccess={() => router.back()}
        />
      </View>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Photo',
          headerRight: () => (
            <Pressable
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              accessibilityRole="button"
              accessibilityLabel="Delete photo"
              hitSlop={8}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.deleteButtonPressed,
                deleteMutation.isPending && styles.deleteButtonDisabled,
              ]}
            >
              <Text variant="body" style={styles.deleteButtonText}>
                Delete
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScreenContainer scrollable padding={false}>
        {/* Photo image — fades in on load, retries up to 3× on server error */}
        <View style={styles.imageWrapper}>
          <Animated.Image
            key={imageKey}
            source={{ uri: imageUri }}
            style={[styles.image, { opacity: imageOpacity }]}
            resizeMode="cover"
            onLoad={revealImage}
            onError={handleImageError}
            accessibilityLabel={`Photo ${id}`}
            accessibilityRole="image"
            accessibilityIgnoresInvertColors
          />
        </View>

        {/* Metadata section */}
        <View style={styles.content}>
          {renderMetadata()}
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.skeleton,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: spacing.md,
    flex: 1,
  },
  formSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  metadataPlaceholder: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorState: {
    flex: 0,
    paddingVertical: spacing.lg,
  },
  deleteButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  deleteButtonPressed: {
    opacity: 0.6,
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    color: colors.destructive,
    fontWeight: '600',
  },
});
