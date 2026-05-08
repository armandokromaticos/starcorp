/**
 * Organism: OrFinancialSummary
 *
 * Financial summary with metric cards grid.
 * Used in Financiero main screen (Ingresos/Costos/Gastos/Utilidad cards).
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { MlMetricCard } from '@/src/components/molecules/ml-metric-card';
import { AtTypography } from '@/src/components/atoms/at-typography';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export interface FinancialMetric {
  id: string;
  label: string;
  value: number;
  deltaPercent?: number;
  icon?: MaterialIconName;
  iconColor?: string;
  ctaLabel?: string;
}

interface OrFinancialSummaryProps {
  title?: string;
  metrics: FinancialMetric[];
  columns?: 2 | 3;
  onMetricPress?: (id: string) => void;
  className?: string;
}

export const OrFinancialSummary = memo<OrFinancialSummaryProps>(
  ({ title, metrics, columns = 3, onMetricPress, className }) => {
    return (
      <View className={`gap-3 ${className ?? ''}`}>
        {title && (
          <View className="px-4">
            <AtTypography variant="h3">{title}</AtTypography>
          </View>
        )}

        <View
          className="px-4"
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {metrics.map((m) => (
            <MlMetricCard
              key={m.id}
              label={m.label}
              value={m.value}
              deltaPercent={m.deltaPercent}
              icon={m.icon}
              iconColor={m.iconColor}
              ctaLabel={m.ctaLabel}
              onPress={() => onMetricPress?.(m.id)}
              className={columns === 3 ? 'flex-1 min-w-[90px]' : 'flex-1 min-w-[140px]'}
            />
          ))}
        </View>
      </View>
    );
  },
);

OrFinancialSummary.displayName = 'OrFinancialSummary';
