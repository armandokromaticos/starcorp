/**
 * Organism: OrThirdPartiesDonutCard
 *
 * Pinned chart card for the terceros (groupId) detail screen.
 *
 * Layout (top → bottom):
 *   - Section title centered above the card
 *   - White card:
 *       • Header row: group name (left) + soft delta chip (right)
 *       • Large metric value
 *       • Donut — empty center by default; shows % of the tapped slice
 *       • 2-column legend grid below (dot + name + amount). Tapping a
 *         legend row also selects that slice.
 *
 * Tap the same slice/row again (or the center of the donut) to deselect.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtMetricValue } from '@/src/components/atoms/at-metric-value';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { DonutChart } from '@/src/components/charts/donut-chart';
import { CLIENT_LEGEND_GRADIENTS } from '@/src/theme/gradients';
import { formatCurrency } from '@/src/utils/currency';
import type { ThirdParty } from '@/src/types/domain.types';

interface OrThirdPartiesDonutCardProps {
  sectionTitle: string;
  groupLabel: string;
  groupAmount: number;
  deltaPercent: number;
  data: ThirdParty[];
  selectedId?: string | null;
  onSelectChange?: (id: string | null) => void;
}

const DONUT_SIZE = 160;
const TOP_N = 8;
export const OTROS_TERCERO_ID = '__otros__';
const OTROS_COLOR = '#C94E80';
const OTROS_INNER = '#531D40';

export const OrThirdPartiesDonutCard = memo<OrThirdPartiesDonutCardProps>(
  ({
    sectionTitle,
    groupLabel,
    groupAmount,
    deltaPercent,
    data,
    selectedId = null,
    onSelectChange,
  }) => {
    const total = data.reduce((s, t) => s + t.amount, 0);
    const topN = data.slice(0, TOP_N);
    const rest = data.slice(TOP_N);
    const restSum = rest.reduce((s, t) => s + t.amount, 0);
    const hasOtros = rest.length > 0 && restSum > 0;

    // Resolve which slice is "selected" visually:
    // - selectedId === OTROS_TERCERO_ID → the Otros slice
    // - selectedId matches a top-N item → its index
    // - selectedId matches a beyond-top-N item → Otros slice (so the list+donut still feel connected)
    const effectiveIndex = (() => {
      if (!selectedId) return null;
      if (selectedId === OTROS_TERCERO_ID) return hasOtros ? TOP_N : null;
      const idx = data.findIndex((t) => t.id === selectedId);
      if (idx < 0) return null;
      if (idx < TOP_N) return idx;
      return hasOtros ? TOP_N : null;
    })();

    const slices = [
      ...topN.map((tp, i) => {
        const grad = CLIENT_LEGEND_GRADIENTS[i % CLIENT_LEGEND_GRADIENTS.length];
        return {
          value: tp.amount,
          color: grad[0],
          innerColor: grad[1],
          label: tp.name,
        };
      }),
      ...(hasOtros
        ? [
            {
              value: restSum,
              color: OTROS_COLOR,
              innerColor: OTROS_INNER,
              label: 'Otros',
            },
          ]
        : []),
    ];

    const toggle = (i: number) => {
      const targetId = i < TOP_N ? topN[i]?.id : OTROS_TERCERO_ID;
      if (!targetId) return;
      onSelectChange?.(selectedId === targetId ? null : targetId);
    };

    const selectedSliceValue =
      effectiveIndex != null
        ? effectiveIndex < TOP_N
          ? topN[effectiveIndex].amount
          : restSum
        : null;
    const selectedPct =
      selectedSliceValue != null && total > 0
        ? (selectedSliceValue / total) * 100
        : null;

    return (
      <View className="gap-3">
        <AtTypography variant="h3" className="px-4 text-center">
          {sectionTitle}
        </AtTypography>

        <View
          className="bg-bg-card mx-4 rounded-lg p-4 gap-3"
          style={{
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.08)',
            boxShadow:
              '0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Header row */}
          <View className="flex-row items-center justify-between">
            <AtTypography
              variant="captionBold"
              color="#1A1F36"
              numberOfLines={1}
              className="flex-1 mr-2"
            >
              {groupLabel}
            </AtTypography>
            <AtDeltaIndicator
              value={deltaPercent}
              size="sm"
              appearance="soft"
            />
          </View>

          {/* Large metric */}
          <AtMetricValue value={groupAmount} size="lg" />

          {/* Donut: empty center by default; % shown when a slice is tapped */}
          <View style={{ alignSelf: 'center' }}>
            <DonutChart
              data={slices}
              size={DONUT_SIZE}
              innerRadius={0.6}
              padAngle={2}
              onSlicePress={toggle}
              selectedIndex={effectiveIndex}
            >
              {selectedPct != null && (
                <AtTypography
                  variant="h2"
                  color="#1A1F36"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {`${selectedPct.toFixed(1)}%`}
                </AtTypography>
              )}
            </DonutChart>
          </View>

          {/* Selected legend: name + monto of whatever is currently selected
              (top-N tercero, the Otros bucket, or a beyond-top-N tercero) */}
          {selectedId != null && (() => {
            const isOtros = selectedId === OTROS_TERCERO_ID;
            const tercero = !isOtros
              ? data.find((t) => t.id === selectedId)
              : null;
            if (!isOtros && !tercero) return null;

            const dotColor = isOtros
              ? OTROS_COLOR
              : effectiveIndex != null && effectiveIndex < TOP_N
                ? CLIENT_LEGEND_GRADIENTS[
                    effectiveIndex % CLIENT_LEGEND_GRADIENTS.length
                  ][0]
                : OTROS_COLOR;
            const name = isOtros ? `Otros (${rest.length})` : tercero!.name;
            const amount = isOtros ? restSum : tercero!.amount;

            return (
              <Pressable
                onPress={() => onSelectChange?.(null)}
                className="flex-row items-center justify-center gap-2 mt-1"
                style={{ paddingVertical: 6 }}
              >
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: dotColor,
                  }}
                />
                <AtTypography
                  variant="bodyBold"
                  color="#1A1F36"
                  numberOfLines={1}
                >
                  {name}
                </AtTypography>
                <AtTypography
                  variant="caption"
                  color="#8892A4"
                  style={{ fontVariant: ['tabular-nums'] }}
                >
                  {formatCurrency(amount)}
                </AtTypography>
              </Pressable>
            );
          })()}
        </View>
      </View>
    );
  },
);

OrThirdPartiesDonutCard.displayName = 'OrThirdPartiesDonutCard';
