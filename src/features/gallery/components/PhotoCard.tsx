import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '@/shared/components/ui';
import { colors, radii, spacing } from '@/shared/theme';
import type { PhotoId } from '@/types';
import type { GalleryItem } from '../types';

const MAX_VISIBLE_TAGS = 2;
const IMAGE_RETRY_DELAY_MS = 1500;
const MAX_IMAGE_RETRIES = 3;

interface PhotoCardProps {
  item: GalleryItem;
  width: number;
  onPress?: (id: PhotoId) => void;
  style?: StyleProp<ViewStyle>;
}

export const PhotoCard = memo(function PhotoCard({
  item,
  width,
  onPress,
  style,
}: PhotoCardProps) {
  const imageSize = width;
  const { id, imageUri, metadata } = item;

  const imageOpacity = useRef(new Animated.Value(0)).current;
  const retryCount = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Incrementing key forces Animated.Image to remount and re-request the image.
  const [imageKey, setImageKey] = useState(0);

  // Clear any pending retry timer on unmount to prevent setState on unmounted component.
  useEffect(() => {
    return () => {
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current);
      }
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
      // Reset opacity so the skeleton shows while waiting for the retry load.
      imageOpacity.setValue(0);
      retryTimerRef.current = setTimeout(() => {
        setImageKey(k => k + 1);
      }, IMAGE_RETRY_DELAY_MS);
    }
    // If all retries exhausted, the skeleton background remains visible.
  }, [imageOpacity]);

  const visibleTags = metadata?.tags.slice(0, MAX_VISIBLE_TAGS) ?? [];
  const overflowCount = (metadata?.tags.length ?? 0) - MAX_VISIBLE_TAGS;

  return (
    <Pressable
      onPress={onPress !== undefined ? () => onPress(id) : undefined}
      disabled={onPress === undefined}
      accessibilityRole="button"
      accessibilityLabel={
        metadata?.tags.length
          ? `Photo tagged ${metadata.tags.slice(0, 3).join(', ')}`
          : 'Photo'
      }
      accessibilityHint={onPress !== undefined ? 'Double tap to view photo' : undefined}
      style={({ pressed }) => [
        styles.container,
        { width },
        pressed && onPress !== undefined && styles.pressed,
        style,
      ]}
    >
      {/* Skeleton background always visible; image fades in on load */}
      <View style={[styles.imageWrapper, { width: imageSize, height: imageSize }]}>
        <Animated.Image
          key={imageKey}
          source={{ uri: imageUri }}
          style={[styles.image, { opacity: imageOpacity }]}
          resizeMode="cover"
          onLoad={revealImage}
          onError={handleImageError}
          accessibilityIgnoresInvertColors
        />
      </View>

      {/* Tag row */}
      {metadata !== null && (
        <View style={styles.tagRow}>
          {visibleTags.length > 0 ? (
            <>
              {visibleTags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text variant="caption" numberOfLines={1} style={styles.tagText}>
                    {tag}
                  </Text>
                </View>
              ))}
              {overflowCount > 0 && (
                <Text variant="caption" color="tertiary">
                  +{overflowCount}
                </Text>
              )}
            </>
          ) : (
            <Text variant="caption" color="tertiary">
              No tags
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  imageWrapper: {
    borderRadius: radii.md,
    backgroundColor: colors.skeleton,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 20,
    paddingHorizontal: 2,
  },
  tag: {
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    maxWidth: 80,
  },
  tagText: {
    color: colors.textSecondary,
  },
});
