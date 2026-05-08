/**
 * Template: TmUtilidad
 *
 * Template for Utilidad consolidated view.
 * Structure: Search + Breadcrumb + TimeFilter + AreaChart + Client List
 */

import React, { memo } from 'react';
import { ScrollView, View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlTimeFilterBar, type TimeFilterOption } from '@/src/components/molecules/ml-time-filter-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';

interface TmUtilidadProps {
  breadcrumbs?: string[];
  clientName?: string;
  totalValue?: number;
  deltaPercent?: number;
  filterOptions: TimeFilterOption[];
  selectedFilter: string;
  onFilterSelect: (key: string) => void;
  onBack?: () => void;
  onMenuPress?: () => void;
  children: React.ReactNode;
}

export const TmUtilidad = memo<TmUtilidadProps>(
  ({
    breadcrumbs,
    clientName,
    totalValue,
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

        {breadcrumbs && (
          <MlBreadcrumb segments={breadcrumbs} onBack={onBack} className="px-4" />
        )}

        <MlTimeFilterBar
          options={filterOptions}
          selectedKey={selectedFilter}
          onSelect={onFilterSelect}
        />

        {/* Client metric */}
        {(clientName || totalValue != null) && (
          <View className="px-4 gap-1">
            {clientName && (
              <AtTypography variant="bodyBold">{clientName}</AtTypography>
            )}
            {totalValue != null && (
              <View className="flex-row items-center gap-3">
                <AtMetricValue value={totalValue} size="lg" />
                {deltaPercent != null && (
                  <AtDeltaIndicator value={deltaPercent} size="sm" />
                )}
              </View>
            )}
          </View>
        )}

        {/* Content: area chart + client list */}
        {children}
      </ScrollView>
    );
  },
);

TmUtilidad.displayName = 'TmUtilidad';
