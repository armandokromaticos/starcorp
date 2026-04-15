/**
 * Number formatting utilities
 */

/**
 * Format large numbers compactly: 1.4M, 38k
 */
export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';

  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(0)}k`;
  }

  return n.toLocaleString('es-AR');
}

/**
 * Format a number with the Argentine locale dot separator: 100.000
 */
export function formatNumber(n: number, decimals = 0): string {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}
