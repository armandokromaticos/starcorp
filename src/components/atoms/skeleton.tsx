/**
 * Atom: Skeleton
 *
 * Animated placeholder for loading states.
 */

import React, { memo, useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { tokens } from '@/src/theme/tokens';

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
}

export const Skeleton = memo<SkeletonProps>(
  ({ width, height, borderRadius = tokens.radius.sm }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
      opacity.value = withRepeat(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, [opacity]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
    }));

    return (
      <Animated.View
        style={[
          {
            width,
            height,
            borderRadius,
            borderCurve: 'continuous' as const,
            backgroundColor: tokens.color.background.tertiary,
          },
          animatedStyle,
        ]}
      />
    );
  },
);

Skeleton.displayName = 'Skeleton';
