/**
 * VAG — Movimientos.
 *
 * Lista de movimientos del mes (stepper < Enero 2026 >) con filas
 * expandibles y footer "Total consolidador". Con el parámetro `focus`
 * (navegación desde un activo o una cuenta) muestra solo ese movimiento,
 * expandido y resaltado en naranja, sin stepper ni footer — como el
 * mockup de "Movimientos / Gastos".
 */

import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { MlInlineSearch } from '@/src/components/molecules/ml-inline-search';
import { MlMonthStepper, type MonthValue } from '@/src/components/molecules/ml-month-stepper';
import { MlSimpleTotalFooter } from '@/src/components/molecules/ml-simple-total-footer';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrVagMovimientoRow } from '@/src/components/organisms/or-vag-movimiento-row';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { useVagMovimientos } from '@/src/hooks/queries/use-vag';
import { formatNumber } from '@/src/utils/number';

export default function VagMovimientosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);
  const { focus } = useLocalSearchParams<{ focus?: string }>();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  // null = aún sin elegir → arranca en el último mes con datos.
  const [month, setMonth] = useState<MonthValue | null>(null);

  const { data: movimientos, isLoading } = useVagMovimientos();
  const focusMode = !!focus;

  const lastDataMonth = useMemo<MonthValue>(() => {
    const list = movimientos ?? [];
    if (list.length === 0) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1 };
    }
    const max = list.reduce((acc, m) => (m.fecha > acc ? m.fecha : acc), list[0].fecha);
    return { year: Number(max.slice(0, 4)), month: Number(max.slice(5, 7)) };
  }, [movimientos]);

  const effectiveMonth = month ?? lastDataMonth;

  const filtered = useMemo(() => {
    const list = movimientos ?? [];
    if (focus) return list.filter((m) => m.id === focus);
    const monthPrefix = `${effectiveMonth.year}-${String(effectiveMonth.month).padStart(2, '0')}`;
    const byMonth = list.filter((m) => m.fecha.startsWith(monthPrefix));
    const q = searchText.trim().toLowerCase();
    if (!q) return byMonth;
    return byMonth.filter((m) => m.nombre.toLowerCase().includes(q));
  }, [movimientos, focus, effectiveMonth, searchText]);

  // Total consolidador = suma de los movimientos visibles del mes.
  const total = useMemo(
    () => filtered.reduce((s, m) => s + m.valor, 0),
    [filtered],
  );

  return (
    <View className="flex-1 bg-bg-secondary" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-4 pb-6"
      >
        <View className="px-4 pt-2">
          <MlSearchBar
            onMenuPress={() => setDrawerVisible(true)}
            onPress={openGlobalSearch}
          />
        </View>

        <View className="px-4">
          <MlBreadcrumb
            segments={['Otras compañías', 'VAG', 'Movimientos']}
            onBack={() => router.back()}
          />
        </View>

        <View className="px-4">
          <MlInlineSearch
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por activo o movimiento"
          />
        </View>

        {/* Encabezado: Movimiento | <stepper de mes> | Valor */}
        <View
          className="mx-4 flex-row items-center justify-between px-1 pb-2"
          style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' }}
        >
          <AtTypography variant="captionBold" color="#1A1F36">
            Movimiento
          </AtTypography>
          {!focusMode && <MlMonthStepper value={effectiveMonth} onChange={setMonth} />}
          <AtTypography variant="captionBold" color="#1A1F36">
            Valor
          </AtTypography>
        </View>

        {isLoading ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={56} />
            <AtSkeleton width="100%" height={56} />
            <AtSkeleton width="100%" height={56} />
          </View>
        ) : filtered.length === 0 ? (
          <MlEmptyState
            icon="swap-vert"
            title="Sin movimientos"
            description="No hay movimientos para este período."
          />
        ) : (
          <View className="gap-3 px-4">
            {filtered.map((mov) => (
              <OrVagMovimientoRow
                key={mov.id}
                movimiento={mov}
                highlighted={focusMode}
                initiallyExpanded={focusMode}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer navy fijo (oculto en la vista de foco, como el mockup) */}
      {!focusMode && (
        <View className="px-4 pt-2 bg-bg-secondary" style={{ paddingBottom: 8 }}>
          <MlSimpleTotalFooter
            label="Total consolidador"
            value={`$ ${formatNumber(total, 2)}`}
          />
        </View>
      )}

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="empresas"
      />
    </View>
  );
}
