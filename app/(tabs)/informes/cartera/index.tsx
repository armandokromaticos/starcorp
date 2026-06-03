/**
 * Informe Cartera — pantalla principal.
 *
 * Donut de distribución + tabs de aging + lista de clientes expandibles
 * + filtros en bottom sheet + footer con totales.
 */

import React, { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, TextInput, View } from '@/src/tw';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { MlBreadcrumb } from '@/src/components/molecules/ml-breadcrumb';
import { MlReportListSkeleton } from '@/src/components/molecules/ml-report-list-skeleton';
import { MlAgingTabsBar } from '@/src/components/molecules/ml-aging-tabs-bar';
import { MlUpdatedAtCard } from '@/src/components/molecules/ml-updated-at-card';
import { MlFilterChip } from '@/src/components/molecules/ml-filter-chip';
import { MlFilterButton } from '@/src/components/molecules/ml-filter-button';
import { MlCarteraClientRow } from '@/src/components/molecules/ml-cartera-client-row';
import { MlCarteraTotalFooter } from '@/src/components/molecules/ml-cartera-total-footer';
import { OrCarteraDonut } from '@/src/components/organisms/or-cartera-donut';
import {
  OrCarteraFiltersSheet,
  type CarteraFilters,
} from '@/src/components/organisms/or-cartera-filters-sheet';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { useCartera } from '@/src/hooks/queries/use-cartera';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import {
  AGING_BUCKETS,
  AGING_BUCKET_LABEL,
  type AgingBucket,
} from '@/src/types/cartera.types';

const MAX_DONUT_SLICES = 8;

export default function CarteraScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isPending } = useCartera();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [filters, setFilters] = useState<CarteraFilters>({ clientIds: [] });
  const [selectedBucket, setSelectedBucket] =
    useState<AgingBucket>('corriente');
  const [search, setSearch] = useState('');
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>(null);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  const visibleClients = useMemo(() => {
    const all = data?.clients ?? [];
    const filtered = filters.clientIds.length
      ? all.filter((c) => filters.clientIds.includes(c.id))
      : all;
    const q = search.trim().toLowerCase();
    const searched = q
      ? filtered.filter((c) => c.name.toLowerCase().includes(q))
      : filtered;
    return [...searched].sort((a, b) => b.total - a.total);
  }, [data, filters, search]);

  const donutData = useMemo(() => {
    if (!visibleClients.length) return [];
    if (visibleClients.length <= MAX_DONUT_SLICES) {
      return visibleClients.map((c) => ({
        id: c.id,
        value: c.total,
        color: c.color,
        label: c.name,
      }));
    }
    const top = visibleClients.slice(0, MAX_DONUT_SLICES);
    const rest = visibleClients.slice(MAX_DONUT_SLICES);
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
        color: '#6B7280',
        label: 'Otros',
      },
    ];
  }, [visibleClients]);

  const totals = useMemo(() => {
    const bucketTotal = visibleClients.reduce(
      (sum, c) => sum + c.buckets[selectedBucket],
      0,
    );
    const grandTotal = visibleClients.reduce((sum, c) => sum + c.total, 0);
    return { bucketTotal, grandTotal };
  }, [visibleClients, selectedBucket]);

  const bucketIndex = AGING_BUCKETS.indexOf(selectedBucket);
  const goPrevBucket = () => {
    if (bucketIndex > 0) setSelectedBucket(AGING_BUCKETS[bucketIndex - 1]);
  };
  const goNextBucket = () => {
    if (bucketIndex < AGING_BUCKETS.length - 1)
      setSelectedBucket(AGING_BUCKETS[bucketIndex + 1]);
  };

  const clientOptions = useMemo(
    () =>
      (data?.clients ?? []).map((c) => ({ id: c.id, name: c.name })),
    [data],
  );

  React.useEffect(() => {
    if (selectedSliceId && !donutData.some((s) => s.id === selectedSliceId)) {
      setSelectedSliceId(null);
    }
  }, [donutData, selectedSliceId]);

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
            segments={['Informes', 'Cartera']}
            onBack={() => router.back()}
          />
        </View>

        <View className="flex-row items-center justify-between px-4">
          <View className="flex-row items-center gap-2 flex-1">
            <AtTypography variant="bodyBold">Filtros</AtTypography>
            {filters.clientIds.length > 0 && (
              <Pressable
                onPress={() => setFilters({ clientIds: [] })}
                hitSlop={6}
              >
                <AtTypography variant="captionBold" color="#1A3FE8">
                  Borrar filtros
                </AtTypography>
              </Pressable>
            )}
          </View>
          <MlFilterButton
            active={filters.clientIds.length > 0}
            onPress={() => setFiltersVisible(true)}
          />
        </View>

        {filters.clientIds.length > 0 && (
          <View className="flex-row flex-wrap gap-2 px-4">
            {clientOptions
              .filter((c) => filters.clientIds.includes(c.id))
              .map((c) => (
                <MlFilterChip
                  key={c.id}
                  label={c.name}
                  onRemove={() =>
                    setFilters((f) => ({
                      clientIds: f.clientIds.filter((id) => id !== c.id),
                    }))
                  }
                />
              ))}
          </View>
        )}

        <MlAgingTabsBar
          value={selectedBucket}
          onChange={setSelectedBucket}
        />

        <View className="px-4">
          <OrCarteraDonut
            title="Distribución cartera por cliente"
            data={donutData}
            labelsMode="tap-only"
            selectedId={selectedSliceId}
            onSelectChange={setSelectedSliceId}
            valueFormatter={(v) =>
              `$${v.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            }
            emptyHint="Toca un sector para ver el cliente"
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

        <View className="flex-row items-center justify-between px-4">
          <AtTypography variant="bodyBold" color="#1A1F36">
            Cliente
          </AtTypography>
          <View className="flex-row items-center gap-6">
            <View className="flex-row items-center gap-1">
              <Pressable onPress={goPrevBucket} hitSlop={6}>
                <AtIcon name="chevron-left" size="md" color="#1A1F36" />
              </Pressable>
              <AtTypography variant="bodyBold" color="#1A1F36">
                {AGING_BUCKET_LABEL[selectedBucket]}
              </AtTypography>
              <Pressable onPress={goNextBucket} hitSlop={6}>
                <AtIcon name="chevron-right" size="md" color="#1A1F36" />
              </Pressable>
            </View>
            <AtTypography variant="bodyBold" color="#1A1F36">
              Total
            </AtTypography>
          </View>
        </View>

        <View className="gap-2 px-4">
          {isPending && <MlReportListSkeleton />}
          {!isPending && visibleClients.length === 0 && (
            <AtTypography variant="caption" color="#8892A4">
              Sin clientes que coincidan con los filtros.
            </AtTypography>
          )}
          {visibleClients.map((c) => (
            <MlCarteraClientRow
              key={c.id}
              name={c.name}
              color={c.color}
              activeBucket={selectedBucket}
              buckets={c.buckets}
              total={c.total}
              expanded={expandedClientId === c.id}
              onToggle={() =>
                setExpandedClientId((cur) => (cur === c.id ? null : c.id))
              }
              onOpenDetail={() =>
                router.push(`/(tabs)/informes/cartera/${c.id}` as never)
              }
            />
          ))}
        </View>

        <View className="px-4">
          <MlCarteraTotalFooter
            bucketLabel={AGING_BUCKET_LABEL[selectedBucket]}
            bucketValue={totals.bucketTotal}
            totalValue={totals.grandTotal}
          />
        </View>
      </ScrollView>

      <OrCarteraFiltersSheet
        visible={filtersVisible}
        onClose={() => setFiltersVisible(false)}
        clients={clientOptions}
        initialFilters={filters}
        onApply={setFilters}
      />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </View>
  );
}
