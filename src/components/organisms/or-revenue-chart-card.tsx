/**
 * Organism: OrRevenueChartCard
 *
 * Main "Empresas (Consolidado)" card from mockup.
 * Combines metric header + stacked area charts using custom SVG components.
 * Migrated to NativeWind + AtTypography atoms.
 * Note: SVG charts still use tokens.ts directly (SVG doesn't support className).
 */

import React, { memo, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { View, Pressable } from '@/src/tw';
import { tokens } from '@/src/theme/tokens';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AreaChart } from '@/src/components/charts/area-chart';
import { useRevenue } from '@/src/hooks/queries/use-revenue';
import type { NormalizedRevenue, TimeSeriesPoint } from '@/src/types/domain.types';

interface OrRevenueChartCardProps {
  onPress?: () => void;
}

export const OrRevenueChartCard = memo<OrRevenueChartCardProps>(({ onPress }) => {
  const { data, isLoading } = useRevenue();

  if (isLoading || !data) {
    return (
      <View
        className="bg-bg-card rounded-lg p-4 mx-4 gap-3"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <AtSkeleton width={200} height={16} />
        <AtSkeleton width={140} height={36} />
        <AtSkeleton width={100} height={16} />
        <AtSkeleton width="100%" height={160} borderRadius={10} />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-bg-card rounded-lg p-4 mx-4 gap-2"
      style={{
        borderCurve: 'continuous',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
      }}
    >
      <RevenueHeader data={data} />
      <RevenueChartArea series={data.series} deltaAbsolute={data.deltaAbsolute} />
    </Pressable>
  );
});

const RevenueHeader = memo<{ data: NormalizedRevenue }>(({ data }) => (
  <View className="gap-1">
    <View className="flex-row justify-between items-center mb-1">
      <AtTypography variant="overline" color="#4A5568">
        Ingresos
      </AtTypography>
      <AtStatusBadge label="Hoy" variant="accent" size="sm" />
    </View>
    <AtMetricValue value={data.total} size="lg" />
    <AtDeltaIndicator value={data.deltaPercent} absolute={data.deltaAbsolute} />
  </View>
));

const RevenueChartArea = memo<{
  series: TimeSeriesPoint[];
  deltaAbsolute: number;
}>(({ series, deltaAbsolute }) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 16 * 4 - 36;
  const chartHeight = 140;

  const primaryData = useMemo(() => series.map((p) => p.value), [series]);
  const secondaryData = useMemo(
    () => series.map((p, i) => Math.max(0, p.value * 0.6 + Math.sin(i * 0.5) * 15)),
    [series],
  );
  const tertiaryData = useMemo(
    () => series.map((p, i) => Math.max(0, p.value * 0.3 + Math.cos(i * 0.3) * 10)),
    [series],
  );

  return (
    <View style={{ height: chartHeight + 20, marginTop: 8 }}>
      {/* Y-axis labels */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 4,
          bottom: 20,
          justifyContent: 'space-between',
          zIndex: 1,
        }}
      >
        {['100%', '50%', '20%'].map((label) => (
          <AtTypography key={label} variant="label" color="#8892A4">
            {label}
          </AtTypography>
        ))}
      </View>

      {/* Stacked area charts */}
      <View style={{ marginLeft: 36, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'space-between',
          }}
        >
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={{
                height: 1,
                backgroundColor: tokens.color.border.subtle,
                marginTop: i === 0 ? chartHeight * 0.05 : 0,
              }}
            />
          ))}
        </View>

        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={tertiaryData}
            width={chartWidth}
            height={chartHeight}
            color={tokens.color.chart[3]}
            fillOpacity={0.12}
            strokeWidth={1}
            gradientId="grad3"
          />
        </View>

        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={secondaryData}
            width={chartWidth}
            height={chartHeight}
            color={tokens.color.chart[1]}
            fillOpacity={0.15}
            strokeWidth={1.5}
            gradientId="grad2"
          />
        </View>

        <AreaChart
          data={primaryData}
          width={chartWidth}
          height={chartHeight}
          color={tokens.color.chart[0]}
          fillOpacity={0.2}
          strokeWidth={2}
          gradientId="grad1"
        />

        <View
          className="absolute right-3 top-4 bg-positive-light px-2 py-1 rounded-md flex-row items-center gap-1"
        >
          <AtTypography variant="label" color="#38A169">
            {'\u2197'}
          </AtTypography>
          <AtTypography variant="label" color="#38A169" selectable style={{ fontVariant: ['tabular-nums'] }}>
            +{deltaAbsolute >= 1000 ? `${(deltaAbsolute / 1000).toFixed(0)}.000` : deltaAbsolute}
          </AtTypography>
        </View>
      </View>
    </View>
  );
});

OrRevenueChartCard.displayName = 'OrRevenueChartCard';
RevenueHeader.displayName = 'RevenueHeader';
RevenueChartArea.displayName = 'RevenueChartArea';
