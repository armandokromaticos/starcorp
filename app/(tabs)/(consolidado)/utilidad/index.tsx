/**
 * /utilidad — consolidated utilidad screen.
 *
 * Layout: pinned top (search + breadcrumb + filter + selected-client chart),
 * scrollable bottom (client list). Tapping a client row swaps the chart to
 * that client's utilidad timeseries.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View } from '@/src/tw';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlClientRow } from '@/src/components/molecules/ml-client-row';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlTimeFilterBar } from '@/src/components/molecules/ml-time-filter-bar';
import { OrAreaChart } from '@/src/components/organisms/or-area-chart';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { useConsolidadoClients } from '@/src/hooks/queries/use-consolidado-clients';
import {
  useDashboardTimeseries,
} from '@/src/hooks/queries/use-dashboard-timeseries';
import type { DashboardSummaryPeriod } from '@/src/hooks/queries/use-dashboard-summary';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

const RPC_PERIOD: Record<PeriodKey, DashboardSummaryPeriod> = {
  today: 'mtd',
  '1w': '1w',
  '1m': '1m',
  '3m': '3m',
  '12m': '12m',
};

export default function UtilidadConsolidadaScreen() {
  const insets = useSafeAreaInsets();
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const rpcPeriod = RPC_PERIOD[activePeriodKey];

  const { data, isLoading } = useConsolidadoClients('utilidad');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const selected = data?.[selectedIndex];
  const timeseries = useDashboardTimeseries(rpcPeriod, {
    compare: false,
    centroCosto: selected?.id ?? null,
  });

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod('12m'),
    [setActivePeriod],
  );

  const series = useMemo(() => {
    const buckets = timeseries.data ?? [];
    if (buckets.length === 0) return [];
    return [
      {
        data: buckets.map((b) => b.utilidad),
        color: selected?.color ?? '#2D4BA0',
        fillOpacity: 0.35,
      },
    ];
  }, [timeseries.data, selected]);

  const isPending = isLoading && !data;
  const isEmpty = !!data && data.length === 0;

  return (
    <View
      className="flex-1 bg-bg-primary"
      style={{ paddingTop: insets.top }}
    >
      {/* Pinned top: search + breadcrumb + filter + chart card */}
      <View className="gap-4 pt-2 pb-3 bg-bg-primary">
        <View className="px-4">
          <MlSearchBar onMenuPress={() => setDrawerVisible(true)} />
        </View>
        <MlBreadcrumb
          segments={['Utilidad consolidada']}
          onBack={() => router.back()}
          className="px-4"
        />
        <MlTimeFilterBar
          options={PERIOD_OPTIONS}
          selectedKey={activePeriodKey}
          onSelect={handleFilterSelect}
        />

        {isPending ? (
          <View className="px-4 gap-3">
            <AtSkeleton width="100%" height={220} borderRadius={14} />
          </View>
        ) : isEmpty ? null : selected ? (
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
            {timeseries.isPending && series.length === 0 ? (
              <AtSkeleton width="100%" height={160} borderRadius={8} />
            ) : series.length === 0 ? (
              <View
                style={{
                  height: 160,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AtTypography variant="caption" color="#8892A4">
                  Sin datos en este periodo
                </AtTypography>
              </View>
            ) : (
              <OrAreaChart series={series} height={160} />
            )}
          </View>
        ) : null}
      </View>

      {/* Scrollable client list */}
      {isPending ? (
        <View className="px-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <AtSkeleton key={i} width="100%" height={48} borderRadius={8} />
          ))}
        </View>
      ) : isEmpty ? (
        <MlEmptyState
          icon="search-off"
          title="Sin clientes con utilidad en este periodo"
          description={
            activePeriodKey === '12m'
              ? 'No hay movimiento en los últimos 12 meses.'
              : 'Probá ampliar el rango desde el filtro de arriba.'
          }
          action={
            activePeriodKey !== '12m'
              ? { label: 'Ver últimos 12 meses', onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-12"
        >
          {data?.map((c, i) => (
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
        </ScrollView>
      )}

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="consolidado"
      />
    </View>
  );
}
