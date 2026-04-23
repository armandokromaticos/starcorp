/**
 * Financiero Tab Screen
 *
 * Client carousel + financial metric cards.
 */

import { AtIcon } from "@/src/components/atoms/at-icon";
import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { AtTypography } from "@/src/components/atoms/at-typography";
import { MlBreadcrumb } from "@/src/components/molecules/ml-breadcrumb";
import { MlCompanyCard } from "@/src/components/molecules/ml-company-card";
import { MlPeriodDropdown } from "@/src/components/molecules/ml-period-dropdown";
import { OrDrawer } from "@/src/components/organisms/or-drawer";
import {
  OrFinancialSummary,
  type FinancialMetric,
} from "@/src/components/organisms/or-financial-summary";
import { TmFinanciero } from "@/src/components/templates/tm-financiero";
import { useCompanies } from "@/src/hooks/queries/use-companies";
import { useCompanyMetrics } from "@/src/hooks/queries/use-company-metrics";
import { ScrollView, View } from "@/src/tw";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";

export default function FinancieroScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );

  const { data: companies = [] } = useCompanies();
  const activeCompanyId = selectedCompanyId ?? companies[0]?.id;
  const { data: metrics } = useCompanyMetrics(activeCompanyId);
  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const primaryMetrics: FinancialMetric[] = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        id: "ingresos",
        label: "Ingresos",
        value: metrics.ingresos.value,
        deltaPercent: metrics.ingresos.deltaPercent,
        icon: "attach-money",
        iconColor: "#1A2B6D",
      },
      {
        id: "costos",
        label: "Costos",
        value: metrics.costos.value,
        deltaPercent: metrics.costos.deltaPercent,
        icon: "shopping-bag",
        iconColor: "#E8952E",
      },
      {
        id: "egresos",
        label: "Egresos",
        value: metrics.egresos.value,
        deltaPercent: metrics.egresos.deltaPercent,
        icon: "credit-card",
        iconColor: "#4A7FD4",
      },
    ];
  }, [metrics]);

  const secondaryMetrics: FinancialMetric[] = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        id: "utilidad-bruta",
        label: "Utilidad bruta",
        value: metrics.utilidadBruta.value,
        deltaPercent: metrics.utilidadBruta.deltaPercent,
        icon: "trending-up",
        iconColor: "#38A169",
      },
      {
        id: "utilidad-neta",
        label: "Utilidad neta",
        value: metrics.utilidadNeta.value,
        deltaPercent: metrics.utilidadNeta.deltaPercent,
        icon: "show-chart",
        iconColor: "#3182CE",
      },
    ];
  }, [metrics]);

  const handleMetricPress = (id: string) => {
    if (!activeCompanyId) return;
    if (id === "ingresos") {
      router.push(
        `/ingresos/${activeCompanyId}` as Parameters<typeof router.push>[0],
      );
    } else if (id === "costos") {
      router.push(
        `/costos/${activeCompanyId}` as Parameters<typeof router.push>[0],
      );
    } else if (id === "egresos") {
      router.push(
        `/egresos/${activeCompanyId}` as Parameters<typeof router.push>[0],
      );
    }
  };

  return (
    <TmFinanciero onMenuPress={() => setDrawerVisible(true)}>
      <MlBreadcrumb
        segments={["Financiero"]}
        onBack={() => router.back()}
        className="px-4"
      />

      {/* Company selector carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
      >
        {companies.map((c) => (
          <MlCompanyCard
            key={c.id}
            name={c.name}
            variant="tile"
            selected={c.id === activeCompanyId}
            onPress={() => setSelectedCompanyId(c.id)}
          />
        ))}
      </ScrollView>

      {/* Selected company header */}
      <View className="flex-row items-center gap-3 px-4">
        <View
          className="justify-center items-center bg-bg-tertiary rounded-md w-9 h-9"
          style={{ borderCurve: "continuous" }}
        >
          <AtIcon name="business" size="md" color="#1A2B6D" />
        </View>
        <AtTypography variant="h1" className="flex-1" numberOfLines={1}>
          {activeCompany?.name ?? ""}
        </AtTypography>
        <MlPeriodDropdown />
      </View>

      {/* Financial metrics grid */}
      {!metrics ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={141} borderRadius={14} />
          <AtSkeleton width="100%" height={120} borderRadius={14} />
        </View>
      ) : (
        <>
          <OrFinancialSummary
            metrics={primaryMetrics.map((m) => ({
              ...m,
              ctaLabel:
                m.id === "ingresos"
                  ? "Ver ingresos"
                  : m.id === "costos"
                    ? "Ver costos"
                    : "Ver egresos",
            }))}
            columns={3}
            onMetricPress={handleMetricPress}
          />
          <OrFinancialSummary metrics={secondaryMetrics} columns={2} />
        </>
      )}

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="financiero"
      />
    </TmFinanciero>
  );
}
