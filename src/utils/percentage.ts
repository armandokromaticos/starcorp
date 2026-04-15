/**
 * Percentage utilities for delta calculations
 */

import type { TrendDirection } from '@/src/types/domain.types';

/**
 * Calculate percentage change between previous and current values.
 */
export function calculateDelta(current: number, previous: number | undefined): number {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Determine trend direction from a delta percentage.
 */
export function getTrend(deltaPercent: number): TrendDirection {
  if (deltaPercent > 0.01) return 'up';
  if (deltaPercent < -0.01) return 'down';
  return 'flat';
}

/**
 * Format percentage with sign: +1.87%, -3.20%
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}
