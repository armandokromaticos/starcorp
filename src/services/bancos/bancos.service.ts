/**
 * Bancos service.
 *
 * Real path: para cada empresa conectada (Realm de QB) consulta
 * SELECT * FROM Account WHERE AccountType='Bank' y agrega los saldos.
 * Las invocaciones por realm corren en paralelo (cada una es una
 * invocación independiente de la edge function, así no acumulan CPU cap).
 *
 * Mock path: getBancosMock() del mock existente.
 *
 * El delta % compara el saldo en vivo contra el snapshot diario más
 * reciente anterior a hoy (tabla bank_balance_snapshots, poblada por el
 * edge function qb-snapshot-bank-balances vía cron). Se lee con el RPC
 * get_bank_balance_previous(); si una empresa no tiene snapshot previo
 * (primer día conectada) el delta queda en 0.
 */

import { withMock } from '@/src/services/mock/mock-adapter';
import { getBancosMock } from '@/src/services/mock/bancos.mock';
import { supabase } from '@/src/config/supabase';
import {
  qbQuery,
  qbStatus,
  QBNotConnectedError,
  QBReauthRequiredError,
  type QBConnectedCompany,
} from '@/src/services/quickbooks/client';
import type {
  QBAccountQueryResponse,
  QBAccountRaw,
} from '@/src/types/api.types';
import type {
  BancoCuenta,
  BancoEmpresa,
  BancosSnapshot,
} from '@/src/types/bancos.types';
import { CHART_COLORS, CHART_GRADIENTS } from '@/src/theme/chart-palette';

const BANK_ACCOUNT_QUERY = "SELECT * FROM Account WHERE AccountType='Bank'";

function slugify(name: string, fallback: string): string {
  if (!name) return fallback;
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || fallback
  );
}

/** "Chase Checking - X 9932" → "CK 9932"; fallback a Id. */
function buildCode(acc: QBAccountRaw): string {
  const sub = (acc.AccountSubType ?? '').toLowerCase();
  const prefix = sub.includes('saving') || sub.includes('money')
    ? 'SW'
    : sub.includes('credit')
      ? 'CC'
      : 'CK';
  if (acc.AcctNum) {
    // En QB el AcctNum suele venir parcialmente enmascarado
    // ("XXXX1234"). Tomamos los últimos 4 dígitos limpios.
    const digits = acc.AcctNum.replace(/\D/g, '');
    const last4 = digits.slice(-4);
    if (last4) return `${prefix} ${last4}`;
  }
  return `${prefix} ${acc.Id.slice(-4)}`;
}

/** Máx. MetaData.LastUpdatedTime (ISO) entre las cuentas; null si no hay. */
function latestUpdatedTime(raw: QBAccountRaw[]): string | null {
  let latest: string | null = null;
  for (const acc of raw) {
    const t = acc.MetaData?.LastUpdatedTime;
    if (t && (latest === null || t > latest)) latest = t;
  }
  return latest;
}

function normalizeAccounts(
  empresaId: string,
  raw: QBAccountRaw[],
): BancoCuenta[] {
  const active = raw.filter((a) => a.Active !== false);
  return active.map((acc, idx) => ({
    id: `${empresaId}-acc-${acc.Id}`,
    name: acc.Name,
    code: buildCode(acc),
    color: CHART_COLORS[idx % CHART_COLORS.length],
    gradient: CHART_GRADIENTS[idx % CHART_GRADIENTS.length],
    balance: typeof acc.CurrentBalance === 'number' ? acc.CurrentBalance : 0,
  }));
}

interface PreviousBalanceRow {
  realm_id: string;
  previous_total: number | string;
  snapshot_date: string;
}

/** deltaPct entre el saldo en vivo y el snapshot previo; 0 si no hay base. */
function computeDeltaPct(current: number | null, previous: number | undefined): number {
  if (current == null || !previous) return 0;
  return ((current - previous) / previous) * 100;
}

async function fetchPreviousBalances(): Promise<Map<string, number>> {
  const { data, error } = await supabase.rpc('get_bank_balance_previous');
  if (error) {
    console.warn('[bancos] get_bank_balance_previous failed', error);
    return new Map();
  }
  const rows = (data as PreviousBalanceRow[] | null) ?? [];
  return new Map(rows.map((r) => [r.realm_id, Number(r.previous_total)]));
}

async function fetchEmpresa(
  company: QBConnectedCompany,
): Promise<BancoEmpresa> {
  const empresaId = slugify(
    company.name ?? `empresa-${company.realmId.slice(-4)}`,
    company.realmId,
  );
  const empresaName =
    company.name ?? `Empresa ${company.realmId.slice(-4)}`;

  if (company.reauthRequired) {
    return {
      id: empresaId,
      name: empresaName,
      balance: null,
      deltaPct: 0,
      lastUpdatedAt: null,
      cuentas: [],
    };
  }

  try {
    const resp = await qbQuery<QBAccountQueryResponse>(
      'query',
      { query: BANK_ACCOUNT_QUERY },
      company.realmId,
    );
    const raw = resp.QueryResponse?.Account ?? [];
    const cuentas = normalizeAccounts(empresaId, raw);
    const balance = cuentas.length
      ? cuentas.reduce((s, c) => s + c.balance, 0)
      : null;
    return {
      id: empresaId,
      name: empresaName,
      balance,
      deltaPct: 0,
      lastUpdatedAt: latestUpdatedTime(raw),
      cuentas,
    };
  } catch (e) {
    // Empresas sin conexión o con reauth quedan como "--"; el resto del
    // informe sigue funcionando con las que sí respondieron.
    if (e instanceof QBNotConnectedError || e instanceof QBReauthRequiredError) {
      return {
        id: empresaId,
        name: empresaName,
        balance: null,
        deltaPct: 0,
        lastUpdatedAt: null,
        cuentas: [],
      };
    }
    console.warn(`[bancos] fetch ${empresaName} failed`, e);
    return {
      id: empresaId,
      name: empresaName,
      balance: null,
      deltaPct: 0,
      lastUpdatedAt: null,
      cuentas: [],
    };
  }
}

async function fetchFromQB(): Promise<BancosSnapshot> {
  const { companies } = await qbStatus();

  if (companies.length === 0) {
    // Sin empresas QB conectadas → snapshot vacío. La UI muestra el
    // hero en 0 y la lista vacía.
    const todayIso = new Date().toISOString().slice(0, 10);
    return {
      totalizado: 0,
      deltaPct: 0,
      updatedAt: todayIso,
      empresas: [],
    };
  }

  // Cada empresa (una invocación por realm, en paralelo) y el snapshot
  // previo (un solo RPC) corren en paralelo — son independientes.
  const [rawEmpresas, previousByRealm] = await Promise.all([
    Promise.all(companies.map(fetchEmpresa)),
    fetchPreviousBalances(),
  ]);

  // Promise.all preserva el orden de `companies`, así que hacemos zip por
  // índice para conocer el realmId de cada empresa sin recalcular el slug.
  const empresas = rawEmpresas.map((e, i) => ({
    ...e,
    deltaPct: computeDeltaPct(e.balance, previousByRealm.get(companies[i].realmId)),
  }));

  const totalizado = empresas.reduce((s, e) => s + (e.balance ?? 0), 0);
  const totalPrevious = [...previousByRealm.values()].reduce((s, v) => s + v, 0);
  const todayIso = new Date().toISOString().slice(0, 10);

  // Fecha de corte = última actualización de cuentas en QB (máx. entre
  // empresas); fallback a hoy si ninguna cuenta trae LastUpdatedTime.
  const latestAccountUpdate = empresas
    .map((e) => e.lastUpdatedAt)
    .filter((t): t is string => t != null)
    .sort()
    .pop();

  return {
    totalizado,
    deltaPct: computeDeltaPct(totalizado, totalPrevious),
    updatedAt: latestAccountUpdate?.slice(0, 10) ?? todayIso,
    empresas,
  };
}

export async function getBancosSnapshot(): Promise<BancosSnapshot> {
  return withMock(fetchFromQB, () => getBancosMock());
}
