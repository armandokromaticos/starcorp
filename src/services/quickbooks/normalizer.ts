/**
 * QuickBooks raw → normalized domain types.
 * Pure functions: no I/O, no React.
 */

import type {
  QBProfitAndLossRaw,
  QBReportRow,
  QBTransactionListRaw,
  QBTransactionListRow,
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

/** A single leaf account inside a P&L category. */
export interface PnLAccount {
  id: string;
  label: string;
  amount: number;
}

/** A first-level category under a P&L section. May contain >=1 accounts. */
export interface PnLCategory extends PnLLineItem {
  /** Leaf accounts under this category. Categories with no sub-accounts
   *  surface themselves as a single account (id/label/amount mirror the
   *  category) so the UI can render a 1-item accordion uniformly. */
  accounts: PnLAccount[];
}

function rowLabel(row: RawWithExtras, fallback: string): string {
  return (
    row.Header?.ColData?.[0]?.value ??
    row.ColData?.[0]?.value ??
    fallback
  );
}

function rowAmount(row: RawWithExtras): number {
  return row.Summary?.ColData
    ? toAmount(lastColValue(row.Summary.ColData))
    : toAmount(lastColValue(row.ColData));
}

function rowId(row: RawWithExtras, fallback: string): string {
  return String(
    row.Header?.ColData?.[0]?.id ?? row.ColData?.[0]?.id ?? fallback,
  );
}

function collectLeaves(
  rows: RawWithExtras[] | undefined,
  out: PnLAccount[],
  pathFallback: string,
): void {
  if (!rows) return;
  rows.forEach((row, idx) => {
    const hasChildren = (row.Rows?.Row?.length ?? 0) > 0;
    if (hasChildren) {
      collectLeaves(row.Rows!.Row, out, `${pathFallback}-${idx}`);
    } else {
      out.push({
        id: rowId(row, `${pathFallback}-${idx}`),
        label: rowLabel(row, `Cuenta ${idx + 1}`),
        amount: rowAmount(row),
      });
    }
  });
}

/**
 * Hierarchical view of a P&L section: top-level categories with their leaf
 * accounts. Categories with no sub-accounts include themselves as the only
 * account so the accordion stays uniform.
 */
export function normalizePnLSectionHierarchical(
  pnl: QBProfitAndLossRaw | null,
  group: 'Income' | 'COGS' | 'Expenses',
): PnLCategory[] {
  const root = findSectionRow(
    pnl?.Rows?.Row as RawWithExtras[] | undefined,
    group,
  );
  const children = root?.Rows?.Row ?? [];

  return children.map((row, idx) => {
    const label = rowLabel(row, `Cuenta ${idx + 1}`);
    const amount = rowAmount(row);
    const id = rowId(row, `${group}-${idx}`);
    const accounts: PnLAccount[] = [];
    const hasChildren = (row.Rows?.Row?.length ?? 0) > 0;
    if (hasChildren) {
      collectLeaves(row.Rows!.Row, accounts, `${group}-${idx}`);
    }
    if (accounts.length === 0) {
      accounts.push({ id, label, amount });
    }
    return {
      id,
      label,
      amount,
      color: SECTION_PALETTE[idx % SECTION_PALETTE.length],
      accounts,
    };
  });
}

/**
 * Finds a leaf account anywhere under a P&L section by its QB id. Used by the
 * level-2 detail screens to resolve an account selected from the accordion.
 */
export function findPnLLeafById(
  pnl: QBProfitAndLossRaw | null,
  group: 'Income' | 'COGS' | 'Expenses',
  leafId: string,
): PnLAccount | null {
  const categories = normalizePnLSectionHierarchical(pnl, group);
  for (const cat of categories) {
    const hit = cat.accounts.find((a) => a.id === leafId);
    if (hit) return hit;
  }
  return null;
}

/** One row of a QB TransactionList report (a posting against an account). */
export interface QBTransaction {
  id: string;
  date: string;
  type: string;
  num: string;
  name: string;
  memo: string;
  amount: number;
}

/** Map QB ColType (or ColTitle fallback) to our normalized fields. */
const TX_COLUMN_MAP: Record<string, keyof QBTransaction> = {
  tx_date: 'date',
  txn_type: 'type',
  doc_num: 'num',
  vend_name: 'name',
  cust_name: 'name',
  name: 'name',
  memo: 'memo',
  subt_nat_amount: 'amount',
  subt_nat_home_amount: 'amount',
  amount: 'amount',
};

function resolveTxField(
  col: { ColTitle?: string; ColType?: string } | undefined,
): keyof QBTransaction | null {
  if (!col) return null;
  const byType = col.ColType ? TX_COLUMN_MAP[col.ColType] : undefined;
  if (byType) return byType;
  const titleKey = col.ColTitle?.toLowerCase();
  if (!titleKey) return null;
  if (titleKey.includes('date') || titleKey.includes('fecha')) return 'date';
  if (titleKey.includes('type') || titleKey.includes('tipo')) return 'type';
  if (titleKey.includes('num')) return 'num';
  if (titleKey.includes('name') || titleKey.includes('nombre')) return 'name';
  if (titleKey.includes('memo') || titleKey.includes('descripci')) return 'memo';
  if (titleKey.includes('amount') || titleKey.includes('monto')) return 'amount';
  return null;
}

function walkTxRows(
  rows: QBTransactionListRow[] | undefined,
  out: QBTransactionListRow[],
): void {
  if (!rows) return;
  for (const row of rows) {
    if (row.ColData?.length) out.push(row);
    if (row.Rows?.Row?.length) walkTxRows(row.Rows.Row, out);
  }
}

export function normalizeTransactionList(
  raw: QBTransactionListRaw | null,
): QBTransaction[] {
  if (!raw) return [];
  const columns = raw.Columns?.Column ?? [];
  const flatRows: QBTransactionListRow[] = [];
  walkTxRows(raw.Rows?.Row, flatRows);

  return flatRows.map((row, rowIdx) => {
    const cols = row.ColData ?? [];
    const tx: QBTransaction = {
      id: '',
      date: '',
      type: '',
      num: '',
      name: '',
      memo: '',
      amount: 0,
    };
    cols.forEach((cell, i) => {
      const field = resolveTxField(columns[i]);
      if (!field) return;
      const value = cell.value ?? '';
      if (field === 'amount') {
        const n = Number(value);
        tx.amount = Number.isFinite(n) ? n : 0;
      } else {
        tx[field] = value;
      }
      if (!tx.id && cell.id) tx.id = String(cell.id);
    });
    if (!tx.id) tx.id = `tx-${rowIdx}-${tx.date}-${tx.num}`;
    return tx;
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
