/**
 * Atom: AtMetricValue
 *
 * Renders a formatted currency/number value with tabular-nums.
 * Uses AtTypography internally (eliminates duplicated sizeMap).
 * Migrated to NativeWind.
 */

import React, { memo } from 'react';
import { AtTypography, type TypographyVariant } from './at-typography';
import { formatCurrency } from '@/src/utils/currency';

interface AtMetricValueProps {
  value: number;
  size?: 'lg' | 'md' | 'sm';
  currency?: string;
  compact?: boolean;
  color?: string;
  className?: string;
}

const sizeToVariant: Record<string, TypographyVariant> = {
  lg: 'metric',
  md: 'metricSmall',
  sm: 'bodyBold',
};

export const AtMetricValue = memo<AtMetricValueProps>(
  ({ value, size = 'lg', currency = 'USD', compact = false, color, className }) => {
    return (
      <AtTypography
        variant={sizeToVariant[size]}
        color={color}
        selectable
        className={className}
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {formatCurrency(value, { currency, compact })}
      </AtTypography>
    );
  },
);

AtMetricValue.displayName = 'AtMetricValue';
