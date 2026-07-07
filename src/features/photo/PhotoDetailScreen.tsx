import { Stack, useRouter } from 'expo-router';
import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
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

  const handleDelete = () => {
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
  };

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

    return (
      <View style={styles.formSection}>
        <Text variant="subheading" style={styles.sectionTitle}>
          Tags
        </Text>
        <MetadataForm
          photoId={id}
          initialTags={initialTags}
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
        {/* Photo image */}
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={`Photo ${id}`}
          accessibilityRole="image"
        />

        {/* Metadata section */}
        <View style={styles.content}>
          {renderMetadata()}
        </View>
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.skeleton,
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
