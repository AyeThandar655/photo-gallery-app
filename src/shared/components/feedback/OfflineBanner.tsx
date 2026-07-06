import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '../ui/Text';
import { useNetworkStatus } from '@/shared/hooks';
import { colors, spacing } from '@/shared/theme';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (isOnline) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      exiting={FadeOutUp.duration(200)}
      style={[styles.banner, { paddingTop: insets.top + spacing.xs }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLabel="You are offline"
    >
      <Text variant="caption" style={styles.text}>
        No internet connection
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: colors.destructive,
    alignItems: 'center',
    paddingBottom: spacing.xs,
  },
  text: {
    color: colors.textInverse,
    fontWeight: '600',
  },
});
