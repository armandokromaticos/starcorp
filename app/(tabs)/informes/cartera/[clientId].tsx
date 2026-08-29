/**
 * Informe Cartera — detalle "Gestión carteras vencidas" por cliente.
 *
 * Arriba se mantiene el MISMO donut de distribución del index (orden,
 * colores y bucket "Otros" idénticos), con la cartera de la ruta marcada
 * como seleccionada y SIN interacción — es solo contexto visual.
 */

import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, TextInput, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlUpdatedAtCard } from '@/src/components/molecules/ml-updated-at-card';
import {
  MlInvoiceRow,
  INVOICE_AMOUNT_COL_W,
} from '@/src/components/molecules/ml-invoice-row';
import { OrCarteraDonut } from '@/src/components/organisms/or-cartera-donut';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useCartera } from '@/src/hooks/queries/use-cartera';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { donutColorAt, DONUT_MAX_NAMED } from '@/src/utils/donut';
import { OTROS_SEGMENT_COLOR } from '@/src/theme/gradients';

const MAX_DONUT_SLICES = DONUT_MAX_NAMED;

function formatMoney(value: number): string {
  return `$${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CarteraClientDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { clientId } = useLocalSearchParams<{ clientId: string }>();
  const { data } = useCartera();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [search, setSearch] = useState('');
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  // Mismo orden y colores que el donut del index (mayor→menor, paleta por
  // posición) para que la gráfica sea idéntica en ambas vistas.
  const sortedClients = useMemo(
    () =>
      [...(data?.clients ?? [])]
        .sort((a, b) => b.total - a.total)
        .map((c, i) => ({ ...c, color: donutColorAt(i) })),
    [data],
  );

  const client = useMemo(
    () => sortedClients.find((c) => c.id === clientId),
    [sortedClients, clientId],
  );

  const invoices = useMemo(() => {
    if (!client) return [];
    const q = search.trim().toLowerCase();
    if (!q) return client.invoices;
    return client.invoices.filter(
      (i) =>
        i.invoiceNumber.toLowerCase().includes(q) ||
        (i.note ?? '').toLowerCase().includes(q),
    );
  }, [client, search]);

  const total = useMemo(
    () => invoices.reduce((s, i) => s + i.amount, 0),
    [invoices],
  );

  // Réplica exacta del donut del index: top-N + bucket "Otros".
  const donutData = useMemo(() => {
    if (!sortedClients.length) return [];
    if (sortedClients.length <= MAX_DONUT_SLICES) {
      return sortedClients.map((c) => ({
        id: c.id,
        value: c.total,
        color: c.color,
        label: c.name,
      }));
    }
    const top = sortedClients.slice(0, MAX_DONUT_SLICES);
    const rest = sortedClients.slice(MAX_DONUT_SLICES);
    return [
      ...top.map((c) => ({
        id: c.id,
        value: c.total,
        color: c.color,
        label: c.name,
      })),
      {
        id: 'otros',
        value: rest.reduce((s, c) => s + c.total, 0),
        color: OTROS_SEGMENT_COLOR,
        label: 'Otros',
      },
    ];
  }, [sortedClients]);

  // La cartera de la ruta se marca en el donut; si cae fuera del top-N,
  // se marca el bucket "Otros" que la contiene.
  const markedSliceId = useMemo(() => {
    if (!clientId) return null;
    const idx = sortedClients.findIndex((c) => c.id === clientId);
    if (idx < 0) return null;
    return idx < MAX_DONUT_SLICES ? clientId : 'otros';
  }, [sortedClients, clientId]);

  return (
    <View
      className="flex-1 bg-bg-secondary"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ rowGap: 20, paddingBottom: 96 + insets.bottom }}
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
            segments={['Informes', 'Cartera', 'Gestión carteras vencidas']}
            onBack={() => router.back()}
          />
        </View>

        <View className="px-4">
          {/* Sin onSelectChange: la gráfica no es interactiva en esta vista;
              solo marca la cartera con la que se entró. */}
          <OrCarteraDonut
            title="Distribución cartera por cliente"
            data={donutData}
            labelsMode="tap-only"
            selectedId={markedSliceId}
            valueFormatter={formatMoney}
          />
        </View>

        <View className="px-4">
          <MlUpdatedAtCard isoDate={data?.updatedAt ?? '2026-04-07'} />
        </View>

        <View className="px-4">
          <View
            className="flex-row items-center gap-2 rounded-full bg-bg-card px-4 py-3"
            style={{
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
            }}
          >
            <AtIcon name="search" size="md" color="#8892A4" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por cliente"
              placeholderTextColor="#8892A4"
              className="flex-1 p-0 text-ink-primary text-base"
              style={{ fontFamily: 'Roboto_400Regular' }}
            />
          </View>
        </View>

        <View className="gap-2">
          {client && (
            <View className="flex-row items-center px-4 gap-3">
              <View className="flex-row items-center gap-2 flex-1">
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: client.color,
                  }}
                />
                <AtTypography variant="bodyBold" numberOfLines={1}>
                  {client.name}
                </AtTypography>
              </View>
              <View
                style={{ width: INVOICE_AMOUNT_COL_W, marginRight: 16 }}
                className="items-start"
              >
                <AtTypography variant="bodyBold" color="#1A1F36">
                  Monto
                </AtTypography>
              </View>
            </View>
          )}

          <View
            className="bg-bg-card mx-4 rounded-lg"
            style={{
              borderCurve: 'continuous',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
            }}
          >
            {invoices.length === 0 && (
              <View className="px-4 py-4">
                <AtTypography variant="caption" color="#8892A4">
                  Sin facturas para este cliente.
                </AtTypography>
              </View>
            )}
            {invoices.map((inv, i) => (
              <MlInvoiceRow
                key={inv.id}
                date={inv.date}
                daysOverdue={inv.daysOverdue}
                invoiceNumber={inv.invoiceNumber}
                note={inv.note}
                amount={inv.amount}
                showDivider={i < invoices.length - 1}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="absolute left-0 right-0 bottom-0 px-4 pt-1 bg-bg-secondary"
        // Holgura acotada (8–12px) para pegar la card al fondo de forma
        // consistente, sin el espacio extra del safe-area en algunos devices.
        style={{ paddingBottom: Math.min(Math.max(insets.bottom, 8), 12) }}
      >
        <View
          className="rounded-lg px-4 py-3 items-end gap-1"
          style={{
            backgroundColor: '#0F1B4A',
            borderCurve: 'continuous',
          }}
        >
          <AtTypography variant="bodyBold" color="#FFFFFF">
            Total
          </AtTypography>
          <AtTypography variant="metricSmall" color="#FFFFFF">
            {formatMoney(total)}
          </AtTypography>
        </View>
      </View>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}
