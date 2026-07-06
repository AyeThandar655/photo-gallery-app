import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { colors, spacing } from '@/shared/theme';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  style,
}: ErrorStateProps) {
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
    >
      <Text style={styles.icon} accessibilityElementsHidden>
        ⚠️
      </Text>

      <Text variant="subheading" align="center" style={styles.title}>
        {title}
      </Text>

      <Text variant="body" color="secondary" align="center" style={styles.message}>
        {message}
      </Text>

      {onRetry !== undefined && (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          size="md"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  icon: {
    fontSize: 40,
    lineHeight: 48,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.text,
  },
  message: {
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.sm,
    minWidth: 140,
  },
});
