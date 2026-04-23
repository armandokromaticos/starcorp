/**
 * Raw API Response Types
 *
 * These represent the raw shapes returned by QuickBooks and Power BI APIs
 * before normalization. They should NOT be consumed directly by components.
 */

// ─── QuickBooks Raw Types ─────────────────────────────────────

export interface QBProfitAndLossRaw {
  Header?: {
    StartPeriod?: string;
    EndPeriod?: string;
    Currency?: string;
  };
  Rows?: {
    Row?: QBReportRow[];
  };
  previousPeriodTotal?: number;
}

export interface QBReportRow {
  group?: string;
  Summary?: {
    ColData?: { value: string }[];
  };
  Rows?: {
    Row?: QBReportRow[];
  };
}

export interface QBBalanceSheetRaw {
  Header?: {
    Time?: string;
    ReportName?: string;
  };
  Rows?: {
    Row?: QBReportRow[];
  };
}

export interface QBCustomersRaw {
  QueryResponse?: {
    Customer?: QBCustomerItem[];
    startPosition?: number;
    maxResults?: number;
  };
}

export interface QBCustomerItem {
  Id: string;
  DisplayName: string;
  Balance?: number;
  Active?: boolean;
  CompanyName?: string;
}

export interface QBInvoicesRaw {
  QueryResponse?: {
    Invoice?: QBInvoiceItem[];
  };
}

export interface QBInvoiceItem {
  Id: string;
  TotalAmt: number;
  Balance: number;
  DueDate: string;
  CustomerRef: { value: string; name: string };
}

// ─── Power BI Raw Types ───────────────────────────────────────

export interface PBIQueryResultRaw {
  results?: PBIQueryResult[];
}

export interface PBIQueryResult {
  tables?: PBITable[];
}

export interface PBITable {
  rows: unknown[][];
  columns?: { name: string; type: string }[];
}

export interface PBIReportDataRaw {
  id: string;
  name: string;
  datasetId: string;
  embedUrl: string;
}

export interface PBIEmbedData {
  embedUrl: string;
  embedToken: string;
  reportId: string;
  expiration: string;
}

export interface PBIReportListItem {
  id: string;
  name: string;
  datasetId: string;
  webUrl: string;
  embedUrl: string;
}

export interface PBIFilter {
  table: string;
  column: string;
  values: (string | number)[];
}
