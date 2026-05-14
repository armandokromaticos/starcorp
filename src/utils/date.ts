/**
 * Date utilities for period calculations
 */

import type { PeriodKey, PeriodRange } from "@/src/types/domain.types";

/**
 * Compute a PeriodRange from a PeriodKey.
 */
export function computePeriod(key: PeriodKey): PeriodRange {
  const now = new Date();
  const end = toISODate(now);
  let start: string;

  switch (key) {
    case "today":
      // Label shows "Mes" → month-to-date: first day of current month → today.
      start = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
      break;
    case "1w":
      start = toISODate(addDays(now, -7));
      break;
    case "1m":
      start = toISODate(addMonths(now, -1));
      break;
    case "3m":
      start = toISODate(addMonths(now, -3));
      break;
    case "12m":
      start = toISODate(addMonths(now, -12));
      break;
    default:
      start = end;
  }

  return { key, start, end };
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

function addMonths(d: Date, months: number): Date {
  const result = new Date(d);
  result.setMonth(result.getMonth() + months);
  return result;
}

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  today: "Mes cte.",
  "1w": "1 semana",
  "1m": "1 mes",
  "3m": "3 meses",
  "12m": "12 meses",
};
