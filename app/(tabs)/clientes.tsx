/**
 * Clientes Tab Screen
 *
 * Dark client list matching the mockup: header with back arrow + title +
 * count + period dropdown, and a stack of dark navy client cards.
 */

import React, { useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { router } from 'expo-router';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { MlClientCardDark } from '@/src/components/molecules/ml-client-card-dark';
import { MlPeriodDropdown } from '@/src/components/molecules/ml-period-dropdown';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { TmDashboard } from '@/src/components/templates/tm-dashboard';

interface ClientItem {
  id: string;
  name: string;
  amount: number;
  deltaPercent: number;
}

const CLIENTS: ClientItem[] = [
  { id: '1', name: 'Baymont', amount: 100000, deltaPercent: 1.87 },
  { id: '2', name: 'Camelback', amount: 100000, deltaPercent: -1.87 },
  { id: '3', name: 'Nombre cliente', amount: 100000, deltaPercent: 1.87 },
  { id: '4', name: 'Nombre cliente', amount: 100000, deltaPercent: 1.87 },
  { id: '5', name: 'Nombre cliente', amount: 100000, deltaPercent: 1.87 },
  { id: '6', name: 'Nombre cliente', amount: 100000, deltaPercent: 1.87 },
];

export default function ClientesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <TmDashboard>
      <View className="flex-row items-center justify-between px-4 pt-2">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="flex-row items-center gap-2"
        >
          <AtIcon name="chevron-left" size="lg" color="#1A1F36" />
          <View className="flex-row items-baseline gap-1.5">
            <AtTypography variant="h2">Clientes</AtTypography>
            <AtTypography variant="body" color="#4A5568">
              ({CLIENTS.length > 99 ? 325 : CLIENTS.length})
            </AtTypography>
          </View>
        </Pressable>
        <MlPeriodDropdown />
      </View>

      <View className="gap-3 px-4 mt-2">
        {CLIENTS.map((c) => (
          <MlClientCardDark
            key={c.id}
            name={c.name}
            amount={c.amount}
            deltaPercent={c.deltaPercent}
            onPress={() => router.push(`/ingresos/${c.id}` as Parameters<typeof router.push>[0])}
          />
        ))}
      </View>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="clientes"
      />
    </TmDashboard>
  );
}
