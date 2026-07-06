import {
  forwardRef,
  useState,
} from 'react';
import {
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';
import { Text } from './Text';
import {
  colors,
  inputTokens,
  radii,
  spacing,
  typography,
} from '@/shared/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      hint,
      style,
      inputStyle,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);

    const handleFocus: TextInputProps['onFocus'] = e => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur: TextInputProps['onBlur'] = e => {
      setFocused(false);
      onBlur?.(e);
    };

    const hasError = Boolean(error);

    return (
      <View style={[styles.wrapper, style]}>
        {label !== undefined && (
          <Text variant="label" style={styles.label}>
            {label}
          </Text>
        )}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            focused && styles.inputFocused,
            hasError && styles.inputError,
            inputStyle,
          ]}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={label}
          accessibilityState={{ disabled: rest.editable === false }}
          accessibilityHint={hint}
          aria-invalid={hasError}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {hasError ? (
          <Text variant="caption" style={styles.errorText}>
            {error}
          </Text>
        ) : hint !== undefined ? (
          <Text variant="caption" color="secondary" style={styles.hintText}>
            {hint}
          </Text>
        ) : null}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs,
  },
  label: {
    color: colors.text,
    marginBottom: 2,
  },
  input: {
    height: inputTokens.height,
    borderWidth: inputTokens.borderWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: inputTokens.paddingHorizontal,
    backgroundColor: colors.background,
    color: colors.text,
    ...typography.body,
  },
  inputFocused: {
    borderWidth: inputTokens.borderWidthFocused,
    borderColor: colors.borderFocused,
  },
  inputError: {
    borderWidth: inputTokens.borderWidthFocused,
    borderColor: colors.borderError,
  },
  errorText: {
    color: colors.textError,
  },
  hintText: {},
});
