/**
 * Organism: OrRevenueChartCard
 *
 * "Empresas (Consolidado)" card. Renders a Corriente vs Histórico area chart
 * with a Totalizado / Corriente / Histórico toggle. Consumes real data from
 * the get_dashboard_summary + get_consolidated_timeseries RPCs.
 */

import React, { memo, useMemo, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { View, Pressable } from '@/src/tw';
import { tokens } from '@/src/theme/tokens';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { Skeleton } from '@/src/components/atoms/skeleton';
import { AreaChart } from '@/src/components/charts/area-chart';
import {
  useDashboardSummary,
  type DashboardSummaryPeriod,
} from '@/src/hooks/queries/use-dashboard-summary';
import {
  useDashboardTimeseries,
  type TimeseriesBucket,
} from '@/src/hooks/queries/use-dashboard-timeseries';
import type { PeriodKey } from '@/src/types/domain.types';
import { formatAxisDate, pickEvenly } from '@/src/utils/date';

interface OrRevenueChartCardProps {
  onPress?: () => void;
  categoryId?: string;
  label?: string;
  period: PeriodKey;
  centroCosto?: string | null;
  /** When provided, the big header value (and delta) is replaced with this
   *  number — used to surface metrics that don't belong to the consolidated
   *  P&L summary, e.g. QB outstanding balance ("Cartera"). The area chart
   *  itself keeps showing `categoryId` since cartera has no timeseries. */
  headerValueOverride?: number | null;
}

type ConsolidadoView = 'totalizado' | 'corriente' | 'historico';
type CategoryId = 'ingresos' | 'costos' | 'gastos' | 'utilidad';

// PeriodKey 'today' is shown as "Mes corriente" in the UI; the RPC accepts 'mtd'.
const RPC_PERIOD: Record<PeriodKey, DashboardSummaryPeriod> = {
  today: 'mtd',
  '1w': '1w',
  '1m': '1m',
  '3m': '3m',
  '12m': '12m',
};

export const OrRevenueChartCard = memo<OrRevenueChartCardProps>(
  ({ onPress, categoryId = 'ingresos', label = 'Ingresos', period, centroCosto, headerValueOverride }) => {
    return (
      <Pressable
        onPress={onPress}
        className="bg-bg-card rounded-lg p-4 mx-4 gap-3"
        style={{
          borderCurve: 'continuous',
          boxShadow:
            '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <ConsolidadoChartCard
          categoryId={categoryId as CategoryId}
          label={label}
          period={period}
          centroCosto={centroCosto}
          headerValueOverride={headerValueOverride}
        />
      </Pressable>
    );
  },
);
OrRevenueChartCard.displayName = 'OrRevenueChartCard';

function niceCeil(value: number): number {
  if (value <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

function niceFloor(value: number): number {
  if (value >= 0) return 0;
  const abs = Math.abs(value);
  const pow = Math.pow(10, Math.floor(Math.log10(abs)));
  const n = abs / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return -nice * pow;
}

const ConsolidadoChartCard = memo<{
  categoryId: CategoryId;
  label: string;
  period: PeriodKey;
  centroCosto?: string | null;
  headerValueOverride?: number | null;
}>(({ categoryId, label, period, centroCosto, headerValueOverride }) => {
  const [view, setView] = useState<ConsolidadoView>('totalizado');
  const rpcPeriod = RPC_PERIOD[period];
  const summary = useDashboardSummary(rpcPeriod, {
    compare: true,
    centroCosto: centroCosto ?? null,
  });
  const timeseries = useDashboardTimeseries(rpcPeriod, {
    compare: true,
    centroCosto: centroCosto ?? null,
  });

  const buckets = useMemo(() => timeseries.data ?? [], [timeseries.data]);
  const corriente = useMemo(
    () => buckets.map((b) => b[categoryId]),
    [buckets, categoryId],
  );
  const historico = useMemo(
    () => buckets.map((b) => prevField(b, categoryId)),
    [buckets, categoryId],
  );
  const xLabels = useMemo(
    () => buckets.map((b) => formatAxisDate(b.start)),
    [buckets],
  );

  const totalCorriente = corriente.reduce((s, v) => s + v, 0);
  const totalHistorico = historico.reduce((s, v) => s + v, 0);
  const totalAll = summary.data ? summary.data[categoryId] : 0;
  const deltaPct = summary.data
    ? summary.data[`${categoryId}DeltaPercent` as const]
    : 0;

  const isOverride = headerValueOverride != null;
  const headerValue = isOverride
    ? headerValueOverride
    : view === 'corriente'
      ? totalCorriente
      : view === 'historico'
        ? totalHistorico
        : totalAll;
  // Override values (e.g. Cartera) have no comparable previous period; hide
  // the delta chip rather than show a misleading delta from `categoryId`.
  const headerDelta = isOverride
    ? null
    : view === 'historico'
      ? -deltaPct
      : deltaPct;

  const isLoading = summary.isPending || timeseries.isPending;

  return (
    <>
      <View className="gap-1">
        <AtTypography variant="captionBold" color="#4A5568">
          {label}
        </AtTypography>
        <View className="flex-row items-center gap-3">
          {isLoading && !summary.data ? (
            <Skeleton width={140} height={28} />
          ) : (
            <>
              <AtMetricValue value={headerValue} size="lg" />
              {headerDelta != null && (
                <AtDeltaIndicator value={headerDelta} appearance="dark" size="lg" />
              )}
            </>
          )}
        </View>
      </View>

      {isLoading && buckets.length === 0 ? (
        <Skeleton width="100%" height={168} />
      ) : (
        <ConsolidadoChart
          corriente={corriente}
          historico={historico}
          view={view}
          xLabels={xLabels}
        />
      )}

      <ConsolidadoToggleBar value={view} onChange={setView} />
    </>
  );
});
ConsolidadoChartCard.displayName = 'ConsolidadoChartCard';

function prevField(bucket: TimeseriesBucket, category: CategoryId): number {
  switch (category) {
    case 'ingresos':
      return bucket.ingresosPrev;
    case 'costos':
      return bucket.costosPrev;
    case 'gastos':
      return bucket.gastosPrev;
    case 'utilidad':
      return bucket.utilidadPrev;
  }
}

const X_AXIS_HEIGHT = 18;

const ConsolidadoChart = memo<{
  corriente: number[];
  historico: number[];
  view: ConsolidadoView;
  xLabels: string[];
}>(({ corriente, historico, view, xLabels }) => {
  const { width: screenWidth } = useWindowDimensions();
  const yAxisWidth = 56;
  const chartWidth = screenWidth - 16 * 4 - yAxisWidth;
  const chartHeight = 160;

  const { yMin, yMax } = useMemo(() => {
    const all = [...corriente, ...historico];
    const peak = Math.max(0, ...all);
    const trough = Math.min(0, ...all);
    return { yMin: niceFloor(trough), yMax: niceCeil(peak) };
  }, [corriente, historico]);

  const yTicks = useMemo(() => {
    if (yMin >= 0) return [yMax, yMax / 2, 0];
    if (yMax <= 0) return [0, yMin / 2, yMin];
    return [yMax, 0, yMin];
  }, [yMin, yMax]);

  const showCorriente = view === 'totalizado' || view === 'corriente';
  const showHistorico = view === 'totalizado' || view === 'historico';
  const hasData = corriente.some((v) => v !== 0) || historico.some((v) => v !== 0);
  const showXAxis = hasData && xLabels.length >= 2;

  return (
    <View
      style={{
        height: chartHeight + 8 + (showXAxis ? X_AXIS_HEIGHT : 0),
        marginTop: 4,
      }}
    >
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: chartHeight,
          width: yAxisWidth - 8,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 1,
        }}
      >
        {yTicks.map((t, i) => (
          <AtTypography key={i} variant="label" color="#8892A4">
            {formatAxisNumber(t)}
          </AtTypography>
        ))}
      </View>

      <View style={{ marginLeft: yAxisWidth }}>
        <View style={{ position: 'relative', height: chartHeight }}>
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

          {!hasData && (
            <View
              style={{
                height: chartHeight,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AtTypography variant="label" color="#8892A4">
                Sin datos en este periodo
              </AtTypography>
            </View>
          )}

          {hasData && showCorriente && (
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <AreaChart
                data={corriente}
                width={chartWidth}
                height={chartHeight}
                color="#E8952E"
                smooth={false}
                strokeWidth={2}
                strokeOpacity={0.9}
                gradientId="grad-corriente"
                yMin={yMin}
                yMax={yMax}
                fillGradient={{
                  stops: [
                    { offset: 0, color: '#F2A24A', opacity: 0.85 },
                    { offset: 1, color: '#E8952E', opacity: 0.35 },
                  ],
                }}
              />
            </View>
          )}

          {hasData && showHistorico && (
            <View style={{ position: 'absolute', top: 0, left: 0 }}>
              <AreaChart
                data={historico}
                width={chartWidth}
                height={chartHeight}
                color="#2D4BA0"
                smooth={false}
                strokeWidth={3}
                strokeOpacity={1}
                gradientId="grad-historico"
                yMin={yMin}
                yMax={yMax}
                fillGradient={{
                  stops: [
                    { offset: 0, color: '#5B82E6', opacity: 0.35 },
                    { offset: 1, color: '#2D4BA0', opacity: 0.05 },
                  ],
                }}
              />
            </View>
          )}
        </View>

        {showXAxis && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            {pickEvenly(xLabels, 6).map((label, i) => (
              <AtTypography key={`${label}-${i}`} variant="label" color="#8892A4">
                {label}
              </AtTypography>
            ))}
          </View>
        )}
      </View>
    </View>
  );
});
ConsolidadoChart.displayName = 'ConsolidadoChart';

const TOGGLE_OPTIONS: {
  key: ConsolidadoView;
  label: string;
  swatch?: string;
}[] = [
  { key: 'totalizado', label: 'Totalizado' },
  { key: 'corriente', label: 'Corriente', swatch: '#E8952E' },
  { key: 'historico', label: 'Histórico', swatch: '#2D4BA0' },
];

const ConsolidadoToggleBar = memo<{
  value: ConsolidadoView;
  onChange: (next: ConsolidadoView) => void;
}>(({ value, onChange }) => (
  <View className="flex-row gap-2 mt-1">
    {TOGGLE_OPTIONS.map((opt) => {
      const selected = value === opt.key;
      return (
        <Pressable
          key={opt.key}
          onPress={() => onChange(opt.key)}
          className="flex-1 flex-row items-center justify-between bg-bg-secondary rounded-md px-3 py-2"
          style={{ borderCurve: 'continuous' }}
        >
          <View className="flex-row items-center gap-1.5">
            {opt.swatch && (
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: opt.swatch,
                }}
              />
            )}
            <AtTypography variant="label" color="#1A1F36">
              {opt.label}
            </AtTypography>
          </View>
          <RadioDot selected={selected} />
        </Pressable>
      );
    })}
  </View>
));
ConsolidadoToggleBar.displayName = 'ConsolidadoToggleBar';

const RadioDot = memo<{ selected: boolean }>(({ selected }) => (
  <View
    style={{
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: selected ? '#E8952E' : '#C7CCD6',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    }}
  >
    {selected && (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: '#E8952E',
        }}
      />
    )}
  </View>
));
RadioDot.displayName = 'RadioDot';

function formatAxisNumber(value: number): string {
  if (value === 0) return '0';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
