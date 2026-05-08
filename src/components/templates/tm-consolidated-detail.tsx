/**
 * Template: TmConsolidatedDetail
 *
 * Template for client detail within consolidated views.
 * Structure: Search + Breadcrumb + TimeFilter + Chart + Stats + CategoryRows
 */

import React, { memo } from 'react';
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
    children,
  }) => {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-bg-primary"
        contentContainerClassName="gap-4 pb-12"
      >
        <View className="px-4 pt-2">
          <MlSearchBar onMenuPress={onMenuPress} />
        </View>

        <MlBreadcrumb segments={breadcrumbs} onBack={onBack} className="px-4" />

        <MlTimeFilterBar
          options={filterOptions}
          selectedKey={selectedFilter}
          onSelect={onFilterSelect}
        />

        {/* Metric header */}
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

        {/* Content slots: chart, stats, category rows, etc. */}
        {children}
      </ScrollView>
    );
  },
);

TmConsolidatedDetail.displayName = 'TmConsolidatedDetail';
