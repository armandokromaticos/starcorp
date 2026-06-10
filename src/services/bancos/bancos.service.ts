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
 * El delta % no viene de QB en una sola query — para tener histórico
 * habría que pedir snapshots previos. Por ahora se deja en 0; cuando
 * tengamos un job que persista snapshots diarios en Supabase, lo
 * enriquecemos comparando con el último snapshot guardado.
 */

import { withMock } from '@/src/services/mock/mock-adapter';
import { getBancosMock } from '@/src/services/mock/bancos.mock';
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

  // Una invocación por realm en paralelo (cada fn corre con su propio CPU).
  const empresas = await Promise.all(companies.map(fetchEmpresa));

  const totalizado = empresas.reduce((s, e) => s + (e.balance ?? 0), 0);
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
    deltaPct: 0,
    updatedAt: latestAccountUpdate?.slice(0, 10) ?? todayIso,
    empresas,
  };
}

export async function getBancosSnapshot(): Promise<BancosSnapshot> {
  return withMock(fetchFromQB, () => getBancosMock());
}
