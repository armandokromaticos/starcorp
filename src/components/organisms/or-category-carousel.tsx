/**
 * Organism: OrCategoryCarousel
 *
 * Horizontal scroll of MlCategoryTab cards.
 * Fixed: accepts data via props (no more hardcoded mock import).
 * Migrated to NativeWind.
 */

import React, { memo } from 'react';
import { ScrollView } from '@/src/tw';
import { MlCategoryTab } from '@/src/components/molecules/ml-category-tab';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface CategoryItem {
  id: string;
  label: string;
  icon: MaterialIconName;
  actionLabel: string;
  statusColor?: string;
}

interface OrCategoryCarouselProps {
  categories: CategoryItem[];
  onCategoryPress?: (id: string) => void;
}

export const OrCategoryCarousel = memo<OrCategoryCarouselProps>(
  ({ categories, onCategoryPress }) => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
      >
        {categories.map((cat) => (
          <MlCategoryTab
            key={cat.id}
            label={cat.label}
            icon={cat.icon}
            actionLabel={cat.actionLabel}
            statusColor={cat.statusColor}
            onPress={() => onCategoryPress?.(cat.id)}
          />
        ))}
      </ScrollView>
    );
  },
);

OrCategoryCarousel.displayName = 'OrCategoryCarousel';
