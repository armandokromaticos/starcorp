/**
 * Molecule: MlCarteraTotalFooter
 *
 * Footer navy con label "Total" y dos columnas a la derecha:
 * el bucket activo y el total general.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';

interface MlCarteraTotalFooterProps {
  bucketLabel: string;
  bucketValue: number;
  totalValue: number;
  className?: string;
}

function formatMoney(value: number): string {
  return `$${value.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const MlCarteraTotalFooter = memo<MlCarteraTotalFooterProps>(
  ({ bucketLabel, bucketValue, totalValue, className }) => {
    return (
      <View
        className={`rounded-lg px-4 py-3 gap-1 ${className ?? ''}`}
        style={{
          backgroundColor: '#0F1B4A',
          borderCurve: 'continuous',
        }}
      >
        <View className="flex-row items-center justify-between">
          <AtTypography variant="bodyBold" color="#FFFFFF">
            Total
          </AtTypography>
          <View className="flex-row gap-6">
            <AtTypography variant="bodyBold" color="#FFFFFF">
              {bucketLabel}
            </AtTypography>
            <AtTypography variant="bodyBold" color="#FFFFFF">
              Total
            </AtTypography>
          </View>
        </View>
        <View className="flex-row items-center justify-end">
          <View className="flex-row gap-6">
            <AtTypography variant="bodyBold" color="#FFFFFF">
              {formatMoney(bucketValue)}
            </AtTypography>
            <AtTypography variant="bodyBold" color="#FFFFFF">
              {formatMoney(totalValue)}
            </AtTypography>
          </View>
        </View>
      </View>
    );
  },
);

MlCarteraTotalFooter.displayName = 'MlCarteraTotalFooter';
