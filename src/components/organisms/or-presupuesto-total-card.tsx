/**
 * Organism: OrPresupuestoTotalCard
 *
 * Card "Total" fija al pie del Informe Presupuesto (navy). Totaliza
 * Proyectado y Ejecutado de las empresas del tipo/período activo.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { formatMoney2 } from '@/src/utils/currency';

interface OrPresupuestoTotalCardProps {
  proyectado: number;
  ejecutado: number;
}

const NAVY_BG = '#1C2A5E';

const TotalCol = memo<{ label: string; value: number }>(({ label, value }) => (
  <View className="items-end gap-1" style={{ minWidth: 96 }}>
    <AtTypography variant="captionBold" color="rgba(255,255,255,0.75)">
      {label}
    </AtTypography>
    <AtTypography
      variant="bodyBold"
      color="#FFFFFF"
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {formatMoney2(value)}
    </AtTypography>
  </View>
));
TotalCol.displayName = 'PresupuestoTotalCol';

export const OrPresupuestoTotalCard = memo<OrPresupuestoTotalCardProps>(
  ({ proyectado, ejecutado }) => {
    return (
      <View
        className="flex-row items-center justify-between gap-3 px-4 py-3 rounded-lg"
        style={{
          backgroundColor: NAVY_BG,
          borderCurve: 'continuous',
          boxShadow: '0 -2px 10px rgba(15, 27, 74, 0.18)',
        }}
      >
        <AtTypography variant="bodyBold" color="#FFFFFF">
          Total
        </AtTypography>
        <View className="flex-row gap-4">
          <TotalCol label="Proyectado" value={proyectado} />
          <TotalCol label="Ejecutado" value={ejecutado} />
        </View>
      </View>
    );
  },
);

OrPresupuestoTotalCard.displayName = 'OrPresupuestoTotalCard';
