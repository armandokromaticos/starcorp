/**
 * Organism: OrBancoSummaryCard
 *
 * Hero card oscura del Informe Bancos: label "Bancos totalizado" arriba,
 * monto grande en blanco, y delta pill a la derecha.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { formatCurrency } from '@/src/utils/currency';

interface OrBancoSummaryCardProps {
  label?: string;
  total: number;
  deltaPct: number;
}

export const OrBancoSummaryCard = memo<OrBancoSummaryCardProps>(
  ({ label = 'Bancos totalizado', total, deltaPct }) => {
    return (
      <View
        className="rounded-lg px-4 py-3"
        style={{
          backgroundColor: '#0F1B4A',
          borderCurve: 'continuous',
        }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <AtTypography variant="body" color="#9FB0D4">
              {label}
            </AtTypography>
            <AtTypography
              variant="h2"
              color="#FFFFFF"
              style={{ fontVariant: ['tabular-nums'] }}
            >
              {formatCurrency(total)}
            </AtTypography>
          </View>
          <AtDeltaIndicator value={deltaPct} size="sm" appearance="dark" />
        </View>
      </View>
    );
  },
);

OrBancoSummaryCard.displayName = 'OrBancoSummaryCard';
