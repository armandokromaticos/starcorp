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
