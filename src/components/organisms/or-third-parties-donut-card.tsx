import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { DonutChart } from '@/src/components/charts/donut-chart';
import type { ThirdParty } from '@/src/types/domain.types';

interface OrThirdPartiesDonutCardProps {
  title: string;
  groupLabel: string;
  groupAmount: number;
  deltaPercent: number;
  data: ThirdParty[];
}

export const OrThirdPartiesDonutCard = memo<OrThirdPartiesDonutCardProps>(
  ({ title, groupLabel, groupAmount, deltaPercent, data }) => {
    const slices = data.slice(0, 8).map((t) => ({
      value: t.amount,
      color: t.color,
      label: t.name,
    }));
    return (
      <View className="gap-3">
        <AtTypography variant="h3" className="px-4 text-center">
          {title}
        </AtTypography>
        <View
          className="bg-bg-card mx-4 rounded-lg p-4 flex-row items-center gap-4"
          style={{
            borderCurve: 'continuous',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          }}
        >
          <View className="flex-1 gap-2">
            <AtTypography variant="bodyBold">{groupLabel}</AtTypography>
            <AtMetricValue value={groupAmount} size="md" />
            <AtDeltaIndicator value={deltaPercent} size="sm" appearance="dark" />
          </View>
          <DonutChart data={slices} size={140} innerRadius={0.55} padAngle={2} />
        </View>
      </View>
    );
  },
);

OrThirdPartiesDonutCard.displayName = 'OrThirdPartiesDonutCard';
