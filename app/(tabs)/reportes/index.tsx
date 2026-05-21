/**
 * Reportes — Lista de responsabilidades (NexiaTask).
 *
 * Composición:
 *  1. SearchBar + Drawer trigger (consistente con resto de tabs)
 *  2. Breadcrumb "< Reportes"
 *  3. H2 "Lista de responsabilidades"
 *  4. Carrusel horizontal de departamentos
 *  5. Acordeón de proyectos del departamento seleccionado
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { View } from '@/src/tw';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrDepartmentsCarousel } from '@/src/components/organisms/or-departments-carousel';
import { OrResponsibilitiesList } from '@/src/components/organisms/or-responsibilities-list';
import { TmDashboard } from '@/src/components/templates/tm-dashboard';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { MlEmptyState } from '@/src/components/molecules/ml-empty-state';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { useNexiataskResponsibilities } from '@/src/hooks/queries/use-nexiatask-responsibilities';

export default function ReportesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | undefined>();
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);
  const router = useRouter();

  const { data, isLoading, isError, refetch, isRefetching } =
    useNexiataskResponsibilities();

  const departamentos = useMemo(() => data?.departamentos ?? [], [data]);
  const effectiveSelectedId = selectedDeptId ?? departamentos[0]?.id;

  return (
    <TmDashboard>
      <View className="px-4 pt-2">
        <MlSearchBar
          onMenuPress={() => setDrawerVisible(true)}
          onPress={openGlobalSearch}
        />
      </View>

      <View className="px-4">
        <MlBreadcrumb segments={['Reportes']} onBack={() => router.back()} />
      </View>

      <View className="px-4">
        <AtTypography variant="h2">Lista de responsabilidades</AtTypography>
      </View>

      {isLoading ? (
        <View className="gap-3 px-4">
          <AtSkeleton width="100%" height={120} />
          <AtSkeleton width="100%" height={240} />
        </View>
      ) : isError ? (
        <MlEmptyState
          icon="cloud-off"
          title="No pudimos cargar los reportes"
          description="Revisa tu conexión o vuelve a intentarlo en unos segundos."
          action={{
            label: isRefetching ? 'Reintentando…' : 'Reintentar',
            onPress: () => refetch(),
          }}
        />
      ) : departamentos.length === 0 ? (
        <MlEmptyState
          icon="assignment"
          title="Sin responsabilidades registradas"
          description="Aún no hay tareas cargadas para esta semana."
        />
      ) : (
        <>
          <OrDepartmentsCarousel
            departamentos={departamentos}
            selectedId={effectiveSelectedId}
            onSelect={setSelectedDeptId}
          />

          <OrResponsibilitiesList
            departamentos={departamentos}
            selectedId={effectiveSelectedId}
            onTareaPress={(tareaId) =>
              router.push(`/(tabs)/reportes/${tareaId}` as never)
            }
          />
        </>
      )}

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="reportes"
      />
    </TmDashboard>
  );
}
