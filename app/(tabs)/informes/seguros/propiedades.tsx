/**
 * Lista completa de pólizas de Propiedades.
 */

import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlPropiedadDetailCard } from '@/src/components/molecules/ml-propiedad-detail-card';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';

export default function SegurosPropiedadesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data } = useSeguros();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

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

        <View className="gap-3 px-4">
          {(data?.propiedades.length ?? 0) === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Sin pólizas de propiedades.
            </AtTypography>
          )}
          {data?.propiedades.map((p) => (
            <MlPropiedadDetailCard
              key={p.id}
              poliza={p}
              todayIso={data.todayIso}
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
