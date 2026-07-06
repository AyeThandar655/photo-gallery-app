import { Text as RNText, StyleSheet } from 'react-native';
import type { StyleProp, TextStyle } from 'react-native';
import type { ComponentProps } from 'react';
import { colors, typography } from '@/shared/theme';

type TextVariant = keyof typeof typography;

type TextColor =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'inverse'
  | 'error'
  | 'brand';

type TextAlign = 'left' | 'center' | 'right';

interface TextProps extends Omit<ComponentProps<typeof RNText>, 'style'> {
  variant?: TextVariant;
  color?: TextColor;
  align?: TextAlign;
  style?: StyleProp<TextStyle>;
}

const colorMap: Record<TextColor, string> = {
  primary: colors.text,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  inverse: colors.textInverse,
  error: colors.textError,
  brand: colors.textBrand,
};

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  style,
  ...rest
}: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        { color: colorMap[color] },
        align !== undefined && { textAlign: align },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  title: typography.title,
  heading: typography.heading,
  subheading: typography.subheading,
  body: typography.body,
  label: typography.label,
  caption: typography.caption,
});
