/**
 * Chart: AreaChart
 *
 * Lightweight area chart built with react-native-svg.
 * Supports both smooth (Catmull-Rom) and sharp (polyline) rendering and
 * optional multi-stop linear gradient fills.
 */

import React, { memo, useMemo } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

export interface AreaGradientStop {
  offset: number;
  color: string;
  opacity?: number;
}

export interface AreaGradient {
  stops: AreaGradientStop[];
  direction?: 'vertical' | 'horizontal';
}

interface AreaChartProps {
  data: number[];
  width: number;
  height: number;
  color: string;
  fillOpacity?: number;
  strokeWidth?: number;
  gradientId?: string;
  smooth?: boolean;
  fillGradient?: AreaGradient;
  strokeOpacity?: number;
}

function buildPath(
  data: number[],
  width: number,
  height: number,
  smooth: boolean,
): string {
  if (data.length < 2) return '';

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height * 0.85 - height * 0.05,
  }));

  if (!smooth) {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export const AreaChart = memo<AreaChartProps>(
  ({
    data,
    width,
    height,
    color,
    fillOpacity = 0.15,
    strokeWidth = 2,
    gradientId = 'areaGrad',
    smooth = true,
    fillGradient,
    strokeOpacity = 1,
  }) => {
    const linePath = useMemo(
      () => buildPath(data, width, height, smooth),
      [data, width, height, smooth],
    );

    const areaPath = useMemo(() => {
      if (!linePath) return '';
      return `${linePath} L ${width} ${height} L 0 ${height} Z`;
    }, [linePath, width, height]);

    const stops = useMemo<AreaGradientStop[]>(
      () =>
        fillGradient?.stops ?? [
          { offset: 0, color, opacity: fillOpacity },
          { offset: 1, color, opacity: 0.01 },
        ],
      [fillGradient, color, fillOpacity],
    );

    const horizontal = fillGradient?.direction === 'horizontal';

    if (data.length < 2) return null;

    return (
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient
            id={gradientId}
            x1="0"
            y1="0"
            x2={horizontal ? '1' : '0'}
            y2={horizontal ? '0' : '1'}
          >
            {stops.map((s, i) => (
              <Stop
                key={i}
                offset={s.offset}
                stopColor={s.color}
                stopOpacity={s.opacity ?? 1}
              />
            ))}
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradientId})`} />
        <Path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeOpacity={strokeOpacity}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  },
);

AreaChart.displayName = 'AreaChart';
