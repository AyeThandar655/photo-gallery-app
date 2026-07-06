import { memo, useCallback } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Text } from '@/shared/components/ui';
import { colors, radii, spacing } from '@/shared/theme';
import type { PhotoId } from '@/types';
import type { GalleryItem } from '../types';

const MAX_VISIBLE_TAGS = 2;

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

  const imageOpacity = useSharedValue(0);
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: imageOpacity.value,
  }));

  const handleImageLoad = useCallback(() => {
    imageOpacity.value = withTiming(1, { duration: 250 });
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
      {/* Photo image with fade-in */}
      <Animated.View
        style={[
          styles.imageWrapper,
          { width: imageSize, height: imageSize },
          imageAnimatedStyle,
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={handleImageLoad}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

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
