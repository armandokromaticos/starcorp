/**
 * Atom: AtDeltaIndicator
 *
 * Shows a percentage change with directional arrow and color coding.
 * Used for: 1,87% indicators in metric cards.
 * Migrated to NativeWind + AtTypography.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from './at-typography';
import { formatCompact } from '@/src/utils/number';

interface AtDeltaIndicatorProps {
  value: number;
  absolute?: number;
  size?: 'sm' | 'md';
}

export const AtDeltaIndicator = memo<AtDeltaIndicatorProps>(
  ({ value, absolute, size = 'md' }) => {
    const isPositive = value >= 0;
    const arrow = isPositive ? '\u2197' : '\u2198';
    const variant = size === 'sm' ? 'label' : 'captionBold';

    return (
      <View className="flex-row items-center gap-1">
        <View
          className={`flex-row items-center px-2 py-0.5 rounded-md gap-0.5 ${
            isPositive ? 'bg-positive-light' : 'bg-negative-light'
          }`}
        >
          <AtTypography
            variant={variant}
            color={isPositive ? '#38A169' : '#E53E3E'}
          >
            {arrow}
          </AtTypography>
          <AtTypography
            variant={variant}
            color={isPositive ? '#38A169' : '#E53E3E'}
            selectable
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {Math.abs(value).toFixed(2)}%
          </AtTypography>
        </View>
        {absolute != null && (
          <AtTypography
            variant={variant}
            color={isPositive ? '#38A169' : '#E53E3E'}
            selectable
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {isPositive ? '+' : ''}
            {formatCompact(absolute)}
          </AtTypography>
        )}
      </View>
    );
  },
);

AtDeltaIndicator.displayName = 'AtDeltaIndicator';
