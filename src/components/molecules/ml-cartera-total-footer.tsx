/**
 * Molecule: MlCarteraTotalFooter
 *
 * Footer navy con label "Total" y dos columnas (bucket activo + total
 * general) alineadas a las mismas columnas de la lista de clientes.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import {
  CARTERA_BUCKET_COL_W,
  CARTERA_TOTAL_COL_W,
} from '@/src/components/molecules/ml-cartera-client-row';

interface MlCarteraTotalFooterProps {
  bucketLabel: string;
  bucketValue: number;
  totalValue: number;
  /** Oculta la columna del bucket activo (ej: al filtrar un solo cliente). */
  showBucket?: boolean;
  className?: string;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const MlCarteraTotalFooter = memo<MlCarteraTotalFooterProps>(
  ({ bucketLabel, bucketValue, totalValue, showBucket = true, className }) => {
    return (
      <View
        className={`flex-row items-center rounded-lg px-4 py-3 gap-3 ${className ?? ''}`}
        style={{
          backgroundColor: '#0F1B4A',
          borderCurve: 'continuous',
        }}
      >
        <AtTypography variant="bodyBold" color="#FFFFFF" className="flex-1">
          Total
        </AtTypography>
        {showBucket && (
          <View
            style={{ width: CARTERA_BUCKET_COL_W }}
            className="items-end gap-1"
          >
            <AtTypography variant="caption" color="#A9B4D6" numberOfLines={1}>
              {bucketLabel}
            </AtTypography>
            <AtTypography
              variant="captionBold"
              color="#FFFFFF"
              numberOfLines={1}
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatMoney(bucketValue)}
            </AtTypography>
          </View>
        )}
        <View style={{ width: CARTERA_TOTAL_COL_W }} className="items-end gap-1">
          <AtTypography variant="caption" color="#A9B4D6" numberOfLines={1}>
            Total
          </AtTypography>
          <AtTypography
            variant="captionBold"
            color="#FFFFFF"
            numberOfLines={1}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {formatMoney(totalValue)}
          </AtTypography>
        </View>
      </View>
    );
  },
);

MlCarteraTotalFooter.displayName = 'MlCarteraTotalFooter';
