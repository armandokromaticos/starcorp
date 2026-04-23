/**
 * Organism: OrInformesSection
 *
 * Dashboard "Informes" card. Works like the Top 8 clients card: the
 * left sidebar lists report categories (cartera, asociados, bancos,
 * presupuesto, seguro, pagos) and serves as the chart legend — each
 * icon tile is colored to match its bar. The right side shows the
 * selected category's label/total/delta, and below it a fixed SVG bar
 * chart with one bar per category (always visible). Selecting a row
 * only swaps the detail panel; the chart stays put.
 */

import React, { memo, useEffect, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { BarChart } from '@/src/components/charts/bar-chart';
import { MlReportCategoryRow } from '@/src/components/molecules/ml-report-category-row';
import { useReports } from '@/src/hooks/queries/use-reports';

interface OrInformesSectionProps {
  title?: string;
  periodLabel?: string;
  initialSelectedId?: string;
  onViewAll?: () => void;
  ctaLabel?: string;
}

export const OrInformesSection = memo<OrInformesSectionProps>(
  ({
    title = 'Informes',
    periodLabel = 'Hoy',
    initialSelectedId,
    onViewAll,
    ctaLabel = 'Ver informes',
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

    if (isLoading || !data) {
      return (
        <View className="px-4 gap-3">
          <AtSkeleton width={160} height={24} />
          <AtSkeleton width="100%" height={320} borderRadius={16} />
        </View>
      );
    }

    const selected =
      data.reports.find((r) => r.id === selectedId) ?? data.reports[0];

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
          <View className="flex-row gap-4">
            <View className="gap-1" style={{ minWidth: 150 }}>
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
              <View className="self-start">
                <AtDeltaIndicator
                  value={selected.deltaPercent}
                  appearance="dark"
                />
              </View>
              <View
                style={{ marginTop: 8 }}
                onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
              >
                {chartWidth > 0 && (
                  <BarChart
                    data={data.chartData}
                    width={chartWidth}
                    height={140}
                  />
                )}
              </View>
            </View>
          </View>
        </View>

        <View className="items-end px-4">
          <Pressable
            onPress={onViewAll}
            className="bg-navy px-6 py-3 rounded-lg"
            style={{
              borderCurve: 'continuous',
              boxShadow: '0 2px 6px rgba(15, 27, 74, 0.25)',
            }}
          >
            <AtTypography variant="captionBold" color="#FFFFFF">
              {ctaLabel}
            </AtTypography>
          </Pressable>
        </View>
      </View>
    );
  },
);

OrInformesSection.displayName = 'OrInformesSection';
