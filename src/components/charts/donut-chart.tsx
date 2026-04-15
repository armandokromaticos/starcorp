/**
 * Chart: DonutChart
 *
 * Lightweight donut/pie chart built with react-native-svg.
 * No native dependencies beyond react-native-svg (included in Expo Go).
 */

import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

interface DonutSlice {
  value: number;
  color: string;
  label?: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size: number;
  innerRadius?: number;
  padAngle?: number;
  children?: React.ReactNode;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): { x: number; y: number } {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, endAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 1 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export const DonutChart = memo<DonutChartProps>(
  ({ data, size, innerRadius = 0.55, padAngle = 2, children }) => {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const innerR = outerR * innerRadius;

    const arcs = useMemo(() => {
      const total = data.reduce((sum, d) => sum + d.value, 0);
      if (total === 0) return [];

      let currentAngle = 0;
      return data.map((slice) => {
        const sliceAngle = (slice.value / total) * 360;
        const startAngle = currentAngle + padAngle / 2;
        const endAngle = currentAngle + sliceAngle - padAngle / 2;
        currentAngle += sliceAngle;

        return {
          path: describeArc(cx, cy, outerR, innerR, startAngle, endAngle),
          color: slice.color,
          label: slice.label,
        };
      });
    }, [data, cx, cy, outerR, innerR, padAngle]);

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G>
            {arcs.map((arc, i) => (
              <Path key={i} d={arc.path} fill={arc.color} />
            ))}
          </G>
        </Svg>
        {/* Center content overlay */}
        {children && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {children}
          </View>
        )}
      </View>
    );
  },
);

DonutChart.displayName = 'DonutChart';
