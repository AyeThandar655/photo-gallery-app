import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '../ui/Text';
import { Button } from '../ui/Button';
import { colors, spacing } from '@/shared/theme';

type FallbackRender = (error: Error, reset: () => void) => ReactNode;

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | FallbackRender;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      this.props.onError?.(error, info);
    } catch {
      // Never allow the logging callback to crash the boundary.
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback !== undefined) {
      return typeof fallback === 'function'
        ? (fallback as FallbackRender)(error!, this.handleReset)
        : fallback;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.icon} accessibilityElementsHidden>
          ⚠️
        </Text>
        <Text variant="subheading" align="center">
          Something went wrong
        </Text>
        <Text
          variant="body"
          color="secondary"
          align="center"
          style={styles.message}
        >
          {error?.message ?? 'An unexpected error occurred.'}
        </Text>
        <Button
          label="Try again"
          onPress={this.handleReset}
          variant="secondary"
          style={styles.button}
        />
      </View>
    );
  }
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
  },
  message: {
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.sm,
    minWidth: 140,
  },
});
