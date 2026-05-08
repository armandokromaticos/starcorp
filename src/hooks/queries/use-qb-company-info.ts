import { useQuery } from '@tanstack/react-query';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { queryKeys } from './query-keys';

interface QBCompanyInfoRaw {
  CompanyInfo: {
    CompanyName: string;
    LegalName?: string;
    Country?: string;
    Email?: { Address?: string };
    FiscalYearStartMonth?: string;
  };
}

export function useQBCompanyInfo() {
  return useQuery({
    queryKey: queryKeys.qbCompanyInfo(),
    queryFn: async () => {
      try {
        return await qbQuery<QBCompanyInfoRaw>('companyinfo/0');
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
