import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { colors, spacing } from '@/shared/theme';

interface LoadingProps {
  size?: 'small' | 'large' | 'full';
  message?: string;
  style?: StyleProp<ViewStyle>;
}

export function Loading({ size = 'large', message, style }: LoadingProps) {
  const indicatorSize = size === 'small' ? 'small' : 'large';
  const isFull = size === 'full';

  return (
    <View
      style={[styles.container, isFull && styles.fullScreen, style]}
      accessibilityLiveRegion="polite"
      accessibilityLabel={message ?? 'Loading'}
      importantForAccessibility="yes"
    >
      <ActivityIndicator size={indicatorSize} color={colors.primary} />
      {message !== undefined && (
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={styles.message}
        >
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: spacing.xs,
  },
});
