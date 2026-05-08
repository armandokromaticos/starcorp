/**
 * Template: TmConsolidatedTerceros
 *
 * Template for terceros view (donut chart + terceros list).
 * Used in Costos/Gastos → Grupos → Terceros.
 */

import React, { memo } from 'react';
import { ScrollView, View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlTimeFilterBar, type TimeFilterOption } from '@/src/components/molecules/ml-time-filter-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface TmConsolidatedTercerosProps {
  breadcrumbs: string[];
  groupTitle?: string;
  filterOptions: TimeFilterOption[];
  selectedFilter: string;
  onFilterSelect: (key: string) => void;
  onBack?: () => void;
  onMenuPress?: () => void;
  children: React.ReactNode;
}

export const TmConsolidatedTerceros = memo<TmConsolidatedTercerosProps>(
  ({
    breadcrumbs,
    groupTitle,
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

        {groupTitle && (
          <View className="px-4">
            <AtTypography variant="h3">{groupTitle}</AtTypography>
          </View>
        )}

        {/* Content: donut chart + terceros search list */}
        {children}
      </ScrollView>
    );
  },
);

TmConsolidatedTerceros.displayName = 'TmConsolidatedTerceros';
