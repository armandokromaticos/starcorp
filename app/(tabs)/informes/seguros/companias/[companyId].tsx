/**
 * Detalle de Compañía — todas las pólizas de una empresa.
 */

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView as RNScrollView } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlPolizaDetailCard } from '@/src/components/molecules/ml-poliza-detail-card';
import { MlTimeFilterBar } from '@/src/components/molecules/ml-time-filter-bar';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import {
  isInactiva,
  POLIZA_STATUS_FILTERS,
  polizaStatus,
  type PolizaStatus,
} from '@/src/types/seguros.types';

export default function SeguroEmpresaDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { companyId, polizaId, status } = useLocalSearchParams<{
    companyId: string;
    polizaId?: string;
    status?: string;
  }>();
  const { data } = useSeguros();

  // Estado inicial del filtro: el que viene del informe (al elegir una póliza
  // concreta) o "Vigente" por defecto.
  const initialStatus =
    status && POLIZA_STATUS_FILTERS.some((f) => f.key === status)
      ? (status as PolizaStatus)
      : 'activa';

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PolizaStatus>(initialStatus);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

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

  const empresa = useMemo(
    () => data?.empresas.find((e) => e.id === companyId),
    [data, companyId],
  );

  const todayIso = data?.todayIso ?? '';

  // Las INACTIVA no participan de los chips — viven en el histórico.
  const polizasFiltradas = useMemo(
    () =>
      (empresa?.polizas ?? []).filter(
        (p) =>
          !isInactiva(p) &&
          polizaStatus(p.vigenciaFin, todayIso) === statusFilter,
      ),
    [empresa, todayIso, statusFilter],
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
            segments={['Informes', 'Seguros', 'Compañías']}
            onBack={() => router.back()}
          />
        </View>

        <View className="flex-row items-center gap-2 px-4">
          <AtIcon name="account-balance" size="md" color="#1A1F36" />
          <AtTypography variant="h2" color="#1A1F36">
            {empresa?.name ?? '—'}
          </AtTypography>
        </View>

        <MlTimeFilterBar
          fill
          options={POLIZA_STATUS_FILTERS}
          selectedKey={statusFilter}
          onSelect={(k) => setStatusFilter(k as PolizaStatus)}
        />

        <View className="gap-3 px-4" onLayout={onListLayout}>
          {polizasFiltradas.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              {empresa && empresa.polizas.length > 0
                ? 'No hay pólizas en este estado.'
                : 'Esta empresa no tiene pólizas registradas.'}
            </AtTypography>
          )}
          {polizasFiltradas.map((p) => (
            <View
              key={p.id}
              onLayout={(e) => {
                cardYRef.current[p.id] = e.nativeEvent.layout.y;
                tryScrollToTarget();
              }}
            >
              <MlPolizaDetailCard
                poliza={p}
                todayIso={todayIso}
                showEmpresa={false}
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
