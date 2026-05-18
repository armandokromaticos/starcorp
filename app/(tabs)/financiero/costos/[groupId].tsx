/**
 * /financiero/costos/[groupId] — Vendors hitting a single COGS account.
 *
 * groupId is the QB account leaf ID picked from the accordion at the parent
 * screen. Transactions come from QB reports/TransactionList filtered by
 * account and are aggregated by vendor (name) into rows.
 *
 * Layout:
 *   - Pinned: OrHighlightedBarChartCard, one bar per top vendor. The bar of
 *     the selected vendor gets a small dot indicator above it.
 *   - Scrollable: OrTercerosList (search + outline-on-select row list).
 */

import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import {
  OrHighlightedBarChartCard,
  type HighlightedBarChartPoint,
} from "@/src/components/organisms/or-highlighted-bar-chart-card";
import { OrTercerosList } from "@/src/components/organisms/or-terceros-list";
import { TmConsolidatedDetail } from "@/src/components/templates/tm-consolidated-detail";
import { useCompanies } from "@/src/hooks/queries/use-companies";
import { useQBProfitAndLoss } from "@/src/hooks/queries/use-qb-profit-and-loss";
import { useQBTransactionList } from "@/src/hooks/queries/use-qb-transaction-list";
import {
  findPnLLeafById,
  normalizeTransactionList,
} from "@/src/services/quickbooks/normalizer";
import { useFiltersStore } from "@/src/stores/filters.store";
import { useQBStore } from "@/src/stores/qb.store";
import { CLIENT_LEGEND_GRADIENTS } from "@/src/theme/gradients";
import { View } from "@/src/tw";
import type { PeriodKey, ThirdParty } from "@/src/types/domain.types";
import { PERIOD_SHORT_LABELS } from "@/src/utils/date";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_SHORT_LABELS[key] }),
);

/** Cap bars in the chart so the flex layout can't squeeze each one to 0 width
 *  when an account has dozens/hundreds of transactions. */
const MAX_CHART_BARS = 20;

/** Aggregate transactions by vendor name → list ordered by absolute amount. */
function aggregateVendors(
  transactions: { name: string; amount: number }[],
): ThirdParty[] {
  const byVendor = new Map<string, number>();
  for (const tx of transactions) {
    const key = tx.name || "—";
    byVendor.set(key, (byVendor.get(key) ?? 0) + tx.amount);
  }
  return Array.from(byVendor.entries())
    .map(([name, signedAmount]) => ({ name, amount: Math.abs(signedAmount) }))
    .sort((a, b) => b.amount - a.amount)
    .map(({ name, amount }, i) => {
      const grad = CLIENT_LEGEND_GRADIENTS[
        i % CLIENT_LEGEND_GRADIENTS.length
      ] as [string, string];
      return {
        id: name,
        name,
        color: grad[0],
        gradientColors: grad,
        amount,
        deltaPercent: 0,
      };
    });
}

export default function CostosCuentaDetalleScreen() {
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

  const account = useMemo(
    () => findPnLLeafById(pnl.data ?? null, "COGS", decodedGroupId),
    [pnl.data, decodedGroupId],
  );

  const txList = useQBTransactionList({
    accountId: decodedGroupId,
    start_date: period.start,
    end_date: period.end,
  });

  const transactions = useMemo(
    () => normalizeTransactionList(txList.data ?? null),
    [txList.data],
  );

  const vendors = useMemo(() => aggregateVendors(transactions), [transactions]);

  const groupLabel = account?.label ?? decodedGroupId;
  const groupAmount = account?.amount ?? 0;

  /** One bar per QB transaction (factura), capped at the top N by magnitude
   *  so the chart layout stays legible. Magnitude is used by the chart so
   *  signed values render upward. */
  const bars: HighlightedBarChartPoint[] = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
        .slice(0, MAX_CHART_BARS)
        .map((tx) => ({
          id: tx.id,
          label: tx.num || tx.name || tx.date,
          value: tx.amount,
        })),
    [transactions],
  );

  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  /** Transaction IDs that belong to the selected vendor (matched by name). */
  const highlightedTxIds = useMemo(() => {
    if (!selectedVendorId) return [];
    return transactions
      .filter((tx) => (tx.name || "—") === selectedVendorId)
      .map((tx) => tx.id);
  }, [transactions, selectedVendorId]);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  const isPnLLoading = pnl.isLoading;
  const isTxLoading = txList.isLoading;

  return (
    <TmConsolidatedDetail
      breadcrumbs={["Costo", company?.name ?? "Empresa", groupLabel]}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
      pinnedContent={
        isPnLLoading ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={260} borderRadius={14} />
          </View>
        ) : (
          <OrHighlightedBarChartCard
            title={groupLabel}
            amount={groupAmount}
            deltaPercent={0}
            bars={bars}
            highlightedIds={highlightedTxIds}
            highlightMode="dot"
          />
        )
      }
    >
      {isPnLLoading ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={200} borderRadius={14} />
        </View>
      ) : !account ? (
        <MlEmptyState
          icon="search-off"
          title="Sin datos para esta cuenta"
          description={
            activePeriodKey === "12m"
              ? "QuickBooks no devolvió movimientos para esta cuenta."
              : "Prueba ampliar el rango desde el filtro de arriba."
          }
          action={
            activePeriodKey !== "12m"
              ? { label: "Ver últimos 12 meses", onPress: goToWidestPeriod }
              : undefined
          }
        />
      ) : isTxLoading ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={56} borderRadius={12} />
          <AtSkeleton width="100%" height={56} borderRadius={12} />
          <AtSkeleton width="100%" height={56} borderRadius={12} />
        </View>
      ) : (
        <OrTercerosList
          terceros={vendors}
          selectedId={selectedVendorId}
          onSelectChange={setSelectedVendorId}
        />
      )}
    </TmConsolidatedDetail>
  );
}
