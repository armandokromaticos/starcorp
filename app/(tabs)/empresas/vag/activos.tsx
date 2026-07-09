/**
 * VAG — Activos.
 *
 * Buscador + tarjetas expandibles por activo (detalle de valores, ficha
 * catastral y movimientos consolidados). Las filas de movimientos navegan
 * a la vista Movimientos con foco en el movimiento.
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { MlInlineSearch } from '@/src/components/molecules/ml-inline-search';
import { MlSimpleTotalFooter } from '@/src/components/molecules/ml-simple-total-footer';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrVagActivoCard } from '@/src/components/organisms/or-vag-activo-card';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { useVagActivos } from '@/src/hooks/queries/use-vag';
import { VAG_TOTAL_CONSOLIDADOR } from '@/src/services/mock/vag.mock';
import { formatNumber } from '@/src/utils/number';

export default function VagActivosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  const { data: activos, isLoading } = useVagActivos();

  const filtered = useMemo(() => {
    const list = activos ?? [];
    const q = searchText.trim().toLowerCase();
    if (!q) return list;
    return list.filter((a) => a.nombre.toLowerCase().includes(q));
  }, [activos, searchText]);

  const goToMovimiento = (movimientoId: string) =>
    router.push({
      pathname: '/(tabs)/empresas/vag/movimientos',
      params: { focus: movimientoId },
    } as never);

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
            segments={['Otras compañías', 'VAG', 'Activos']}
            onBack={() => router.back()}
          />
        </View>

        <View className="px-4">
          <MlInlineSearch
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por activo"
          />
        </View>

        {isLoading ? (
          <View className="gap-3 px-4">
            <AtSkeleton width="100%" height={64} />
            <AtSkeleton width="100%" height={64} />
            <AtSkeleton width="100%" height={64} />
          </View>
        ) : filtered.length === 0 ? (
          <MlEmptyState
            icon="home-work"
            title="Sin activos"
            description="No se encontraron activos para mostrar."
          />
        ) : (
          <View className="gap-3 px-4">
            {filtered.map((activo) => (
              <OrVagActivoCard
                key={activo.id}
                activo={activo}
                onMovimientoPress={goToMovimiento}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer navy fijo */}
      <View className="px-4 pt-2 bg-bg-secondary" style={{ paddingBottom: 8 }}>
        <MlSimpleTotalFooter
          label="Total consolidador"
          value={`$ ${formatNumber(VAG_TOTAL_CONSOLIDADOR, 2)}`}
        />
      </View>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="empresas"
      />
    </View>
  );
}
