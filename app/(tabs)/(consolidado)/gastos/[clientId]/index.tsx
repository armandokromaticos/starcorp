/**
 * /gastos/[clientId] — gasto groups for one client. Mirrors costos/[clientId].
 *
 * Layout:
 *   - Pinned: OrCostGroupsChartCard (section title + bar chart card)
 *   - Scrollable: MlCostGroupAccordionRow list with placeholder sub-items
 */

import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { MlCostGroupAccordionRow } from "@/src/components/molecules/ml-cost-group-accordion-row";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import { OrCostGroupsChartCard } from "@/src/components/organisms/or-cost-groups-chart-card";
import { TmConsolidatedDetail } from "@/src/components/templates/tm-consolidated-detail";
import { useCostGroups } from "@/src/hooks/queries/use-cost-groups";
import { useFiltersStore } from "@/src/stores/filters.store";
import { CLIENT_LEGEND_GRADIENTS } from "@/src/theme/gradients";
import { View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { PERIOD_LABELS } from "@/src/utils/date";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

export default function GastosGruposScreen() {
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const centroCosto = decodeURIComponent(clientId ?? "");
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const { data, isLoading } = useCostGroups("gastos", clientId ?? "");

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  const total = (data ?? []).reduce((s, g) => s + g.amount, 0);
  const totalDelta = 0; // delta of the totals isn't returned by RPC; left at 0

  return (
    <TmConsolidatedDetail
      breadcrumbs={["Gasto", centroCosto || "..."]}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
      pinnedContent={
        !isLoading && data && data.length > 0 ? (
          <OrCostGroupsChartCard
            sectionTitle="Gastos administrativos"
            title={centroCosto}
            total={total}
            deltaPercent={totalDelta}
            groups={data}
          />
        ) : null
      }
    >
      {isLoading || !data ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={260} borderRadius={14} />
        </View>
      ) : data.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title="Sin grupos de gasto en este periodo"
          description={
            activePeriodKey === "12m"
              ? "Este cliente no registra gastos en los últimos 12 meses."
              : "Prueba ampliar el rango desde el filtro de arriba."
          }
          action={
            activePeriodKey !== "12m"
              ? { label: "Ver últimos 12 meses", onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : (
        <View className="gap-2">
          {data.map((g, index) => {
            const gradientColors = CLIENT_LEGEND_GRADIENTS[
              index % CLIENT_LEGEND_GRADIENTS.length
            ] as [string, string];
            // Placeholder sub-items until the RPC exposes nested segment data.
            const placeholderSubItems = [
              { id: `${g.id}__seg1`, name: "Segmentación 1", amount: g.amount * 0.6 },
              { id: `${g.id}__seg2`, name: "Segmentación 2", amount: g.amount * 0.4 },
            ];
            return (
              <MlCostGroupAccordionRow
                key={g.id}
                name={g.label}
                amount={g.amount}
                deltaPercent={g.deltaPercent}
                gradientColors={gradientColors}
                subItems={placeholderSubItems}
                onSubItemPress={() =>
                  router.push(
                    `/gastos/${encodeURIComponent(clientId ?? "")}/${encodeURIComponent(g.id)}` as Parameters<
                      typeof router.push
                    >[0],
                  )
                }
              />
            );
          })}
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
