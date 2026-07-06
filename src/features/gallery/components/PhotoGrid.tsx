import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { Skeleton } from '@/shared/components/feedback';
import { colors, radii, spacing } from '@/shared/theme';
import type { PhotoId } from '@/types';
import type { GalleryItem } from '../types';
import { PhotoCard } from './PhotoCard';

const NUM_COLUMNS = 2;
const GRID_PADDING = spacing.md;
const COLUMN_GAP = spacing.sm;
const SKELETON_COUNT = 6;

interface PhotoGridProps {
  items: GalleryItem[];
  isLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onPressItem?: (id: PhotoId) => void;
}

// Skeleton card
function SkeletonCard({ size }: { size: number }) {
  return (
    <View style={[skeletonStyles.container, { width: size }]}>
      <Skeleton width={size} height={size} borderRadius={radii.md} />
      <Skeleton width="65%" height={14} borderRadius={radii.sm} />
      <Skeleton width="40%" height={12} borderRadius={radii.sm} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
});

// PhotoGrid
export function PhotoGrid({
  items,
  isLoading = false,
  refreshing = false,
  onRefresh,
  onPressItem,
}: PhotoGridProps) {
  const { width: windowWidth } = useWindowDimensions();

  const cardWidth =
    (windowWidth - GRID_PADDING * 2 - COLUMN_GAP * (NUM_COLUMNS - 1)) /
    NUM_COLUMNS;

  // Skeleton mode
  if (isLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonCard key={i} size={cardWidth} />
        ))}
      </View>
    );
  }

  // Data mode
  return (
    <FlatList<GalleryItem>
      data={items}
      keyExtractor={item => item.id}
      numColumns={NUM_COLUMNS}
      renderItem={({ item }: ListRenderItemInfo<GalleryItem>) => (
        <PhotoCard
          item={item}
          width={cardWidth}
          onPress={onPressItem}
          style={styles.card}
        />
      )}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      initialNumToRender={6}
      maxToRenderPerBatch={4}
      windowSize={5}
      removeClippedSubviews
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
    />
  );
}

const styles = StyleSheet.create({
  content: {
    padding: GRID_PADDING,
    gap: COLUMN_GAP,
  },
  row: {
    gap: COLUMN_GAP,
  },
  card: {
    flex: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    gap: COLUMN_GAP,
  },
});
