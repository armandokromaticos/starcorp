/**
 * Organism: OrClientDetail
 *
 * Single-client detail view used by /ingresos/[clientId], /costos/[clientId],
 * /gastos/[clientId]. The top section (search bar + breadcrumb + period
 * filter) stays pinned; chart card, stat boxes and metric bars scroll below.
 *
 * The entryCategory drives the breadcrumb label and the initially-selected
 * metric bar (which in turn drives the chart card category).
 */

import { Skeleton } from "@/src/components/atoms/skeleton";
import { MlBreadcrumb } from "@/src/components/molecules/ml-breadcrumb";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import { MlLocationCard } from "@/src/components/molecules/ml-location-card";
import { MlMetricBar } from "@/src/components/molecules/ml-metric-bar";
import { MlSearchBar } from "@/src/components/molecules/ml-search-bar";
import { MlStatBox } from "@/src/components/molecules/ml-stat-box";
import { MlTimeFilterBar } from "@/src/components/molecules/ml-time-filter-bar";
import { OrDrawer } from "@/src/components/organisms/or-drawer";
import { OrRevenueChartCard } from "@/src/components/organisms/or-revenue-chart-card";
import { useClientMetadata } from "@/src/hooks/queries/use-client-metadata";
import {
  useDashboardSummary,
  type DashboardSummaryPeriod,
} from "@/src/hooks/queries/use-dashboard-summary";
import { useFiltersStore } from "@/src/stores/filters.store";
import { ScrollView, View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { PERIOD_LABELS } from "@/src/utils/date";
import type { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];
type MetricKey =
  | "ingreso"
  | "costo"
  | "gastos"
  | "utilidad-neta"
  | "utilidad-bruta"
  | "cartera"
  | "margen";
type ChartCategory = "ingresos" | "costos" | "gastos" | "utilidad";
export type ClientDetailEntry = "ingresos" | "costos" | "gastos";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

const RPC_PERIOD: Record<PeriodKey, DashboardSummaryPeriod> = {
  today: "mtd",
  "1w": "1w",
  "1m": "1m",
  "3m": "3m",
  "12m": "12m",
};

const METRIC_TO_CATEGORY: Record<MetricKey, ChartCategory> = {
  ingreso: "ingresos",
  costo: "costos",
  gastos: "gastos",
  "utilidad-neta": "utilidad",
  "utilidad-bruta": "utilidad",
  cartera: "ingresos",
  margen: "utilidad",
};

const CATEGORY_LABEL: Record<ChartCategory, string> = {
  ingresos: "Ingresos",
  costos: "Costos",
  gastos: "Gastos",
  utilidad: "Utilidad",
};

const ENTRY_BREADCRUMB: Record<ClientDetailEntry, string> = {
  ingresos: "Ingresos",
  costos: "Costos",
  gastos: "Gastos",
};

const ENTRY_INITIAL_METRIC: Record<ClientDetailEntry, MetricKey> = {
  ingresos: "ingreso",
  costos: "costo",
  gastos: "gastos",
};

interface OrClientDetailProps {
  clientId: string;
  entryCategory: ClientDetailEntry;
}

export function OrClientDetail({
  clientId,
  entryCategory,
}: OrClientDetailProps) {
  const centroCosto = decodeURIComponent(clientId ?? "");
  const insets = useSafeAreaInsets();

  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const rpcPeriod = RPC_PERIOD[activePeriodKey];

  const summaryQuery = useDashboardSummary(rpcPeriod, {
    compare: true,
    centroCosto,
  });
  const metaQuery = useClientMetadata(centroCosto);

  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(
    ENTRY_INITIAL_METRIC[entryCategory],
  );
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

  const summary = summaryQuery.data;
  const meta = metaQuery.data;

  const metrics = useMemo(() => {
    if (!summary) return [];
    const ingreso = summary.ingresos;
    const costo = summary.costos;
    const gastos = summary.gastos;
    const utilidadNeta = summary.utilidad;
    const utilidadBruta = ingreso - costo;

    const margenPct = ingreso !== 0 ? (utilidadNeta / ingreso) * 100 : null;
    const margenPrevPct =
      summary.ingresosPrev !== 0
        ? (summary.utilidadPrev / summary.ingresosPrev) * 100
        : null;

    const maxAbs = Math.max(
      Math.abs(ingreso),
      Math.abs(costo),
      Math.abs(gastos),
      Math.abs(utilidadNeta),
      Math.abs(utilidadBruta),
      1,
    );
    const w = (v: number) => Math.abs(v) / maxAbs;

    return [
      {
        key: "ingreso" as MetricKey,
        label: "Ingreso",
        icon: "attach-money" as MaterialIconName,
        value: ingreso as number | null,
        deltaPositive: summary.ingresosDeltaPercent >= 0,
        gradient: ["#1A2B6D", "#2D4BA0"] as const,
        widthPercent: w(ingreso),
      },
      {
        key: "costo" as MetricKey,
        label: "Costo",
        icon: "shopping-bag" as MaterialIconName,
        value: costo as number | null,
        deltaPositive: summary.costosDeltaPercent >= 0,
        gradient: ["#1A2B6D", "#5B82E6"] as const,
        widthPercent: w(costo),
      },
      {
        key: "gastos" as MetricKey,
        label: "Gastos",
        icon: "credit-card" as MaterialIconName,
        value: gastos as number | null,
        deltaPositive: summary.gastosDeltaPercent >= 0,
        gradient: ["#0F1B4A", "#1A2B6D"] as const,
        widthPercent: w(gastos),
      },
      {
        key: "utilidad-neta" as MetricKey,
        label: "Utilidad neta",
        icon: "trending-up" as MaterialIconName,
        value: utilidadNeta as number | null,
        deltaPositive: summary.utilidadDeltaPercent >= 0,
        gradient: ["#84CC16", "#D9E26A"] as const,
        widthPercent: w(utilidadNeta),
      },
      {
        key: "utilidad-bruta" as MetricKey,
        label: "Utilidad bruta",
        icon: "insights" as MaterialIconName,
        value: utilidadBruta as number | null,
        deltaPositive: utilidadBruta >= 0,
        gradient: ["#1A2B6D", "#3A5BBB"] as const,
        widthPercent: w(utilidadBruta),
      },
      // Placeholders — data source pending. Render as "—" with no arrow.
      {
        key: "cartera" as MetricKey,
        label: "Cartera",
        icon: "account-balance-wallet" as MaterialIconName,
        value: null,
        deltaPositive: true,
        gradient: ["#0E5048", "#84CC16"] as const,
        widthPercent: 0.6,
      },
      {
        key: "margen" as MetricKey,
        label: "Margen",
        icon: "show-chart" as MaterialIconName,
        value: margenPct,
        deltaPositive:
          margenPct !== null && margenPrevPct !== null
            ? margenPct >= margenPrevPct
            : (margenPct ?? 0) >= 0,
        gradient: ["#F59E0B", "#FBBF24"] as const,
        widthPercent:
          margenPct !== null ? Math.max(0, Math.min(1, margenPct / 100)) : 0.4,
        valueFormat: "percent" as const,
      },
    ];
  }, [summary]);

  const chartCategory = METRIC_TO_CATEGORY[selectedMetric];

  const hasNoActivity =
    !!summary &&
    summary.ingresos === 0 &&
    summary.costos === 0 &&
    summary.gastos === 0;

  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  return (
    <View className="flex-1 bg-bg-secondary" style={{ paddingTop: insets.top }}>
      {/* Pinned top: search + breadcrumb + period filter + chart */}
      <View className="gap-4 bg-bg-secondary pt-2 pb-3">
        <View className="px-4">
          <MlSearchBar onMenuPress={() => setDrawerVisible(true)} />
        </View>
        <MlBreadcrumb
          segments={[ENTRY_BREADCRUMB[entryCategory], centroCosto || "..."]}
          onBack={() => router.back()}
          className="px-4"
        />
        <MlTimeFilterBar
          options={PERIOD_OPTIONS}
          selectedKey={activePeriodKey}
          onSelect={handleFilterSelect}
        />
        <OrRevenueChartCard
          categoryId={chartCategory}
          label={CATEGORY_LABEL[chartCategory]}
          period={activePeriodKey}
          centroCosto={centroCosto}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-12"
      >
        <MlLocationCard value="—" />

        {metaQuery.isPending && !meta ? (
          <View className="flex-row gap-3 px-4">
            {[0, 1, 2].map((i) => (
              <View key={i} className="flex-1">
                <Skeleton width="100%" height={88} />
              </View>
            ))}
          </View>
        ) : meta ? (
          <View className="flex-row gap-3 px-4">
            <MlStatBox
              icon="engineering"
              value="XX"
              label="Empleados"
              iconColor="#F59E0B"
              variant="dark"
            />
            <MlStatBox
              icon="workspace-premium"
              value="XX"
              label="Líder"
              iconColor="#22D3EE"
              variant="dark"
            />
            <MlStatBox
              icon="event"
              value={
                meta.firstFecha ? `Desde ${meta.firstFecha.slice(0, 4)}` : "XX"
              }
              label="Vigencia"
              iconColor="#A78BFA"
              variant="dark"
            />
          </View>
        ) : null}

        <View className="gap-1 px-4">
          {summaryQuery.isPending && metrics.length === 0 ? (
            <View className="gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width="100%" height={64} />
              ))}
            </View>
          ) : hasNoActivity ? (
            <MlEmptyState
              icon="event-busy"
              title="Sin movimiento en este periodo"
              description={
                activePeriodKey === "12m"
                  ? "Este cliente no registra asientos en los últimos 12 meses."
                  : "Prueba ampliar el rango desde el selector de arriba."
              }
              action={
                activePeriodKey !== "12m"
                  ? {
                      label: "Ver últimos 12 meses",
                      onPress: goToWidestPeriod,
                    }
                  : undefined
              }
            />
          ) : (
            metrics.map((m) => (
              <MlMetricBar
                key={m.key}
                label={m.label}
                icon={m.icon}
                value={m.value}
                deltaPositive={m.deltaPositive}
                gradient={m.gradient}
                widthPercent={m.widthPercent}
                valueFormat={"valueFormat" in m ? m.valueFormat : undefined}
                selected={selectedMetric === m.key}
                onPress={() => setSelectedMetric(m.key)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="consolidado"
      />
    </View>
  );
}
