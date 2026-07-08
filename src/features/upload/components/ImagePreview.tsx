import { Image, Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/shared/components/ui';
import { colors, radii, spacing, typography } from '@/shared/theme';

interface ImagePreviewProps {
  uri: string | null;
  onPress: () => void;
  error?: string;
  style?: StyleProp<ViewStyle>;
}

export function ImagePreview({ uri, onPress, error, style }: ImagePreviewProps) {
  const hasError = Boolean(error) && uri === null;

  if (uri !== null) {
    return (
      <View style={[styles.container, style]}>
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel="Selected photo preview"
          accessibilityRole="image"
        />
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.changeBadge, pressed && styles.changeBadgePressed]}
          accessibilityRole="button"
          accessibilityLabel="Change selected photo"
        >
          <Text variant="caption" style={styles.changeBadgeText}>
            Change
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={style}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.placeholder,
          hasError && styles.placeholderError,
          pressed && styles.placeholderPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Choose a photo"
        accessibilityHint="Opens your photo library"
      >
        <Ionicons
          name="images-outline"
          size={48}
          color={colors.textTertiary}
          accessibilityElementsHidden
        />
        <Text variant="body" color="secondary" align="center">
          Tap to choose a photo
        </Text>
      </Pressable>
      {hasError && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    backgroundColor: colors.skeleton,
  },
  changeBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radii.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  changeBadgePressed: {
    opacity: 0.75,
  },
  changeBadgeText: {
    color: colors.textInverse,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderError: {
    borderColor: colors.borderError,
  },
  placeholderPressed: {
    backgroundColor: colors.surfaceSecondary,
  },
  placeholderIcon: {
    // kept for layout spacing; icon size is set on the Ionicons component
  },
  errorText: {
    color: colors.textError,
    marginTop: spacing.xs,
  },
});
