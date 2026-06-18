/**
 * Date utilities for period calculations
 */

import type { PeriodKey, PeriodRange } from "@/src/types/domain.types";

/**
 * Compute a PeriodRange from a PeriodKey.
 */
export function computePeriod(key: PeriodKey): PeriodRange {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (key) {
    case "today":
      // Label shows "Mes" → month-to-date: first day of current month → today.
      return { key, start: toISODate(new Date(y, m, 1)), end: toISODate(now) };
    case "1w":
      return { key, start: toISODate(addDays(now, -7)), end: toISODate(now) };
    // 1m / 3m / 12m span CLOSED calendar months: the in-progress current
    // month is excluded and the range covers the last N fully-closed months.
    // e.g. on any day of June: "1 mes" = all of May; "3 meses" = Mar–May.
    case "1m":
      return closedMonths(key, y, m, 1);
    case "3m":
      return closedMonths(key, y, m, 3);
    case "12m":
      return closedMonths(key, y, m, 12);
    default:
      return { key, start: toISODate(now), end: toISODate(now) };
  }
}

/**
 * Range covering the last `count` fully-closed calendar months relative to a
 * date in month (y, m). End is the last day of the previous month; start is the
 * first day of the month `count` months before that.
 */
function closedMonths(
  key: PeriodKey,
  y: number,
  m: number,
  count: number,
): PeriodRange {
  const start = new Date(y, m - count, 1);
  const end = new Date(y, m, 0); // day 0 of current month = last day of prev month
  return { key, start: toISODate(start), end: toISODate(end) };
}

/**
 * Compute the same-length window immediately preceding the given range.
 * Used to derive a previous-period baseline for delta % calculations.
 */
export function computePreviousPeriod(current: PeriodRange): PeriodRange {
  const dayMs = 24 * 60 * 60 * 1000;
  const startD = new Date(`${current.start}T00:00:00Z`);
  const endD = new Date(`${current.end}T00:00:00Z`);
  const lenDays = Math.max(
    0,
    Math.round((endD.getTime() - startD.getTime()) / dayMs),
  );
  const prevEnd = new Date(startD.getTime() - dayMs);
  const prevStart = new Date(prevEnd.getTime() - lenDays * dayMs);
  return {
    key: current.key,
    start: toISODate(prevStart),
    end: toISODate(prevEnd),
  };
}

function toISODate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, days: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + days);
  return result;
}

const MONTH_SHORT_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

/**
 * Format an ISO date ("2025-06-01") as a short X-axis label ("1 jun").
 * Parses the date by parts (not `new Date`) to avoid UTC→local day shifts.
 */
export function formatAxisDate(iso: string): string {
  const [, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTH_SHORT_ES[(m ?? 1) - 1] ?? ''}`;
}

/**
 * Evenly-spaced subset of `arr` (always including the first and last items),
 * capped at `max` entries. Used to thin axis labels so they don't crowd.
 */
export function pickEvenly<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const out: T[] = [];
  for (let i = 0; i < max; i++) {
    out.push(arr[Math.round((i * (arr.length - 1)) / (max - 1))]);
  }
  return out;
}

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "Mes cte.",
  "1w": "1 semana",
  "1m": "1 mes",
  "3m": "3 meses",
  "12m": "12 meses",
};

/**
 * Compact labels for the time-filter bar, where 5 pills share a tight row.
 * Full labels (PERIOD_LABELS) stay for standalone period chips/badges.
 */
export const PERIOD_SHORT_LABELS: Record<PeriodKey, string> = {
  today: "Mes cte.",
  "1w": "1 sem",
  "1m": "1 mes",
  "3m": "3 meses",
  "12m": "12 meses",
};
