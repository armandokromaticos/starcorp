/**
 * Atom: AtColorDot
 *
 * Small colored square/circle indicator for lists.
 * Used in client lists, category lists, terceros lists.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';

type DotShape = 'square' | 'circle';
type DotSize = 'sm' | 'md' | 'lg';

interface AtColorDotProps {
  color: string;
  shape?: DotShape;
  size?: DotSize;
  className?: string;
}

const sizeMap: Record<DotSize, number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const AtColorDot = memo<AtColorDotProps>(
  ({ color, shape = 'square', size = 'md', className }) => {
    const dimension = sizeMap[size];

    return (
      <View
        className={className}
        style={{
          width: dimension,
          height: dimension,
          backgroundColor: color,
          borderRadius: shape === 'circle' ? dimension / 2 : 2,
          borderCurve: 'continuous' as const,
        }}
      />
    );
  },
);

AtColorDot.displayName = 'AtColorDot';
