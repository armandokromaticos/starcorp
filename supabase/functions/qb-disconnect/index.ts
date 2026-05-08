import { createClient } from "jsr:@supabase/supabase-js@2";

const REVOKE_URL = "https://developer.api.intuit.com/v2/oauth2/tokens/revoke";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respondJson(body: unknown, init: { status?: number } = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return respondJson({ error: "missing_auth" }, { status: 401 });
    const userJwt = authHeader.replace(/^Bearer\s+/i, "");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: { user }, error: uErr } = await admin.auth.getUser(userJwt);
    if (uErr || !user) return respondJson({ error: "invalid_jwt" }, { status: 401 });

    const { data: row } = await admin
      .from("qb_user_tokens")
      .select("refresh_token")
      .eq("user_id", user.id)
      .maybeSingle<{ refresh_token: string }>();

    if (!row) return respondJson({ status: "already_disconnected" });

    const { data: vault, error: vErr } = await admin
      .from("starcorp_vault")
      .select("key,value")
      .in("key", ["QB_CLIENT_ID", "QB_CLIENT_SECRET"]);
    if (vErr || !vault || vault.length < 2) {
      return respondJson({ error: "vault_misconfigured" }, { status: 500 });
    }
    const kv = Object.fromEntries(vault.map((r) => [r.key, r.value]));

    const basic = btoa(`${kv.QB_CLIENT_ID}:${kv.QB_CLIENT_SECRET}`);
    // Best-effort revoke at Intuit; we delete locally regardless.
    const revokeRes = await fetch(REVOKE_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ token: row.refresh_token }),
    });
    if (!revokeRes.ok) {
      console.warn("QB revoke non-2xx", revokeRes.status);
    }

    const { error: delErr } = await admin
      .from("qb_user_tokens")
      .delete()
      .eq("user_id", user.id);
    if (delErr) {
      console.error("delete failed", delErr);
      return respondJson({ error: "delete_failed" }, { status: 500 });
    }

    return respondJson({ status: "disconnected" });
  } catch (err) {
    console.error(err);
    return respondJson({ error: "internal" }, { status: 500 });
  }
});
