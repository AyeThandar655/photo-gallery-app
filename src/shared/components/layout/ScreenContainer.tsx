import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/shared/theme';

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scrollable = true,
  padding = true,
  refreshing = false,
  onRefresh,
  style,
  contentStyle,
}: ScreenContainerProps) {
  const paddingStyle = padding ? styles.padded : undefined;

  if (!scrollable) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.root, style]}>
        <View style={[styles.fill, paddingStyle, contentStyle]}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.root, style]}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scrollContent, paddingStyle, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh !== undefined ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
