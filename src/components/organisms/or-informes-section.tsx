/**
 * Organism: OrInformesSection
 *
 * Dashboard "Informes" card. Left sidebar lists report categories
 * (carteras, asociados, bancos, presupuestos, seguros, pagos). Right
 * side shows the selected category's label, total, a 12-month line
 * chart with axes, and a "Ver <categoría>" CTA pinned to the bottom.
 */

import React, { memo, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AreaChart } from '@/src/components/charts/area-chart';
import { MlReportCategoryRow } from '@/src/components/molecules/ml-report-category-row';
import { useReports } from '@/src/hooks/queries/use-reports';
import { tokens } from '@/src/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/src/theme/gradients';

interface OrInformesSectionProps {
  title?: string;
  periodLabel?: string;
  initialSelectedId?: string;
  onViewAll?: () => void;
}

const MONTHS_ES_SHORT = [
  'E',
  'F',
  'M',
  'A',
  'M',
  'J',
  'J',
  'A',
  'S',
  'O',
  'N',
  'D',
];

function niceCeil(value: number): number {
  if (value <= 0) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const n = value / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

export const OrInformesSection = memo<OrInformesSectionProps>(
  ({
    title = 'Informes',
    periodLabel = 'Mes corriente',
    initialSelectedId,
    onViewAll,
  }) => {
    const { data, isLoading } = useReports();
    const [selectedId, setSelectedId] = useState<string | null>(
      initialSelectedId ?? null,
    );
    const [chartWidth, setChartWidth] = useState(0);

    useEffect(() => {
      if (!selectedId && data?.reports.length) {
        setSelectedId(data.reports[0].id);
      }
    }, [data, selectedId]);

    const selected = useMemo(() => {
      if (!data) return null;
      return data.reports.find((r) => r.id === selectedId) ?? data.reports[0];
    }, [data, selectedId]);

    if (isLoading || !data || !selected) {
      return (
        <View className="px-4 gap-3">
          <AtSkeleton width={160} height={24} />
          <AtSkeleton width="100%" height={320} borderRadius={16} />
        </View>
      );
    }

    return (
      <View className="gap-4">
        <View className="flex-row justify-between items-center px-4">
          <AtTypography variant="h2">{title}</AtTypography>
          <AtStatusBadge label={periodLabel} variant="gradient" size="md" />
        </View>

        <View
          className="bg-bg-card rounded-lg mx-4 p-4 gap-4"
          style={{
            borderCurve: 'continuous',
            boxShadow:
              '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          <View className="flex-row gap-3">
            <View className="gap-1" style={{ minWidth: 84 }}>
              {data.reports.map((r) => (
                <MlReportCategoryRow
                  key={r.id}
                  label={r.label}
                  icon={r.icon as React.ComponentProps<typeof MlReportCategoryRow>['icon']}
                  color={r.color}
                  selected={selected.id === r.id}
                  onPress={() => setSelectedId(r.id)}
                />
              ))}
            </View>

            <View className="flex-1 gap-2">
              <AtTypography variant="bodyBold" color="#1A1F36">
                {selected.label}
              </AtTypography>
              <AtMetricValue
                value={selected.total}
                size="md"
                currency={selected.currency}
              />

              <View
                style={{ marginTop: 8 }}
                onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
              >
                {chartWidth > 0 && (
                  <ReportLineChart
                    series={selected.series}
                    width={chartWidth}
                  />
                )}
              </View>

              <View className="items-end mt-2">
                <Pressable
                  onPress={onViewAll}
                  style={{
                    borderRadius: 8,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    boxShadow: '0 2px 6px rgba(4, 17, 63, 0.35)',
                  }}
                >
                  <LinearGradient
                    colors={gradients.buttonBlue.colors}
                    start={gradients.buttonBlue.start}
                    end={gradients.buttonBlue.end}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AtTypography variant="captionBold" color="#FFFFFF">
                      Ver {selected.label.toLowerCase()}
                    </AtTypography>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  },
);
OrInformesSection.displayName = 'OrInformesSection';

const ReportLineChart = memo<{ series: number[]; width: number }>(
  ({ series, width }) => {
    const yAxisWidth = 28;
    const chartWidth = Math.max(40, width - yAxisWidth);
    const chartHeight = 110;

    const yMax = useMemo(() => niceCeil(Math.max(...series)), [series]);
    const yTicks = useMemo(() => [yMax, yMax / 2, 0], [yMax]);

    return (
      <View style={{ width, height: chartHeight + 22 }}>
        {/* Y-axis labels */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: chartHeight,
            width: yAxisWidth - 4,
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            zIndex: 1,
          }}
        >
          {yTicks.map((t, i) => (
            <AtTypography key={i} variant="label" color="#8892A4">
              {t === 0 ? '0' : String(t)}
            </AtTypography>
          ))}
        </View>

        <View style={{ marginLeft: yAxisWidth, position: 'relative' }}>
          {/* Dashed grid lines */}
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
                  borderTopWidth: 1,
                  borderTopColor: tokens.color.border.default,
                  borderStyle: 'dashed',
                }}
              />
            ))}
          </View>

          {/* Line — navy stroke, no fill */}
          <View style={{ position: 'absolute', top: 0, left: 0 }}>
            <AreaChart
              data={series}
              width={chartWidth}
              height={chartHeight}
              color="#1B2A6B"
              smooth
              strokeWidth={2.5}
              strokeOpacity={1}
              gradientId="grad-report-line"
              yMin={0}
              yMax={yMax}
              fillGradient={{
                stops: [
                  { offset: 0, color: '#1B2A6B', opacity: 0 },
                  { offset: 1, color: '#1B2A6B', opacity: 0 },
                ],
              }}
            />
          </View>

          {/* X-axis month labels */}
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
            {MONTHS_ES_SHORT.map((m, i) => (
              <AtTypography key={i} variant="label" color="#8892A4">
                {m}
              </AtTypography>
            ))}
          </View>
        </View>
      </View>
    );
  },
);
ReportLineChart.displayName = 'ReportLineChart';
