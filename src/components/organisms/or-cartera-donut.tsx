/**
 * Organism: OrCarteraDonut
 *
 * Card con donut chart de distribución y etiquetas flotantes (chips
 * coloreados) posicionadas según el ángulo medio de cada slice.
 *
 * Soporta selección interactiva (tap en slice o en chip): cuando hay
 * selección, el resto de slices y labels se atenúan y en el centro
 * se muestra el porcentaje del slice seleccionado.
 */

import React, { memo, useMemo } from 'react';
import { Pressable, View } from '@/src/tw';
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
  headerBadge?: React.ReactNode;
  selectedId?: string | null;
  onSelectChange?: (id: string | null) => void;
  /**
   * 'floating' (default): chips coloreados alrededor del donut.
   * 'tap-only': sin chips; el slice seleccionado se muestra en el centro
   *   (nombre corto + %) y debajo como banner (dot + nombre + valor).
   */
  labelsMode?: 'floating' | 'tap-only';
  /** Cómo formatear el valor en el banner inferior (tap-only). */
  valueFormatter?: (value: number) => string;
  /** Hint cuando no hay slice seleccionado en modo tap-only. */
  emptyHint?: string;
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
  ({
    title,
    data,
    showCenterPercent,
    centerPercentText,
    donutSize = 180,
    className,
    headerBadge,
    selectedId = null,
    onSelectChange,
    labelsMode = 'floating',
    valueFormatter,
    emptyHint = 'Toca un sector para ver detalle',
  }) => {
    const isTapOnly = labelsMode === 'tap-only';
    const containerSize = isTapOnly ? donutSize : donutSize + 140;
    const cx = containerSize / 2;
    const cy = containerSize / 2;
    const labelRadius = donutSize / 2 + 40;
    const minVerticalGap = 32;

    const labels = useMemo(
      () =>
        isTapOnly
          ? []
          : layoutLabels(data, cx, cy, labelRadius, minVerticalGap),
      [isTapOnly, data, cx, cy, labelRadius],
    );

    const total = useMemo(
      () => data.reduce((s, d) => s + d.value, 0),
      [data],
    );

    const selectedIndex = useMemo(() => {
      if (!selectedId) return null;
      const i = data.findIndex((d) => d.id === selectedId);
      return i >= 0 ? i : null;
    }, [data, selectedId]);

    const selectedPct = useMemo(() => {
      if (selectedIndex == null || total === 0) return null;
      return (data[selectedIndex].value / total) * 100;
    }, [data, selectedIndex, total]);

    const handleSlicePress = (index: number) => {
      if (!onSelectChange) return;
      const sliceId = data[index]?.id;
      if (!sliceId) return;
      onSelectChange(selectedId === sliceId ? null : sliceId);
    };

    const handleLabelPress = (id: string) => {
      if (!onSelectChange) return;
      onSelectChange(selectedId === id ? null : id);
    };

    return (
      <View
        className={`bg-bg-card rounded-lg px-3 py-4 gap-3 ${className ?? ''}`}
        style={{
          borderCurve: 'continuous',
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
        }}
      >
        <View className="flex-row items-center justify-between gap-2">
          <AtTypography variant="bodyBold">{title}</AtTypography>
          {headerBadge}
        </View>

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
              data={data.map((d) => ({
                value: d.value,
                color: d.color,
                label: d.label,
              }))}
              size={donutSize}
              innerRadius={0.62}
              padAngle={2}
              onSlicePress={onSelectChange ? handleSlicePress : undefined}
              selectedIndex={selectedIndex}
            >
              {selectedPct != null ? (
                <View style={{ alignItems: 'center', paddingHorizontal: 12 }}>
                  <AtTypography
                    variant="metricSmall"
                    color="#1A1F36"
                    style={{ fontVariant: ['tabular-nums'] }}
                  >
                    {`${selectedPct.toFixed(1)}%`}
                  </AtTypography>
                </View>
              ) : (
                showCenterPercent && (
                  <AtTypography variant="metricSmall">
                    {centerPercentText ?? '50%'}
                  </AtTypography>
                )
              )}
            </DonutChart>
          </View>

          {labels.map((lbl) => {
            const maxLabelWidth = 110;
            const dimmed =
              selectedId != null && lbl.id !== selectedId;
            const chip = (
              <View
                style={{
                  backgroundColor: lbl.color,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 6,
                  borderCurve: 'continuous',
                  maxWidth: maxLabelWidth,
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
            );
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
                {onSelectChange ? (
                  <Pressable
                    onPress={() => handleLabelPress(lbl.id)}
                    hitSlop={4}
                  >
                    {chip}
                  </Pressable>
                ) : (
                  chip
                )}
              </View>
            );
          })}
        </View>

        {isTapOnly && (
          <View
            className="flex-row items-center justify-center gap-2"
            style={{ minHeight: 28 }}
          >
            {selectedIndex != null ? (
              <Pressable
                onPress={() => onSelectChange?.(null)}
                className="flex-row items-center gap-2"
                style={{ flexShrink: 1, maxWidth: '100%' }}
                hitSlop={6}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: data[selectedIndex].color,
                    flexShrink: 0,
                  }}
                />
                <AtTypography
                  variant="bodyBold"
                  color="#1A1F36"
                  numberOfLines={1}
                  style={{ flexShrink: 1 }}
                >
                  {data[selectedIndex].label}
                </AtTypography>
                <AtTypography
                  variant="caption"
                  color="#8892A4"
                  numberOfLines={1}
                  style={{ fontVariant: ['tabular-nums'], flexShrink: 0 }}
                >
                  {valueFormatter
                    ? valueFormatter(data[selectedIndex].value)
                    : data[selectedIndex].value.toLocaleString('es-VE')}
                </AtTypography>
              </Pressable>
            ) : (
              <AtTypography variant="caption" color="#8892A4">
                {emptyHint}
              </AtTypography>
            )}
          </View>
        )}
      </View>
    );
  },
);

OrCarteraDonut.displayName = 'OrCarteraDonut';
