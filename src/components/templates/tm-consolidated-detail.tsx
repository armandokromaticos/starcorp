/**
 * Template: TmConsolidatedDetail
 *
 * Template for client detail within consolidated views.
 * Structure: Search + Breadcrumb + TimeFilter + Chart + Stats + CategoryRows
 */

import React, { memo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlTimeFilterBar, type TimeFilterOption } from '@/src/components/molecules/ml-time-filter-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';

interface TmConsolidatedDetailProps {
  breadcrumbs: string[];
  metricLabel?: string;
  metricValue?: number;
  deltaPercent?: number;
  filterOptions: TimeFilterOption[];
  selectedFilter: string;
  onFilterSelect: (key: string) => void;
  onBack?: () => void;
  onMenuPress?: () => void;
  /** Rendered between the top filter bar and the scrollable area — stays pinned. */
  pinnedContent?: React.ReactNode;
  children: React.ReactNode;
}

export const TmConsolidatedDetail = memo<TmConsolidatedDetailProps>(
  ({
    breadcrumbs,
    metricLabel,
    metricValue,
    deltaPercent,
    filterOptions,
    selectedFilter,
    onFilterSelect,
    onBack,
    onMenuPress,
    pinnedContent,
    children,
  }) => {
    const insets = useSafeAreaInsets();
    return (
      <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
        {/* Pinned top: search + breadcrumb + filter + optional pinned slot */}
        <View className="gap-4 pt-2">
          <View className="px-4">
            <MlSearchBar onMenuPress={onMenuPress} />
          </View>

          <MlBreadcrumb segments={breadcrumbs} onBack={onBack} className="px-4" />

          <MlTimeFilterBar
            options={filterOptions}
            selectedKey={selectedFilter}
            onSelect={onFilterSelect}
          />

          {metricValue != null && (
            <View className="px-4 gap-1">
              {metricLabel && (
                <AtTypography variant="caption" color="#8892A4">
                  {metricLabel}
                </AtTypography>
              )}
              <View className="flex-row items-center gap-3">
                <AtMetricValue value={metricValue} size="lg" />
                {deltaPercent != null && (
                  <AtDeltaIndicator value={deltaPercent} size="sm" />
                )}
              </View>
            </View>
          )}

          {pinnedContent}
        </View>

        {/* Scrollable area */}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-bg-primary"
          contentContainerClassName="gap-4 pb-12 pt-4"
        >
          {children}
        </ScrollView>
      </View>
    );
  },
);

TmConsolidatedDetail.displayName = 'TmConsolidatedDetail';
