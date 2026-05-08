import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './query-keys';
import { mockCompanies } from '@/src/services/mock/data.mock';
import {
  qbListCompanies,
  qbQuery,
  type QBConnectedCompany,
} from '@/src/services/quickbooks/client';
import type { Company } from '@/src/types/domain.types';

interface QBCompanyInfoRaw {
  CompanyInfo?: { CompanyName?: string; LegalName?: string };
}

async function resolveName(c: QBConnectedCompany): Promise<string> {
  if (c.name) return c.name;
  // Fallback for rows persisted before company_name caching: pull live.
  try {
    const raw = await qbQuery<QBCompanyInfoRaw>(
      'companyinfo/0',
      undefined,
      c.realmId,
    );
    return raw.CompanyInfo?.CompanyName ??
      raw.CompanyInfo?.LegalName ??
      `Empresa ${c.realmId.slice(-4)}`;
  } catch {
    return `Empresa ${c.realmId.slice(-4)}`;
  }
}

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: queryKeys.companies(),
    queryFn: async () => {
      const connected = await qbListCompanies();
      if (connected.length === 0) return mockCompanies;
      return Promise.all(
        connected.map(async (c) => ({
          id: c.realmId,
          name: await resolveName(c),
        })),
      );
    },
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });
}
