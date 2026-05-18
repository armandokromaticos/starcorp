import { useQuery } from '@tanstack/react-query';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { useQBStore } from '@/src/stores/qb.store';
import type { QBTransactionListRaw } from '@/src/types/api.types';
import { queryKeys } from './query-keys';

interface Params {
  accountId: string;
  start_date: string;
  end_date: string;
}

const TX_COLUMNS = 'tx_date,txn_type,doc_num,name,memo,subt_nat_amount';

export function useQBTransactionList(params: Params) {
  const realmId = useQBStore((s) => s.activeRealmId);

  return useQuery({
    queryKey: [
      ...queryKeys.qbTransactionList(
        params.accountId,
        params.start_date,
        params.end_date,
      ),
      realmId ?? 'default',
    ],
    enabled: Boolean(params.accountId),
    queryFn: async () => {
      try {
        return await qbQuery<QBTransactionListRaw>(
          'reports/TransactionList',
          {
            account: params.accountId,
            start_date: params.start_date,
            end_date: params.end_date,
            columns: TX_COLUMNS,
          },
          realmId ?? undefined,
        );
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
