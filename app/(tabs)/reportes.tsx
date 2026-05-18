import React, { useState } from 'react';
import { MlSearchBar } from '@/src/components/molecules/ml-search-bar';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrPowerBIReport } from '@/src/components/organisms/or-powerbi-report';
import { TmDashboard } from '@/src/components/templates/tm-dashboard';
import { useGlobalSearchStore } from '@/src/stores/global-search.store';
import { View } from '@/src/tw';

const POWERBI_GROUP_ID = '457b264f-6eb8-4b00-8f62-f65ee2700cd4';
const POWERBI_REPORT_ID = '4d82ab2a-72f5-4093-98c6-fd860b2917de';

export default function ReportesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const openGlobalSearch = useGlobalSearchStore((s) => s.open);

  return (
    <TmDashboard>
      <View className="px-4 pt-2">
        <MlSearchBar
          onMenuPress={() => setDrawerVisible(true)}
          onPress={openGlobalSearch}
        />
      </View>

      <OrPowerBIReport
        groupId={POWERBI_GROUP_ID}
        reportId={POWERBI_REPORT_ID}
      />

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="reportes"
      />
    </TmDashboard>
  );
}
