import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';

interface OrExpenseCentralCardProps {
  total: number;
  deltaPercent: number;
}

export const OrExpenseCentralCard = memo<OrExpenseCentralCardProps>(
  ({ total, deltaPercent }) => {
    return (
      <View
        className="bg-navy mx-4 rounded-lg px-4 py-4 gap-1"
        style={{ borderCurve: 'continuous' }}
      >
        <View className="flex-row justify-between items-center">
          <AtTypography variant="bodyBold" color="#FFFFFF">
            Gastos central
          </AtTypography>
          <AtDeltaIndicator value={deltaPercent} size="sm" appearance="dark" />
        </View>
        <AtMetricValue value={total} size="lg" color="#FFFFFF" />
      </View>
    );
  },
);

OrExpenseCentralCard.displayName = 'OrExpenseCentralCard';
