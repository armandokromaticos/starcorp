/**
 * Financiero Tab Screen
 *
 * Company selector + financial metric cards.
 */

import React, { useState } from 'react';
import { View, ScrollView } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { MlCompanyCard } from '@/src/components/molecules/ml-company-card';
import { OrFinancialSummary, type FinancialMetric } from '@/src/components/organisms/or-financial-summary';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { TmFinanciero } from '@/src/components/templates/tm-financiero';

const MOCK_METRICS: FinancialMetric[] = [
  { id: 'ingresos', label: 'Ingresos', value: 100000, deltaPercent: 1.87, icon: 'attach-money', iconColor: '#1A2B6D' },
  { id: 'costos', label: 'Costos', value: 100000, deltaPercent: -1.87, icon: 'shopping-bag', iconColor: '#E8952E' },
  { id: 'egresos', label: 'Egreso', value: 100000, deltaPercent: 1.87, icon: 'credit-card', iconColor: '#4A7FD4' },
];

const MOCK_METRICS_2: FinancialMetric[] = [
  { id: 'utilidad-bruta', label: 'Utilidad bruta', value: 100000, icon: 'trending-up', iconColor: '#38A169' },
  { id: 'utilidad-neta', label: 'Utilidad neta', value: 100000, icon: 'show-chart', iconColor: '#3182CE' },
];

export default function FinancieroScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <TmFinanciero onMenuPress={() => setDrawerVisible(true)}>
      {/* Company selector carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 px-4"
      >
        <MlCompanyCard
          name="5 Stars"
          totalLabel="Ingresos totales"
          totalValue={100000}
          deltaPercent={1.87}
        />
        <MlCompanyCard
          name="One A"
          totalLabel="Ingresos totales"
          totalValue={100000}
          deltaPercent={1.87}
        />
      </ScrollView>

      {/* Selected company header */}
      <View className="flex-row items-center gap-2 px-4">
        <AtTypography variant="h3">5 Stars</AtTypography>
        <AtStatusBadge label="Hoy" variant="accent" size="sm" />
      </View>

      {/* Financial metrics grid */}
      <OrFinancialSummary metrics={MOCK_METRICS} columns={3} />
      <OrFinancialSummary metrics={MOCK_METRICS_2} columns={2} />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="financiero"
      />
    </TmFinanciero>
  );
}
