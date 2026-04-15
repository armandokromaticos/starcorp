/**
 * Template: TmConsolidatedList
 *
 * Reusable template for Ingresos/Costos/Gastos consolidated list view.
 * Structure: Header + TimeFilter + Metric + Client List
 */

import React, { memo } from 'react';
import { ScrollView, View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlTimeFilterBar, type TimeFilterOption } from '@/src/components/molecules/ml-time-filter-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';

interface TmConsolidatedListProps {
  breadcrumbs: string[];
  totalLabel?: string;
  totalValue?: number;
  filterOptions: TimeFilterOption[];
  selectedFilter: string;
  onFilterSelect: (key: string) => void;
  onBack?: () => void;
  onMenuPress?: () => void;
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
        {/* Search bar */}
        <View className="px-4 pt-2">
          <MlSearchBar onMenuPress={onMenuPress} />
        </View>

        {/* Breadcrumb */}
        <MlBreadcrumb segments={breadcrumbs} onBack={onBack} className="px-4" />

        {/* Time filter */}
        <MlTimeFilterBar
          options={filterOptions}
          selectedKey={selectedFilter}
          onSelect={onFilterSelect}
        />

        {/* Total metric */}
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

        {/* Content (client list, charts, etc.) */}
        {children}
      </ScrollView>
    );
  },
);

TmConsolidatedList.displayName = 'TmConsolidatedList';
