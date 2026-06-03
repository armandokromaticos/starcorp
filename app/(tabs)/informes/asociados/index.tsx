/**
 * Informe Asociados activos — pantalla principal.
 *
 * Cabecera fija (search global, breadcrumb, filtros, donut). Sólo la
 * lista inferior scrollea. El donut soporta tap para resaltar slice.
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, TextInput, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlFilterChip } from '@/src/components/molecules/ml-filter-chip';
import { MlFilterButton } from '@/src/components/molecules/ml-filter-button';
import { MlAsociadoClientRow } from '@/src/components/molecules/ml-asociado-client-row';
import { MlSimpleTotalFooter } from '@/src/components/molecules/ml-simple-total-footer';
import { MlReportListSkeleton } from '@/src/components/molecules/ml-report-list-skeleton';
import { OrCarteraDonut } from '@/src/components/organisms/or-cartera-donut';
import {
  OrAsociadosTrend,
  type TrendSeries,
} from '@/src/components/organisms/or-asociados-trend';
import {
  OrAsociadosFiltersSheet,
  type AsociadosFilters,
} from '@/src/components/organisms/or-asociados-filters-sheet';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, SEGMENT_PALETTE } from '@/src/theme/gradients';
import { useAsociados } from '@/src/hooks/queries/use-asociados';
import { useAsociadosTrend } from '@/src/hooks/queries/use-asociados-trend';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';

const MAX_DONUT_SLICES = 8;
const VARIOS_ID = '__varios__';

export default function AsociadosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isPending } = useAsociados();
  const { data: trend } = useAsociadosTrend();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [vista, setVista] = useState<'participacion' | 'tendencia'>(
    'participacion',
  );
  const [filters, setFilters] = useState<AsociadosFilters>({
    area: 'todos',
    clientIds: [],
  });
  const [search, setSearch] = useState('');
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const clientOptions = useMemo(
    () => (data?.clients ?? []).map((c) => ({ id: c.id, name: c.name })),
    [data],
  );

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    (data?.clients ?? []).forEach((c) =>
      c.employees.forEach((e) => e.area && set.add(e.area)),
    );
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [data]);

  const effectiveFilters: AsociadosFilters = filters;

  const allClientCounts = useMemo(() => {
    const all = data?.clients ?? [];
    const byClient = effectiveFilters.clientIds.length
      ? all.filter((c) => effectiveFilters.clientIds.includes(c.id))
      : all;
    return byClient.map((c) => {
      const employees =
        effectiveFilters.area === 'todos'
          ? c.employees
          : c.employees.filter((e) => e.area === effectiveFilters.area);
      return { client: c, count: employees.length };
    });
  }, [data, effectiveFilters]);

  const donutData = useMemo(() => {
    const rows = allClientCounts
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
    if (!rows.length) return [];
    if (rows.length <= MAX_DONUT_SLICES) {
      return rows.map((r) => ({
        id: r.client.id,
        value: r.count,
        color: r.client.color,
        label: r.client.name,
      }));
    }
    const top = rows.slice(0, MAX_DONUT_SLICES);
    const rest = rows.slice(MAX_DONUT_SLICES);
    return [
      ...top.map((r) => ({
        id: r.client.id,
        value: r.count,
        color: r.client.color,
        label: r.client.name,
      })),
      {
        id: VARIOS_ID,
        value: rest.reduce((s, r) => s + r.count, 0),
        color: '#6B7280',
        label: 'Varios',
      },
    ];
  }, [allClientCounts]);

  const visibleClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searched = q
      ? allClientCounts.filter((r) =>
          r.client.name.toLowerCase().includes(q),
        )
      : allClientCounts;
    return [...searched].sort((a, b) => a.client.name.localeCompare(b.client.name));
  }, [allClientCounts, search]);

  const total = useMemo(
    () => visibleClients.reduce((s, r) => s + r.count, 0),
    [visibleClients],
  );

  // Series de tendencia: reusa el color del cliente (match por id) y respeta
  // el filtro por cliente si hay alguno seleccionado.
  const trendSeries = useMemo<TrendSeries[]>(() => {
    if (!trend) return [];
    const colorById = new Map(
      (data?.clients ?? []).map((c) => [c.id, c.color]),
    );
    const ids = effectiveFilters.clientIds;
    return trend.series
      .filter((s) => ids.length === 0 || ids.includes(s.id))
      .map((s, i) => ({
        id: s.id,
        name: s.name,
        color: colorById.get(s.id) ?? SEGMENT_PALETTE[i % SEGMENT_PALETTE.length],
        counts: s.counts,
      }));
  }, [trend, data, effectiveFilters.clientIds]);

  const hasActiveFilters =
    filters.area !== 'todos' || filters.clientIds.length > 0;

  // Reset selección si la slice ya no existe (cambió filtro/data)
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
      <View className="gap-4 pt-2">
        <View className="px-4">
          <MlSearchBar
            onMenuPress={() => setDrawerVisible(true)}
            onPress={openGlobalSearch}
          />
        </View>

        <View className="px-4">
          <MlBreadcrumb
            segments={['Informes', 'Asociados activos']}
            onBack={() => router.back()}
          />
        </View>

        {/* Botón para alternar la vista: participación (donut) ↔ tendencia
            (línea). El label muestra la vista a la que cambia. */}
        <View className="px-4">
          <Pressable
            onPress={() =>
              setVista((v) =>
                v === 'participacion' ? 'tendencia' : 'participacion',
              )
            }
            style={{
              borderRadius: 12,
              borderCurve: 'continuous',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(4, 17, 63, 0.35)',
            }}
          >
            <LinearGradient
              colors={gradients.buttonBlue.colors}
              start={gradients.buttonBlue.start}
              end={gradients.buttonBlue.end}
              style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AtTypography variant="bodyBold" color="#FFFFFF">
                {vista === 'participacion'
                  ? 'Ver asociados por tendencia'
                  : 'Ver asociados por participación'}
              </AtTypography>
            </LinearGradient>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between px-4">
          <AtTypography variant="bodyBold">Filtros</AtTypography>
          <View className="flex-row items-center gap-2">
            {hasActiveFilters && (
              <Pressable
                onPress={() => setFilters({ area: 'todos', clientIds: [] })}
                hitSlop={6}
              >
                <AtTypography variant="captionBold" color="#1A3FE8">
                  Borrar
                </AtTypography>
              </Pressable>
            )}
            <MlFilterButton
              active={hasActiveFilters}
              onPress={() => setFiltersVisible(true)}
            />
          </View>
        </View>

        {hasActiveFilters && (
          <View className="flex-row flex-wrap gap-2 px-4">
            {effectiveFilters.area !== 'todos' && (
              <MlFilterChip
                label={effectiveFilters.area}
                onRemove={() =>
                  setFilters((f) => ({ ...f, area: 'todos' }))
                }
              />
            )}
            {clientOptions
              .filter((c) => effectiveFilters.clientIds.includes(c.id))
              .map((c) => (
                <MlFilterChip
                  key={c.id}
                  label={c.name}
                  onRemove={() =>
                    setFilters((f) => ({
                      ...f,
                      clientIds: f.clientIds.filter((id) => id !== c.id),
                    }))
                  }
                />
              ))}
          </View>
        )}

        <View className="px-4">
          {vista === 'participacion' ? (
            <OrCarteraDonut
              title="Asociados por participación"
              data={donutData}
              headerBadge={<AtDeltaIndicator value={1.87} size="sm" />}
              selectedId={selectedSliceId}
              onSelectChange={setSelectedSliceId}
              labelsMode="tap-only"
              valueFormatter={(v) => `${v} asociados`}
              emptyHint="Toca un sector para ver el cliente"
            />
          ) : (
            <OrAsociadosTrend
              months={trend?.months ?? []}
              series={trendSeries}
            />
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 mt-4"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-4">
          <View
            className="flex-row items-center gap-2 rounded-full bg-bg-card px-4 py-3"
            style={{
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
            }}
          >
            <AtIcon name="search" size="md" color="#8892A4" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por cliente"
              placeholderTextColor="#8892A4"
              className="flex-1 p-0 text-ink-primary text-base"
              style={{ fontFamily: 'Roboto_400Regular' }}
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between px-4">
          <AtTypography variant="bodyBold" color="#1A1F36">
            Cliente
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            Asociados
          </AtTypography>
        </View>

        <View className="gap-2 px-4">
          {isPending && <MlReportListSkeleton />}
          {!isPending && visibleClients.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Sin clientes que coincidan con los filtros.
            </AtTypography>
          )}
          {visibleClients.map((row) => (
            <MlAsociadoClientRow
              key={row.client.id}
              name={row.client.name}
              color={row.client.color}
              count={row.count}
              onPress={() =>
                router.push(
                  `/(tabs)/informes/asociados/${row.client.id}` as never,
                )
              }
            />
          ))}
        </View>

        <View className="px-4">
          <MlSimpleTotalFooter value={total} />
        </View>
      </ScrollView>

      <OrAsociadosFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        clients={clientOptions}
        areas={areaOptions}
        initialFilters={filters}
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
