import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AreaChart } from '@/src/components/charts/area-chart';
import { MlLocationCard } from '@/src/components/molecules/ml-location-card';
import { MlStatBox } from '@/src/components/molecules/ml-stat-box';
import { tokens } from '@/src/theme/tokens';
import type { TimeSeriesPoint } from '@/src/types/domain.types';
import { useWindowDimensions } from 'react-native';

interface OrClientDetailHeaderProps {
  amount: number;
  deltaPercent: number;
  deltaAbsolute: number;
  series: TimeSeriesPoint[];
  location: string;
  employees: number;
  leader: number;
  vigencia: number;
}

export const OrClientDetailHeader = memo<OrClientDetailHeaderProps>(
  ({
    amount,
    deltaPercent,
    deltaAbsolute,
    series,
    location,
    employees,
    leader,
    vigencia,
  }) => {
    const { width } = useWindowDimensions();
    const chartWidth = width - 64;

    return (
      <View className="gap-3">
        <View
          className="bg-bg-card mx-4 rounded-lg p-4 gap-3"
          style={{
            borderCurve: 'continuous',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
          }}
        >
          <AtTypography variant="captionBold" color="#8892A4">
            Ingreso
          </AtTypography>
          <View className="flex-row justify-between items-center">
            <View className="gap-1">
              <AtMetricValue value={amount} size="lg" />
              <AtDeltaIndicator value={deltaPercent} size="sm" />
            </View>
            <AtDeltaIndicator
              value={deltaPercent}
              absolute={deltaAbsolute}
              size="sm"
              appearance="dark"
            />
          </View>
          <View style={{ height: 120, width: chartWidth }}>
            <AreaChart
              data={series.map((p) => p.value)}
              width={chartWidth}
              height={120}
              color={tokens.color.chart[0]}
              fillOpacity={0.25}
              strokeWidth={1.8}
              gradientId="client-detail-area"
            />
          </View>
        </View>

        <MlLocationCard value={location} />

        <View className="flex-row gap-3 mx-4">
          <MlStatBox
            icon="engineering"
            value={employees}
            label="Empleados"
            iconColor="#F59E0B"
          />
          <MlStatBox
            icon="workspace-premium"
            value={leader}
            label="Líder"
            iconColor="#4A7FD4"
          />
          <MlStatBox
            icon="event"
            value={vigencia}
            label="Vigencia"
            iconColor="#7E4FE8"
          />
        </View>
      </View>
    );
  },
);

OrClientDetailHeader.displayName = 'OrClientDetailHeader';
