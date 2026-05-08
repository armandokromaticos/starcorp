/**
 * Template: TmConsolidatedList
 *
 * Reusable template for Ingresos/Costos/Gastos consolidated list view.
 *
 * Pinned top section (search + breadcrumb + optional filter + optional total +
 * optional pinnedHeader slot) stays anchored. Only `children` scroll.
 */

import React, { memo } from 'react';
import { ScrollView, View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import {
  MlTimeFilterBar,
  type TimeFilterOption,
} from '@/src/components/molecules/ml-time-filter-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';

interface TmConsolidatedListProps {
  breadcrumbs: string[];
  totalLabel?: string;
  totalValue?: number;
  filterOptions?: TimeFilterOption[];
  selectedFilter?: string;
  onFilterSelect?: (key: string) => void;
  showFilter?: boolean;
  onBack?: () => void;
  onMenuPress?: () => void;
  /** Slot rendered inside the pinned area, right above the scrollable content. */
  pinnedHeader?: React.ReactNode;
  children: React.ReactNode;
}

export const TmConsolidatedList = memo<TmConsolidatedListProps>(
  ({
    breadcrumbs,
    totalLabel,
    totalValue,
    filterOptions,
    selectedFilter,
    onFilterSelect,
    showFilter = true,
    onBack,
    onMenuPress,
    pinnedHeader,
    children,
  }) => {
    return (
      <View className="flex-1 bg-bg-primary">
        {/* Pinned top */}
        <View className="gap-4 pt-2 pb-3 bg-bg-primary">
          <View className="px-4">
            <MlSearchBar onMenuPress={onMenuPress} />
          </View>

          <MlBreadcrumb
            segments={breadcrumbs}
            onBack={onBack}
            className="px-4"
          />

          {showFilter && filterOptions && selectedFilter && onFilterSelect && (
            <MlTimeFilterBar
              options={filterOptions}
              selectedKey={selectedFilter}
              onSelect={onFilterSelect}
            />
          )}

          {totalValue != null && (
            <View className="px-4 gap-1">
              {totalLabel && (
                <AtTypography variant="caption" color="#8892A4">
                  {totalLabel}
                </AtTypography>
              )}
              <AtMetricValue value={totalValue} size="lg" />
            </View>
          )}

          {pinnedHeader}
        </View>

        {/* Scrollable content */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="gap-4 pb-12"
        >
          {children}
        </ScrollView>
      </View>
    );
  },
);

TmConsolidatedList.displayName = 'TmConsolidatedList';
