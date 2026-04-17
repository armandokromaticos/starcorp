/**
 * Atom: AtDeltaIndicator
 *
 * Shows a percentage change with directional arrow and color coding.
 * `appearance="dark"` renders a dark navy chip with a bright green text —
 * matches the delta pill in the Empresas (Consolidado) mockup.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from './at-typography';
import { formatCompact } from '@/src/utils/number';

interface AtDeltaIndicatorProps {
  value: number;
  absolute?: number;
  size?: 'sm' | 'md';
  appearance?: 'soft' | 'dark';
}

const palette = {
  soft: {
    positiveBg: 'bg-positive-light',
    negativeBg: 'bg-negative-light',
    positiveText: '#38A169',
    negativeText: '#E53E3E',
  },
  dark: {
    positiveBg: '',
    negativeBg: '',
    positiveText: '#4ADE80',
    negativeText: '#FCA5A5',
  },
} as const;

export const AtDeltaIndicator = memo<AtDeltaIndicatorProps>(
  ({ value, absolute, size = 'md', appearance = 'soft' }) => {
    const isPositive = value >= 0;
    const arrow = isPositive ? '\u2197' : '\u2198';
    const variant = size === 'sm' ? 'label' : 'captionBold';
    const tones = palette[appearance];
    const textColor = isPositive ? tones.positiveText : tones.negativeText;
    const isDark = appearance === 'dark';

    const chipClass = isDark
      ? 'flex-row items-center px-2.5 py-1 rounded-lg gap-1'
      : `flex-row items-center px-2 py-0.5 rounded-md gap-0.5 ${
          isPositive ? tones.positiveBg : tones.negativeBg
        }`;

    return (
      <View className="flex-row items-center gap-1">
        <View
          className={chipClass}
          style={isDark ? { backgroundColor: '#0F1B2E' } : undefined}
        >
          <AtTypography variant={variant} color={textColor}>
            {arrow}
          </AtTypography>
          <AtTypography
            variant={variant}
            color={textColor}
            selectable
            style={{ fontVariant: ['tabular-nums'] }}
          >
            {Math.abs(value).toFixed(2)}%
          </AtTypography>
        </View>
        {absolute != null && (
          <AtTypography
            variant={variant}
            color={textColor}
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
