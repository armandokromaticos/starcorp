/**
 * Atom: AtColorDot
 *
 * Small colored square/circle indicator for lists (client/category/terceros).
 * With `gradient`, the dot renders a top-left → bottom-right linear
 * gradient from the base color into an auto-darkened variant — matches
 * the donut slice colors in the dashboard legend.
 */

import React, { memo } from 'react';
import { View } from '@/src/tw';
import { LinearGradient } from 'expo-linear-gradient';
import { darkenHex } from '@/src/utils/color';

type DotShape = 'square' | 'circle';
type DotSize = 'sm' | 'md' | 'lg';

interface AtColorDotProps {
  color: string;
  shape?: DotShape;
  size?: DotSize;
  gradient?: boolean;
  className?: string;
}

const sizeMap: Record<DotSize, number> = {
  sm: 8,
  md: 12,
  lg: 16,
};

export const AtColorDot = memo<AtColorDotProps>(
  ({ color, shape = 'square', size = 'md', gradient = false, className }) => {
    const dimension = sizeMap[size];
    const borderRadius = shape === 'circle' ? dimension / 2 : 2;

    if (gradient) {
      return (
        <View
          className={className}
          style={{
            width: dimension,
            height: dimension,
            borderRadius,
            overflow: 'hidden',
            borderCurve: 'continuous' as const,
          }}
        >
          <LinearGradient
            colors={[color, darkenHex(color, 0.6)]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
        </View>
      );
    }

    return (
      <View
        className={className}
        style={{
          width: dimension,
          height: dimension,
          backgroundColor: color,
          borderRadius,
          borderCurve: 'continuous' as const,
        }}
      />
    );
  },
);

AtColorDot.displayName = 'AtColorDot';
