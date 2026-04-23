/**
 * Organism: OrBarChart
 *
 * Bar chart for consolidated views (Costos/Gastos by groups).
 * Uses RN views for bars (no SVG dependency).
 */

import React, { memo, useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { BAR_GRADIENTS } from '@/src/theme/gradients';

interface BarDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface OrBarChartProps {
  data: BarDataPoint[];
  height?: number;
  className?: string;
}

export const OrBarChart = memo<OrBarChartProps>(
  ({ data, height = 200, className }) => {
    const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

    const yLabels = useMemo(() => {
      const step = maxValue / 2;
      return [maxValue, step, 0].map((v) =>
        v >= 1000000 ? `${(v / 1000000).toFixed(0)}M` :
        v >= 1000 ? `${(v / 1000).toFixed(0)}k` :
        String(Math.round(v))
      );
    }, [maxValue]);

    return (
      <View className={`gap-2 ${className ?? ''}`}>
        <View className="flex-row" style={{ height }}>
          {/* Y-axis labels */}
          <View className="justify-between pr-2" style={{ width: 50 }}>
            {yLabels.map((label, i) => (
              <AtTypography key={i} variant="label" color="#8892A4">
                {label}
              </AtTypography>
            ))}
          </View>

          {/* Bars */}
          <View className="flex-1 flex-row items-end gap-1">
            {data.map((item, i) => {
              const barHeight = (item.value / maxValue) * height * 0.9;
              const gradient = BAR_GRADIENTS[i % BAR_GRADIENTS.length];
              return (
                <View key={i} className="flex-1 items-center">
                  <LinearGradient
                    colors={gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      width: '70%',
                      height: barHeight,
                      borderRadius: 4,
                      borderCurve: 'continuous' as const,
                    }}
                  />
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  },
);

OrBarChart.displayName = 'OrBarChart';
