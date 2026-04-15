/**
 * Normalized Domain Models
 *
 * These are the canonical types consumed by all components.
 * They are source-agnostic: the normalizer layer maps
 * QuickBooks and Power BI raw responses into these shapes.
 */

export interface TimeSeriesPoint {
  date: string;
  value: number;
  label?: string;
}

export interface NormalizedRevenue {
  total: number;
  currency: string;
  deltaPercent: number;
  deltaAbsolute: number;
  trend: 'up' | 'down' | 'flat';
  series: TimeSeriesPoint[];
  period: { start: string; end: string };
}

export interface NormalizedClient {
  id: string;
  name: string;
  revenue: number;
  deltaPercent: number;
  color: string;
  source: 'quickbooks' | 'powerbi';
}

export interface NormalizedCashFlow {
  inflows: number;
  outflows: number;
  net: number;
  deltaPercent: number;
  sparklineData: TimeSeriesPoint[];
  breakdown: CashFlowBreakdownItem[];
}

export interface CashFlowBreakdownItem {
  category: string;
  amount: number;
}

export interface NormalizedCategory {
  id: string;
  label: string;
  icon: string;
  total: number;
  actionLabel: string;
}

export type TrendDirection = 'up' | 'down' | 'flat';

export type PeriodKey = 'today' | '1w' | '1m' | '3m' | '12m';

export interface PeriodRange {
  key: PeriodKey;
  start: string;
  end: string;
}
