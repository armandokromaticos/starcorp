/**
 * Organism: OrThirdPartiesDonutCard
 *
 * Pinned chart card for the terceros (groupId) detail screen.
 * Layout (top → bottom):
 *   - Section title ("Costos administrativos") centered above the card
 *   - White card:
 *       • Header row: group name (left) + soft delta chip (right)
 *       • Large metric value
 *       • Donut chart with floating colored-tag labels per tercero
 *
 * Each slice/tag uses the CLIENT_LEGEND_GRADIENTS palette.
 * Label layout uses the same anti-collision algorithm as OrCarteraDonut.
 */

import React, { memo, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { DonutChart } from '@/src/components/charts/donut-chart';
import { CLIENT_LEGEND_GRADIENTS } from '@/src/theme/gradients';
import type { ThirdParty } from '@/src/types/domain.types';

interface PositionedLabel {
  id: string;
  label: string;
  tagColor: string;
  x: number;
  y: number;
  side: 'left' | 'right';
}

function layoutLabels(
  data: ThirdParty[],
  cx: number,
  cy: number,
  labelRadius: number,
  minVerticalGap: number,
): PositionedLabel[] {
  const total = data.reduce((s, d) => s + d.amount, 0);
  if (total === 0) return [];

  let cursor = 0;
  const items = data.map((tp, i) => {
    const sliceAngle = (tp.amount / total) * 360;
    const mid = cursor + sliceAngle / 2;
    cursor += sliceAngle;
    const angleRad = ((mid - 90) * Math.PI) / 180;
    const x = cx + labelRadius * Math.cos(angleRad);
    const y = cy + labelRadius * Math.sin(angleRad);
    const grad = CLIENT_LEGEND_GRADIENTS[i % CLIENT_LEGEND_GRADIENTS.length];
    return {
      id: tp.id,
      label: tp.name,
      tagColor: grad[0],
      x,
      y,
      side: (x >= cx ? 'right' : 'left') as 'right' | 'left',
    };
  });

  // Simple per-side anti-collision: push overlapping labels down
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

interface OrThirdPartiesDonutCardProps {
  sectionTitle: string;
  groupLabel: string;
  groupAmount: number;
  deltaPercent: number;
  data: ThirdParty[];
}

export const OrThirdPartiesDonutCard = memo<OrThirdPartiesDonutCardProps>(
  ({ sectionTitle, groupLabel, groupAmount, deltaPercent, data }) => {
    const { width: screenWidth } = useWindowDimensions();
    // card: mx-4 (8+8) + p-4 (16+16) = 48px total horizontal insets
    const cardInnerWidth = screenWidth - 48;

    const sliced = data.slice(0, 8);

    const donutSize = 180;
    const containerSize = Math.min(donutSize + 160, cardInnerWidth);
    const cx = containerSize / 2;
    const cy = containerSize / 2;
    const labelRadius = donutSize / 2 + 48;
    const minVerticalGap = 30;

    const slices = sliced.map((tp, i) => {
      const grad = CLIENT_LEGEND_GRADIENTS[i % CLIENT_LEGEND_GRADIENTS.length];
      return {
        value: tp.amount,
        color: grad[0],
        innerColor: grad[1],
        label: tp.name,
      };
    });

    const labels = useMemo(
      () => layoutLabels(sliced, cx, cy, labelRadius, minVerticalGap),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [sliced.map((t) => t.id).join(','), cx, cy, labelRadius],
    );

    return (
      <View className="gap-3">
        {/* Section title — centered above the card, matching or-cost-groups-chart-card */}
        <AtTypography variant="h3" className="px-4 text-center">
          {sectionTitle}
        </AtTypography>

        <View
          className="bg-bg-card mx-4 rounded-lg p-4 gap-2"
          style={{
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.08)',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header row: group name + soft delta chip */}
          <View className="flex-row items-center justify-between">
            <AtTypography variant="captionBold" color="#1A1F36" numberOfLines={1} className="flex-1 mr-2">
              {groupLabel}
            </AtTypography>
            <AtDeltaIndicator value={deltaPercent} size="sm" appearance="soft" />
          </View>

          {/* Large metric */}
          <AtMetricValue value={groupAmount} size="lg" />

          {/* Donut with floating labels */}
          <View
            style={{
              width: containerSize,
              height: containerSize,
              alignSelf: 'center',
              position: 'relative',
            }}
          >
            {/* Donut centered inside the container */}
            <View
              style={{
                position: 'absolute',
                left: (containerSize - donutSize) / 2,
                top: (containerSize - donutSize) / 2,
              }}
            >
              <DonutChart
                data={slices}
                size={donutSize}
                innerRadius={0.6}
                padAngle={2}
              />
            </View>

            {/* Floating tag labels */}
            {labels.map((lbl) => {
              const maxLabelWidth = 110;
              const edgePad = 4;
              const rawLeft = lbl.side === 'right' ? lbl.x : lbl.x - maxLabelWidth;
              const clampedLeft = Math.max(
                edgePad,
                Math.min(rawLeft, containerSize - maxLabelWidth - edgePad),
              );
              return (
                <View
                  key={lbl.id}
                  style={{
                    position: 'absolute',
                    left: clampedLeft,
                    top: lbl.y - 12,
                    width: maxLabelWidth,
                    alignItems: lbl.side === 'right' ? 'flex-start' : 'flex-end',
                  }}
                >
                  <View
                    style={{
                      backgroundColor: lbl.tagColor,
                      paddingHorizontal: 7,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderCurve: 'continuous',
                      maxWidth: maxLabelWidth,
                    }}
                  >
                    <AtTypography variant="caption" color="#FFFFFF" numberOfLines={2}>
                      {lbl.label}
                    </AtTypography>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  },
);

OrThirdPartiesDonutCard.displayName = 'OrThirdPartiesDonutCard';
