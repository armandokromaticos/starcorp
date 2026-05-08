/**
 * Molecule: MlClientRow
 *
 * Single client row with color dot, name, revenue, and delta.
 * Fixed: revenue and deltaPercent now rendered (were dead props).
 * Migrated to NativeWind + AtTypography.
 */

import React, { memo } from 'react';
import { Pressable, View } from '@/src/tw';
import { AtTypography } from '@/src/components/atoms/at-typography';
import { AtColorDot } from '@/src/components/atoms/at-color-dot';
import { AtDeltaIndicator } from '@/src/components/atoms/at-delta-indicator';
import { formatCurrency } from '@/src/utils/currency';

interface MlClientRowProps {
  name: string;
  color: string;
  revenue?: number;
  deltaPercent?: number;
  onPress?: () => void;
  selected?: boolean;
  className?: string;
}

export const MlClientRow = memo<MlClientRowProps>(
  ({ name, color, revenue, deltaPercent, onPress, selected = false, className }) => {
    return (
      <Pressable
        onPress={onPress}
        className={`flex-row items-center gap-3 py-2 px-4 rounded-md ${
          selected ? 'bg-bg-secondary' : ''
        } ${className ?? ''}`}
      >
        <AtColorDot color={color} size="lg" shape="square" gradient />

        <View className="flex-1 gap-0.5">
          <AtTypography variant="body" numberOfLines={1}>
            {name}
          </AtTypography>
          {revenue != null && (
            <AtTypography variant="caption" color="#4A5568">
              {formatCurrency(revenue, { currency: 'USD', compact: false })}
            </AtTypography>
          )}
        </View>

        {deltaPercent != null && (
          <AtDeltaIndicator value={deltaPercent} size="sm" />
        )}
      </Pressable>
    );
  },
);

MlClientRow.displayName = 'MlClientRow';
