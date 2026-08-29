/**
 * Organism: OrQBSectionDetail
 *
 * Shared detail screen for the QB P&L sections /financiero/{costos,egresos}.
 * (Ingresos has its own screen at app/(tabs)/financiero/ingresos.tsx.)
 * Reads the active QB realm + period, fetches a single P&L report, extracts
 * the requested section group, and renders a donut chart card + flat row
 * list (una fila por cuenta hoja, con flecha — sin acordeón).
 *
 * Level-2 drill-down (terceros) is wired for COGS and Expenses:
 *   /financiero/{costos,egresos}/[groupId]
 */

import { AtSkeleton } from "@/src/components/atoms/at-skeleton";
import { MlClientRow } from "@/src/components/molecules/ml-client-row";
import { MlCostGroupAccordionRow } from "@/src/components/molecules/ml-cost-group-accordion-row";
import { MlEmptyState } from "@/src/components/molecules/ml-empty-state";
import {
  OrThirdPartiesDonutCard,
  OTROS_TERCERO_ID,
} from "@/src/components/organisms/or-third-parties-donut-card";
import { DONUT_MAX_NAMED } from "@/src/utils/donut";
import { TmConsolidatedDetail } from "@/src/components/templates/tm-consolidated-detail";
import { useCompanies } from "@/src/hooks/queries/use-companies";
import { useQBProfitAndLoss } from "@/src/hooks/queries/use-qb-profit-and-loss";
import {
  normalizePnLSection,
  normalizePnLSectionHierarchical,
  type PnLSection,
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
  group: PnLSection;
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

  // Cuentas hoja de la sección — una fila plana por cada una, con flecha
  // que navega directo al detalle (sin acordeón). Ordenadas desc por monto
  // para que el donut (top-N + "Otros") y la lista cuenten lo mismo.
  const leafAccounts = useMemo(
    () =>
      categories
        .flatMap((cat) => cat.accounts)
        .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)),
    [categories],
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

  // ThirdParty shape required by OrThirdPartiesDonutCard. Mismo dataset que
  // la lista (cuentas hoja) para que la selección conecte donut ↔ lista.
  const donutData: ThirdParty[] = useMemo(
    () =>
      leafAccounts.map((leaf, i) => {
        const grad = CLIENT_LEGEND_GRADIENTS[
          i % CLIENT_LEGEND_GRADIENTS.length
        ] as [string, string];
        return {
          id: leaf.id,
          name: leaf.label,
          color: grad[0],
          gradientColors: grad,
          amount: leaf.amount,
          deltaPercent: 0,
        };
      }),
    [leafAccounts],
  );

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );
  const goToWidestPeriod = useCallback(
    () => setActivePeriod("12m"),
    [setActivePeriod],
  );

  // Selected donut slice — tapping a segment shows its % in the donut center
  // Y filtra la lista de abajo; tocar una fila selecciona su segmento, y
  // tocarla de nuevo navega al detalle.
  const [selectedTerceroId, setSelectedTerceroId] = useState<string | null>(
    null,
  );

  // Lista visible según la selección: una cuenta puntual, el bucket
  // "Otros" (las cuentas fuera del top-N del donut), o todas.
  const visibleLeaves = useMemo(() => {
    if (!selectedTerceroId) return leafAccounts;
    if (selectedTerceroId === OTROS_TERCERO_ID) {
      return leafAccounts.slice(DONUT_MAX_NAMED);
    }
    return leafAccounts.filter((l) => l.id === selectedTerceroId);
  }, [leafAccounts, selectedTerceroId]);

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
            emptyHint="Toca un sector para filtrar las cuentas"
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
          {visibleLeaves.map((leaf) => {
            // Color estable por posición en la lista completa, para que
            // coincida con el donut aunque la lista esté filtrada.
            const originalIdx = leafAccounts.findIndex(
              (l) => l.id === leaf.id,
            );
            const gradientColors = CLIENT_LEGEND_GRADIENTS[
              originalIdx % CLIENT_LEGEND_GRADIENTS.length
            ] as [string, string];
            return (
              <MlCostGroupAccordionRow
                key={leaf.id}
                name={leaf.label}
                amount={leaf.amount}
                deltaPercent={null}
                gradientColors={gradientColors}
                onPress={() => {
                  // Primer tap: selecciona (resalta el segmento y filtra).
                  // Tap sobre la fila ya seleccionada: navega al detalle.
                  if (selectedTerceroId !== leaf.id) {
                    setSelectedTerceroId(leaf.id);
                    return;
                  }
                  router.push(
                    `${accountRoutePrefix}/${encodeURIComponent(leaf.id)}` as never,
                  );
                }}
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
