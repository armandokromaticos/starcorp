import React, { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { TmConsolidatedDetail } from '@/src/components/templates/tm-consolidated-detail';
import { OrHighlightedBarChartCard } from '@/src/components/organisms/or-highlighted-bar-chart-card';
import { formatCurrency } from '@/src/utils/currency';
import { useCompany } from '@/src/hooks/queries/use-company';
import { useCompanyIngresosClients } from '@/src/hooks/queries/use-company-ingresos-clients';
import { useFiltersStore } from '@/src/stores/filters.store';
import { PERIOD_LABELS } from '@/src/utils/date';
import type { PeriodKey } from '@/src/types/domain.types';

const PERIOD_OPTIONS = (['today', '1w', '1m', '3m', '12m'] as PeriodKey[]).map(
  (key) => ({ key, label: PERIOD_LABELS[key] }),
);

export default function IngresoClienteDetailScreen() {
  const { clientId: companyId } = useLocalSearchParams<{ clientId: string }>();
  const activePeriodKey = useFiltersStore((s) => s.activePeriodKey);
  const setActivePeriod = useFiltersStore((s) => s.setActivePeriod);
  const { data: company } = useCompany(companyId);
  const { data: clientes = [], isLoading } = useCompanyIngresosClients(companyId);

  const handleFilterSelect = useCallback(
    (key: string) => setActivePeriod(key as PeriodKey),
    [setActivePeriod],
  );

  const [firstCliente] = clientes;

  return (
    <TmConsolidatedDetail
      breadcrumbs={['Ingreso', company?.name ?? 'Empresa']}
      filterOptions={PERIOD_OPTIONS}
      selectedFilter={activePeriodKey}
      onFilterSelect={handleFilterSelect}
      onBack={() => router.back()}
    >
      {isLoading || !firstCliente ? (
        <View className="px-4 gap-3">
          <AtSkeleton width="100%" height={260} borderRadius={14} />
          <AtSkeleton width="100%" height={320} borderRadius={14} />
        </View>
      ) : (
        <View className="gap-3">
          <OrHighlightedBarChartCard
            title={firstCliente.name}
            amount={firstCliente.amount}
            deltaPercent={firstCliente.deltaPercent}
            bars={clientes.map((c) => ({
              id: c.id,
              label: c.name,
              value: c.amount,
              color: c.color,
            }))}
            highlightedId={firstCliente.id}
          />

          <View className="pt-2">
            {clientes.map((c) => {
              const isSelected = c.id === firstCliente.id;
              return (
                <View
                  key={c.id}
                  className="mx-4 mb-2 bg-bg-card rounded-lg"
                  style={{
                    borderCurve: 'continuous',
                    borderWidth: isSelected ? 1.5 : 1,
                    borderColor: isSelected ? '#1A2B6D' : 'rgba(0, 0, 0, 0.08)',
                  }}
                >
                  <Pressable className="flex-row items-center gap-3 py-3 px-3">
                    <View
                      className="w-8 h-8 rounded-md"
                      style={{
                        backgroundColor: c.color,
                        borderCurve: 'continuous',
                      }}
                    />
                    <View className="flex-1">
                      <AtTypography variant="bodyBold" numberOfLines={1}>
                        {c.name}
                      </AtTypography>
                      <AtTypography
                        variant="bodyBold"
                        color="#1A1F36"
                        style={{ fontVariant: ['tabular-nums'] }}
                      >
                        {formatCurrency(c.amount)}
                      </AtTypography>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <AtIcon name="north-east" size="sm" color="#38A169" />
                      <AtTypography
                        variant="body"
                        color="#38A169"
                        style={{ fontVariant: ['tabular-nums'] }}
                      >
                        {formatCurrency(c.amount)}
                      </AtTypography>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </TmConsolidatedDetail>
  );
}
