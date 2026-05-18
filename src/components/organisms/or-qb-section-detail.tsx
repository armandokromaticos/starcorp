/**
 * Organism: OrQBSectionDetail
 *
 * Shared detail screen for the QB P&L sections /financiero/{costos,egresos}.
 * (Ingresos has its own screen at app/(tabs)/financiero/ingresos.tsx.)
 * Reads the active QB realm + period, fetches a single P&L report, extracts
 * the requested section group, and renders a donut chart card + tappable
 * row list.
 *
 * Level-2 drill-down (terceros) is wired for COGS and Expenses:
 *   /financiero/{costos,egresos}/[groupId]
 */

import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { MlClientRow } from "@/src/components/molecules/ml-client-row";
import { MlCostGroupAccordionRow } from "@/src/components/molecules/ml-cost-group-accordion-row";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import { OrThirdPartiesDonutCard } from "@/src/components/organisms/or-third-parties-donut-card";
import { TmConsolidatedDetail } from "@/src/components/templates/tm-consolidated-detail";
import { useCompanies } from "@/src/hooks/queries/use-companies";
import { useQBProfitAndLoss } from "@/src/hooks/queries/use-qb-profit-and-loss";
import {
  normalizePnLSection,
  normalizePnLSectionHierarchical,
} from "@/src/services/quickbooks/normalizer";
import { useFiltersStore } from "@/src/stores/filters.store";
import { useQBStore } from "@/src/stores/qb.store";
import { CLIENT_LEGEND_GRADIENTS } from "@/src/theme/gradients";
import { View } from "@/src/tw";
import type { PeriodKey, ThirdParty } from "@/src/types/domain.types";
import { PERIOD_SHORT_LABELS } from "@/src/utils/date";
import type { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>["name"];

const PERIOD_OPTIONS = (["today", "1w", "1m", "3m", "12m"] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_SHORT_LABELS[key] }),
);

interface OrQBSectionDetailProps {
  group: "Income" | "COGS" | "Expenses";
  breadcrumbLabel: string;
  defaultIcon: MaterialIconName;
}

export function OrQBSectionDetail({
  group,
  breadcrumbLabel,
  defaultIcon,
}: OrQBSectionDetailProps) {
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
    () => normalizePnLSection(pnl.data ?? null, group),
    [pnl.data, group],
  );

  const categories = useMemo(
    () => normalizePnLSectionHierarchical(pnl.data ?? null, group),
    [pnl.data, group],
  );

  const total = items.reduce((s, it) => s + it.amount, 0);
  const groups = items.map((it) => ({
    id: it.id,
    label: it.label,
    icon: defaultIcon as string,
    color: it.color,
    amount: it.amount,
    deltaPercent: 0,
  }));

  const accountRoutePrefix =
    group === "COGS"
      ? "/financiero/costos"
      : group === "Expenses"
        ? "/financiero/egresos"
        : null;

  // ThirdParty shape required by OrThirdPartiesDonutCard
  const donutData: ThirdParty[] = useMemo(
    () =>
      items.map((it, i) => {
        const grad = CLIENT_LEGEND_GRADIENTS[
          i % CLIENT_LEGEND_GRADIENTS.length
        ] as [string, string];
        return {
          id: it.id,
          name: it.label,
          color: grad[0],
          gradientColors: grad,
          amount: it.amount,
          deltaPercent: 0,
        };
      }),
    [items],
  );

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  // Selected donut slice — tapping a segment shows its % in the donut center,
  // mirroring the consolidado costos/gastos terceros screens.
  const [selectedTerceroId, setSelectedTerceroId] = useState<string | null>(
    null,
  );

  const isLoading = pnl.isLoading;

  return (
    <TmConsolidatedDetail
      breadcrumbs={[breadcrumbLabel, company?.name ?? "Empresa"]}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
      pinnedContent={
        !isLoading && items.length > 0 ? (
          <OrThirdPartiesDonutCard
            sectionTitle={breadcrumbLabel}
            groupLabel={company?.name ?? breadcrumbLabel}
            groupAmount={total}
            deltaPercent={0}
            data={donutData}
            selectedId={selectedTerceroId}
            onSelectChange={setSelectedTerceroId}
          />
        ) : null
      }
    >
      {isLoading ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={260} borderRadius={14} />
        </View>
      ) : items.length === 0 ? (
        <MlEmptyState
          icon="search-off"
          title={`Sin ${breadcrumbLabel.toLowerCase()} en este periodo`}
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
      ) : accountRoutePrefix ? (
        <View className="gap-2">
          {categories.map((cat, i) => {
            const gradientColors = CLIENT_LEGEND_GRADIENTS[
              i % CLIENT_LEGEND_GRADIENTS.length
            ] as [string, string];
            return (
              <MlCostGroupAccordionRow
                key={cat.id}
                name={cat.label}
                amount={cat.amount}
                deltaPercent={0}
                gradientColors={gradientColors}
                subItems={cat.accounts.map((a) => ({
                  id: a.id,
                  name: a.label,
                  amount: a.amount,
                }))}
                onSubItemPress={(accountId) =>
                  router.push(
                    `${accountRoutePrefix}/${encodeURIComponent(accountId)}` as never,
                  )
                }
              />
            );
          })}
        </View>
      ) : (
        <View className="gap-1">
          {groups.map((g, i) => {
            const gradientColors = CLIENT_LEGEND_GRADIENTS[
              i % CLIENT_LEGEND_GRADIENTS.length
            ] as [string, string];
            return (
              <MlClientRow
                key={g.id}
                name={g.label}
                color={gradientColors[0]}
                gradientColors={gradientColors}
                revenue={g.amount}
                deltaPercent={g.deltaPercent}
                swatchSize="lg"
              />
            );
          })}
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
