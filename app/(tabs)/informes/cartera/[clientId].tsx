/**
 * Informe Cartera — detalle "Gestión carteras vencidas" por cliente.
 */

import React, { useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, TextInput, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlUpdatedAtCard } from '@/src/components/molecules/ml-updated-at-card';
import { MlInvoiceRow } from '@/src/components/molecules/ml-invoice-row';
import { OrCarteraDonut } from '@/src/components/organisms/or-cartera-donut';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useCartera } from '@/src/hooks/queries/use-cartera';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';

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

  const client = useMemo(
    () => data?.clients.find((c) => c.id === clientId),
    [data, clientId],
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

  const donutData = useMemo(() => {
    if (!data?.clients) return [];
    return data.clients.slice(0, 8).map((c) => ({
      id: c.id,
      value: c.total,
      color: c.color,
      label: c.name,
    }));
  }, [data]);

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
            segments={['Informes', 'Cartera', 'Gestión carteras vencidas']}
            onBack={() => router.back()}
          />
        </View>

        <View className="px-4">
          <OrCarteraDonut
            title="Distribución cartera por cliente"
            data={donutData}
            showCenterPercent
            centerPercentText="50%"
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

        {client && (
          <View className="flex-row items-center justify-between px-4">
            <View className="flex-row items-center gap-2">
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: client.color,
                }}
              />
              <AtTypography variant="bodyBold">{client.name}</AtTypography>
            </View>
            <AtTypography variant="bodyBold" color="#1A1F36">
              Monto
            </AtTypography>
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

        <View className="px-4">
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
      </ScrollView>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}
