/**
 * Chart: DonutChart
 *
 * Lightweight donut/pie built with react-native-svg.
 * Each slice renders two concentric bands — outer wider band and a
 * thinner inner "shadow" band. Both bands use per-slice vertical
 * LinearGradients (bright → darker) to give each color a glossy depth.
 *
 * Pass `centerBackground` to fill the hole with a radial navy gradient
 * (the "bubble" behind the total in the top clients card).
 */

import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Path,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Circle,
} from 'react-native-svg';
import { darkenHex } from '@/src/utils/color';

interface DonutSlice {
  value: number;
  color: string;
  innerColor?: string;
  label?: string;
}

export interface DonutCenterBackground {
  from: string;
  to: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  size: number;
  innerRadius?: number;
  padAngle?: number;
  ringSplit?: number;
  centerBackground?: DonutCenterBackground;
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
  ({
    data,
    size,
    innerRadius = 0.55,
    padAngle = 2,
    ringSplit = 0.22,
    centerBackground,
    children,
  }) => {
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size / 2 - 4;
    const holeR = outerR * innerRadius;
    const midR = holeR + (outerR - holeR) * ringSplit;

    const slices = useMemo(() => {
      const total = data.reduce((sum, d) => sum + d.value, 0);
      if (total === 0) return [];

      let currentAngle = 0;
      return data.map((slice, i) => {
        const sliceAngle = (slice.value / total) * 360;
        const startAngle = currentAngle + padAngle / 2;
        const endAngle = currentAngle + sliceAngle - padAngle / 2;
        currentAngle += sliceAngle;

        const base = slice.color;
        const inner = slice.innerColor ?? darkenHex(base, 0.55);

        return {
          startAngle,
          endAngle,
          outerTop: base,
          outerBottom: darkenHex(base, 0.82),
          innerTop: inner,
          innerBottom: darkenHex(inner, 0.78),
          outerGradId: `donut-outer-${i}`,
          innerGradId: `donut-inner-${i}`,
        };
      });
    }, [data, padAngle]);

    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Defs>
            {centerBackground && (
              <RadialGradient
                id="donutCenter"
                cx="50%"
                cy="42%"
                r="55%"
                fx="50%"
                fy="42%"
              >
                <Stop offset="0" stopColor={centerBackground.from} />
                <Stop offset="1" stopColor={centerBackground.to} />
              </RadialGradient>
            )}
            {slices.map((s) => (
              <React.Fragment key={s.outerGradId}>
                <LinearGradient
                  id={s.outerGradId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor={s.outerTop} />
                  <Stop offset="1" stopColor={s.outerBottom} />
                </LinearGradient>
                <LinearGradient
                  id={s.innerGradId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <Stop offset="0" stopColor={s.innerTop} />
                  <Stop offset="1" stopColor={s.innerBottom} />
                </LinearGradient>
              </React.Fragment>
            ))}
          </Defs>

          {/* Inner (shadow) thinner band */}
          <G>
            {slices.map((s, i) => (
              <Path
                key={`i-${i}`}
                d={describeArc(
                  cx,
                  cy,
                  midR,
                  holeR,
                  s.startAngle,
                  s.endAngle,
                )}
                fill={`url(#${s.innerGradId})`}
              />
            ))}
          </G>

          {/* Outer wider band */}
          <G>
            {slices.map((s, i) => (
              <Path
                key={`o-${i}`}
                d={describeArc(
                  cx,
                  cy,
                  outerR,
                  midR,
                  s.startAngle,
                  s.endAngle,
                )}
                fill={`url(#${s.outerGradId})`}
              />
            ))}
          </G>

          {centerBackground && (
            <Circle cx={cx} cy={cy} r={holeR} fill="url(#donutCenter)" />
          )}
        </Svg>

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
