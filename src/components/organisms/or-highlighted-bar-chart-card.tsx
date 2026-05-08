/**
 * Organism: OrHighlightedBarChartCard
 *
 * White rounded card: entity label + amount + dark delta chip,
 * with an OrBarChart below. One bar is visually emphasized with
 * a small "Hoy" pill overlay above it.
 *
 * Reused by the Ingreso-by-clientes view and the Costo/Egreso terceros view.
 */

import React, { memo, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { BAR_GRADIENTS } from '@/src/theme/gradients';

export interface HighlightedBarChartPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface OrHighlightedBarChartCardProps {
  title: string;
  amount: number;
  deltaPercent: number;
  bars: HighlightedBarChartPoint[];
  highlightedId?: string;
  highlightLabel?: string;
  height?: number;
  className?: string;
}

export const OrHighlightedBarChartCard = memo<OrHighlightedBarChartCardProps>(
  ({
    title,
    amount,
    deltaPercent,
    bars,
    highlightedId,
    highlightLabel = 'Hoy',
    height = 180,
    className,
  }) => {
    const maxValue = useMemo(
      () => Math.max(...bars.map((b) => b.value), 1),
      [bars],
    );
    const resolvedHighlighted = highlightedId ?? bars[0]?.id;

    return (
      <View
        className={`bg-bg-card rounded-lg p-4 gap-3 mx-4 ${className ?? ''}`}
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        }}
      >
        <View className="gap-1">
          <AtTypography variant="captionBold" color="#1A1F36">
            {title}
          </AtTypography>
          <View className="flex-row items-center gap-3">
            <AtMetricValue value={amount} size="lg" />
            <AtDeltaIndicator value={deltaPercent} size="sm" appearance="dark" />
          </View>
        </View>

        <View style={{ height }} className="flex-row items-end gap-2 pt-4">
          {bars.map((bar, i) => {
            const barHeight = (bar.value / maxValue) * (height - 24);
            const gradient = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
            const isHighlighted = bar.id === resolvedHighlighted;
            return (
              <View
                key={bar.id}
                className="flex-1 items-center justify-end"
                style={{ height }}
              >
                {isHighlighted && (
                  <View
                    className="rounded-full px-2.5 py-0.5 mb-1"
                    style={{ backgroundColor: '#1A2B6D', borderCurve: 'continuous' }}
                  >
                    <AtTypography variant="label" color="#FFFFFF">
                      {highlightLabel}
                    </AtTypography>
                  </View>
                )}
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    width: '80%',
                    height: barHeight,
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                    borderCurve: 'continuous',
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);

OrHighlightedBarChartCard.displayName = 'OrHighlightedBarChartCard';
