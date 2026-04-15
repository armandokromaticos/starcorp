/**
 * Reportes Tab Screen
 *
 * Reports and analytics placeholder.
 */

import React, { useState } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { TmDashboard } from '@/src/components/templates/tm-dashboard';

export default function ReportesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <TmDashboard>
      <View className="items-center justify-center py-20 gap-4">
        <AtIcon name="bar-chart" size="xl" color="#8892A4" />
        <AtTypography variant="h2" color="#1A1F36">
          Reportes
        </AtTypography>
        <AtTypography variant="body" color="#8892A4">
          Reportes y analytics — próximamente.
        </AtTypography>
      </View>

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="reportes"
      />
    </TmDashboard>
  );
}
