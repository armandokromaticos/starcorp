/**
 * Molecule: MlMetricBar
 *
 * Gradient pill row used in the client detail screen. The pill width is
 * proportional to `widthPercent` (clamped 0.18..0.7 so the right value
 * never overflows). The right side shows arrow + amount, with the
 * arrow coloured by `deltaPositive` and the amount in dark navy. When
 * `selected` is true the whole row gets a thin blue outline matching
 * the pill curvature.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { LinearGradient } from 'expo-linear-gradient';
import { AtIcon } from '@/src/components/atoms/at-icon';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { formatCurrency } from '@/src/utils/currency';
import type { MaterialIcons } from '@expo/vector-icons';

type MaterialIconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface MlMetricBarProps {
  label: string;
  icon: MaterialIconName;
  /** When null, the right side renders "—" without arrow (placeholder mode). */
  value: number | null;
  deltaPositive: boolean;
  gradient: readonly [string, string, ...string[]];
  widthPercent: number;
  selected?: boolean;
  onPress?: () => void;
  /** Currency by default; 'percent' renders e.g. "42.3%". */
  valueFormat?: 'currency' | 'percent';
}

function formatPercent(v: number): string {
  return `${v.toFixed(1)}%`;
}

const MIN_WIDTH = 0.18;
const MAX_WIDTH = 0.7;
// Below this pill width, the label is rendered outside the gradient (in
// dark text on the white area) so it never gets clipped.
const LABEL_OUTSIDE_THRESHOLD = 0.3;

export const MlMetricBar = memo<MlMetricBarProps>(
  ({
    label,
    icon,
    value,
    deltaPositive,
    gradient,
    widthPercent,
    selected = false,
    onPress,
    valueFormat = 'currency',
  }) => {
    const isPlaceholder = value === null;
    const arrow = deltaPositive ? '↗' : '↘';
    const arrowColor = deltaPositive ? '#22C55E' : '#EF4444';
    const pillFlex = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, widthPercent));
    const rightFlex = 1 - pillFlex;
    const labelOutside = pillFlex < LABEL_OUTSIDE_THRESHOLD;

    return (
      <Pressable
        onPress={onPress}
        style={{
          padding: 4,
          borderWidth: 1.5,
          borderColor: selected ? '#6366F1' : 'transparent',
          borderRadius: 22,
          borderCurve: 'continuous',
        }}
      >
        <View className="flex-row items-center">
          <View style={{ flex: pillFlex }}>
            <LinearGradient
              colors={
                gradient as unknown as readonly [string, string, ...string[]]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 18,
                paddingVertical: 16,
                borderRadius: 14,
                borderCurve: 'continuous',
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#FFFFFF',
                }}
              />
              <AtIcon name={icon} size={22} color="#FFFFFF" />
              {!labelOutside && (
                <AtTypography
                  variant="h3"
                  color="#FFFFFF"
                  numberOfLines={1}
                  className="flex-shrink"
                >
                  {label}
                </AtTypography>
              )}
            </LinearGradient>
          </View>

          <View
            style={{
              flex: rightFlex,
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 12,
              paddingRight: 4,
            }}
          >
            {labelOutside && (
              <AtTypography
                variant="h3"
                color="#1A1F36"
                numberOfLines={1}
                style={{ flexShrink: 1, marginRight: 8 }}
              >
                {label}
              </AtTypography>
            )}
            <View
              className="flex-row items-center gap-2"
              style={{ marginLeft: 'auto' }}
            >
              {!isPlaceholder && (
                <AtTypography variant="bodyBold" color={arrowColor}>
                  {arrow}
                </AtTypography>
              )}
              <AtTypography
                variant="bodyBold"
                color={isPlaceholder ? '#8892A4' : '#1A1F36'}
                style={{ fontVariant: ['tabular-nums'] }}
                numberOfLines={1}
              >
                {isPlaceholder
                  ? '—'
                  : valueFormat === 'percent'
                  ? formatPercent(value)
                  : formatCurrency(value)}
              </AtTypography>
            </View>
          </View>
        </View>
      </Pressable>
    );
  },
);

MlMetricBar.displayName = 'MlMetricBar';
