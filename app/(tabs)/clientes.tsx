/**
 * Clientes Tab Screen
 *
 * Client list with search and filter.
 */

import React, { useState } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { OrClientList, type ClientListItem } from '@/src/components/organisms/or-client-list';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { TmDashboard } from '@/src/components/templates/tm-dashboard';
import { tokens } from '@/src/theme/tokens';

const MOCK_CLIENTS: ClientListItem[] = [
  { id: '1', name: 'Baymont', color: tokens.color.chart[0], revenue: 100000, deltaPercent: 1.87 },
  { id: '2', name: 'Camelback', color: tokens.color.chart[1], revenue: 100000, deltaPercent: 1.87 },
  { id: '3', name: 'Hotel California', color: tokens.color.chart[2], revenue: 150000, deltaPercent: 2.5 },
  { id: '4', name: 'La Quinta', color: tokens.color.chart[3], revenue: 75000, deltaPercent: 1.2 },
  { id: '5', name: 'Holiday Inn', color: tokens.color.chart[4], revenue: 200000, deltaPercent: 3.0 },
  { id: '6', name: 'Comfort Inn', color: tokens.color.chart[5], revenue: 120000, deltaPercent: 1.95 },
  { id: '7', name: 'Super 8', color: tokens.color.chart[6], revenue: 90000, deltaPercent: 1.65 },
  { id: '8', name: 'Hotel 6', color: tokens.color.chart[7], revenue: 60000, deltaPercent: 1.3 },
];

export default function ClientesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <TmDashboard>
      <OrClientList
        clients={MOCK_CLIENTS}
        title="Clientes"
        count={325}
        showSearch
        onMenuPress={() => setDrawerVisible(true)}
      />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="clientes"
      />
    </TmDashboard>
  );
}
