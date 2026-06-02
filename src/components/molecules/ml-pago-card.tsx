/**
 * Molecule: MlPagoCard
 *
 * Card de un pago en la lista del Informe Pagos. Header: dot color +
 * nombre empresa generadora + monto a la derecha. Body: grid 2×2 con
 * Centro de costos, Empleado/hotel, Concepto, Fecha.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDivider } from '@/src/components/atoms/at-divider';
import { formatCurrency } from '@/src/utils/currency';
import { formatShortDate } from '@/src/types/pagos.types';

interface MlPagoCardProps {
  empresaName: string;
  empresaColor: string;
  monto: number;
  centroCostos: string;
  empleado: string;
  concepto: string;
  fecha: string;
}

function formatMonto(value: number): string {
  const base = formatCurrency(value);
  const decimals = value.toFixed(2).split('.')[1];
  return `${base},${decimals}`;
}

export const MlPagoCard = memo<MlPagoCardProps>(
  ({
    empresaName,
    empresaColor,
    monto,
    centroCostos,
    empleado,
    concepto,
    fecha,
  }) => {
    return (
      <View
        className="bg-white rounded-lg p-4 gap-3"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-row items-center gap-2 flex-1">
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                backgroundColor: empresaColor,
              }}
            />
            <AtTypography variant="bodyBold" color="#1A1F36" numberOfLines={1}>
              {empresaName}
            </AtTypography>
          </View>
          <AtTypography
            variant="bodyBold"
            color="#1A1F36"
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatMonto(monto)}
          </AtTypography>
        </View>

        <AtDivider />

        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <AtTypography variant="bodyBold" color="#1A1F36">
              Centro de costos
            </AtTypography>
            <AtTypography variant="caption" color="#4A5568">
              {centroCostos}
            </AtTypography>
          </View>
          <View className="flex-1 gap-1">
            <AtTypography variant="bodyBold" color="#1A1F36">
              Empleado/hotel
            </AtTypography>
            <AtTypography variant="caption" color="#4A5568">
              {empleado}
            </AtTypography>
          </View>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <AtTypography variant="bodyBold" color="#1A1F36">
              Concepto
            </AtTypography>
            <AtTypography variant="caption" color="#4A5568">
              {concepto}
            </AtTypography>
          </View>
          <View className="flex-1 gap-1">
            <AtTypography variant="bodyBold" color="#1A1F36">
              Fecha
            </AtTypography>
            <AtTypography variant="caption" color="#4A5568">
              {formatShortDate(fecha)}
            </AtTypography>
          </View>
        </View>
      </View>
    );
  },
);

MlPagoCard.displayName = 'MlPagoCard';
