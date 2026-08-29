/**
 * Cartera service — AR aging.
 *
 * Real path: para cada Realm de QB consulta las facturas con balance > 0
 * y deriva el bucket de aging desde DueDate vs hoy. Las invocaciones por
 * realm corren en paralelo. Los clientes se identifican por
 * `${realmId}-${customerId}` para evitar colisiones entre Realms.
 *
 * Mock path: getCarteraMock() del mock existente.
 *
 * Notes:
 *   - `daysOverdue` = dueDate - today (positivo = corriente, negativo = vencida).
 *   - QB Customers de distintos realms aparecen como entries separadas.
 *     Si necesitamos merge por nombre, lo hacemos en una segunda fase.
 *   - Las empresas del grupo se facturan entre sí, así que cada una está
 *     dada de alta como Customer en el QB de las otras. Esa deuda
 *     intercompañía se filtra con la tabla `qb_customer_exclusions`
 *     (match por nombre normalizado, no por customerId: los ids cambian
 *     entre realms).
 */

import { withMock } from '@/src/services/mock/mock-adapter';
import { supabase } from '@/src/config/supabase';
import { getCarteraMock } from '@/src/services/mock/cartera.mock';
import { SEGMENT_PALETTE as PALETTE } from '@/src/theme/gradients';
import {
  qbQuery,
  qbStatus,
  QBNotConnectedError,
  QBReauthRequiredError,
} from '@/src/services/quickbooks/client';
import type {
  QBInvoiceQueryResponse,
  QBInvoiceRaw,
} from '@/src/types/api.types';
import type {
  AgingBucket,
  CarteraClient,
  CarteraInvoice,
  CarteraSnapshot,
} from '@/src/types/cartera.types';

const INVOICE_QUERY = "SELECT * FROM Invoice WHERE Balance > '0' MAXRESULTS 1000";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function diffInDays(targetIso: string, base: Date): number {
  const t = new Date(`${targetIso}T00:00:00Z`).getTime();
  return Math.round((t - base.getTime()) / 86400000);
}

function bucketFromDays(daysOverdue: number): AgingBucket {
  if (daysOverdue >= 0) return 'corriente';
  if (daysOverdue >= -30) return '0-30';
  if (daysOverdue >= -60) return '31-60';
  if (daysOverdue >= -90) return '61-90';
  return '91+';
}

function emptyBuckets(): Record<AgingBucket, number> {
  return { corriente: 0, '0-30': 0, '31-60': 0, '61-90': 0, '91+': 0 };
}

function parseIsoDate(value: string | undefined): string {
  if (!value) return '';
  // QB devuelve TxnDate / DueDate como yyyy-mm-dd
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

/**
 * Clave de match de exclusiones: mayúsculas y solo alfanuméricos, para que
 * "ONE A SOLUTIONS LLC" y "ONEA SOLUTIONS LLC" caigan en la misma clave.
 */
function customerKey(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Customers que no son cartera real (las empresas del grupo facturándose
 * entre sí). Si la tabla no se puede leer se propaga el error en vez de
 * seguir: es preferible que el informe falle a que los saldos
 * intercompañía reaparezcan inflando el total sin que se note.
 */
async function fetchExcludedCustomerKeys(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('qb_customer_exclusions')
    .select('customer_name');
  if (error) throw new Error(`load qb_customer_exclusions: ${error.message}`);
  const rows = (data ?? []) as { customer_name: string }[];
  return new Set(rows.map((r) => customerKey(r.customer_name)));
}

async function fetchRealmInvoices(
  realmId: string,
): Promise<QBInvoiceRaw[]> {
  try {
    const resp = await qbQuery<QBInvoiceQueryResponse>(
      'query',
      { query: INVOICE_QUERY },
      realmId,
    );
    return resp.QueryResponse?.Invoice ?? [];
  } catch (e) {
    if (
      e instanceof QBNotConnectedError ||
      e instanceof QBReauthRequiredError
    ) {
      return [];
    }
    console.warn(`[cartera] realm ${realmId} fetch failed`, e);
    return [];
  }
}

async function fetchFromQB(): Promise<CarteraSnapshot> {
  const [{ companies }, excludedCustomers] = await Promise.all([
    qbStatus(),
    fetchExcludedCustomerKeys(),
  ]);
  if (companies.length === 0) {
    return { clients: [], updatedAt: todayIso() };
  }

  const today = new Date(`${todayIso()}T00:00:00Z`);

  // Invocaciones por realm en paralelo
  const invoicesByRealm = await Promise.all(
    companies.map(async (c) => ({
      company: c,
      invoices: await fetchRealmInvoices(c.realmId),
    })),
  );

  const clientsMap = new Map<string, CarteraClient>();
  let colorIdx = 0;

  for (const { company, invoices } of invoicesByRealm) {
    for (const inv of invoices) {
      const balance = typeof inv.Balance === 'number' ? inv.Balance : 0;
      if (balance <= 0) continue;

      const customerId = inv.CustomerRef?.value ?? 'unknown';
      const customerName =
        inv.CustomerRef?.name ?? `Cliente ${customerId.slice(-4)}`;
      if (excludedCustomers.has(customerKey(customerName))) continue;
      const clientKey = `${company.realmId}-${customerId}`;

      let client = clientsMap.get(clientKey);
      if (!client) {
        client = {
          id: clientKey,
          name: customerName,
          color: PALETTE[colorIdx % PALETTE.length],
          buckets: emptyBuckets(),
          total: 0,
          invoices: [],
        };
        clientsMap.set(clientKey, client);
        colorIdx += 1;
      }

      const dueDate = parseIsoDate(inv.DueDate);
      const txnDate = parseIsoDate(inv.TxnDate);
      const daysOverdue = dueDate ? diffInDays(dueDate, today) : 0;
      const bucket = bucketFromDays(daysOverdue);

      const note = inv.PrivateNote || inv.CustomerMemo?.value || undefined;

      const carteraInvoice: CarteraInvoice = {
        id: `${company.realmId}-${inv.Id}`,
        date: txnDate,
        dueDate,
        daysOverdue,
        invoiceNumber: inv.DocNumber ?? inv.Id,
        note,
        amount: balance,
        bucket,
      };

      client.invoices.push(carteraInvoice);
      client.buckets[bucket] += balance;
      client.total += balance;
    }
  }

  // Ordenar invoices de cada cliente por fecha de vencimiento y, a igual
  // vencimiento, por número de factura (comparación numérica: F-9 < F-10).
  for (const client of clientsMap.values()) {
    client.invoices.sort(
      (a, b) =>
        a.daysOverdue - b.daysOverdue ||
        a.invoiceNumber.localeCompare(b.invoiceNumber, undefined, {
          numeric: true,
        }),
    );
  }

  return {
    clients: [...clientsMap.values()],
    updatedAt: todayIso(),
  };
}

export async function getCarteraSnapshot(): Promise<CarteraSnapshot> {
  return withMock(fetchFromQB, () => getCarteraMock());
}
