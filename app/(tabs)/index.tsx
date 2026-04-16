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
import { OrGreetingHeader } from "@/src/components/organisms/or-greeting-header";
import { OrRevenueChartCard } from "@/src/components/organisms/or-revenue-chart-card";
import { OrTopClientsSection } from "@/src/components/organisms/or-top-clients-section";
import { TmDashboard } from "@/src/components/templates/tm-dashboard";
import { useFiltersStore } from "@/src/stores/filters.store";
import { View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { PERIOD_LABELS } from "@/src/utils/date";
import React, { useCallback, useState } from "react";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({
    key,
    label: PERIOD_LABELS[key],
  }),
);

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
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

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

      {/* Section: Empresas (Consolidado) */}
      <View className="gap-3">
        <View className="flex-row justify-between items-center px-4">
          <AtTypography variant="h2">Empresas (Consolidado)</AtTypography>
          <AtStatusBadge label="Hoy" variant="accent" size="sm" />
        </View>
        <OrRevenueChartCard />
      </View>

      {/* Category carousel */}
      <OrCategoryCarousel categories={CATEGORIES} />

      {/* Top clients */}
      <OrTopClientsSection periodLabel={PERIOD_LABELS[activePeriodKey]} />

      {/* Drawer */}
      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="consolidado"
      />
    </TmDashboard>
  );
}
