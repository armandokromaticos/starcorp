/**
 * Informe Pagos — pantalla principal.
 *
 * Layout scrolleable:
 *   1. Search + breadcrumb
 *   2. Fila "Filtros" (toggle + botón filtros) y chips de filtros aplicados
 *   3. Card cabecera con toggle "Por fecha" (calendario heatmap) / "Por
 *      empresa generadora" (donut)
 *   4. Headers "Empresa generadora" / "Total"
 *   5. Lista de cards de pagos
 *   6. Footer "Total" navy
 *
 * Tap en una celda del calendario abre el sheet "Detalle del día".
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlReportListSkeleton } from '@/src/components/molecules/ml-report-list-skeleton';
import { MlFilterChip } from '@/src/components/molecules/ml-filter-chip';
import { MlPagoCard } from '@/src/components/molecules/ml-pago-card';
import { MlSimpleTotalFooter } from '@/src/components/molecules/ml-simple-total-footer';
import { OrPagosCalendar } from '@/src/components/organisms/or-pagos-calendar';
import { OrPagosDayDetailSheet } from '@/src/components/organisms/or-pagos-day-detail-sheet';
import { OrPagosFiltersSheet } from '@/src/components/organisms/or-pagos-filters-sheet';
import { OrCarteraDonut } from '@/src/components/organisms/or-cartera-donut';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtToggleSwitch } from '@/src/components/atoms/at-toggle-switch';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { usePagos } from '@/src/hooks/queries/use-pagos';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import {
  EMPTY_PAGOS_FILTERS,
  formatShortDate,
  type PagosFilters,
} from '@/src/types/pagos.types';
import { formatCurrency } from '@/src/utils/currency';

function inRange(iso: string, from: string | null, to: string | null): boolean {
  if (from && iso < from) return false;
  if (to && iso > to) return false;
  return true;
}

export default function PagosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isPending } = usePagos();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filtersActive, setFiltersActive] = useState(true);
  const [filters, setFilters] = useState<PagosFilters>(EMPTY_PAGOS_FILTERS);
  const [yearMonth, setYearMonth] = useState('2026-03');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  // Vista derivada del toggle: ON = calendario por fecha, OFF = donut por
  // empresa generadora. Misma señal que controla los chips de filtros.
  const vista: 'calendario' | 'donut' = filtersActive ? 'calendario' : 'donut';
  const effective = filtersActive ? filters : EMPTY_PAGOS_FILTERS;

  const empresasMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    data?.empresas.forEach((e) => map.set(e.id, { name: e.name, color: e.color }));
    return map;
  }, [data]);

  const centrosMap = useMemo(() => {
    const map = new Map<string, string>();
    data?.centrosCostos.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [data]);

  const empleadosMap = useMemo(() => {
    const map = new Map<string, string>();
    data?.empleados.forEach((e) => map.set(e.id, e.name));
    return map;
  }, [data]);

  const filteredPagos = useMemo(() => {
    if (!data) return [];
    return data.pagos.filter((p) => {
      if (!inRange(p.fecha, effective.dateFrom, effective.dateTo)) return false;
      if (effective.empresaIds.length && !effective.empresaIds.includes(p.empresaId))
        return false;
      if (
        effective.centroCostosIds.length &&
        !effective.centroCostosIds.includes(p.centroCostosId)
      )
        return false;
      if (effective.empleadoIds.length && !effective.empleadoIds.includes(p.empleadoId))
        return false;
      return true;
    });
  }, [data, effective]);

  const totalsByDate = useMemo(() => {
    const out: Record<string, number> = {};
    for (const p of filteredPagos) {
      out[p.fecha] = (out[p.fecha] ?? 0) + p.monto;
    }
    return out;
  }, [filteredPagos]);

  const donutData = useMemo(() => {
    if (!data) return [];
    const totals = new Map<string, number>();
    for (const p of filteredPagos) {
      totals.set(p.empresaId, (totals.get(p.empresaId) ?? 0) + p.monto);
    }
    return data.empresas
      .filter((e) => totals.has(e.id))
      .map((e) => ({
        id: e.id,
        value: totals.get(e.id) ?? 0,
        color: e.color,
        label: e.name,
      }));
  }, [data, filteredPagos]);

  const listaTotal = useMemo(
    () => filteredPagos.reduce((s, p) => s + p.monto, 0),
    [filteredPagos],
  );

  const hasActiveFilters =
    !!effective.dateFrom ||
    !!effective.dateTo ||
    effective.empresaIds.length > 0 ||
    effective.centroCostosIds.length > 0 ||
    effective.empleadoIds.length > 0;

  const selectedDayBucket = selectedDay
    ? data?.dayBuckets[selectedDay] ?? null
    : null;
  const selectedDayTotal = selectedDay ? totalsByDate[selectedDay] ?? 0 : 0;

  // Reset selección del donut si el slice ya no existe (cambió filtro).
  React.useEffect(() => {
    if (selectedSliceId && !donutData.some((s) => s.id === selectedSliceId)) {
      setSelectedSliceId(null);
    }
  }, [donutData, selectedSliceId]);

  return (
    <View
      className="flex-1 bg-bg-secondary"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4 pt-2">
          <MlSearchBar
            onMenuPress={() => setDrawerVisible(true)}
            onPress={openGlobalSearch}
          />
        </View>

        <View className="px-4">
          <MlBreadcrumb
            segments={['Informes', 'Pagos']}
            onBack={() => router.back()}
          />
        </View>

        {/* Filtros bar */}
        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center gap-3 flex-1">
            <AtTypography variant="bodyBold">Filtros</AtTypography>
            <AtToggleSwitch value={filtersActive} onChange={setFiltersActive} />
            {hasActiveFilters && filtersActive && (
              <Pressable
                onPress={() => setFilters(EMPTY_PAGOS_FILTERS)}
                hitSlop={6}
              >
                <AtTypography variant="captionBold" color="#1A3FE8">
                  Borrar filtros
                </AtTypography>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={() => setFiltersVisible(true)}
            className="rounded-md items-center justify-center"
            style={{
              width: 36,
              height: 36,
              backgroundColor:
                hasActiveFilters && filtersActive ? '#E8952E' : '#0F1B4A',
              borderCurve: 'continuous',
            }}
          >
            <AtIcon name="filter-list" size="md" color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Chips de filtros aplicados */}
        {filtersActive && hasActiveFilters && (
          <View className="flex-row flex-wrap gap-2 px-4">
            {effective.dateFrom && effective.dateTo && (
              <MlFilterChip
                label={`Fecha: ${formatShortDate(effective.dateFrom)} - ${formatShortDate(effective.dateTo)}`}
                onRemove={() =>
                  setFilters((f) => ({ ...f, dateFrom: null, dateTo: null }))
                }
              />
            )}
            {effective.empresaIds.map((id) => (
              <MlFilterChip
                key={`emp-${id}`}
                label={`Empresa: ${empresasMap.get(id)?.name ?? id}`}
                onRemove={() =>
                  setFilters((f) => ({
                    ...f,
                    empresaIds: f.empresaIds.filter((x) => x !== id),
                  }))
                }
              />
            ))}
            {effective.centroCostosIds.map((id) => (
              <MlFilterChip
                key={`cc-${id}`}
                label={`Centro de costos: ${centrosMap.get(id) ?? id}`}
                onRemove={() =>
                  setFilters((f) => ({
                    ...f,
                    centroCostosIds: f.centroCostosIds.filter((x) => x !== id),
                  }))
                }
              />
            ))}
            {effective.empleadoIds.map((id) => (
              <MlFilterChip
                key={`emp-${id}`}
                label={`Empleado/Hotel: ${empleadosMap.get(id) ?? id}`}
                onRemove={() =>
                  setFilters((f) => ({
                    ...f,
                    empleadoIds: f.empleadoIds.filter((x) => x !== id),
                  }))
                }
              />
            ))}
          </View>
        )}

        {/* Card cabecera — calendario cuando filtros ON, donut cuando OFF */}
        {data && vista === 'calendario' && (
          <View className="px-4">
            <OrPagosCalendar
              yearMonth={yearMonth}
              totalsByDate={totalsByDate}
              bucketsByDate={data.dayBuckets}
              onChangeMonth={setYearMonth}
              onSelectDay={setSelectedDay}
            />
          </View>
        )}

        {data && vista === 'donut' && (
          <View className="px-4">
            <OrCarteraDonut
              title="Total por empresa generadora"
              data={donutData}
              headerBadge={<AtDeltaIndicator value={1.87} size="sm" />}
              labelsMode="tap-only"
              selectedId={selectedSliceId}
              onSelectChange={setSelectedSliceId}
              valueFormatter={(v) => formatCurrency(v)}
              emptyHint="Toca un sector para ver la empresa"
            />
          </View>
        )}

        {/* Lista headers */}
        <View className="flex-row items-center justify-between px-4">
          <AtTypography variant="bodyBold" color="#1A1F36">
            Empresa generadora
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            Total
          </AtTypography>
        </View>

        <View className="gap-3 px-4">
          {isPending && <MlReportListSkeleton />}
          {!isPending && filteredPagos.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Sin pagos que coincidan con los filtros.
            </AtTypography>
          )}
          {filteredPagos.map((p) => {
            const empresa = empresasMap.get(p.empresaId);
            return (
              <MlPagoCard
                key={p.id}
                empresaName={empresa?.name ?? p.empresaId}
                empresaColor={empresa?.color ?? '#1A1F36'}
                monto={p.monto}
                centroCostos={centrosMap.get(p.centroCostosId) ?? '—'}
                empleado={empleadosMap.get(p.empleadoId) ?? '—'}
                concepto={p.concepto}
                fecha={p.fecha}
              />
            );
          })}
        </View>

        {filteredPagos.length > 0 && (
          <View className="px-4">
            <MlSimpleTotalFooter value={formatTotal(listaTotal)} />
          </View>
        )}
      </ScrollView>

      <OrPagosDayDetailSheet
        visible={selectedDay !== null}
        fechaIso={selectedDay}
        total={selectedDayTotal}
        bucket={selectedDayBucket}
        onClose={() => setSelectedDay(null)}
      />

      <OrPagosFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        initialFilters={filters}
        empresas={data?.empresas ?? []}
        centrosCostos={data?.centrosCostos ?? []}
        empleados={data?.empleados ?? []}
        onApply={setFilters}
      />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}

function formatTotal(value: number): string {
  const base = formatCurrency(value);
  const decimals = value.toFixed(2).split('.')[1];
  return `${base},${decimals}`;
}
