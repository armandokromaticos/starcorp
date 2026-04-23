import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { OrBarChart } from '@/src/components/organisms/or-bar-chart';
import type { CostGroup } from '@/src/types/domain.types';

interface OrCostGroupsChartCardProps {
  title: string;
  total: number;
  deltaPercent: number;
  groups: CostGroup[];
}

export const OrCostGroupsChartCard = memo<OrCostGroupsChartCardProps>(
  ({ title, total, deltaPercent, groups }) => {
    const bars = groups.map((g) => ({
      label: g.label,
      value: g.amount,
      color: g.color,
    }));
    return (
      <View className="gap-3">
        <AtTypography variant="h3" className="px-4 text-center">
          {title}
        </AtTypography>
        <View
          className="bg-bg-card mx-4 rounded-lg p-4 gap-3"
          style={{
            borderCurve: 'continuous',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          }}
        >
          <View className="gap-1">
            <AtTypography variant="caption" color="#8892A4">
              Total
            </AtTypography>
            <View className="flex-row items-center gap-3">
              <AtMetricValue value={total} size="lg" />
              <AtDeltaIndicator value={deltaPercent} size="sm" />
            </View>
          </View>
          <OrBarChart data={bars} height={160} />
        </View>
      </View>
    );
  },
);

OrCostGroupsChartCard.displayName = 'OrCostGroupsChartCard';
