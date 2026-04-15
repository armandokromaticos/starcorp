/**
 * Atom: AtStatusBadge
 *
 * Pill-shaped label with semantic coloring.
 * Used for: "Hoy", status indicators, period labels.
 * Migrated to NativeWind + AtTypography.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { AtTypography } from './at-typography';

export type BadgeVariant = 'positive' | 'negative' | 'neutral' | 'accent';

interface AtStatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const variantClasses: Record<BadgeVariant, { bg: string; color: string }> = {
  positive: { bg: 'bg-positive-light', color: '#38A169' },
  negative: { bg: 'bg-negative-light', color: '#E53E3E' },
  neutral: { bg: 'bg-bg-tertiary', color: '#4A5568' },
  accent: { bg: 'bg-accent', color: '#FFFFFF' },
};

export const AtStatusBadge = memo<AtStatusBadgeProps>(
  ({ label, variant = 'neutral', size = 'md' }) => {
    const styles = variantClasses[variant];
    const isSmall = size === 'sm';

    return (
      <View
        className={`self-start rounded-full ${styles.bg} ${
          isSmall ? 'px-2 py-0.5' : 'px-3 py-1'
        }`}
        style={{ borderCurve: 'continuous' }}
      >
        <AtTypography
          variant={isSmall ? 'label' : 'captionBold'}
          color={styles.color}
          style={{ letterSpacing: 0.2 }}
        >
          {label}
        </AtTypography>
      </View>
    );
  },
);

AtStatusBadge.displayName = 'AtStatusBadge';
