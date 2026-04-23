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
      start = end;
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
  today: "Hoy",
  "1w": "1 sem",
  "1m": "1 m",
  "3m": "3 m",
  "12m": "12 m",
};
