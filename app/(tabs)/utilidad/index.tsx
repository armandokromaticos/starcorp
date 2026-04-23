import React, { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { View } from '@/src/tw';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlClientRow } from '@/src/components/molecules/ml-client-row';
import { OrAreaChart } from '@/src/components/organisms/or-area-chart';
import { TmConsolidatedDetail } from '@/src/components/templates/tm-consolidated-detail';
import { useConsolidadoClients } from '@/src/hooks/queries/use-consolidado-clients';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

function buildSeries(index: number): number[] {
  return Array.from({ length: 20 }, (_, i) =>
    40 + Math.sin((i + index) / 3) * 25 + (index * 4) + Math.random() * 8,
  );
}

export default function UtilidadConsolidadaScreen() {
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const { data, isLoading } = useConsolidadoClients('utilidad');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

  const series = useMemo(
    () =>
      (data ?? []).map((c, i) => ({
        data: buildSeries(i),
        color: c.color,
        fillOpacity: 0.35,
      })),
    [data],
  );

  const selected = data?.[selectedIndex];

  return (
    <TmConsolidatedDetail
      breadcrumbs={['Utilidad consolidada']}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
    >
      {isLoading || !data || !selected ? (
        <View className="px-4 gap-3">
          <AtSkeleton width="100%" height={220} borderRadius={14} />
          <AtSkeleton width="100%" height={260} borderRadius={14} />
        </View>
      ) : (
        <View className="gap-4">
          <View
            className="bg-bg-card mx-4 rounded-lg p-4 gap-3"
            style={{
              borderCurve: 'continuous',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            }}
          >
            <View className="gap-1">
              <AtTypography variant="bodyBold">{selected.name}</AtTypography>
              <View className="flex-row items-center gap-3">
                <AtMetricValue value={selected.amount} size="md" />
                <AtDeltaIndicator
                  value={selected.deltaPercent}
                  size="sm"
                  appearance="dark"
                />
              </View>
            </View>
            <OrAreaChart series={series} height={160} />
          </View>
          <View>
            {data.map((c, i) => (
              <MlClientRow
                key={c.id}
                name={c.name}
                color={c.color}
                revenue={c.amount}
                deltaPercent={c.deltaPercent}
                selected={selectedIndex === i}
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </View>
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
