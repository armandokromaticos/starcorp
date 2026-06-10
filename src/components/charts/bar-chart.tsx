/**
 * Chart: BarChart
 *
 * Vertical bar chart built with react-native-svg.
 * Each bar renders as a rounded-top rect with a per-bar vertical
 * LinearGradient (bright → darker) to give a glossy depth.
 */

import React, { memo, useMemo } from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { darkenHex } from '@/src/utils/color';

export interface BarDatum {
  value: number;
  color: string;
  darkColor?: string;
  /**
   * Degradado completo (multi-stop, primer color arriba → último abajo).
   * Si se provee, tiene prioridad sobre `color`/`darkColor`.
   */
  gradient?: readonly string[];
}

interface BarChartProps {
  data: BarDatum[];
  width: number;
  height: number;
  gap?: number;
  cornerRadius?: number;
  baseline?: number;
}

export const BarChart = memo<BarChartProps>(
  ({ data, width, height, gap = 10, cornerRadius = 6, baseline = 4 }) => {
    const { bars, max } = useMemo(() => {
      const m = Math.max(...data.map((d) => d.value), 1);
      const barWidth =
        data.length > 0 ? (width - gap * (data.length - 1)) / data.length : 0;

      return {
        max: m,
        bars: data.map((d, i) => {
          const h = Math.max(baseline, (d.value / m) * height);
          const stops =
            d.gradient && d.gradient.length >= 2
              ? d.gradient
              : [d.color, d.darkColor ?? darkenHex(d.color, 0.72)];
          return {
            x: i * (barWidth + gap),
            y: height - h,
            w: barWidth,
            h,
            stops,
            gradId: `bar-grad-${i}`,
          };
        }),
      };
    }, [data, width, height, gap, baseline]);

    if (data.length === 0 || max === 0) return null;

    return (
      <Svg width={width} height={height}>
        <Defs>
          {bars.map((b) => (
            <LinearGradient
              key={b.gradId}
              id={b.gradId}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              {b.stops.map((c, si) => (
                <Stop
                  key={si}
                  offset={b.stops.length > 1 ? si / (b.stops.length - 1) : 0}
                  stopColor={c}
                />
              ))}
            </LinearGradient>
          ))}
        </Defs>
        {bars.map((b, i) => (
          <Rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={cornerRadius}
            ry={cornerRadius}
            fill={`url(#${b.gradId})`}
          />
        ))}
      </Svg>
    );
  },
);

BarChart.displayName = 'BarChart';
