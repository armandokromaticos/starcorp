import { createClient } from "jsr:@supabase/supabase-js@2";

const TOKEN_URL = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer";
const APP_DEEP_LINK = "starcorp://oauth/quickbooks";

function redirect(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return Response.redirect(`${APP_DEEP_LINK}?${qs}`, 302);
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const realmId = url.searchParams.get("realmId");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) return redirect({ status: "error", reason: error });
  if (!code || !realmId || !state) {
    return redirect({ status: "error", reason: "missing_params" });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // Single-use nonce: delete-and-return in one round-trip
  const { data: stateRow, error: sErr } = await admin
    .from("qb_oauth_states")
    .delete()
    .eq("nonce", state)
    .select("user_id, expires_at")
    .maybeSingle<{ user_id: string; expires_at: string }>();

  if (sErr || !stateRow) {
    return redirect({ status: "error", reason: "invalid_state" });
  }
  if (new Date(stateRow.expires_at).getTime() < Date.now()) {
    return redirect({ status: "error", reason: "state_expired" });
  }

  const userId = stateRow.user_id;

  const { data: vault, error: vErr } = await admin
    .from("starcorp_vault")
    .select("key,value")
    .in("key", ["QB_CLIENT_ID", "QB_CLIENT_SECRET"]);
  if (vErr || !vault || vault.length < 2) {
    return redirect({ status: "error", reason: "vault_misconfigured" });
  }
  const kv = Object.fromEntries(vault.map((r) => [r.key, r.value]));

  const redirectUri =
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/qb-oauth-callback`;
  const basic = btoa(`${kv.QB_CLIENT_ID}:${kv.QB_CLIENT_SECRET}`);

  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    console.error("QB token exchange failed", tokenRes.status);
    return redirect({ status: "error", reason: "exchange_failed" });
  }

  const t = await tokenRes.json() as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    x_refresh_token_expires_in: number;
  };

  const now = Date.now();
  const { error: upErr } = await admin.from("qb_user_tokens").upsert({
    user_id: userId,
    realm_id: realmId,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    access_expires_at: new Date(now + t.expires_in * 1000).toISOString(),
    refresh_expires_at: new Date(
      now + t.x_refresh_token_expires_in * 1000,
    ).toISOString(),
    updated_at: new Date(now).toISOString(),
  });

  if (upErr) {
    console.error("Token upsert failed", upErr);
    return redirect({ status: "error", reason: "persist_failed" });
  }

  return redirect({ status: "ok", realmId });
});
