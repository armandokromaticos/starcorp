/**
 * Informes Tab Screen
 *
 * List of available reports/informes.
 */

import React, { useState } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtStatusBadge } from '@/src/components/atoms/at-status-badge';
import { MlReportRow } from '@/src/components/molecules/ml-report-row';
import { AtDivider } from '@/src/components/atoms/at-divider';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { TmInformes } from '@/src/components/templates/tm-informes';

const REPORTS = [
  { id: 'cartera', label: 'Cartera', icon: 'account-balance-wallet' as const, color: '#1A2B6D' },
  { id: 'empleados', label: 'Empleados', icon: 'people' as const, color: '#E8952E' },
  { id: 'bancos', label: 'Bancos', icon: 'account-balance' as const, color: '#4A7FD4' },
  { id: 'presupuesto', label: 'Presupuesto', icon: 'calculate' as const, color: '#38A169' },
  { id: 'seguro', label: 'Seguro', icon: 'security' as const, color: '#ED64A6' },
  { id: 'pagos', label: 'Pagos', icon: 'payment' as const, color: '#DD6B20' },
];

export default function InformesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <TmInformes onMenuPress={() => setDrawerVisible(true)}>
      <View className="flex-row items-center gap-2 px-4">
        <AtTypography variant="h3">Informes disponibles</AtTypography>
        <AtStatusBadge label="Hoy" variant="accent" size="sm" />
      </View>

      <View className="bg-bg-card mx-4 rounded-lg" style={{ borderCurve: 'continuous', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' }}>
        {REPORTS.map((report, i) => (
          <React.Fragment key={report.id}>
            <MlReportRow
              label={report.label}
              icon={report.icon}
              iconBgColor={report.color}
            />
            {i < REPORTS.length - 1 && <AtDivider className="mx-4" />}
          </React.Fragment>
        ))}
      </View>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="informes"
      />
    </TmInformes>
  );
}
