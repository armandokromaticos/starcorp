/**
 * Home Dashboard Page (Consolidado)
 *
 * Assembles new organisms into the full dashboard view matching the mockup.
 * Uses NativeWind components + AtTypography.
 */

import { AtStatusBadge } from "@/src/components/atoms/at-status-badge";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { MlSearchBar } from "@/src/components/molecules/ml-search-bar";
import { MlTimeFilterBar } from "@/src/components/molecules/ml-time-filter-bar";
import {
  OrCategoryCarousel,
  type CategoryItem,
} from "@/src/components/organisms/or-category-carousel";
import { OrDrawer } from "@/src/components/organisms/or-drawer";
import {
  OrFinancieroSection,
  type CompanySummary,
} from "@/src/components/organisms/or-financiero-section";
import { OrGreetingHeader } from "@/src/components/organisms/or-greeting-header";
import { OrInformesSection } from "@/src/components/organisms/or-informes-section";
import { OrPowerBIMetricCard } from "@/src/components/organisms/or-powerbi-metric-card";
import { OrRevenueChartCard } from "@/src/components/organisms/or-revenue-chart-card";
import { OrTopClientsSection } from "@/src/components/organisms/or-top-clients-section";
import { TmDashboard } from "@/src/components/templates/tm-dashboard";
import { useFiltersStore } from "@/src/stores/filters.store";
import { View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { PERIOD_LABELS } from "@/src/utils/date";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({
    key,
    label: PERIOD_LABELS[key],
  }),
);

const POWERBI_DATASET_ID = "af521f53-3c89-4a69-8927-1fe92888ff0a";
const POWERBI_GROUP_ID = "457b264f-6eb8-4b00-8f62-f65ee2700cd4";
const DAX_BBM_INGRESO = `EVALUATE ROW("BBMIngreso", [BBMIngreso])`;

const COMPANIES: CompanySummary[] = [
  {
    id: "5-stars",
    name: "5 Stars",
    totalLabel: "Ingresos totales",
    totalValue: 100000,
    deltaPercent: 1.87,
  },
  {
    id: "one-a",
    name: "One A",
    totalLabel: "Ingresos totales",
    totalValue: 100000,
    deltaPercent: -1.87,
  },
  {
    id: "north",
    name: "North Co.",
    totalLabel: "Ingresos totales",
    totalValue: 86500,
    deltaPercent: 0.92,
  },
];

const CATEGORIES: CategoryItem[] = [
  {
    id: "ingresos",
    label: "Ingresos",
    icon: "attach-money",
    actionLabel: "Ver clientes",
  },
  {
    id: "costos",
    label: "Costos",
    icon: "shopping-bag",
    actionLabel: "Ver clientes",
  },
  {
    id: "gastos",
    label: "Gastos",
    icon: "credit-card",
    actionLabel: "Ver clientes",
  },
  {
    id: "utilidad",
    label: "Utilidad",
    icon: "trending-up",
    actionLabel: "Ver detalle",
  },
];

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("ingresos");
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

  const activeCategory =
    CATEGORIES.find((c) => c.id === selectedCategory) ?? CATEGORIES[0];

  return (
    <TmDashboard stickyHeaderIndices={[0]}>
      {/* Sticky header: search + time filter */}
      <View className="gap-4 bg-bg-secondary pt-2 pb-3">
        <View className="px-4">
          <MlSearchBar onMenuPress={() => setDrawerVisible(true)} />
        </View>
        <MlTimeFilterBar
          options={PERIOD_OPTIONS}
          selectedKey={activePeriodKey}
          onSelect={handleFilterSelect}
        />
      </View>

      {/* Greeting */}
      <OrGreetingHeader name="Alejandro" />

      {/* Power BI — BBM Ingreso (PoC) */}
      <OrPowerBIMetricCard
        datasetId={POWERBI_DATASET_ID}
        groupId={POWERBI_GROUP_ID}
        daxQuery={DAX_BBM_INGRESO}
        label="BBM Ingreso"
      />

      {/* Section: Empresas (Consolidado) */}
      <View className="gap-3">
        <View className="flex-row justify-between items-center px-4">
          <AtTypography variant="h2">Empresas (Consolidado)</AtTypography>
          <AtStatusBadge
            label={PERIOD_LABELS[activePeriodKey]}
            variant="gradient"
            size="md"
          />
        </View>
        <OrRevenueChartCard
          categoryId={activeCategory.id}
          label={activeCategory.label}
        />
      </View>

      {/* Category carousel */}
      <OrCategoryCarousel
        categories={CATEGORIES}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
        onActionPress={(id) =>
          router.push(`/${id}` as Parameters<typeof router.push>[0])
        }
      />

      {/* Top clients */}
      <OrTopClientsSection
        periodLabel={PERIOD_LABELS[activePeriodKey]}
        onViewClients={() => router.push("/clientes")}
      />

      {/* Financiero (empresas carousel) */}
      <OrFinancieroSection
        periodLabel={PERIOD_LABELS[activePeriodKey]}
        companies={COMPANIES}
        onViewAll={() => router.push("/financiero")}
      />

      {/* Informes (reports) */}
      <OrInformesSection
        periodLabel={PERIOD_LABELS[activePeriodKey]}
        onViewAll={() => router.push("/informes")}
      />

      {/* Drawer */}
      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="consolidado"
      />
    </TmDashboard>
  );
}
