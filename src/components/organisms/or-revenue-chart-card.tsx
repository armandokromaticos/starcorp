/**
 * Organism: OrRevenueChartCard
 *
 * Main "Empresas (Consolidado)" card from mockup.
 * Stacked pointy area charts with navy/blue/orange gradients +
 * a navy gradient delta bubble pointing at the latest peak.
 */

import React, { memo, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { View, Pressable } from '@/src/tw';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '@/src/theme/tokens';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AreaChart } from '@/src/components/charts/area-chart';
import { useCategoryRevenue } from '@/src/hooks/queries/use-category-revenue';
import {
  usePowerBITimeSeries,
  type TimeSeriesRow,
} from '@/src/hooks/queries/use-powerbi-timeseries';
import { formatCompact } from '@/src/utils/number';
import type {
  NormalizedRevenue,
  TimeSeriesPoint,
} from '@/src/types/domain.types';

interface OrRevenueChartCardProps {
  onPress?: () => void;
  categoryId?: string;
  label?: string;
}

const POWERBI_DATASET_ID = 'af521f53-3c89-4a69-8927-1fe92888ff0a';
const POWERBI_GROUP_ID = '457b264f-6eb8-4b00-8f62-f65ee2700cd4';

const DAX_INGRESOS_EGRESOS_12M = `
DEFINE
  VAR __end = TODAY()
  VAR __start = __end - 364
EVALUATE
SELECTCOLUMNS(
  FILTER(
    ALL('Auxiliar'[Fecha]),
    'Auxiliar'[Fecha] >= __start && 'Auxiliar'[Fecha] <= __end
  ),
  "[Fecha]", 'Auxiliar'[Fecha],
  "[Ingreso]", CALCULATE([Ingreso]) + 0,
  "[Egreso]", CALCULATE([EGRESOS]) + 0
)
ORDER BY [Fecha]
`.trim();

export const OrRevenueChartCard = memo<OrRevenueChartCardProps>(
  ({ onPress, categoryId = 'ingresos', label = 'Ingresos' }) => {
    const isIngresos = categoryId === 'ingresos';
    const { data, isLoading } = useCategoryRevenue(categoryId);
    const { data: pbiSeries, isLoading: pbiLoading } = usePowerBITimeSeries({
      datasetId: isIngresos ? POWERBI_DATASET_ID : '',
      daxQuery: DAX_INGRESOS_EGRESOS_12M,
      groupId: POWERBI_GROUP_ID,
    });

    if (isIngresos) {
      if (pbiLoading || !pbiSeries) {
        return <ChartSkeleton />;
      }
      return (
        <Pressable
          onPress={onPress}
          className="bg-bg-card rounded-lg p-4 mx-4 gap-2"
          style={{
            borderCurve: 'continuous',
            boxShadow:
              '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <IngresosEgresosHeader rows={pbiSeries} label={label} />
          <IngresosEgresosChart rows={pbiSeries} />
        </Pressable>
      );
    }

    if (isLoading || !data) {
      return <ChartSkeleton />;
    }

    return (
      <Pressable
        onPress={onPress}
        className="bg-bg-card rounded-lg p-4 mx-4 gap-2"
        style={{
          borderCurve: 'continuous',
          boxShadow:
            '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <RevenueHeader data={data} label={label} />
        <RevenueChartArea
          series={data.series}
          deltaAbsolute={data.deltaAbsolute}
        />
      </Pressable>
    );
  },
);

const ChartSkeleton = memo(() => (
  <View
    className="bg-bg-card rounded-lg p-4 mx-4 gap-3"
    style={{
      boxShadow:
        '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
    }}
  >
    <AtSkeleton width={200} height={16} />
    <AtSkeleton width={140} height={36} />
    <AtSkeleton width={100} height={16} />
    <AtSkeleton width="100%" height={160} borderRadius={10} />
  </View>
));
ChartSkeleton.displayName = 'ChartSkeleton';

const MONTH_ES_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

function niceCeil(value: number): number {
  if (value <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

const IngresosEgresosHeader = memo<{
  rows: TimeSeriesRow[];
  label: string;
}>(({ rows, label }) => {
  const totalIngreso = rows.reduce((sum, r) => sum + r.ingreso, 0);
  const prev =
    rows.length >= 2 ? rows[rows.length - 2].ingreso : 0;
  const last = rows.length >= 1 ? rows[rows.length - 1].ingreso : 0;
  const deltaPercent = prev === 0 ? 0 : ((last - prev) / prev) * 100;

  return (
    <View className="gap-1">
      <AtTypography variant="overline" color="#4A5568">
        {label}
      </AtTypography>
      <View className="flex-row items-center gap-3">
        <AtMetricValue value={totalIngreso} size="lg" />
        <AtDeltaIndicator value={deltaPercent} appearance="dark" />
      </View>
    </View>
  );
});
IngresosEgresosHeader.displayName = 'IngresosEgresosHeader';

const IngresosEgresosChart = memo<{ rows: TimeSeriesRow[] }>(({ rows }) => {
  const { width: screenWidth } = useWindowDimensions();
  const yAxisWidth = 44;
  const chartWidth = screenWidth - 16 * 4 - yAxisWidth;
  const chartHeight = 140;

  const ingresoData = useMemo(() => rows.map((r) => r.ingreso), [rows]);
  const egresoData = useMemo(() => rows.map((r) => r.egreso), [rows]);

  const yMax = useMemo(() => {
    const peak = Math.max(
      0,
      ...ingresoData,
      ...egresoData,
    );
    return niceCeil(peak);
  }, [ingresoData, egresoData]);

  const yTicks = useMemo(() => {
    if (yMax === 0) return [0];
    return [yMax, yMax * 0.75, yMax * 0.5, yMax * 0.25, 0];
  }, [yMax]);

  const xTickCount = 6;
  const xTicks = useMemo(() => {
    if (rows.length === 0) return [];
    const idxs = Array.from({ length: xTickCount }, (_, i) =>
      Math.round((i / (xTickCount - 1)) * (rows.length - 1)),
    );
    return idxs.map((idx) => {
      const d = new Date(rows[idx].date);
      const day = d.getDate();
      const month = MONTH_ES_SHORT[d.getMonth()] ?? '';
      return `${day} ${month}`;
    });
  }, [rows]);

  return (
    <View style={{ height: chartHeight + 36, marginTop: 8 }}>
      {/* Y-axis scale labels */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 20,
          width: yAxisWidth - 6,
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          zIndex: 1,
        }}
      >
        {yTicks.map((t, i) => (
          <AtTypography key={i} variant="label" color="#8892A4">
            {formatCompact(t)}
          </AtTypography>
        ))}
      </View>

      <View style={{ marginLeft: yAxisWidth, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: chartHeight,
            justifyContent: 'space-between',
          }}
        >
          {yTicks.map((_, i) => (
            <View
              key={i}
              style={{
                height: 1,
                backgroundColor: tokens.color.border.subtle,
              }}
            />
          ))}
        </View>

        {/* Ingresos — navy */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={ingresoData}
            width={chartWidth}
            height={chartHeight}
            color="#0F1B4A"
            smooth
            strokeWidth={2}
            strokeOpacity={0.9}
            gradientId="grad-ingreso"
            yMin={0}
            yMax={yMax}
            fillGradient={{
              stops: [
                { offset: 0, color: '#2B3B7A', opacity: 0.85 },
                { offset: 1, color: '#0A1230', opacity: 0.1 },
              ],
            }}
          />
        </View>

        {/* Egresos — orange */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={egresoData}
            width={chartWidth}
            height={chartHeight}
            color="#DF6434"
            smooth
            strokeWidth={2}
            strokeOpacity={0.9}
            gradientId="grad-egreso"
            yMin={0}
            yMax={yMax}
            fillGradient={{
              stops: [
                { offset: 0, color: '#F2A24A', opacity: 0.7 },
                { offset: 1, color: '#B84A1E', opacity: 0.05 },
              ],
            }}
          />
        </View>

        {/* X-axis day labels */}
        <View
          style={{
            position: 'absolute',
            top: chartHeight + 4,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {xTicks.map((m, i) => (
            <AtTypography key={i} variant="label" color="#8892A4">
              {m}
            </AtTypography>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          flexDirection: 'row',
          gap: 12,
        }}
      >
        <LegendDot color="#0F1B4A" label="Ingresos" />
        <LegendDot color="#DF6434" label="Egresos" />
      </View>
    </View>
  );
});
IngresosEgresosChart.displayName = 'IngresosEgresosChart';

const LegendDot = memo<{ color: string; label: string }>(({ color, label }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
      }}
    />
    <AtTypography variant="label" color="#4A5568">
      {label}
    </AtTypography>
  </View>
));
LegendDot.displayName = 'LegendDot';

const RevenueHeader = memo<{ data: NormalizedRevenue; label: string }>(
  ({ data, label }) => (
    <View className="gap-1">
      <AtTypography variant="overline" color="#4A5568">
        {label}
      </AtTypography>
      <View className="flex-row items-center gap-3">
        <AtMetricValue value={data.total} size="lg" />
        <AtDeltaIndicator value={data.deltaPercent} appearance="dark" />
      </View>
    </View>
  ),
);

const RevenueChartArea = memo<{
  series: TimeSeriesPoint[];
  deltaAbsolute: number;
}>(({ series, deltaAbsolute }) => {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 16 * 4 - 36;
  const chartHeight = 140;

  const primaryData = useMemo(() => series.map((p) => p.value), [series]);
  const secondaryData = useMemo(
    () =>
      series.map((p, i) => Math.max(0, p.value * 0.6 + Math.sin(i * 0.5) * 15)),
    [series],
  );
  const tertiaryData = useMemo(
    () =>
      series.map((p, i) =>
        i < Math.ceil(series.length * 0.35)
          ? Math.max(0, p.value * 0.55 + Math.cos(i * 0.6) * 12)
          : 0,
      ),
    [series],
  );

  const peakIndex = useMemo(() => {
    let maxIdx = 0;
    for (let i = 1; i < primaryData.length; i++) {
      if (primaryData[i] > primaryData[maxIdx]) maxIdx = i;
    }
    return maxIdx;
  }, [primaryData]);

  const peakX = (peakIndex / Math.max(1, primaryData.length - 1)) * chartWidth;

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
        {['100%', '50%', '20%'].map((axisLabel) => (
          <AtTypography key={axisLabel} variant="label" color="#8892A4">
            {axisLabel}
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

        {/* Back layer — dark navy peaks (dominant silhouette) */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={primaryData}
            width={chartWidth}
            height={chartHeight}
            color="#0F1B4A"
            smooth={false}
            strokeWidth={1}
            strokeOpacity={0.4}
            gradientId="grad-navy"
            fillGradient={{
              stops: [
                { offset: 0, color: '#2B3B7A', opacity: 1 },
                { offset: 1, color: '#0A1230', opacity: 1 },
              ],
            }}
          />
        </View>

        {/* Middle layer — bright blue */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={secondaryData}
            width={chartWidth}
            height={chartHeight}
            color="#3A5BBB"
            smooth={false}
            strokeWidth={1}
            strokeOpacity={0.6}
            gradientId="grad-blue"
            fillGradient={{
              stops: [
                { offset: 0, color: '#5B82E6', opacity: 1 },
                { offset: 1, color: '#2D4BA0', opacity: 1 },
              ],
            }}
          />
        </View>

        {/* Front layer — orange peak on the left */}
        <View style={{ position: 'absolute', top: 0, left: 0 }}>
          <AreaChart
            data={tertiaryData}
            width={chartWidth}
            height={chartHeight}
            color="#DF6434"
            smooth={false}
            strokeWidth={1}
            strokeOpacity={0.7}
            gradientId="grad-orange"
            fillGradient={{
              stops: [
                { offset: 0, color: '#F2A24A', opacity: 1 },
                { offset: 1, color: '#B84A1E', opacity: 0.95 },
              ],
            }}
          />
        </View>

        {/* Delta bubble pointing to peak */}
        <DeltaBubble
          absolute={deltaAbsolute}
          x={peakX}
          chartWidth={chartWidth}
        />
      </View>
    </View>
  );
});

const DeltaBubble = memo<{
  absolute: number;
  x: number;
  chartWidth: number;
}>(({ absolute, x, chartWidth }) => {
  const bubbleWidth = 120;
  const clampedLeft = Math.min(
    Math.max(x - bubbleWidth / 2, 0),
    chartWidth - bubbleWidth,
  );
  const isPositive = absolute >= 0;

  return (
    <View
      style={{
        position: 'absolute',
        top: 18,
        left: clampedLeft,
        width: bubbleWidth,
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      <LinearGradient
        colors={['#2D4BA0', '#1A2B6D', '#0F1B4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          borderCurve: 'continuous',
        }}
      >
        <AtTypography variant="captionBold" color="#4ADE80">
          {isPositive ? '\u2197' : '\u2198'}
        </AtTypography>
        <AtTypography
          variant="captionBold"
          color="#FFFFFF"
          selectable
          style={{ fontVariant: ['tabular-nums'] }}
        >
          {isPositive ? '+' : '-'}
          {formatCompact(Math.abs(absolute))}
        </AtTypography>
      </LinearGradient>
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 6,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: '#1A2B6D',
          marginTop: -1,
        }}
      />
    </View>
  );
});

OrRevenueChartCard.displayName = 'OrRevenueChartCard';
RevenueHeader.displayName = 'RevenueHeader';
RevenueChartArea.displayName = 'RevenueChartArea';
DeltaBubble.displayName = 'DeltaBubble';
