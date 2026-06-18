/**
 * Organism: OrAreaChart
 *
 * Stacked area chart for Utilidad consolidada.
 * Wraps the existing AreaChart SVG component.
 */

import React, { memo } from 'react';
import { useWindowDimensions } from 'react-native';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AreaChart } from '@/src/components/charts/area-chart';
import { pickEvenly } from '@/src/utils/date';

interface AreaSeries {
  data: number[];
  color: string;
  fillOpacity?: number;
}

interface OrAreaChartProps {
  series: AreaSeries[];
  height?: number;
  yLabels?: string[];
  /** X-axis labels, one per data point (e.g. bucket dates). Thinned to fit. */
  xLabels?: string[];
  className?: string;
}

const X_AXIS_HEIGHT = 18;

export const OrAreaChart = memo<OrAreaChartProps>(
  ({ series, height = 160, yLabels = ['100%', '50%', '0%'], xLabels, className }) => {
    const { width: screenWidth } = useWindowDimensions();
    const chartWidth = screenWidth - 16 * 4 - 40;
    const showXAxis = !!xLabels && xLabels.length >= 2;

    return (
      <View className={className} style={{ height: height + 4 + X_AXIS_HEIGHT }}>
        {/* Y-axis labels */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 4,
            height,
            justifyContent: 'space-between',
            zIndex: 1,
            width: 36,
          }}
        >
          {yLabels.map((label) => (
            <AtTypography key={label} variant="label" color="#8892A4">
              {label}
            </AtTypography>
          ))}
        </View>

        {/* Chart area */}
        <View style={{ marginLeft: 40 }}>
          <View style={{ position: 'relative', height }}>
            {series.map((s, i) => (
              <View
                key={i}
                style={i > 0 ? { position: 'absolute', top: 0, left: 0 } : undefined}
              >
                <AreaChart
                  data={s.data}
                  width={chartWidth}
                  height={height}
                  color={s.color}
                  fillOpacity={s.fillOpacity ?? 0.15}
                  strokeWidth={1.5}
                  smooth={false}
                  gradientId={`area-grad-${i}`}
                />
              </View>
            ))}
          </View>

          {/* X-axis labels */}
          {showXAxis && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 4,
              }}
            >
              {pickEvenly(xLabels, 6).map((label, i) => (
                <AtTypography key={`${label}-${i}`} variant="label" color="#8892A4">
                  {label}
                </AtTypography>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  },
);

OrAreaChart.displayName = 'OrAreaChart';
