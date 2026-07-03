/**
 * Otras compañías — detalle de una compañía.
 *
 * Toggle Ingresos/Gastos → donut por categoría (interactivo) + lista de
 * terceros. La tarjeta navy de Total queda FIJA abajo (fuera del scroll).
 * Filtro de periodo (año/mes) en bottom sheet; por ahora solo actualiza el
 * chip de periodo y el conteo de aplicados.
 */

import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, ScrollView, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { MlSegmentedToggle } from '@/src/components/molecules/ml-segmented-toggle';
import { MlSimpleTotalFooter } from '@/src/components/molecules/ml-simple-total-footer';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrEmpresaDonutCard } from '@/src/components/organisms/or-empresa-donut-card';
import { OrEmpresaTercerosList } from '@/src/components/organisms/or-empresa-terceros-list';
import {
  OrEmpresaFiltersSheet,
  DEFAULT_EMPRESA_FILTERS,
} from '@/src/components/organisms/or-empresa-filters-sheet';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { useEmpresaDetail } from '@/src/hooks/queries/use-empresa-detail';
import { formatNumber } from '@/src/utils/number';
import type { EmpresaFilters, EmpresaTipo } from '@/src/types/empresas.types';

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function periodLabel(f: EmpresaFilters): string {
  const year = f.year === 'corriente' ? '2026' : f.year;
  // 'ultimo' = último mes cerrado (mock: Abril 2026).
  if (f.month === 'ultimo') return `Abril ${year}`;
  return `${MONTHS[Number(f.month) - 1] ?? ''} ${year}`;
}

const TIPO_OPTIONS = [
  { value: 'ingresos', label: 'Ingresos' },
  { value: 'gastos', label: 'Gastos' },
];

export default function EmpresaDetailScreen() {
  const insets = useSafeAreaInsets();
  const { empresaId } = useLocalSearchParams<{ empresaId: string }>();
  const router = useRouter();
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [tipo, setTipo] = useState<EmpresaTipo>('ingresos');
  const [filters, setFilters] = useState<EmpresaFilters>(DEFAULT_EMPRESA_FILTERS);
  const [filtersVisible, setFiltersVisible] = useState(false);

  const { data: detail, isLoading } = useEmpresaDetail(empresaId ?? '');

  const financials = detail ? detail[tipo] : null;
  const periodText = useMemo(() => periodLabel(filters), [filters]);
  const tipoLabel = tipo === 'ingresos' ? 'Ingresos' : 'Gastos';

  return (
    <View className="flex-1 bg-bg-secondary" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 pb-6"
      >
        <View className="px-4 pt-2">
          <MlSearchBar
            onMenuPress={() => setDrawerVisible(true)}
            onPress={openGlobalSearch}
          />
        </View>

        <View className="px-4">
          <MlBreadcrumb
            segments={['Otras compañías', detail?.name ?? '']}
            onBack={() => router.back()}
          />
        </View>

        {isLoading && !detail ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={48} />
            <AtSkeleton width="100%" height={320} />
          </View>
        ) : !detail ? (
          <MlEmptyState
            icon="business"
            title="Compañía no encontrada"
            description="No pudimos cargar el detalle de esta compañía."
          />
        ) : (
          <>
            {/* Toggle Ingresos / Gastos */}
            <View className="px-4">
              <MlSegmentedToggle
                options={TIPO_OPTIONS}
                value={tipo}
                onChange={(v) => setTipo(v as EmpresaTipo)}
                gradient="brandOrange"
              />
            </View>

            {/* Fila Filtros */}
            <View className="px-4 flex-row items-center justify-between">
              <AtTypography variant="bodyBold">Filtros</AtTypography>
              <Pressable
                onPress={() => setFiltersVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Abrir filtros"
                className="rounded-lg p-2.5"
                style={{ backgroundColor: '#0F1B4A', borderCurve: 'continuous' }}
              >
                <AtIcon name="filter-list" size="md" color="#FFFFFF" />
              </Pressable>
            </View>

            {financials && (
              <>
                <View className="px-4">
                  <OrEmpresaDonutCard
                    title={tipoLabel}
                    periodLabel={periodText}
                    total={financials.total}
                    categories={financials.categories}
                  />
                </View>

                <OrEmpresaTercerosList terceros={financials.terceros} />
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Tarjeta navy de Total — FIJA al fondo */}
      {financials && (
        <View
          className="px-4 pt-2 bg-bg-secondary"
          style={{ paddingBottom: 8 }}
        >
          <MlSimpleTotalFooter
            value={formatNumber(financials.tercerosTotal, 2)}
          />
        </View>
      )}

      <OrEmpresaFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        initialFilters={filters}
        onApply={setFilters}
      />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="empresas"
      />
    </View>
  );
}
