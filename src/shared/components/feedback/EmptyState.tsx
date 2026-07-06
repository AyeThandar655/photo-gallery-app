import { StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { colors, spacing } from '@/shared/theme';

interface EmptyStateAction {
  label: string;
  onPress: () => void;
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: string;
  action?: EmptyStateAction;
  style?: StyleProp<ViewStyle>;
}

export function EmptyState({
  title,
  message,
  icon,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon !== undefined && (
        <Text style={styles.icon} accessibilityElementsHidden>
          {icon}
        </Text>
      )}

      <Text variant="heading" align="center">
        {title}
      </Text>

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

      {action !== undefined && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="primary"
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
    fontSize: 48,
    lineHeight: 56,
    marginBottom: spacing.xs,
  },
  message: {
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.sm,
    minWidth: 160,
  },
});
