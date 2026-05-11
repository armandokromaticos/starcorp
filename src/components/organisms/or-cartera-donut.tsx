/**
 * Organism: OrCarteraDonut
 *
 * Card con donut chart de distribución de cartera por cliente y
 * etiquetas flotantes (chips coloreados) posicionadas según el ángulo
 * medio de cada slice.
 */

import React, { memo, useMemo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { DonutChart } from '@/src/components/charts/donut-chart';

interface DonutSlice {
  id: string;
  value: number;
  color: string;
  label: string;
}

interface OrCarteraDonutProps {
  title: string;
  data: DonutSlice[];
  showCenterPercent?: boolean;
  centerPercentText?: string;
  donutSize?: number;
  className?: string;
}

interface PositionedLabel {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  side: 'left' | 'right';
}

/**
 * Distribuye las labels en un círculo externo. Para evitar el
 * solapamiento básico, ordena por ángulo y separa verticalmente las
 * que caen demasiado cerca en y.
 */
function layoutLabels(
  data: DonutSlice[],
  cx: number,
  cy: number,
  labelRadius: number,
  minVerticalGap: number,
): PositionedLabel[] {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return [];

  let cursor = 0;
  const items = data.map((slice) => {
    const sliceAngle = (slice.value / total) * 360;
    const mid = cursor + sliceAngle / 2;
    cursor += sliceAngle;
    const angleRad = ((mid - 90) * Math.PI) / 180;
    const x = cx + labelRadius * Math.cos(angleRad);
    const y = cy + labelRadius * Math.sin(angleRad);
    return {
      id: slice.id,
      label: slice.label,
      color: slice.color,
      x,
      y,
      side: (x >= cx ? 'right' : 'left') as 'right' | 'left',
    };
  });

  // anti-collision sencillo: por lado, ordenar por y y empujar hacia abajo
  (['left', 'right'] as const).forEach((side) => {
    const group = items
      .filter((i) => i.side === side)
      .sort((a, b) => a.y - b.y);
    for (let i = 1; i < group.length; i++) {
      const prev = group[i - 1];
      const cur = group[i];
      if (cur.y - prev.y < minVerticalGap) {
        cur.y = prev.y + minVerticalGap;
      }
    }
  });

  return items;
}

export const OrCarteraDonut = memo<OrCarteraDonutProps>(
  ({ title, data, showCenterPercent, centerPercentText, donutSize = 180, className }) => {
    const containerSize = donutSize + 140;
    const cx = containerSize / 2;
    const cy = containerSize / 2;
    const labelRadius = donutSize / 2 + 40;
    const minVerticalGap = 32;

    const labels = useMemo(
      () => layoutLabels(data, cx, cy, labelRadius, minVerticalGap),
      [data, cx, cy, labelRadius],
    );

    return (
      <View
        className={`bg-bg-card rounded-lg px-3 py-4 gap-3 ${className ?? ''}`}
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <AtTypography variant="bodyBold">{title}</AtTypography>

        <View
          style={{
            width: containerSize,
            height: containerSize,
            alignSelf: 'center',
            position: 'relative',
          }}
        >
          <View
            style={{
              position: 'absolute',
              left: (containerSize - donutSize) / 2,
              top: (containerSize - donutSize) / 2,
            }}
          >
            <DonutChart
              data={data.map((d) => ({ value: d.value, color: d.color, label: d.label }))}
              size={donutSize}
              innerRadius={0.62}
              padAngle={2}
            >
              {showCenterPercent && (
                <AtTypography variant="metricSmall">
                  {centerPercentText ?? '50%'}
                </AtTypography>
              )}
            </DonutChart>
          </View>

          {labels.map((lbl) => {
            const maxLabelWidth = 110;
            return (
              <View
                key={lbl.id}
                style={{
                  position: 'absolute',
                  left: lbl.side === 'right' ? lbl.x : lbl.x - maxLabelWidth,
                  top: lbl.y - 12,
                  width: maxLabelWidth,
                  alignItems: lbl.side === 'right' ? 'flex-start' : 'flex-end',
                }}
              >
                <View
                  style={{
                    backgroundColor: lbl.color,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    borderCurve: 'continuous',
                    maxWidth: maxLabelWidth,
                  }}
                >
                  <AtTypography
                    variant="caption"
                    color="#FFFFFF"
                    numberOfLines={2}
                  >
                    {lbl.label}
                  </AtTypography>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);

OrCarteraDonut.displayName = 'OrCarteraDonut';
