/**
 * Lista completa (histórico) de pólizas de Vehículos — sólo vencidas.
 *
 * Al navegar con `polizaId` (desde el informe), hace scroll y resalta esa
 * póliza, igual que el detalle de Compañías.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView as RNScrollView } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlVehiculoDetailCard } from '@/src/components/molecules/ml-vehiculo-detail-card';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { polizaStatus } from '@/src/types/seguros.types';

export default function SegurosVehiculosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { polizaId } = useLocalSearchParams<{ polizaId?: string }>();
  const { data } = useSeguros();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const todayIso = data?.todayIso ?? '';
  // Sólo pólizas vencidas (de años pasados).
  const vehiculosFiltrados = useMemo(
    () =>
      (data?.vehiculos ?? []).filter(
        (p) => polizaStatus(p.vigenciaFin, todayIso) === 'vencida',
      ),
    [data, todayIso],
  );

  // Scroll automático hasta la póliza objetivo (la elegida en el informe).
  const scrollRef = useRef<RNScrollView>(null);
  const listYRef = useRef(0);
  const listMeasuredRef = useRef(false);
  const cardYRef = useRef<Record<string, number>>({});
  const didScrollRef = useRef(false);

  const tryScrollToTarget = useCallback(() => {
    if (didScrollRef.current || !polizaId || !listMeasuredRef.current) return;
    const cardY = cardYRef.current[polizaId];
    if (cardY == null) return;
    didScrollRef.current = true;
    scrollRef.current?.scrollTo({
      y: Math.max(0, listYRef.current + cardY - 16),
      animated: true,
    });
  }, [polizaId]);

  const onListLayout = useCallback(
    (e: LayoutChangeEvent) => {
      listYRef.current = e.nativeEvent.layout.y;
      listMeasuredRef.current = true;
      tryScrollToTarget();
    },
    [tryScrollToTarget],
  );

  return (
    <View
      className="flex-1 bg-bg-secondary"
      style={{ paddingTop: insets.top }}
    >
      <RNScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ rowGap: 20, paddingBottom: 48 }}
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
            segments={['Informes', 'Seguros', 'Vehículos']}
            onBack={() => router.back()}
          />
        </View>

        <View className="gap-3 px-4" onLayout={onListLayout}>
          {vehiculosFiltrados.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Sin pólizas de vehículos vencidas.
            </AtTypography>
          )}
          {vehiculosFiltrados.map((p) => (
            <View
              key={p.id}
              onLayout={(e) => {
                cardYRef.current[p.id] = e.nativeEvent.layout.y;
                tryScrollToTarget();
              }}
            >
              <MlVehiculoDetailCard
                poliza={p}
                todayIso={todayIso}
                highlighted={p.id === polizaId}
              />
            </View>
          ))}
        </View>
      </RNScrollView>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}
