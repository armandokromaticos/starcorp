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
import { useQBCustomerBalance } from "@/src/hooks/queries/use-qb-customer-balance";
import { useFiltersStore } from "@/src/stores/filters.store";
import { useGlobalSearchStore } from "@/src/stores/global-search.store";
import { ScrollView, View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { PERIOD_SHORT_LABELS } from "@/src/utils/date";
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
  (key) => ({ key, label: PERIOD_SHORT_LABELS[key] }),
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

const METRIC_CHART_LABEL: Partial<Record<MetricKey, string>> = {
  "utilidad-neta": "Utilidad neta",
  "utilidad-bruta": "Utilidad bruta",
  margen: "Margen",
  cartera: "Cartera",
};

// Resolve a value from clientes_master.data tolerating column-name variants
// (case, accents, common synonyms). Returns the first non-empty match.
function pickField(
  data: Record<string, unknown> | null | undefined,
  candidates: string[],
): string | null {
  if (!data) return null;
  const norm = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const targets = new Set(candidates.map(norm));
  for (const [k, v] of Object.entries(data)) {
    if (v == null || v === "") continue;
    if (targets.has(norm(k))) return String(v);
  }
  return null;
}

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

/**
 * Métricas que tienen un single propio en `(consolidado)/<categoria>/[clientId]`.
 * Sólo estas pueden actuar como drill-down (tap-de-nuevo navega). El resto
 * sólo cambia el chart al seleccionarse.
 */
const METRIC_REDIRECT_TARGET: Partial<Record<MetricKey, ClientDetailEntry>> = {
  ingreso: "ingresos",
  costo: "costos",
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

  /** QB customer DisplayName comes from the PBI master row's `Quickbook`
   *  field (synced into clientes_master.data via pbi-sync-clientes). */
  const qbCustomerName = pickField(metaQuery.data?.clienteData, [
    "Quickbook",
    "QuickBook",
    "QuickBooks",
    "Quickbooks",
    "QBName",
    "QuickbookName",
  ]);
  const carteraQuery = useQBCustomerBalance(qbCustomerName);

  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(
    ENTRY_INITIAL_METRIC[entryCategory],
  );
  const [drawerVisible, setDrawerVisible] = useState(false);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

  const summary = summaryQuery.data;
  const meta = metaQuery.data;

  const cartera = carteraQuery.data ?? null;

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
      Math.abs(cartera ?? 0),
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
        key: "utilidad-bruta" as MetricKey,
        label: "U. bruta",
        icon: "insights" as MaterialIconName,
        value: utilidadBruta as number | null,
        deltaPositive: utilidadBruta >= 0,
        gradient: ["#1A2B6D", "#3A5BBB"] as const,
        widthPercent: w(utilidadBruta),
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
        label: "U. neta",
        icon: "trending-up" as MaterialIconName,
        value: utilidadNeta as number | null,
        deltaPositive: summary.utilidadDeltaPercent >= 0,
        gradient: ["#84CC16", "#D9E26A"] as const,
        widthPercent: w(utilidadNeta),
      },
      // Cartera: outstanding balance for this client's QB Customer (resolved
      // via clientes_master.Quickbook → useQBCustomerBalance). Null when the
      // master row has no Quickbook, the customer isn't in QB, or QB isn't
      // connected — in which case the card stays as "—".
      {
        key: "cartera" as MetricKey,
        label: "Cartera",
        icon: "account-balance-wallet" as MaterialIconName,
        value: cartera,
        deltaPositive: true,
        gradient: ["#0E5048", "#84CC16"] as const,
        widthPercent: cartera != null ? w(cartera) : 0,
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
  }, [summary, cartera]);

  const chartCategory = METRIC_TO_CATEGORY[selectedMetric];

  // Cartera seleccionada: el header y la gráfica dejan de reflejar la
  // categoría P&L. Sin cartera (null o 0) todo se fuerza a 0; con cartera
  // se muestra el saldo QB con flecha según su signo (QB solo expone el
  // saldo actual, no hay serie histórica para un trend real).
  const carteraSelected = selectedMetric === "cartera";
  const hasCartera = cartera != null && cartera !== 0;

  const hasNoActivity =
    !!summary &&
    summary.ingresos === 0 &&
    summary.costos === 0 &&
    summary.gastos === 0;

  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  const handleMetricPress = useCallback(
    (key: MetricKey) => {
      const target = METRIC_REDIRECT_TARGET[key];
      const alreadySelected = key === selectedMetric;
      // Tap inicial → selecciona (cambia chart + activa chevron de redirect).
      // Tap subsecuente en una barra que apunta a OTRA categoría → navega.
      if (alreadySelected && target && target !== entryCategory) {
        router.push(
          `/${target}/${encodeURIComponent(clientId)}` as Parameters<
            typeof router.push
          >[0],
        );
        return;
      }
      setSelectedMetric(key);
    },
    [selectedMetric, entryCategory, clientId],
  );

  return (
    <View className="flex-1 bg-bg-secondary" style={{ paddingTop: insets.top }}>
      {/* Pinned top: search + breadcrumb + period filter + chart */}
      <View className="gap-4 bg-bg-secondary pt-2 pb-3">
        <View className="px-4">
          <MlSearchBar
            onMenuPress={() => setDrawerVisible(true)}
            onPress={openGlobalSearch}
          />
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
          label={
            METRIC_CHART_LABEL[selectedMetric] ?? CATEGORY_LABEL[chartCategory]
          }
          period={activePeriodKey}
          centroCosto={centroCosto}
          headerValueOverride={carteraSelected ? (cartera ?? 0) : undefined}
          headerTrend={
            carteraSelected && hasCartera
              ? cartera > 0
                ? "up"
                : "down"
              : null
          }
          zeroData={carteraSelected && !hasCartera}
        />
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-12"
      >
        <MlLocationCard
          value={
            pickField(meta?.clienteData, [
              "Ubicacion",
              "Ubicación",
              "Direccion",
              "Dirección",
              "DireccionCliente",
              "Address",
              "DireccionFiscal",
            ]) ?? "—"
          }
        />

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
              value={
                meta.empleadosActivos != null
                  ? String(meta.empleadosActivos)
                  : "XX"
              }
              label="Empleados"
              iconColor="#F59E0B"
              variant="dark"
            />
            <MlStatBox
              icon="workspace-premium"
              value={
                pickField(meta.clienteData, [
                  "Lider",
                  "Líder",
                  "LiderCuenta",
                  "AccountManager",
                  "Responsable",
                ]) ?? "XX"
              }
              label="Líder"
              iconColor="#22D3EE"
              variant="dark"
            />
            <MlStatBox
              icon="event"
              value={(() => {
                const raw = pickField(meta.clienteData, [
                  "Vigencia",
                  "FechaVigencia",
                  "FechaInicio",
                  "FechaContrato",
                  "VigenciaDesde",
                ]);
                if (raw) {
                  const year = raw.match(/\d{4}/)?.[0];
                  return year ? `Desde ${year}` : raw;
                }
                return meta.firstFecha
                  ? `Desde ${meta.firstFecha.slice(0, 4)}`
                  : "XX";
              })()}
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
            metrics.map((m) => {
              const target = METRIC_REDIRECT_TARGET[m.key];
              const redirectable = !!target && target !== entryCategory;
              return (
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
                  redirectable={redirectable}
                  onPress={() => handleMetricPress(m.key)}
                />
              );
            })
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
