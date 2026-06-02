/**
 * Detalle de Compañía — todas las pólizas de una empresa.
 */

import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlPolizaDetailCard } from '@/src/components/molecules/ml-poliza-detail-card';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';

export default function SeguroEmpresaDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { companyId } = useLocalSearchParams<{ companyId: string }>();
  const { data } = useSeguros();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const empresa = useMemo(
    () => data?.empresas.find((e) => e.id === companyId),
    [data, companyId],
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

        <View className="gap-3 px-4">
          {empresa?.polizas.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Esta empresa no tiene pólizas registradas.
            </AtTypography>
          )}
          {empresa?.polizas.map((p) => (
            <MlPolizaDetailCard
              key={p.id}
              poliza={p}
              todayIso={data?.todayIso ?? ''}
              showEmpresa={false}
            />
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
