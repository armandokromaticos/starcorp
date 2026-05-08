import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

interface TokenRow {
  user_id: string;
  realm_id: string;
  access_token: string;
  refresh_token: string;
  access_expires_at: string;
  refresh_expires_at: string;
  updated_at: string;
}

async function refreshIfNeeded(
  admin: SupabaseClient,
  userId: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenRow> {
  const { data: row, error } = await admin
    .from("qb_user_tokens")
    .select("*")
    .eq("user_id", userId)
    .single<TokenRow>();
  if (error || !row) throw new Error("not_connected");

  // Refresh tokens expire after 101 days of inactivity.
  if (new Date(row.refresh_expires_at).getTime() < Date.now()) {
    throw new Error("reauth_required");
  }

  if (new Date(row.access_expires_at).getTime() > Date.now() + 60_000) {
    return row;
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
    }),
  });
  if (res.status === 400 || res.status === 401) {
    throw new Error("reauth_required");
  }
  if (!res.ok) throw new Error(`refresh_failed_${res.status}`);

  const t = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
  };
  const now = Date.now();
  const updated: TokenRow = {
    ...row,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    access_expires_at: new Date(now + t.expires_in * 1000).toISOString(),
    refresh_expires_at: new Date(
      now + t.x_refresh_token_expires_in * 1000,
    ).toISOString(),
    updated_at: new Date(now).toISOString(),
  };
  await admin.from("qb_user_tokens").update(updated).eq("user_id", userId);
  return updated;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return respond("ok");

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respond("Missing auth", { status: 401 });
    const userJwt = authHeader.replace(/^Bearer\s+/i, "");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: uErr } = await admin.auth.getUser(userJwt);
    if (uErr || !user) return respond("Invalid JWT", { status: 401 });

    const body = await req.json() as {
      endpoint: string;
      query?: Record<string, string>;
    };
    if (!body.endpoint) {
      return respond("endpoint required", { status: 400 });
    }

    const { data: vault, error: vErr } = await admin
      .from("starcorp_vault")
      .select("key,value")
      .in("key", ["QB_CLIENT_ID", "QB_CLIENT_SECRET", "QB_ENVIRONMENT"]);
    if (vErr || !vault || vault.length < 3) {
      return respond("Vault misconfigured", { status: 500 });
    }
    const kv = Object.fromEntries(vault.map((r) => [r.key, r.value]));

    let tokens: TokenRow;
    try {
      tokens = await refreshIfNeeded(
        admin,
        user.id,
        kv.QB_CLIENT_ID,
        kv.QB_CLIENT_SECRET,
      );
    } catch (e) {
      const msg = (e as Error).message;
      if (msg === "not_connected") {
        return respondJson({ error: "not_connected" }, { status: 409 });
      }
      if (msg === "reauth_required") {
        return respondJson({ error: "reauth_required" }, { status: 410 });
      }
      throw e;
    }

    const base = kv.QB_ENVIRONMENT === "production"
      ? "https://quickbooks.api.intuit.com"
      : "https://sandbox-quickbooks.api.intuit.com";

    const cleanedEndpoint = body.endpoint.replace(/^\//, "");
    const qs = body.query
      ? "?" + new URLSearchParams(body.query).toString()
      : "";
    const url =
      `${base}/v3/company/${tokens.realm_id}/${cleanedEndpoint}${qs}`;

    const qbRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        Accept: "application/json",
      },
    });
    if (!qbRes.ok) {
      const txt = await qbRes.text();
      return respond(`QB ${qbRes.status}: ${txt}`, { status: 502 });
    }
    return respondJson(await qbRes.json());
  } catch (err) {
    console.error(err);
    return respond("Internal error", { status: 500 });
  }
});
