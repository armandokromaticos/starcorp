/**
 * Template: TmFinanciero
 *
 * Template for Financiero screen.
 * Structure: Search + Company selector + Metric cards + Drill-down sections
 */

import React, { memo } from 'react';
import { ScrollView, View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface TmFinancieroProps {
  title?: string;
  onMenuPress?: () => void;
  children: React.ReactNode;
}

export const TmFinanciero = memo<TmFinancieroProps>(
  ({ title = 'Financiero', onMenuPress, children }) => {
    return (
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-bg-secondary"
        contentContainerClassName="gap-4 pb-12"
      >
        <View className="px-4 pt-2">
          <MlSearchBar onMenuPress={onMenuPress} />
        </View>

        <View className="px-4">
          <AtTypography variant="h2">{title}</AtTypography>
        </View>

        {/* Content: company carousel, metric cards, sections */}
        {children}
      </ScrollView>
    );
  },
);

TmFinanciero.displayName = 'TmFinanciero';
