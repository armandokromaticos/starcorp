/**
 * Informe Seguros — pantalla principal.
 *
 * 3 secciones apiladas: Compañías (carousel de empresas + listas por
 * vencer/vencidas), Vehículos y Propiedades (cada una con su link a
 * Histórico y sus listas). Tap en una pill abre el detalle de empresa;
 * tap en una card por vencer/vencida también navega al detalle de su
 * empresa (cuando aplica).
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlReportListSkeleton } from '@/src/components/molecules/ml-report-list-skeleton';
import { MlEmpresaPill } from '@/src/components/molecules/ml-empresa-pill';
import { MlPolizaAlertRow } from '@/src/components/molecules/ml-poliza-alert-row';
import { MlSectionHeaderLink } from '@/src/components/molecules/ml-section-header-link';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtDivider } from '@/src/components/atoms/at-divider';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useSeguros } from '@/src/hooks/queries/use-seguros';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import {
  diffInDays,
  formatVigenciaDate,
  polizaStatus,
  type PolizaCompania,
  type PolizaPropiedad,
  type PolizaVehiculo,
} from '@/src/types/seguros.types';

function buildSubline(vigenciaFin: string, todayIso: string): string {
  const status = polizaStatus(vigenciaFin, todayIso);
  if (status === 'vencida') {
    return `Vigencia: ${diffInDays(vigenciaFin, todayIso)} días`;
  }
  return `Vigencia: ${formatVigenciaDate(vigenciaFin)}`;
}

export default function SegurosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isPending } = useSeguros();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const { todayIso, empresas, vehiculos, propiedades } = useMemo(() => {
    if (!data) {
      return {
        todayIso: '',
        empresas: [],
        vehiculos: [],
        propiedades: [],
      };
    }
    return {
      todayIso: data.todayIso,
      empresas: data.empresas,
      vehiculos: data.vehiculos,
      propiedades: data.propiedades,
    };
  }, [data]);

  const allPolizasCompania = useMemo<PolizaCompania[]>(
    () => empresas.flatMap((e) => e.polizas),
    [empresas],
  );

  const polizasPorVencer = useMemo(
    () =>
      allPolizasCompania.filter(
        (p) => polizaStatus(p.vigenciaFin, todayIso) === 'por_vencer',
      ),
    [allPolizasCompania, todayIso],
  );

  const polizasVencidas = useMemo(
    () =>
      allPolizasCompania.filter(
        (p) => polizaStatus(p.vigenciaFin, todayIso) === 'vencida',
      ),
    [allPolizasCompania, todayIso],
  );

  const vehiculosPorVencer = useMemo(
    () => vehiculos.filter((v) => polizaStatus(v.vigenciaFin, todayIso) === 'por_vencer'),
    [vehiculos, todayIso],
  );
  const vehiculosVencidos = useMemo(
    () => vehiculos.filter((v) => polizaStatus(v.vigenciaFin, todayIso) === 'vencida'),
    [vehiculos, todayIso],
  );

  const propiedadesPorVencer = useMemo(
    () => propiedades.filter((p) => polizaStatus(p.vigenciaFin, todayIso) === 'por_vencer'),
    [propiedades, todayIso],
  );
  const propiedadesVencidas = useMemo(
    () => propiedades.filter((p) => polizaStatus(p.vigenciaFin, todayIso) === 'vencida'),
    [propiedades, todayIso],
  );

  const goEmpresa = (id: string) =>
    router.push(`/(tabs)/informes/seguros/companias/${id}` as never);

  return (
    <View
      className="flex-1 bg-bg-secondary"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 pb-12"
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
            segments={['Informes', 'Seguros']}
            onBack={() => router.back()}
          />
        </View>

        {isPending && (
          <View className="px-4">
            <MlReportListSkeleton />
          </View>
        )}

        {/* — Compañías — */}
        <View className="gap-3">
          <View className="px-4">
            <MlSectionHeaderLink
              title="Compañías"
              iconName="business-center"
              linkLabel="Histórico de pólizas"
              onLinkPress={() =>
                router.push('/(tabs)/informes/seguros/companias/historico' as never)
              }
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3 px-4"
          >
            {empresas.map((empresa) => (
              <MlEmpresaPill
                key={empresa.id}
                name={empresa.name}
                onPress={() => goEmpresa(empresa.id)}
              />
            ))}
          </ScrollView>

          <View className="px-4 gap-2">
            <AtTypography variant="bodyBold" color="#1A1F36">
              Pólizas por vencer
            </AtTypography>
            {polizasPorVencer.length === 0 && (
              <AtTypography variant="caption" color="#8892A4">
                Sin pólizas por vencer.
              </AtTypography>
            )}
            {polizasPorVencer.map((p) => (
              <MlPolizaAlertRow
                key={p.id}
                name={p.nombre}
                subline={buildSubline(p.vigenciaFin, todayIso)}
                variant="por_vencer"
                onPress={() => goEmpresa(p.empresaId)}
              />
            ))}
          </View>

          <View className="px-4 gap-2">
            <AtTypography variant="bodyBold" color="#1A1F36">
              Pólizas vencidas
            </AtTypography>
            {polizasVencidas.length === 0 && (
              <AtTypography variant="caption" color="#8892A4">
                Sin pólizas vencidas.
              </AtTypography>
            )}
            {polizasVencidas.map((p) => (
              <MlPolizaAlertRow
                key={p.id}
                name={p.nombre}
                subline={buildSubline(p.vigenciaFin, todayIso)}
                variant="vencida"
                onPress={() => goEmpresa(p.empresaId)}
              />
            ))}
          </View>
        </View>

        <AtDivider className="mx-4" />

        {/* — Vehículos — */}
        <SimpleAlertSection
          title="Vehículos"
          iconName="directions-bus"
          onTitlePress={() =>
            router.push('/(tabs)/informes/seguros/vehiculos' as never)
          }
          onLinkPress={() =>
            router.push('/(tabs)/informes/seguros/vehiculos' as never)
          }
          porVencer={vehiculosPorVencer.map<AlertItem>((v) => ({
            id: v.id,
            name: v.nombre,
            subline: buildSubline(v.vigenciaFin, todayIso),
          }))}
          vencidas={vehiculosVencidos.map<AlertItem>((v) => ({
            id: v.id,
            name: v.nombre,
            subline: buildSubline(v.vigenciaFin, todayIso),
          }))}
          onItemPress={() =>
            router.push('/(tabs)/informes/seguros/vehiculos' as never)
          }
        />

        <AtDivider className="mx-4" />

        {/* — Propiedades — */}
        <SimpleAlertSection
          title="Propiedades"
          iconName="home-work"
          onTitlePress={() =>
            router.push('/(tabs)/informes/seguros/propiedades' as never)
          }
          onLinkPress={() =>
            router.push('/(tabs)/informes/seguros/propiedades' as never)
          }
          porVencer={propiedadesPorVencer.map<AlertItem>((p) => ({
            id: p.id,
            name: p.nombre,
            subline: buildSubline(p.vigenciaFin, todayIso),
          }))}
          vencidas={propiedadesVencidas.map<AlertItem>((p) => ({
            id: p.id,
            name: p.nombre,
            subline: buildSubline(p.vigenciaFin, todayIso),
          }))}
          onItemPress={() =>
            router.push('/(tabs)/informes/seguros/propiedades' as never)
          }
        />
      </ScrollView>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}

interface AlertItem {
  id: string;
  name: string;
  subline: string;
}

interface SimpleAlertSectionProps {
  title: string;
  iconName: React.ComponentProps<typeof MlSectionHeaderLink>['iconName'];
  onTitlePress: () => void;
  onLinkPress: () => void;
  porVencer: AlertItem[];
  vencidas: AlertItem[];
  onItemPress: () => void;
}

function SimpleAlertSection({
  title,
  iconName,
  onTitlePress,
  onLinkPress,
  porVencer,
  vencidas,
  onItemPress,
}: SimpleAlertSectionProps) {
  return (
    <View className="gap-3">
      <View className="px-4">
        <MlSectionHeaderLink
          title={title}
          iconName={iconName}
          onTitlePress={onTitlePress}
          linkLabel="Histórico de pólizas"
          onLinkPress={onLinkPress}
        />
      </View>

      <View className="px-4 gap-2">
        <AtTypography variant="bodyBold" color="#1A1F36">
          Pólizas por vencer
        </AtTypography>
        {porVencer.length === 0 && (
          <AtTypography variant="caption" color="#8892A4">
            Sin pólizas por vencer.
          </AtTypography>
        )}
        {porVencer.map((item) => (
          <MlPolizaAlertRow
            key={item.id}
            name={item.name}
            subline={item.subline}
            variant="por_vencer"
            onPress={onItemPress}
          />
        ))}
      </View>

      <View className="px-4 gap-2">
        <AtTypography variant="bodyBold" color="#1A1F36">
          Pólizas vencidas
        </AtTypography>
        {vencidas.length === 0 && (
          <AtTypography variant="caption" color="#8892A4">
            Sin pólizas vencidas.
          </AtTypography>
        )}
        {vencidas.map((item) => (
          <MlPolizaAlertRow
            key={item.id}
            name={item.name}
            subline={item.subline}
            variant="vencida"
            onPress={onItemPress}
          />
        ))}
      </View>
    </View>
  );
}
