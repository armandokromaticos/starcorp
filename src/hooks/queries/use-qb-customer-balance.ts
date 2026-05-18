/**
 * useQBCustomerBalance — outstanding balance of a single QB Customer
 * resolved by DisplayName.
 *
 * Source of the name: `clientes_master.data.Quickbook` (PBI master). The
 * master values are often short marketing names (e.g. "ANCHORAGE"), while
 * the QB Customer's DisplayName is the full legal/business name
 * ("ANCHORAGE INN"). We try in escalating order: exact → starts-with →
 * contains, and return the first hit. Null when no variant matches.
 */

import { useQuery } from '@tanstack/react-query';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { useQBStore } from '@/src/stores/qb.store';
import type { QBCustomersRaw } from '@/src/types/api.types';
import { queryKeys } from './query-keys';

/** Escape single quotes for QB's SQL-like query language. */
function escapeQBString(value: string): string {
  return value.replace(/'/g, "''");
}

async function findCustomer(
  trimmed: string,
  realmId: string | undefined,
): Promise<{ Balance?: number } | null> {
  const escaped = escapeQBString(trimmed);
  const variants = [
    `DisplayName = '${escaped}'`,
    `DisplayName LIKE '${escaped}%'`,
    `DisplayName LIKE '%${escaped}%'`,
  ];
  for (const where of variants) {
    const res = await qbQuery<QBCustomersRaw>(
      'query',
      { query: `select Id, DisplayName, Balance from Customer where ${where} maxresults 1` },
      realmId,
    );
    const customer = res.QueryResponse?.Customer?.[0];
    if (customer) return customer;
  }
  return null;
}

export function useQBCustomerBalance(qbName: string | null | undefined) {
  const realmId = useQBStore((s) => s.activeRealmId);
  const trimmed = qbName?.trim() ?? '';
  const enabled = trimmed.length > 0;

  return useQuery<number | null>({
    queryKey: [
      ...queryKeys.qbCustomerBalance(trimmed),
      realmId ?? 'default',
    ],
    enabled,
    queryFn: async () => {
      try {
        const customer = await findCustomer(trimmed, realmId ?? undefined);
        if (!customer || customer.Balance == null) return null;
        const n = Number(customer.Balance);
        return Number.isFinite(n) ? n : null;
      } catch (e) {
        if (
          e instanceof QBNotConnectedError ||
          e instanceof QBReauthRequiredError
        ) return null;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}
