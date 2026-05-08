import { createClient } from "jsr:@supabase/supabase-js@2";

const POWERBI_SCOPE = "https://analysis.windows.net/powerbi/api/.default";
const CHUNK = 2000;
const DEFAULT_LOOKBACK_DAYS = 90;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(
  body: BodyInit | null,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  return new Response(body, {
    status: init.status ?? 200,
    headers: { ...corsHeaders, ...(init.headers ?? {}) },
  });
}

function respondJson(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function getAzureToken(t: string, c: string, s: string) {
  const res = await fetch(
    `https://login.microsoftonline.com/${t}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: c,
        client_secret: s,
        scope: POWERBI_SCOPE,
      }),
    },
  );
  if (!res.ok) throw new Error(`azure ${res.status}: ${await res.text()}`);
  return (await res.json()).access_token as string;
}

function parseMoney(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return v;
  let s = String(v).trim();
  if (!s) return null;
  const negParen = s.charCodeAt(0) === 40 && s.charCodeAt(s.length - 1) === 41;
  if (negParen) s = s.slice(1, -1);
  s = s.replace(/[\$\s,]/g, "");
  if (!s || s === "-") return null;
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return negParen ? -n : n;
}

function toIsoDate(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const s = String(v);
  if (s.length >= 10 && s[4] === "-" && s[7] === "-") return s.slice(0, 10);
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return null;
}

function toIsoTimestamp(v: unknown): string | null {
  if (!v) return null;
  const d = new Date(String(v));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

type Cell = Record<string, unknown>;
function g(row: Cell, alias: string): unknown {
  const k = `[${alias}]`;
  return k in row ? row[k] : null;
}

interface MappedRow {
  fecha: string;
  cuenta: string;
  nombre_cuenta: string | null;
  centro_costo_codigo: string | null;
  centro_costo_nombre: string | null;
  nit: string | null;
  razon_social: string | null;
  detalle: string | null;
  referencia: string | null;
  debitos: number;
  creditos: number;
  saldo_inicial: number | null;
  saldo_final: number | null;
  saldo_final_ajustado: number | null;
  tipo_ingreso: string | null;
  clasificacion: string | null;
  fecha_auditoria: string | null;
  usuario: string | null;
  source_hash: string;
}

function mapRow(row: Cell): MappedRow | null {
  const fecha = toIsoDate(g(row, "fecha"));
  const cuentaRaw = g(row, "cuenta");
  if (!fecha || !cuentaRaw) return null;
  const cuenta = String(cuentaRaw).trim();
  const c0 = cuenta.charCodeAt(0);
  // ASCII codes for '4'..'6'.
  if (c0 < 52 || c0 > 54) return null;

  const debitos = parseMoney(g(row, "debitos")) ?? 0;
  const creditos = parseMoney(g(row, "creditos")) ?? 0;
  const saldo_final = parseMoney(g(row, "saldo_final"));
  const saldo_final_ajustado = parseMoney(g(row, "saldo_final_ajustado"));
  const saldo_inicial = parseMoney(g(row, "saldo_inicial"));
  const referencia = (g(row, "referencia") as string | null) ?? null;
  const centro_codigo = (g(row, "centro_codigo") as string | null) ?? null;
  const centro_nombre = (g(row, "centro_nombre") as string | null) ?? null;
  const nit = (g(row, "nit") as string | null) ?? null;

  const source_hash =
    `${fecha}|${cuenta}|${referencia ?? ""}|${debitos}|${creditos}|${centro_codigo ?? ""}|${nit ?? ""}`;

  return {
    fecha,
    cuenta,
    nombre_cuenta: (g(row, "nombre_cuenta") as string | null) ?? null,
    centro_costo_codigo: centro_codigo,
    centro_costo_nombre: centro_nombre,
    nit,
    razon_social: (g(row, "razon_social") as string | null) ?? null,
    detalle: (g(row, "detalle") as string | null) ?? null,
    referencia,
    debitos,
    creditos,
    saldo_inicial,
    saldo_final,
    saldo_final_ajustado,
    tipo_ingreso: (g(row, "tipo_ingreso") as string | null) ?? null,
    clasificacion: (g(row, "clasificacion") as string | null) ?? null,
    fecha_auditoria: toIsoTimestamp(g(row, "fecha_auditoria")),
    usuario: (g(row, "usuario") as string | null) ?? null,
    source_hash,
  };
}

function buildDax(from: Date, to: Date): string {
  // Half-open: [from, to)
  return `
EVALUATE
SELECTCOLUMNS(
  CALCULATETABLE(
    'Auxiliar',
    'Auxiliar'[Fecha] >= DATE(${from.getUTCFullYear()}, ${from.getUTCMonth() + 1}, ${from.getUTCDate()}),
    'Auxiliar'[Fecha] < DATE(${to.getUTCFullYear()}, ${to.getUTCMonth() + 1}, ${to.getUTCDate()}),
    LEFT('Auxiliar'[Cuenta8], 1) = "4"
      || LEFT('Auxiliar'[Cuenta8], 1) = "5"
      || LEFT('Auxiliar'[Cuenta8], 1) = "6"
  ),
  "fecha", 'Auxiliar'[Fecha],
  "cuenta", 'Auxiliar'[Cuenta8],
  "nombre_cuenta", 'Auxiliar'[Nombre cuenta],
  "centro_codigo", 'Auxiliar'[Centro costos],
  "centro_nombre", 'Auxiliar'[Nom. centro costos],
  "nit", 'Auxiliar'[nit],
  "razon_social", 'Auxiliar'[RazonSocial],
  "detalle", 'Auxiliar'[Detalle],
  "referencia", 'Auxiliar'[Referencia],
  "debitos", 'Auxiliar'[Debitos],
  "creditos", 'Auxiliar'[Creditos],
  "saldo_inicial", 'Auxiliar'[Saldo Inicial],
  "saldo_final", 'Auxiliar'[Saldo Final],
  "saldo_final_ajustado", 'Auxiliar'[SaldoFinalAjustado],
  "tipo_ingreso", 'Auxiliar'[TIPO_INGRESO],
  "clasificacion", 'Auxiliar'[Clasificaicon],
  "fecha_auditoria", 'Auxiliar'[Fecha auditoria],
  "usuario", 'Auxiliar'[Usuario]
)
`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return respond("ok");

  const startedAt = Date.now();
  let logId: number | null = null;
  let source: "cron" | "manual" = "manual";

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    let triggeredBy: string | null = null;

    if (cronSecret) {
      const { data: row, error } = await admin
        .from("starcorp_vault")
        .select("value")
        .eq("key", "PBI_SYNC_CRON_SECRET")
        .single();
      if (error || !row || row.value !== cronSecret) {
        return respond("Invalid cron secret", { status: 401 });
      }
      source = "cron";
    } else {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return respond("Missing auth", { status: 401 });
      const userJwt = authHeader.replace(/^Bearer\s+/i, "");
      const { data: { user }, error: uErr } = await admin.auth.getUser(
        userJwt,
      );
      if (uErr || !user) return respond("Invalid JWT", { status: 401 });
      triggeredBy = user.id;
      source = "manual";
    }

    const body = await req.json().catch(() => ({})) as {
      from?: string;
      to?: string;
    };

    let from: Date;
    let to: Date;
    const today = new Date();
    if (body.from && body.to) {
      from = new Date(body.from + "T00:00:00Z");
      to = new Date(body.to + "T00:00:00Z");
    } else {
      to = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1),
      );
      from = new Date(to.getTime() - DEFAULT_LOOKBACK_DAYS * 86400_000);
    }
    if (isNaN(from.getTime()) || isNaN(to.getTime()) || from >= to) {
      throw new Error(`invalid range: from=${body.from}, to=${body.to}`);
    }
    const rangeLabel = `${from.toISOString().slice(0, 10)}_to_${to.toISOString().slice(0, 10)}`;

    const { data: log, error: logErr } = await admin
      .from("pbi_sync_log")
      .insert({
        status: "running",
        source,
        triggered_by: triggeredBy,
        error_message: `range=${rangeLabel}`,
      })
      .select("id")
      .single();
    if (logErr || !log) throw new Error(`log insert: ${logErr?.message}`);
    logId = log.id;

    const { data: vault, error: vErr } = await admin
      .from("starcorp_vault")
      .select("key,value")
      .in("key", [
        "AZURE_TENANT_ID",
        "AZURE_CLIENT_ID",
        "AZURE_CLIENT_SECRET",
        "PBI_AUXILIAR_DATASET_ID",
        "PBI_AUXILIAR_GROUP_ID",
      ]);
    if (vErr || !vault || vault.length < 5) {
      throw new Error("Vault misconfigured");
    }
    const kv = Object.fromEntries(vault.map((r) => [r.key, r.value]));

    const azureToken = await getAzureToken(
      kv.AZURE_TENANT_ID,
      kv.AZURE_CLIENT_ID,
      kv.AZURE_CLIENT_SECRET,
    );

    const hasGroup = kv.PBI_AUXILIAR_GROUP_ID &&
      kv.PBI_AUXILIAR_GROUP_ID !== "CHANGE_ME";
    const pbiUrl = hasGroup
      ? `https://api.powerbi.com/v1.0/myorg/groups/${kv.PBI_AUXILIAR_GROUP_ID}/datasets/${kv.PBI_AUXILIAR_DATASET_ID}/executeQueries`
      : `https://api.powerbi.com/v1.0/myorg/datasets/${kv.PBI_AUXILIAR_DATASET_ID}/executeQueries`;

    const dax = buildDax(from, to);
    const pbiRes = await fetch(pbiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${azureToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queries: [{ query: dax }],
        serializerSettings: { includeNulls: true },
      }),
    });
    if (!pbiRes.ok) {
      throw new Error(`PBI ${pbiRes.status}: ${await pbiRes.text()}`);
    }
    const pbiJson = await pbiRes.json() as {
      results: Array<{ tables: Array<{ rows: Cell[] }> }>;
    };
    const rows = pbiJson.results?.[0]?.tables?.[0]?.rows ?? [];
    const rowsFetched = rows.length;

    const seen = new Set<string>();
    const unique: MappedRow[] = [];
    for (const r of rows) {
      const m = mapRow(r);
      if (!m) continue;
      if (seen.has(m.source_hash)) continue;
      seen.add(m.source_hash);
      unique.push(m);
    }

    let upserted = 0;
    for (let i = 0; i < unique.length; i += CHUNK) {
      const slice = unique.slice(i, i + CHUNK);
      const { error } = await admin
        .from("accounting_entries")
        .upsert(slice, { onConflict: "source_hash" });
      if (error) {
        throw new Error(`upsert at offset ${i}: ${error.message}`);
      }
      upserted += slice.length;
    }

    const { error: refErr } = await admin.rpc("refresh_mv_monthly_summary");
    if (refErr) console.warn("refresh MV:", refErr.message);

    const duration = Date.now() - startedAt;
    await admin
      .from("pbi_sync_log")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        rows_fetched: rowsFetched,
        rows_upserted: upserted,
        duration_ms: duration,
        error_message: `range=${rangeLabel}`,
      })
      .eq("id", logId);

    return respondJson({
      ok: true,
      source,
      range: rangeLabel,
      rows_fetched: rowsFetched,
      rows_unique: unique.length,
      rows_upserted: upserted,
      duration_ms: duration,
    });
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    console.error("pbi-sync-auxiliar failed:", message);
    if (logId !== null) {
      await admin
        .from("pbi_sync_log")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          duration_ms: Date.now() - startedAt,
          error_message: message,
        })
        .eq("id", logId);
    }
    return respondJson({ ok: false, error: message }, { status: 500 });
  }
});
