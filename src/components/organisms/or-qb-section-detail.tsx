/**
 * Organism: OrQBSectionDetail
 *
 * Shared detail screen for /financiero/{ingresos,costos,egresos}.
 * Reads the active QB realm + period, fetches a single P&L report,
 * extracts the requested section group (Income / COGS / Expenses),
 * and renders the same chart-card + row list pattern as /costos.
 */

import React, { useCallback, useMemo } from 'react';
import { router } from 'expo-router';
import { View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlCostGroupRow } from '@/src/components/molecules/ml-cost-group-row';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { OrCostGroupsChartCard } from '@/src/components/organisms/or-cost-groups-chart-card';
import { TmConsolidatedDetail } from '@/src/components/templates/tm-consolidated-detail';
import { useCompanies } from '@/src/hooks/queries/use-companies';
import { useQBProfitAndLoss } from '@/src/hooks/queries/use-qb-profit-and-loss';
import { useFiltersStore } from '@/src/stores/filters.store';
import { useQBStore } from '@/src/stores/qb.store';
import { normalizePnLSection } from '@/src/services/quickbooks/normalizer';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

interface OrQBSectionDetailProps {
  group: 'Income' | 'COGS' | 'Expenses';
  breadcrumbLabel: string;
  defaultIcon: MaterialIconName;
}

export function OrQBSectionDetail({
  group,
  breadcrumbLabel,
  defaultIcon,
}: OrQBSectionDetailProps) {
  const period = useFiltersStore((s) => s.activePeriod);
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const realmId = useQBStore((s) => s.activeRealmId);
  const { data: companies = [] } = useCompanies();
  const company = companies.find((c) => c.id === realmId);

  const pnl = useQBProfitAndLoss({
    start_date: period.start,
    end_date: period.end,
  });

  const items = useMemo(
    () => normalizePnLSection(pnl.data ?? null, group),
    [pnl.data, group],
  );

  const total = items.reduce((s, it) => s + it.amount, 0);
  const groups = items.map((it) => ({
    id: it.id,
    label: it.label,
    icon: defaultIcon as string,
    color: it.color,
    amount: it.amount,
    deltaPercent: 0,
  }));

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod('12m'),
    [setActivePeriod],
  );

  const isLoading = pnl.isLoading;

  return (
    <TmConsolidatedDetail
      breadcrumbs={[breadcrumbLabel, company?.name ?? 'Empresa']}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
    >
      {isLoading ? (
        <View className="px-4 gap-3">
          <AtSkeleton width="100%" height={260} borderRadius={14} />
        </View>
      ) : items.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title={`Sin ${breadcrumbLabel.toLowerCase()} en este periodo`}
          description={
            activePeriodKey === '12m'
              ? 'QuickBooks no devolvió cuentas para este rango.'
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
            title={company?.name ?? breadcrumbLabel}
            total={total}
            deltaPercent={0}
            groups={groups}
          />
          <View>
            {groups.map((g) => (
              <MlCostGroupRow
                key={g.id}
                label={g.label}
                amount={g.amount}
                deltaPercent={g.deltaPercent}
                icon={g.icon as MaterialIconName}
                color={g.color}
              />
            ))}
          </View>
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
