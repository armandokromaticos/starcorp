import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { mockCompanies } from '@/src/services/mock/data.mock';
import {
  qbQuery,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import { normalizeCompany } from '@/src/services/quickbooks/normalizer';
import type { Company } from '@/src/types/domain.types';

interface QBCompanyInfoRaw {
  CompanyInfo: { CompanyName: string; LegalName?: string };
}

export const QB_COMPANY_ID = 'qb';

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: queryKeys.companies(),
    queryFn: async () => {
      try {
        const raw = await qbQuery<QBCompanyInfoRaw>('companyinfo/0');
        const company = normalizeCompany(raw, QB_COMPANY_ID);
        return company ? [company] : mockCompanies;
      } catch (e) {
        if (
          e instanceof QBNotConnectedError ||
          e instanceof QBReauthRequiredError
        ) return mockCompanies;
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
