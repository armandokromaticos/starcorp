/**
 * QuickBooks Mock Data
 */

import { tokens } from '@/src/theme/tokens';
import type {
  NormalizedRevenue,
  NormalizedCashFlow,
  NormalizedClient,
  NormalizedCategory,
  TimeSeriesPoint,
} from '@/src/types/domain.types';

// ─── Revenue ──────────────────────────────────────────────────

function generateRevenueSeries(): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    points.push({
      date: date.toISOString().split('T')[0],
      value: 40 + Math.random() * 60,
    });
  }
  return points;
}

export const mockRevenue: NormalizedRevenue = {
  total: 100000,
  currency: 'USD',
  deltaPercent: 1.87,
  deltaAbsolute: 78000,
  trend: 'up',
  series: generateRevenueSeries(),
  period: { start: '2026-01-01', end: '2026-04-14' },
};

// ─── Cash Flow ────────────────────────────────────────────────

function generateCashFlowSeries(): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = 14; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    points.push({
      date: date.toISOString().split('T')[0],
      value: 20 + Math.random() * 80,
    });
  }
  return points;
}

export const mockCashFlow: NormalizedCashFlow = {
  inflows: 100000,
  outflows: 22000,
  net: 78000,
  deltaPercent: 1.87,
  sparklineData: generateCashFlowSeries(),
  breakdown: [
    { category: 'Ventas', amount: 72000 },
    { category: 'Servicios', amount: 18000 },
    { category: 'Inversiones', amount: 10000 },
  ],
};

// ─── Top Clients ──────────────────────────────────────────────

export const mockTopClients: NormalizedClient[] = [
  { id: '1', name: 'Cliente 1', revenue: 8250, deltaPercent: 1.87, color: tokens.color.chart[3], source: 'quickbooks' },
  { id: '2', name: 'Cliente 2', revenue: 7100, deltaPercent: 3.2, color: tokens.color.chart[0], source: 'quickbooks' },
  { id: '3', name: 'Cliente 3', revenue: 6800, deltaPercent: -0.5, color: tokens.color.chart[2], source: 'quickbooks' },
  { id: '4', name: 'Cliente 4', revenue: 5400, deltaPercent: 2.1, color: tokens.color.chart[5], source: 'quickbooks' },
  { id: '5', name: 'Cliente 5', revenue: 4900, deltaPercent: 0.8, color: tokens.color.chart[6], source: 'quickbooks' },
  { id: '6', name: 'Cliente 6', revenue: 3200, deltaPercent: -1.3, color: tokens.color.chart[1], source: 'quickbooks' },
  { id: '7', name: 'Cliente 7', revenue: 2100, deltaPercent: 4.5, color: tokens.color.chart[7], source: 'quickbooks' },
  { id: '8', name: 'Cliente 8', revenue: 1250, deltaPercent: 0.2, color: tokens.color.chart[4], source: 'quickbooks' },
];

// ─── Categories ───────────────────────────────────────────────

export const mockCategories: NormalizedCategory[] = [
  { id: 'income', label: 'Ingresos', icon: 'dollarsign.circle', total: 100000, actionLabel: 'Ver clientes' },
  { id: 'costs', label: 'Costos', icon: 'bag', total: 15000, actionLabel: 'Ver clientes' },
  { id: 'expenses', label: 'Gastos', icon: 'creditcard', total: 7000, actionLabel: 'Ver clientes' },
  { id: 'profit', label: 'Utilidad', icon: 'chart.line.uptrend.xyaxis', total: 78000, actionLabel: 'Ver detalle' },
];
