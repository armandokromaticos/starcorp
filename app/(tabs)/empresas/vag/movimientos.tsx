/**
 * VAG — Movimientos.
 *
 * Acordeones por activo (centro de costo) del mes elegido (stepper
 * < Enero 2026 >): la fila muestra "Activo (n) | Mes | Consolidado" y
 * expandida las cards de sus movimientos. Footer "Total consolidador".
 * Con el parámetro `focus` (navegación desde un activo o una cuenta)
 * muestra solo el acordeón de ese movimiento, expandido y con la card
 * resaltada en naranja, sin stepper ni footer.
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
import {
  MlMonthStepper,
  monthName,
  type MonthValue,
} from '@/src/components/molecules/ml-month-stepper';
import { MlSimpleTotalFooter } from '@/src/components/molecules/ml-simple-total-footer';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrVagMovimientosGroup } from '@/src/components/organisms/or-vag-movimientos-group';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { useVagMovimientos } from '@/src/hooks/queries/use-vag';
import { formatNumber } from '@/src/utils/number';
import type { VagMovimiento } from '@/src/types/vag.types';

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

  // Un acordeón por activo (centro de costo), ordenados por total desc.
  const grupos = useMemo(() => {
    const byNombre = new Map<string, VagMovimiento[]>();
    for (const m of filtered) {
      const list = byNombre.get(m.nombre);
      if (list) list.push(m);
      else byNombre.set(m.nombre, [m]);
    }
    return [...byNombre.entries()]
      .map(([nombre, movs]) => ({
        nombre,
        movs,
        total: movs.reduce((s, m) => s + m.valor, 0),
      }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

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

        {/* Encabezado: Activo | <stepper de mes> | Consolidado. Mismas
            tres zonas que las filas de acordeón (laterales flex-1, px-4
            = inset del contenido de las cards) para que los títulos
            queden alineados como tabla; el spacer de 20 compensa el
            chevron de las filas. */}
        <View
          className="mx-4 flex-row items-center px-4 pb-2"
          style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.08)' }}
        >
          <View className="flex-1 pr-2">
            <AtTypography variant="captionBold" color="#1A1F36">
              Activo
            </AtTypography>
          </View>
          {!focusMode && <MlMonthStepper value={effectiveMonth} onChange={setMonth} />}
          <View className="flex-1 flex-row items-center justify-end gap-2 pl-2">
            <AtTypography variant="captionBold" color="#1A1F36">
              Consolidado
            </AtTypography>
            <View style={{ width: 20 }} />
          </View>
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
            {grupos.map((grupo) => (
              <OrVagMovimientosGroup
                key={grupo.nombre}
                nombre={grupo.nombre}
                // En focus mode el mes sale de la fecha del movimiento
                // enfocado (el stepper está oculto).
                monthLabel={
                  focusMode
                    ? monthName(Number(grupo.movs[0].fecha.slice(5, 7)))
                    : monthName(effectiveMonth.month)
                }
                movimientos={grupo.movs}
                initiallyExpanded={focusMode}
                highlightedId={focusMode ? focus : undefined}
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
