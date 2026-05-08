/**
 * QuickBooks raw → normalized domain types.
 * Pure functions: no I/O, no React.
 */

import type {
  QBProfitAndLossRaw,
  QBReportRow,
} from '@/src/types/api.types';
import type {
  Company,
  CompanyMetrics,
  NormalizedRevenue,
} from '@/src/types/domain.types';

interface QBCompanyInfoRaw {
  CompanyInfo?: {
    CompanyName?: string;
    LegalName?: string;
  };
}

export function normalizeCompany(
  raw: QBCompanyInfoRaw | null,
  realmId: string,
): Company | null {
  const name = raw?.CompanyInfo?.CompanyName ?? raw?.CompanyInfo?.LegalName;
  if (!name) return null;
  return { id: realmId, name };
}

/**
 * QB Profit & Loss report has hierarchical rows. Section rows carry a `group`
 * tag ("Income", "COGS", "GrossProfit", "Expenses", "NetIncome"...) and a
 * Summary.ColData where the LAST entry is the period total.
 */
function findGroupTotal(
  rows: QBReportRow[] | undefined,
  group: string,
): number {
  if (!rows) return 0;
  for (const row of rows) {
    if (row.group === group && row.Summary?.ColData?.length) {
      const cols = row.Summary.ColData;
      const last = cols[cols.length - 1]?.value;
      const n = Number(last);
      return Number.isFinite(n) ? n : 0;
    }
    const nested = findGroupTotal(row.Rows?.Row, group);
    if (nested) return nested;
  }
  return 0;
}

export function normalizeRevenueFromPnL(
  pnl: QBProfitAndLossRaw | null,
  period: { start: string; end: string },
): NormalizedRevenue {
  const income = findGroupTotal(pnl?.Rows?.Row, 'Income');
  return {
    total: income,
    currency: pnl?.Header?.Currency ?? 'USD',
    deltaPercent: 0,
    deltaAbsolute: 0,
    trend: 'flat',
    series: [],
    period,
  };
}

/** A single line item under an Income / COGS / Expenses section. */
export interface PnLLineItem {
  id: string;
  label: string;
  amount: number;
  color: string;
}

interface RawWithExtras {
  type?: string;
  group?: string;
  Header?: { ColData?: { value: string; id?: string }[] };
  ColData?: { value: string; id?: string }[];
  Summary?: { ColData?: { value: string }[] };
  Rows?: { Row?: RawWithExtras[] };
}

const SECTION_PALETTE = [
  "#1A2B6D",
  "#E8952E",
  "#4A7FD4",
  "#38A169",
  "#3182CE",
  "#9F7AEA",
  "#D53F8C",
  "#DD6B20",
] as const;

function toAmount(raw: string | undefined): number {
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function lastColValue(cols: { value: string }[] | undefined): string | undefined {
  if (!cols || cols.length === 0) return undefined;
  return cols[cols.length - 1]?.value;
}

function findSectionRow(
  rows: RawWithExtras[] | undefined,
  group: string,
): RawWithExtras | undefined {
  if (!rows) return undefined;
  for (const row of rows) {
    if (row.group === group) return row;
    const nested = findSectionRow(row.Rows?.Row, group);
    if (nested) return nested;
  }
  return undefined;
}

/**
 * Flattens immediate descendants of a P&L section (Income, COGS, Expenses)
 * into a list of leaf line items so we can render them in a detail screen.
 */
export function normalizePnLSection(
  pnl: QBProfitAndLossRaw | null,
  group: 'Income' | 'COGS' | 'Expenses',
): PnLLineItem[] {
  const root = findSectionRow(pnl?.Rows?.Row as RawWithExtras[] | undefined, group);
  const children = root?.Rows?.Row ?? [];

  return children.map((row, idx) => {
    const label = row.Header?.ColData?.[0]?.value ??
      row.ColData?.[0]?.value ??
      `Cuenta ${idx + 1}`;
    const amount = row.Summary?.ColData
      ? toAmount(lastColValue(row.Summary.ColData))
      : toAmount(lastColValue(row.ColData));
    const id = row.Header?.ColData?.[0]?.id ??
      row.ColData?.[0]?.id ??
      `${group}-${idx}`;
    return {
      id: String(id),
      label,
      amount,
      color: SECTION_PALETTE[idx % SECTION_PALETTE.length],
    };
  });
}

export function normalizeMetricsFromPnL(
  pnl: QBProfitAndLossRaw | null,
): CompanyMetrics {
  const income = findGroupTotal(pnl?.Rows?.Row, 'Income');
  const cogs = findGroupTotal(pnl?.Rows?.Row, 'COGS');
  const grossProfit = findGroupTotal(pnl?.Rows?.Row, 'GrossProfit') ||
    income - cogs;
  const expenses = findGroupTotal(pnl?.Rows?.Row, 'Expenses');
  const netIncome = findGroupTotal(pnl?.Rows?.Row, 'NetIncome') ||
    grossProfit - expenses;

  const flat = (value: number) => ({ value, deltaPercent: 0 });
  return {
    ingresos: flat(income),
    costos: flat(cogs),
    egresos: flat(expenses),
    utilidadBruta: flat(grossProfit),
    utilidadNeta: flat(netIncome),
  };
}
