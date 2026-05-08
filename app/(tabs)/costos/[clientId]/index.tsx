/**
 * /costos/[clientId] — cost groups for one client.
 * Bar chart of level-4 cuenta groups + per-group rows; tap a row drills
 * down to /costos/[clientId]/[groupId] (terceros).
 */

import React, { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlCostGroupRow } from '@/src/components/molecules/ml-cost-group-row';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { OrCostGroupsChartCard } from '@/src/components/organisms/or-cost-groups-chart-card';
import { TmConsolidatedDetail } from '@/src/components/templates/tm-consolidated-detail';
import { useCostGroups } from '@/src/hooks/queries/use-cost-groups';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

export default function CostosGruposScreen() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const centroCosto = decodeURIComponent(clientId ?? '');
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const { data, isLoading } = useCostGroups('costos', clientId ?? '');

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod('12m'),
    [setActivePeriod],
  );

  const total = (data ?? []).reduce((s, g) => s + g.amount, 0);
  const totalPrev = 0; // delta of the totals isn't returned by RPC; left at 0
  const totalDelta = 0;

  return (
    <TmConsolidatedDetail
      breadcrumbs={['Costo', centroCosto || '...']}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
    >
      {isLoading || !data ? (
        <View className="px-4 gap-3">
          <AtSkeleton width="100%" height={260} borderRadius={14} />
        </View>
      ) : data.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title="Sin grupos de costo en este periodo"
          description={
            activePeriodKey === '12m'
              ? 'Este cliente no registra costos en los últimos 12 meses.'
              : 'Probá ampliar el rango desde el filtro de arriba.'
          }
          action={
            activePeriodKey !== '12m'
              ? { label: 'Ver últimos 12 meses', onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : (
        <View className="gap-2">
          <OrCostGroupsChartCard
            title={centroCosto}
            total={total}
            deltaPercent={totalDelta}
            groups={data}
          />
          <View>
            {data.map((g) => (
              <MlCostGroupRow
                key={g.id}
                label={g.label}
                amount={g.amount}
                deltaPercent={g.deltaPercent}
                icon={
                  g.icon as React.ComponentProps<typeof MlCostGroupRow>['icon']
                }
                color={g.color}
                onPress={() =>
                  router.push(
                    `/costos/${encodeURIComponent(clientId ?? '')}/${encodeURIComponent(g.id)}` as Parameters<
                      typeof router.push
                    >[0],
                  )
                }
              />
            ))}
          </View>
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
