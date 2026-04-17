/**
 * QuickBooks Mock Data
 */

import { tokens } from '@/src/theme/tokens';
import type {
  NormalizedRevenue,
  NormalizedCashFlow,
  NormalizedClient,
  NormalizedCategory,
  NormalizedReport,
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

function scaleSeries(
  series: TimeSeriesPoint[],
  factor: number,
): TimeSeriesPoint[] {
  return series.map((p) => ({ ...p, value: Math.max(0, p.value * factor) }));
}

const baseSeries = mockRevenue.series;

export const mockCategoryRevenues: Record<string, NormalizedRevenue> = {
  ingresos: mockRevenue,
  costos: {
    ...mockRevenue,
    total: 15000,
    deltaPercent: -0.82,
    deltaAbsolute: -1200,
    trend: 'down',
    series: scaleSeries(baseSeries, 0.22),
  },
  gastos: {
    ...mockRevenue,
    total: 7000,
    deltaPercent: 0.45,
    deltaAbsolute: 350,
    trend: 'up',
    series: scaleSeries(baseSeries, 0.1),
  },
  utilidad: {
    ...mockRevenue,
    total: 78000,
    deltaPercent: 2.41,
    deltaAbsolute: 78000,
    trend: 'up',
    series: scaleSeries(baseSeries, 0.78),
  },
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

// ─── Reports (Informes) ──────────────────────────────────────

export const mockReports: NormalizedReport[] = [
  {
    id: 'cartera',
    label: 'Cartera',
    icon: 'account-balance-wallet',
    color: '#E89A3E',
    total: 8250,
    currency: 'USD',
    deltaPercent: 1.87,
  },
  {
    id: 'asociados',
    label: 'Asociados activos',
    icon: 'groups',
    color: '#1B2A6B',
    total: 1240,
    currency: 'USD',
    deltaPercent: 0.62,
  },
  {
    id: 'bancos',
    label: 'Bancos',
    icon: 'account-balance',
    color: '#4A7FD4',
    total: 42500,
    currency: 'USD',
    deltaPercent: -0.45,
  },
  {
    id: 'presupuesto',
    label: 'Presupuesto',
    icon: 'assessment',
    color: '#B4C93A',
    total: 65000,
    currency: 'USD',
    deltaPercent: 2.15,
  },
  {
    id: 'seguro',
    label: 'Seguro',
    icon: 'verified-user',
    color: '#78A63A',
    total: 3200,
    currency: 'USD',
    deltaPercent: 0.12,
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: 'payments',
    color: '#3D6F4E',
    total: 12800,
    currency: 'USD',
    deltaPercent: 1.05,
  },
];

// ─── Categories ───────────────────────────────────────────────

export const mockCategories: NormalizedCategory[] = [
  { id: 'income', label: 'Ingresos', icon: 'dollarsign.circle', total: 100000, actionLabel: 'Ver clientes' },
  { id: 'costs', label: 'Costos', icon: 'bag', total: 15000, actionLabel: 'Ver clientes' },
  { id: 'expenses', label: 'Gastos', icon: 'creditcard', total: 7000, actionLabel: 'Ver clientes' },
  { id: 'profit', label: 'Utilidad', icon: 'chart.line.uptrend.xyaxis', total: 78000, actionLabel: 'Ver detalle' },
];
