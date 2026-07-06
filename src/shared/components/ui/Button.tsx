import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, radii, buttonHeight, spacing } from '@/shared/theme';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && !isDisabled && pressedStyles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator
            size="small"
            color={variant === 'secondary' || variant === 'ghost'
              ? colors.primary
              : colors.textInverse}
          />
        </View>
      ) : (
        <Text
          variant={size === 'sm' ? 'label' : 'body'}
          style={[
            styles.label,
            variant === 'secondary' || variant === 'ghost'
              ? { color: variant === 'ghost' ? colors.primary : colors.text }
              : { color: colors.textInverse },
            variant === 'destructive' && { color: colors.textInverse },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontWeight: '600',
  },
  loadingRow: {
    height: 20,
    justifyContent: 'center',
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    height: buttonHeight.sm,
    paddingHorizontal: spacing.md,
  },
  md: {
    height: buttonHeight.md,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    height: buttonHeight.lg,
    paddingHorizontal: spacing.xl,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructive: {
    backgroundColor: colors.destructive,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primaryPressed },
  secondary: { backgroundColor: colors.surface },
  destructive: { backgroundColor: colors.destructivePressed },
  ghost: { backgroundColor: colors.surface },
});
