/**
 * Informe Asociados — detalle del cliente.
 * Lista de empleados con área + código interno, filtrable por área.
 */

import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlFilterChip } from '@/src/components/molecules/ml-filter-chip';
import { MlAsociadoEmployeeRow } from '@/src/components/molecules/ml-asociado-employee-row';
import {
  OrAsociadosFiltersSheet,
  type AsociadosFilters,
} from '@/src/components/organisms/or-asociados-filters-sheet';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDivider } from '@/src/components/atoms/at-divider';
import { useAsociados } from '@/src/hooks/queries/use-asociados';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';

function truncate(text: string, max = 18): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function AsociadoClientDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { data } = useAsociados();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<AsociadosFilters>({
    area: 'todos',
    clientIds: [],
  });
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const client = useMemo(
    () => data?.clients.find((c) => c.id === clientId),
    [data, clientId],
  );

  const areaOptions = useMemo(() => {
    const set = new Set<string>();
    (client?.employees ?? []).forEach((e) => e.area && set.add(e.area));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [client]);

  const employees = useMemo(() => {
    if (!client) return [];
    return filters.area === 'todos'
      ? client.employees
      : client.employees.filter((e) => e.area === filters.area);
  }, [client, filters.area]);

  const hasActiveFilters = filters.area !== 'todos';

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
            segments={[
              'Informes',
              'Asociados activos',
              truncate(client?.name ?? 'Cliente'),
            ]}
            onBack={() => router.back()}
          />
        </View>

        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center gap-3 flex-1">
            <AtTypography variant="bodyBold">Filtros</AtTypography>
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
          </View>
          <Pressable
            onPress={() => setFiltersVisible(true)}
            className="rounded-md items-center justify-center"
            style={{
              width: 36,
              height: 36,
              backgroundColor: hasActiveFilters ? '#E8952E' : '#0F1B4A',
              borderCurve: 'continuous',
            }}
          >
            <AtIcon name="filter-list" size="md" color="#FFFFFF" />
          </Pressable>
        </View>

        {hasActiveFilters && (
          <View className="flex-row flex-wrap gap-2 px-4">
            <MlFilterChip
              label={filters.area}
              onRemove={() => setFilters((f) => ({ ...f, area: 'todos' }))}
            />
          </View>
        )}

        <View className="px-4">
          <AtTypography variant="h2">{client?.name ?? '—'}</AtTypography>
        </View>

        <View className="flex-row items-center justify-between px-4">
          <AtTypography variant="bodyBold" color="#1A1F36">
            Empleado
          </AtTypography>
          <AtTypography variant="bodyBold" color="#1A1F36">
            Código interno
          </AtTypography>
        </View>

        <AtDivider className="mx-4" />

        <View className="gap-2 px-4">
          {employees.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Sin empleados para mostrar.
            </AtTypography>
          )}
          {employees.map((e, i) => (
            <MlAsociadoEmployeeRow
              key={e.id}
              name={e.name}
              area={e.area}
              codigoInterno={e.codigoInterno}
              variant={i % 2 === 0 ? 'plain' : 'card'}
            />
          ))}
        </View>
      </ScrollView>

      <OrAsociadosFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        clients={[]}
        areas={areaOptions}
        initialFilters={filters}
        onApply={setFilters}
        showClientFilter={false}
      />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}
