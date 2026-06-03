/**
 * Lista completa de pólizas de Propiedades.
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlPropiedadDetailCard } from '@/src/components/molecules/ml-propiedad-detail-card';
import { MlTimeFilterBar } from '@/src/components/molecules/ml-time-filter-bar';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import {
  POLIZA_STATUS_FILTERS,
  polizaStatus,
  type PolizaStatus,
} from '@/src/types/seguros.types';

export default function SegurosPropiedadesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useSeguros();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PolizaStatus>('activa');
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const todayIso = data?.todayIso ?? '';
  const propiedadesFiltradas = useMemo(
    () =>
      (data?.propiedades ?? []).filter(
        (p) => polizaStatus(p.vigenciaFin, todayIso) === statusFilter,
      ),
    [data, todayIso, statusFilter],
  );

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
            segments={['Informes', 'Seguros', 'Propiedades']}
            onBack={() => router.back()}
          />
        </View>

        <MlTimeFilterBar
          options={POLIZA_STATUS_FILTERS}
          selectedKey={statusFilter}
          onSelect={(k) => setStatusFilter(k as PolizaStatus)}
        />

        <View className="gap-3 px-4">
          {propiedadesFiltradas.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              {(data?.propiedades.length ?? 0) > 0
                ? 'No hay pólizas de propiedades en este estado.'
                : 'Sin pólizas de propiedades.'}
            </AtTypography>
          )}
          {propiedadesFiltradas.map((p) => (
            <MlPropiedadDetailCard key={p.id} poliza={p} todayIso={todayIso} />
          ))}
        </View>
      </ScrollView>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}
