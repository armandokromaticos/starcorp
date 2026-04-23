import React, { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { TmConsolidatedDetail } from '@/src/components/templates/tm-consolidated-detail';
import { OrThirdPartiesDonutCard } from '@/src/components/organisms/or-third-parties-donut-card';
import { OrTercerosList } from '@/src/components/organisms/or-terceros-list';
import { useThirdParties } from '@/src/hooks/queries/use-third-parties';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';
import { mockCostGroups } from '@/src/services/mock/data.mock';

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

export default function GastosTercerosScreen() {
  const { groupId } = useLocalSearchParams<{ clientId: string; groupId: string }>();
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const { data, isLoading } = useThirdParties('gastos', groupId ?? '');
  const group = mockCostGroups.find((g) => g.id === groupId);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

  return (
    <TmConsolidatedDetail
      breadcrumbs={['Gastos', 'Grupos', 'Terceros']}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
    >
      {isLoading || !data ? (
        <View className="px-4 gap-3">
          <AtSkeleton width="100%" height={200} borderRadius={14} />
          <AtSkeleton width="100%" height={360} borderRadius={14} />
        </View>
      ) : (
        <View className="gap-3">
          <OrThirdPartiesDonutCard
            title="Gastos administrativos"
            groupLabel={group?.label ?? 'Grupo'}
            groupAmount={group?.amount ?? 0}
            deltaPercent={group?.deltaPercent ?? 0}
            data={data}
          />
          <OrTercerosList terceros={data} />
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
