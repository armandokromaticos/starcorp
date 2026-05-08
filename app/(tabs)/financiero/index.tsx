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
import { queryKeys } from "@/src/hooks/queries/query-keys";
import { startQuickBooksOAuth } from "@/src/services/quickbooks/oauth";
import { useQBStore } from "@/src/stores/qb.store";
import { Pressable, ScrollView, View } from "@/src/tw";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function FinancieroScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [connectingCompany, setConnectingCompany] = useState(false);

  const activeRealmId = useQBStore((s) => s.activeRealmId);
  const setActiveRealmId = useQBStore((s) => s.setActiveRealmId);
  const queryClient = useQueryClient();

  const { data: companies = [] } = useCompanies();

  useEffect(() => {
    if (!activeRealmId && companies[0]) {
      setActiveRealmId(companies[0].id);
    }
  }, [activeRealmId, companies, setActiveRealmId]);

  const activeCompanyId = activeRealmId ?? companies[0]?.id;
  const { data: metrics } = useCompanyMetrics(activeCompanyId);
  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  async function handleConnectAnother() {
    setConnectingCompany(true);
    try {
      await startQuickBooksOAuth();
      await queryClient.invalidateQueries({ queryKey: queryKeys.companies() });
    } catch (err) {
      console.warn("connect another QB company failed", err);
    } finally {
      setConnectingCompany(false);
    }
  }

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
    if (id === "ingresos") router.push("/financiero/ingresos");
    else if (id === "costos") router.push("/financiero/costos");
    else if (id === "egresos") router.push("/financiero/egresos");
  };

  return (
    <TmFinanciero onMenuPress={() => setDrawerVisible(true)}>
      <MlBreadcrumb
        segments={["Financiero"]}
        onBack={() => router.back()}
        className="px-4"
      />

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
            onPress={() => setActiveRealmId(c.id)}
          />
        ))}
        <Pressable
          onPress={handleConnectAnother}
          disabled={connectingCompany}
          className="items-center gap-2"
          style={{ width: 110, opacity: connectingCompany ? 0.6 : 1 }}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 18,
              borderCurve: "continuous",
              borderWidth: 2,
              borderColor: "#1A2B6D",
              borderStyle: "dashed",
              backgroundColor: "#F4F6FB",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {connectingCompany ? (
              <ActivityIndicator color="#1A2B6D" />
            ) : (
              <AtIcon name="add" size="xl" color="#1A2B6D" />
            )}
          </View>
          <AtTypography
            variant="bodyBold"
            color="#1A1F36"
            className="text-center"
            numberOfLines={2}
          >
            Conectar otra
          </AtTypography>
        </Pressable>
      </ScrollView>

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
