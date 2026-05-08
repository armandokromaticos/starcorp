/**
 * Atom: AtProgressBar
 *
 * Horizontal progress bar with color fill.
 * Used in consolidated detail views.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';

interface AtProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  className?: string;
}

export const AtProgressBar = memo<AtProgressBarProps>(
  ({ progress, color = '#E8952E', trackColor = '#EBEBF0', height = 6, className }) => {
    const clampedProgress = Math.max(0, Math.min(1, progress));

    return (
      <View
        className={`w-full overflow-hidden ${className ?? ''}`}
        style={{
          height,
          backgroundColor: trackColor,
          borderRadius: height / 2,
          borderCurve: 'continuous' as const,
        }}
      >
        <View
          style={{
            width: `${clampedProgress * 100}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: height / 2,
            borderCurve: 'continuous' as const,
          }}
        />
      </View>
    );
  },
);

AtProgressBar.displayName = 'AtProgressBar';
