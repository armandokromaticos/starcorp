/**
 * /costos/[clientId]/[groupId] — terceros within one cost group for one client.
 *
 * Layout:
 *   - Pinned: OrThirdPartiesDonutCard (section title + card with donut + labeled tags)
 *   - Scrollable: OrTercerosList (search bar + tercero rows with gradient swatches)
 */

import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import { OrThirdPartiesDonutCard } from "@/src/components/organisms/or-third-parties-donut-card";
import { OrTercerosList } from "@/src/components/organisms/or-terceros-list";
import { TmConsolidatedDetail } from "@/src/components/templates/tm-consolidated-detail";
import { useCostGroups } from "@/src/hooks/queries/use-cost-groups";
import { useThirdParties } from "@/src/hooks/queries/use-third-parties";
import { useFiltersStore } from "@/src/stores/filters.store";
import { View } from "@/src/tw";
import type { PeriodKey } from "@/src/types/domain.types";
import { PERIOD_LABELS } from "@/src/utils/date";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback } from "react";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

export default function CostosTercerosScreen() {
  const { clientId, groupId } = useLocalSearchParams<{
    clientId: string;
    groupId: string;
  }>();
  const centroCosto = decodeURIComponent(clientId ?? "");
  const decodedGroupId = decodeURIComponent(groupId ?? "");
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);

  const { data, isLoading } = useThirdParties(
    "costos",
    decodedGroupId,
    clientId ?? "",
  );
  const { data: groups } = useCostGroups("costos", clientId ?? "");
  const group = groups?.find((g) => g.id === decodedGroupId);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  const isReady = !isLoading && data != null;
  const isEmpty = isReady && data.length === 0;

  return (
    <TmConsolidatedDetail
      breadcrumbs={[
        "Costo",
        centroCosto || "...",
        group?.label ?? decodedGroupId ?? "...",
      ]}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
      pinnedContent={
        isLoading || !data ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={300} borderRadius={14} />
          </View>
        ) : !isEmpty ? (
          <OrThirdPartiesDonutCard
            sectionTitle="Costos administrativos"
            groupLabel={group?.label ?? decodedGroupId}
            groupAmount={group?.amount ?? 0}
            deltaPercent={group?.deltaPercent ?? 0}
            data={data}
          />
        ) : null
      }
    >
      {isEmpty ? (
        <MlEmptyState
          icon="search-off"
          title="Sin terceros en este grupo"
          description={
            activePeriodKey === "12m"
              ? "No hay movimiento de terceros en los últimos 12 meses para este grupo."
              : "Prueba ampliar el rango desde el filtro de arriba."
          }
          action={
            activePeriodKey !== "12m"
              ? { label: "Ver últimos 12 meses", onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : isReady ? (
        <OrTercerosList terceros={data} />
      ) : null}
    </TmConsolidatedDetail>
  );
}
