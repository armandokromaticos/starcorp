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

// QB Transaction List report — flat row list of postings hitting an account.
export interface QBTransactionListRaw {
  Header?: {
    StartPeriod?: string;
    EndPeriod?: string;
    Currency?: string;
  };
  Columns?: {
    Column?: { ColTitle?: string; ColType?: string }[];
  };
  Rows?: {
    Row?: QBTransactionListRow[];
  };
}

export interface QBTransactionListRow {
  ColData?: { value?: string; id?: string }[];
  Rows?: { Row?: QBTransactionListRow[] };
  Summary?: { ColData?: { value?: string }[] };
  type?: string;
  group?: string;
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

// ─── QuickBooks Account (Bank) Raw ────────────────────────────

/**
 * Subset de campos relevantes del Account entity de QB cuando se
 * consulta `SELECT * FROM Account WHERE AccountType='Bank'`.
 */
export interface QBAccountRaw {
  Id: string;
  Name: string;
  AcctNum?: string;
  AccountType: string;
  AccountSubType?: string;
  CurrentBalance?: number;
  CurrentBalanceWithSubAccounts?: number;
  Active?: boolean;
  Classification?: string;
  CurrencyRef?: { value: string; name?: string };
}

export interface QBAccountQueryResponse {
  QueryResponse?: {
    Account?: QBAccountRaw[];
    startPosition?: number;
    maxResults?: number;
    totalCount?: number;
  };
  intuit_tid?: string;
}

// ─── QuickBooks Invoice Raw ───────────────────────────────────

export interface QBInvoiceRaw {
  Id: string;
  DocNumber?: string;
  TxnDate?: string;
  DueDate?: string;
  Balance?: number;
  TotalAmt?: number;
  CustomerRef?: { value: string; name?: string };
  PrivateNote?: string;
  CustomerMemo?: { value?: string };
  CurrencyRef?: { value: string };
}

export interface QBInvoiceQueryResponse {
  QueryResponse?: {
    Invoice?: QBInvoiceRaw[];
    startPosition?: number;
    maxResults?: number;
    totalCount?: number;
  };
  intuit_tid?: string;
}

// ─── Notion Raw Types ─────────────────────────────────────────

/** Una propiedad de una fila de Notion. Unión discriminada por `type`. */
export type NotionProperty =
  | { id: string; type: "title"; title: Array<{ plain_text: string }> }
  | { id: string; type: "rich_text"; rich_text: Array<{ plain_text: string }> }
  | { id: string; type: "number"; number: number | null }
  | {
      id: string;
      type: "select";
      select: { id: string; name: string; color: string } | null;
    }
  | {
      id: string;
      type: "multi_select";
      multi_select: Array<{ id: string; name: string; color: string }>;
    }
  | {
      id: string;
      type: "status";
      status: { id: string; name: string; color: string } | null;
    }
  | {
      id: string;
      type: "date";
      date: { start: string; end: string | null } | null;
    }
  | { id: string; type: "checkbox"; checkbox: boolean }
  | { id: string; type: "url"; url: string | null }
  | { id: string; type: "email"; email: string | null }
  | {
      id: string;
      type: "people";
      people: Array<{ id: string; name?: string }>;
    }
  | { id: string; type: "relation"; relation: Array<{ id: string }> }
  | { id: string; type: "formula"; formula: NotionFormulaValue }
  | { id: string; type: string; [key: string]: unknown };

type NotionFormulaValue =
  | { type: "string"; string: string | null }
  | { type: "number"; number: number | null }
  | { type: "boolean"; boolean: boolean | null }
  | { type: "date"; date: { start: string; end: string | null } | null };

export interface NotionPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  url: string;
  properties: Record<string, NotionProperty>;
}

export interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}
