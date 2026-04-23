/**
 * Centralized Query Keys
 *
 * All TanStack Query keys in one place for easy invalidation.
 */

export const queryKeys = {
  revenue: (period: string) => ['revenue', period] as const,
  cashFlow: (period: string) => ['cashFlow', period] as const,
  topClients: (period: string, limit: number) =>
    ['topClients', period, limit] as const,
  categories: (period: string) => ['categories', period] as const,
  report: (reportId: string) => ['report', reportId] as const,
  powerBIEmbed: (groupId: string, reportId: string) =>
    ['powerbi', 'embed', groupId, reportId] as const,
  powerBIReports: (groupId: string) =>
    ['powerbi', 'reports', groupId] as const,
  powerBITimeSeries: (datasetId: string, daxQuery: string) =>
    ['powerbi', 'timeseries', datasetId, daxQuery] as const,
  consolidadoClients: (period: string, categoryId: string) =>
    ['consolidado', categoryId, 'clients', period] as const,
  clientDetail: (period: string, categoryId: string, clientId: string) =>
    ['consolidado', categoryId, 'client', clientId, period] as const,
  costGroups: (period: string, categoryId: string, clientId: string) =>
    ['consolidado', categoryId, 'groups', clientId, period] as const,
  thirdParties: (period: string, categoryId: string, groupId: string) =>
    ['consolidado', categoryId, 'terceros', groupId, period] as const,
  expenseCentral: (period: string) =>
    ['consolidado', 'gastos', 'central', period] as const,
  companies: () => ['companies'] as const,
  company: (companyId: string) => ['companies', companyId] as const,
  companyMetrics: (period: string, companyId: string) =>
    ['companies', companyId, 'metrics', period] as const,
  companyIngresosClients: (period: string, companyId: string) =>
    ['companies', companyId, 'ingresos-clients', period] as const,
  // Prefix for bulk invalidation
  all: ['finance'] as const,
} as const;
