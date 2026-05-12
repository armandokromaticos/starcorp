/**
 * /financiero/egresos/[groupId] — Level-2 terceros screen for an Expenses group.
 * Mirrors /financiero/costos/[groupId].
 *
 * DATA NOTE: QuickBooks P&L does not provide a per-account breakdown of
 * vendors/transactions. Terceros here are PLACEHOLDER data derived from the
 * group's total (5 entries with fixed distribution 30/25/20/15/10%).
 * Wire to real data (QB Vendors or Transaction List endpoint) when available.
 *
 * Layout:
 *   - Pinned: OrHighlightedBarChartCard (group name + total + gradient bars)
 *   - Scrollable: search bar + MlClientRow list
 */

import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { MlClientRow } from "@/src/components/molecules/ml-client-row";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import {
  OrHighlightedBarChartCard,
  type HighlightedBarChartPoint,
} from "@/src/components/organisms/or-highlighted-bar-chart-card";
import { TmConsolidatedDetail } from "@/src/components/templates/tm-consolidated-detail";
import { useCompanies } from "@/src/hooks/queries/use-companies";
import { useQBProfitAndLoss } from "@/src/hooks/queries/use-qb-profit-and-loss";
import { normalizePnLSection } from "@/src/services/quickbooks/normalizer";
import { useFiltersStore } from "@/src/stores/filters.store";
import { useQBStore } from "@/src/stores/qb.store";
import { CLIENT_LEGEND_GRADIENTS } from "@/src/theme/gradients";
import { View, TextInput } from "@/src/tw";
import type { PeriodKey, ThirdParty } from "@/src/types/domain.types";
import { PERIOD_LABELS } from "@/src/utils/date";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { AtIcon } from "@/src/components/atoms/at-icon";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

/** Fixed placeholder distribution across 5 terceros (sums to 100%). */
const TERCERO_SHARES = [0.3, 0.25, 0.2, 0.15, 0.1];
const TERCERO_DELTA = 1.87;

function buildPlaceholderTerceros(
  groupId: string,
  groupTotal: number,
): ThirdParty[] {
  return TERCERO_SHARES.map((share, i) => {
    const grad = CLIENT_LEGEND_GRADIENTS[
      i % CLIENT_LEGEND_GRADIENTS.length
    ] as [string, string];
    return {
      id: `${groupId}-tercero-${i + 1}`,
      name: `Tercero ${i + 1}`,
      color: grad[0],
      gradientColors: grad,
      amount: groupTotal * share,
      deltaPercent: TERCERO_DELTA,
    };
  });
}

export default function EgresosGrupoTercerosScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const decodedGroupId = decodeURIComponent(groupId ?? "");

  const period = useFiltersStore((s) => s.activePeriod);
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const realmId = useQBStore((s) => s.activeRealmId);
  const { data: companies = [] } = useCompanies();
  const company = companies.find((c) => c.id === realmId);

  const pnl = useQBProfitAndLoss({
    start_date: period.start,
    end_date: period.end,
  });

  const items = useMemo(
    () => normalizePnLSection(pnl.data ?? null, "Expenses"),
    [pnl.data],
  );

  const group = items.find((it) => it.id === decodedGroupId);
  const groupLabel = group?.label ?? decodedGroupId;
  const groupAmount = group?.amount ?? 0;

  const terceros = useMemo(
    () => buildPlaceholderTerceros(decodedGroupId, groupAmount),
    [decodedGroupId, groupAmount],
  );

  const bars: HighlightedBarChartPoint[] = useMemo(
    () =>
      terceros.map((t) => ({
        id: t.id,
        label: t.name,
        value: t.amount,
      })),
    [terceros],
  );

  const [searchText, setSearchText] = useState("");

  const filteredTerceros = useMemo(() => {
    if (!searchText.trim()) return terceros;
    const lower = searchText.toLowerCase();
    return terceros.filter((t) => t.name.toLowerCase().includes(lower));
  }, [terceros, searchText]);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  const isLoading = pnl.isLoading;

  return (
    <TmConsolidatedDetail
      breadcrumbs={[
        "Egreso",
        company?.name ?? "Empresa",
        groupLabel,
      ]}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
      pinnedContent={
        isLoading ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={260} borderRadius={14} />
          </View>
        ) : (
          <OrHighlightedBarChartCard
            title={groupLabel}
            amount={groupAmount}
            deltaPercent={TERCERO_DELTA}
            bars={bars}
          />
        )
      }
    >
      {isLoading ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={200} borderRadius={14} />
        </View>
      ) : items.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title="Sin egresos en este periodo"
          description={
            activePeriodKey === "12m"
              ? "QuickBooks no devolvió cuentas para este rango."
              : "Prueba ampliar el rango desde el filtro de arriba."
          }
          action={
            activePeriodKey !== "12m"
              ? { label: "Ver últimos 12 meses", onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : (
        <View className="gap-4">
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
                value={searchText}
                onChangeText={setSearchText}
                placeholder="Buscar por terceros"
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

          <View className="gap-1">
            {filteredTerceros.map((t) => {
              const gradientColors = t.gradientColors as [string, string];
              return (
                <MlClientRow
                  key={t.id}
                  name={t.name}
                  color={gradientColors[0]}
                  gradientColors={gradientColors}
                  revenue={t.amount}
                  deltaPercent={t.deltaPercent}
                  swatchSize="lg"
                />
              );
            })}

            {filteredTerceros.length === 0 && (
              <View className="items-center py-8 px-4">
                <AtIcon name="search-off" size="lg" color="#8892A4" />
              </View>
            )}
          </View>
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
