/**
 * Reportes Tab Screen
 *
 * Embeds the Power BI BI_FINANCIEROManager report from the Manager workspace.
 */

import React, { useState } from 'react';
import { View } from '@/src/tw';
import { AtSkeleton } from '@/src/components/atoms/at-skeleton';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { OrDrawer } from '@/src/components/organisms/or-drawer';
import { OrPowerBIReport } from '@/src/components/organisms/or-powerbi-report';
import { TmDashboard } from '@/src/components/templates/tm-dashboard';
import { usePowerBIListReports } from '@/src/hooks/queries/use-powerbi-list-reports';

const POWERBI_GROUP_ID = '457b264f-6eb8-4b00-8f62-f65ee2700cd4';
const POWERBI_REPORT_NAME = 'BI_FINANCIEROManager';

export default function ReportesScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const {
    data: reports,
    isLoading,
    error,
  } = usePowerBIListReports(POWERBI_GROUP_ID);
  const report = reports?.find((r) => r.name === POWERBI_REPORT_NAME);

  return (
    <TmDashboard>
      {isLoading ? (
        <View className="gap-3 p-4">
          <AtSkeleton width={200} height={16} />
          <AtSkeleton width="100%" height={500} borderRadius={12} />
        </View>
      ) : error ? (
        <View className="p-4 gap-2">
          <AtTypography variant="h3" color="#1A1F36">
            No se pudieron listar los reportes
          </AtTypography>
          <AtTypography variant="body" color="#DC2626">
            {error instanceof Error ? error.message : 'error desconocido'}
          </AtTypography>
        </View>
      ) : !report ? (
        <View className="p-4 gap-2">
          <AtTypography variant="h3" color="#1A1F36">
            Reporte no encontrado
          </AtTypography>
          <AtTypography variant="body" color="#8892A4">
            No existe un reporte llamado "{POWERBI_REPORT_NAME}" en el workspace.
          </AtTypography>
        </View>
      ) : (
        <OrPowerBIReport
          groupId={POWERBI_GROUP_ID}
          reportId={report.id}
        />
      )}

      <OrDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        activeSection="reportes"
      />
    </TmDashboard>
  );
}
