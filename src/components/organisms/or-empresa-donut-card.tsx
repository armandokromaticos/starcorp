/**
 * Organism: OrEmpresaDonutCard
 *
 * Card blanca del detalle de compañía: header (título + chip de periodo),
 * valor total y donut con etiquetas flotantes por categoría (Honorarios,
 * Otros, Arrendamientos, Gastos de personal).
 *
 * Interactivo como el resto de donuts de la app: tap en un sector (o en su
 * etiqueta) lo selecciona, atenúa el resto y muestra su % en el centro.
 */

import React, { memo, useMemo, useState } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { DonutChart } from '@/src/components/charts/donut-chart';
import type { EmpresaCategory } from '@/src/types/empresas.types';

interface OrEmpresaDonutCardProps {
  title: string;
  periodLabel: string;
  total: number;
  categories: EmpresaCategory[];
}

interface PositionedLabel {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  side: 'left' | 'right';
}

function layoutLabels(
  data: EmpresaCategory[],
  cx: number,
  cy: number,
  labelRadius: number,
  minVerticalGap: number,
): PositionedLabel[] {
  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return [];

  let cursor = 0;
  const items: PositionedLabel[] = data.map((slice) => {
    const sliceAngle = (slice.amount / total) * 360;
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

  (['left', 'right'] as const).forEach((side) => {
    const group = items.filter((i) => i.side === side).sort((a, b) => a.y - b.y);
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

const DONUT_SIZE = 150;
const MAX_LABEL_WIDTH = 110;

export const OrEmpresaDonutCard = memo<OrEmpresaDonutCardProps>(
  ({ title, periodLabel, total, categories }) => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const containerSize = DONUT_SIZE + 140;
    const cx = containerSize / 2;
    const cy = containerSize / 2;
    const labelRadius = DONUT_SIZE / 2 + 38;

    const labels = useMemo(
      () => layoutLabels(categories, cx, cy, labelRadius, 32),
      [categories, cx, cy, labelRadius],
    );

    const sumTotal = useMemo(
      () => categories.reduce((s, c) => s + c.amount, 0),
      [categories],
    );

    const selectedIndex = useMemo(() => {
      if (!selectedId) return null;
      const i = categories.findIndex((c) => c.id === selectedId);
      return i >= 0 ? i : null;
    }, [categories, selectedId]);

    const selectedPct = useMemo(() => {
      if (selectedIndex == null || sumTotal === 0) return null;
      return (categories[selectedIndex].amount / sumTotal) * 100;
    }, [categories, selectedIndex, sumTotal]);

    const toggle = (id: string) =>
      setSelectedId((prev) => (prev === id ? null : id));

    return (
      <View
        className="bg-bg-card rounded-lg px-3 py-4 gap-2"
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        {/* Header: título + chip de periodo */}
        <View className="flex-row items-center gap-2">
          <AtTypography variant="bodyBold" color="#1A1F36">
            {title}
          </AtTypography>
          <View
            className="rounded-full bg-bg-secondary px-3 py-1"
            style={{ borderCurve: 'continuous' }}
          >
            <AtTypography variant="caption" color="#4A5568">
              {periodLabel}
            </AtTypography>
          </View>
        </View>

        {/* Valor total */}
        <AtMetricValue value={total} size="md" color="#1A1F36" />

        {/* Donut + etiquetas flotantes */}
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
              left: (containerSize - DONUT_SIZE) / 2,
              top: (containerSize - DONUT_SIZE) / 2,
            }}
          >
            <DonutChart
              data={categories.map((c) => ({
                value: c.amount,
                color: c.color,
                label: c.label,
              }))}
              size={DONUT_SIZE}
              innerRadius={0.62}
              padAngle={2}
              onSlicePress={(i) => {
                const id = categories[i]?.id;
                if (id) toggle(id);
              }}
              selectedIndex={selectedIndex}
            >
              {selectedPct != null && (
                <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
                  <AtTypography
                    variant="metricSmall"
                    color="#1A1F36"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {`${selectedPct.toFixed(1)}%`}
                  </AtTypography>
                </View>
              )}
            </DonutChart>
          </View>

          {labels.map((lbl) => {
            const dimmed = selectedId != null && lbl.id !== selectedId;
            return (
              <View
                key={lbl.id}
                style={{
                  position: 'absolute',
                  left: lbl.side === 'right' ? lbl.x : lbl.x - MAX_LABEL_WIDTH,
                  top: lbl.y - 12,
                  width: MAX_LABEL_WIDTH,
                  alignItems: lbl.side === 'right' ? 'flex-start' : 'flex-end',
                }}
              >
                <Pressable onPress={() => toggle(lbl.id)} hitSlop={4}>
                  <View
                    style={{
                      backgroundColor: lbl.color,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 6,
                      borderCurve: 'continuous',
                      maxWidth: MAX_LABEL_WIDTH,
                      opacity: dimmed ? 0.4 : 1,
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
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);

OrEmpresaDonutCard.displayName = 'OrEmpresaDonutCard';
