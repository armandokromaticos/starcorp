/**
 * /costos/[clientId]/[groupId] — terceros (nits) within one cost group
 * for one client. Highlighted bar chart + scrollable list.
 */

import React, { useCallback, useMemo } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { OrHighlightedBarChartCard } from '@/src/components/organisms/or-highlighted-bar-chart-card';
import { OrTercerosList } from '@/src/components/organisms/or-terceros-list';
import { TmConsolidatedDetail } from '@/src/components/templates/tm-consolidated-detail';
import { useCostGroups } from '@/src/hooks/queries/use-cost-groups';
import { useThirdParties } from '@/src/hooks/queries/use-third-parties';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

export default function CostosTercerosScreen() {
  const { clientId, groupId } = useLocalSearchParams<{
    clientId: string;
    groupId: string;
  }>();
  const centroCosto = decodeURIComponent(clientId ?? '');
  const decodedGroupId = decodeURIComponent(groupId ?? '');
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const { data, isLoading } = useThirdParties(
    'costos',
    decodedGroupId,
    clientId ?? '',
  );
  // Pull the group meta from the cached cost-groups query for this client.
  const { data: groups } = useCostGroups('costos', clientId ?? '');
  const group = groups?.find((g) => g.id === decodedGroupId);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod('12m'),
    [setActivePeriod],
  );

  const bars = useMemo(
    () =>
      (data ?? []).slice(0, 5).map((tp) => ({
        id: tp.id,
        label: tp.name,
        value: tp.amount,
        color: tp.color,
      })),
    [data],
  );
  const [firstBar] = bars;

  return (
    <TmConsolidatedDetail
      breadcrumbs={[
        'Costo',
        centroCosto || '...',
        group?.label ?? decodedGroupId ?? '...',
      ]}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
    >
      {isLoading || !data ? (
        <View className="px-4 gap-3">
          <AtSkeleton width="100%" height={240} borderRadius={14} />
          <AtSkeleton width="100%" height={360} borderRadius={14} />
        </View>
      ) : data.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title="Sin terceros en este grupo"
          description={
            activePeriodKey === '12m'
              ? 'No hay movimiento de terceros en los últimos 12 meses para este grupo.'
              : 'Probá ampliar el rango desde el filtro de arriba.'
          }
          action={
            activePeriodKey !== '12m'
              ? { label: 'Ver últimos 12 meses', onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : (
        <View className="gap-3">
          {firstBar && (
            <OrHighlightedBarChartCard
              title={group?.label ?? firstBar.label}
              amount={group?.amount ?? firstBar.value}
              deltaPercent={group?.deltaPercent ?? 0}
              bars={bars}
              highlightedId={firstBar.id}
            />
          )}
          <OrTercerosList terceros={data} />
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
