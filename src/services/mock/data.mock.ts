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
  ConsolidadoCategoryId,
  ConsolidadoClient,
  ClientConsolidadoDetail,
  CostGroup,
  ThirdParty,
  ExpenseCentral,
  Company,
  CompanyMetrics,
  IngresoCliente,
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

// ─── Consolidados ─────────────────────────────────────────────

const HOTEL_NAMES = [
  'Baymont',
  'Hotel California',
  'La Quinta',
  'Holiday Inn',
  'Comfort Inn',
  'Super 8',
  'Hotel 6',
  'Marriott Downtown',
  'Hilton Garden',
  'Hampton Inn',
  'Best Western',
  'Ramada Plaza',
  'Red Roof Inn',
  'Wyndham Grand',
  'Days Inn',
  'Fairfield Suites',
  'Courtyard West',
  'Embassy Suites',
  'Sheraton Park',
  'DoubleTree',
];

const CHART_COLORS = tokens.color.chart;

function buildClientList(
  seed: number,
  downCount = 2,
): ConsolidadoClient[] {
  return HOTEL_NAMES.map((name, i) => {
    const isDown = i % 7 === downCount;
    const rand = ((i + 1) * seed * 37) % 1000;
    return {
      id: `cli-${i + 1}`,
      name,
      amount: 100000 + rand * 50,
      deltaPercent: isDown ? -(1 + (rand % 300) / 100) : 1 + (rand % 400) / 100,
      color: CHART_COLORS[i % CHART_COLORS.length],
    };
  });
}

export const mockConsolidadoClients: Record<ConsolidadoCategoryId, ConsolidadoClient[]> = {
  ingresos: buildClientList(1, 1),
  costos: buildClientList(3, 2),
  gastos: buildClientList(5, 1),
  egresos: buildClientList(9, 2),
  utilidad: buildClientList(7, 3).slice(0, 5).map((c, i) => ({
    ...c,
    name: `Cliente ${i + 1}`,
    color: CHART_COLORS[i % CHART_COLORS.length],
  })),
};

function buildDetailSeries(amplitude: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    points.push({
      date: date.toISOString().split('T')[0],
      value: 20 + Math.sin(i / 3) * amplitude + Math.random() * (amplitude / 2),
    });
  }
  return points;
}

export const mockClientDetail: Record<string, ClientConsolidadoDetail> = Object.fromEntries(
  mockConsolidadoClients.ingresos.map((c, i) => [
    c.id,
    {
      id: c.id,
      name: c.name,
      amount: c.amount,
      deltaPercent: c.deltaPercent,
      deltaAbsolute: 78000,
      series: buildDetailSeries(30 + i),
      location: 'Estado lorem ipsum',
      employees: 24 + (i % 10),
      leader: 3 + (i % 4),
      vigencia: 12 + (i % 6),
      metrics: {
        ingreso: { value: 100000, deltaPercent: 1.87 },
        costo: { value: 10000, deltaPercent: -0.5 },
        gastos: { value: 10000, deltaPercent: -0.8 },
        utilidadNeta: { value: 100000, deltaPercent: 1.87 },
        utilidadBruta: { value: 10000, deltaPercent: -0.4 },
        cartera: { value: 100000, deltaPercent: 1.87 },
        margen: { value: 100000, deltaPercent: 1.87 },
      },
    } satisfies ClientConsolidadoDetail,
  ]),
);

export const mockCostGroups: CostGroup[] = [
  { id: 'alquiler', label: 'Alquiler vehículo', icon: 'directions-car', color: '#2D4BA0', amount: 100000, deltaPercent: 1.87 },
  { id: 'casino', label: 'Casino y restaurante', icon: 'restaurant', color: '#E53E3E', amount: 10000, deltaPercent: -1.2 },
  { id: 'celular', label: 'Celular', icon: 'phone-iphone', color: '#4A7FD4', amount: 10000, deltaPercent: -0.8 },
  { id: 'combustible', label: 'Combustible', icon: 'local-gas-station', color: '#F59E0B', amount: 100000, deltaPercent: 1.87 },
  { id: 'comisiones', label: 'Gasto comisiones', icon: 'receipt-long', color: '#6366F1', amount: 100000, deltaPercent: 1.87 },
  { id: 'diversos', label: 'Diversos', icon: 'category', color: '#EC4899', amount: 100000, deltaPercent: 1.87 },
  { id: 'bancarios', label: 'Gastos bancarios', icon: 'account-balance', color: '#10B981', amount: 100000, deltaPercent: 1.87 },
  { id: 'convencion', label: 'Gastos de convención', icon: 'event', color: '#F97316', amount: 100000, deltaPercent: 1.87 },
  { id: 'oficina', label: 'Gastos de oficina', icon: 'business', color: '#84CC16', amount: 100000, deltaPercent: 1.87 },
  { id: 'representacion', label: 'Gastos de representación', icon: 'groups', color: '#14B8A6', amount: 100000, deltaPercent: 1.87 },
];

const THIRD_PARTY_NAMES = [
  'American Airlines',
  'Allianz Assistance USA',
  'ALLTOWN',
  'Amazon',
  'American Advantage',
  'American Parking',
  'A-Plus',
  'ARB Parking Philadelphia',
  'Avis Rent-A-Car',
  'Budget Rent-A-Car',
  'Delta Air Lines',
  'Enterprise Holdings',
  'Expedia Group',
  'Hertz Corporation',
  'JetBlue Airways',
  'Sixt SE',
  'Southwest Airlines',
  'Uber Technologies',
  'United Airlines',
  'Walmart Inc.',
];

function buildThirdParties(): ThirdParty[] {
  return THIRD_PARTY_NAMES.map((name, i) => ({
    id: `tp-${i + 1}`,
    name,
    color: CHART_COLORS[i % CHART_COLORS.length],
    amount: 5654,
  }));
}

export const mockThirdParties: Record<string, ThirdParty[]> = Object.fromEntries(
  mockCostGroups.map((g) => [g.id, buildThirdParties()]),
);

export const mockExpenseCentral: ExpenseCentral = {
  total: 100000,
  deltaPercent: 1.87,
};

// ─── Financiero (companies) ─────────────────────────────────────

export const mockCompanies: Company[] = [
  { id: '5-stars', name: '5 Stars' },
  { id: 'one-a', name: 'One A' },
  { id: 'seasons', name: 'Seasons solutions' },
  { id: 'mcs', name: 'MCS' },
  { id: 'clea', name: 'Cleaxx' },
];

function buildCompanyMetrics(seed: number): CompanyMetrics {
  const rand = (n: number) => ((seed * n * 37) % 500) / 100;
  const sign = (n: number) => (n % 2 === 0 ? 1 : -1);
  return {
    ingresos: { value: 100000 + seed * 1500, deltaPercent: 1.5 + rand(1) },
    costos: { value: 70000 + seed * 900, deltaPercent: sign(seed) * (0.8 + rand(2)) },
    egresos: { value: 22000 + seed * 400, deltaPercent: 0.9 + rand(3) },
    utilidadBruta: { value: 30000 + seed * 600, deltaPercent: 1.1 + rand(4) },
    utilidadNeta: { value: 18000 + seed * 500, deltaPercent: 1.3 + rand(5) },
  };
}

export const mockCompanyMetrics: Record<string, CompanyMetrics> = Object.fromEntries(
  mockCompanies.map((c, i) => [c.id, buildCompanyMetrics(i + 1)]),
);

function buildIngresoClientes(seed: number): IngresoCliente[] {
  return Array.from({ length: 5 }, (_, i) => {
    const rand = ((seed + 1) * (i + 1) * 31) % 1000;
    return {
      id: `cli-${seed}-${i + 1}`,
      name: `Cliente ${i + 1}`,
      color: CHART_COLORS[i % CHART_COLORS.length],
      amount: 80000 + rand * 60,
      deltaPercent: 1 + (rand % 300) / 100,
    };
  });
}

export const mockIngresoClientesByCompany: Record<string, IngresoCliente[]> =
  Object.fromEntries(mockCompanies.map((c, i) => [c.id, buildIngresoClientes(i + 1)]));

// Egresos has its own independent data set, visually identical to costos.
export const mockCostGroupsEgresos: CostGroup[] = [
  { id: 'nomina', label: 'Nómina', icon: 'payments', color: '#2D4BA0', amount: 55000, deltaPercent: 2.1 },
  { id: 'servicios', label: 'Servicios públicos', icon: 'bolt', color: '#4A7FD4', amount: 8200, deltaPercent: -0.6 },
  { id: 'impuestos', label: 'Impuestos', icon: 'receipt', color: '#E53E3E', amount: 14500, deltaPercent: 0.8 },
  { id: 'seguros', label: 'Seguros', icon: 'shield', color: '#10B981', amount: 6400, deltaPercent: -1.3 },
  { id: 'mantenimiento', label: 'Mantenimiento', icon: 'build', color: '#F59E0B', amount: 9300, deltaPercent: 1.2 },
  { id: 'software', label: 'Software y licencias', icon: 'computer', color: '#6366F1', amount: 4100, deltaPercent: 0.9 },
  { id: 'marketing', label: 'Marketing', icon: 'campaign', color: '#EC4899', amount: 7200, deltaPercent: 1.7 },
  { id: 'otros', label: 'Otros gastos', icon: 'category', color: '#14B8A6', amount: 3100, deltaPercent: -0.2 },
];

function buildEgresosThirdParties(): ThirdParty[] {
  return THIRD_PARTY_NAMES.slice(0, 12).map((name, i) => ({
    id: `tp-eg-${i + 1}`,
    name,
    color: CHART_COLORS[i % CHART_COLORS.length],
    amount: 3200 + (i * 131) % 4800,
  }));
}

export const mockThirdPartiesEgresos: Record<string, ThirdParty[]> =
  Object.fromEntries(mockCostGroupsEgresos.map((g) => [g.id, buildEgresosThirdParties()]));
