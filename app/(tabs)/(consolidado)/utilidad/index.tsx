/**
 * /utilidad — consolidated utilidad screen.
 *
 * Layout: pinned top (search + breadcrumb + filter + selected-client chart),
 * scrollable bottom (client list). Tapping a client row swaps the chart to
 * that client's utilidad timeseries.
 */

import { AtDeltaIndicator } from "@/src/components/atoms/at-delta-indicator";
import { AtMetricValue } from "@/src/components/atoms/at-metric-value";
import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { MlBreadcrumb } from "@/src/components/molecules/ml-breadcrumb";
import { MlClientRow } from "@/src/components/molecules/ml-client-row";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import { MlSearchBar } from "@/src/components/molecules/ml-search-bar";
import { MlTimeFilterBar } from "@/src/components/molecules/ml-time-filter-bar";
import { AtIcon } from "@/src/components/atoms/at-icon";
import { OrAreaChart } from "@/src/components/organisms/or-area-chart";
import { OrDrawer } from "@/src/components/organisms/or-drawer";
import { useConsolidadoClients } from "@/src/hooks/queries/use-consolidado-clients";
import type { DashboardSummaryPeriod } from "@/src/hooks/queries/use-dashboard-summary";
import { useDashboardTimeseries } from "@/src/hooks/queries/use-dashboard-timeseries";
import { useFiltersStore } from "@/src/stores/filters.store";
import { useGlobalSearchStore } from "@/src/stores/global-search.store";
import { ScrollView, TextInput, View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { formatAxisDate, PERIOD_SHORT_LABELS } from "@/src/utils/date";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_SHORT_LABELS[key] }),
);

const RPC_PERIOD: Record<PeriodKey, DashboardSummaryPeriod> = {
  today: "mtd",
  "1w": "1w",
  "1m": "1m",
  "3m": "3m",
  "12m": "12m",
};

export default function UtilidadConsolidadaScreen() {
  const insets = useSafeAreaInsets();
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const rpcPeriod = RPC_PERIOD[activePeriodKey];

  const { data, isLoading } = useConsolidadoClients("utilidad");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [query, setQuery] = useState("");
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const filtered = useMemo(() => {
    if (!data) return null;
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((c) => c.name.toLowerCase().includes(q));
  }, [data, query]);

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
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  const series = useMemo(() => {
    const buckets = timeseries.data ?? [];
    if (buckets.length === 0) return [];
    return [
      {
        data: buckets.map((b) => b.utilidad),
        color: selected?.color ?? "#2D4BA0",
        fillOpacity: 0.35,
      },
    ];
  }, [timeseries.data, selected]);

  const xLabels = useMemo(
    () => (timeseries.data ?? []).map((b) => formatAxisDate(b.start)),
    [timeseries.data],
  );

  const isPending = isLoading && !data;
  const isEmpty = !!data && data.length === 0;

  return (
    <View className="flex-1 bg-bg-primary" style={{ paddingTop: insets.top }}>
      {/* Pinned top: search + breadcrumb + filter + chart card */}
      <View className="gap-4 bg-bg-primary pt-2 pb-3">
        <View className="px-4">
          <MlSearchBar
            onMenuPress={() => setDrawerVisible(true)}
            onPress={openGlobalSearch}
          />
        </View>
        <MlBreadcrumb
          segments={["Utilidad consolidada"]}
          onBack={() => router.back()}
          className="px-4"
        />
        <MlTimeFilterBar
          options={PERIOD_OPTIONS}
          selectedKey={activePeriodKey}
          onSelect={handleFilterSelect}
        />

        {isPending ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={220} borderRadius={14} />
          </View>
        ) : isEmpty ? null : selected ? (
          <View
            className="gap-3 bg-bg-card mx-4 p-4 rounded-lg"
            style={{
              borderCurve: "continuous",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
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
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AtTypography variant="caption" color="#8892A4">
                  Sin datos en este periodo
                </AtTypography>
              </View>
            ) : (
              <OrAreaChart series={series} height={160} xLabels={xLabels} />
            )}
          </View>
        ) : null}

        {!isPending && !isEmpty ? (
          <View className="px-4">
            <View
              className="flex-row items-center bg-bg-card px-4 gap-3"
              style={{
                borderRadius: 24,
                borderCurve: "continuous",
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: "rgba(0, 0, 0, 0.08)",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
              }}
            >
              <AtIcon name="search" size="sm" color="#8892A4" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Buscar cliente"
                placeholderTextColor="#8892A4"
                className="flex-1 p-0"
                style={{
                  fontFamily: "Roboto_400Regular",
                  fontSize: 14,
                  color: "#1A1F36",
                }}
              />
            </View>
          </View>
        ) : null}
      </View>

      {/* Scrollable client list */}
      {isPending ? (
        <View className="gap-2 px-4">
          {[0, 1, 2, 3].map((i) => (
            <AtSkeleton key={i} width="100%" height={48} borderRadius={8} />
          ))}
        </View>
      ) : isEmpty ? (
        <MlEmptyState
          icon="search-off"
          title="Sin clientes con utilidad en este periodo"
          description={
            activePeriodKey === "12m"
              ? "No hay movimiento en los últimos 12 meses."
              : "Prueba ampliar el rango desde el filtro de arriba."
          }
          action={
            activePeriodKey !== "12m"
              ? { label: "Ver últimos 12 meses", onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : filtered && filtered.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title="Sin coincidencias"
          description={`No hay clientes que coincidan con "${query.trim()}".`}
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-4 pb-12"
        >
          {filtered?.map((c) => {
            const originalIndex = data?.findIndex((d) => d.id === c.id) ?? -1;
            return (
              <MlClientRow
                key={c.id}
                name={c.name}
                color={c.color}
                revenue={c.amount}
                deltaPercent={c.deltaPercent}
                selected={selectedIndex === originalIndex}
                highlighted
                onPress={() => setSelectedIndex(originalIndex)}
              />
            );
          })}
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
