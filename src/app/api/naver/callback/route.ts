import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { encryptNaverToken, getNaverOAuthConfig, hashOAuthState, isExpectedNaverCallback, statesMatch } from "@/lib/naver-oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type TokenResponse = { access_token?: unknown; refresh_token?: unknown; expires_in?: unknown };

function redirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set({ name: "naver_oauth_state", value: "", httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/api/naver", maxAge: 0 });
  return response;
}

function connectionFailed(request: NextRequest, stage: string) {
  // Keep diagnostics useful without exposing OAuth codes, state, tokens, or secrets.
  console.error("Naver OAuth callback failed", { stage });
  return redirect(request, "/settings/naver?notice=connection-failed");
}

function getSafeDatabaseFailureKind(code?: string, message?: string) {
  if (code !== "42501") return code ? "database-error" : "database-error-unknown";

  if (/row-level security/i.test(message ?? "")) return "row-level-security";
  if (/permission denied for table/i.test(message ?? "")) return "table-permission";
  if (/permission denied for sequence/i.test(message ?? "")) return "sequence-permission";
  if (/permission denied for function/i.test(message ?? "")) return "function-permission";
  return "permission-unknown-source";
}

export async function GET(request: NextRequest) {
  const current = await getCurrentUserRole();
  if (!current) {
    console.error("Naver OAuth callback failed", { stage: "missing-current-user" });
    return redirect(request, "/login");
  }
  if (current.role !== "admin") {
    console.error("Naver OAuth callback failed", { stage: "not-admin" });
    return redirect(request, "/dashboard?notice=admin-only");
  }

  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get("naver_oauth_state")?.value;
  if (!state || !stateCookie || !statesMatch(state, stateCookie)) return connectionFailed(request, "invalid-state");

  const supabase = await createClient();
  if (!supabase) return connectionFailed(request, "missing-user-client");

  const now = new Date().toISOString();
  const { data: oauthState } = await supabase
    .from("naver_oauth_states")
    .select("id")
    .eq("owner_user_id", current.user.id)
    .eq("state_hash", hashOAuthState(state))
    .is("consumed_at", null)
    .gt("expires_at", now)
    .maybeSingle();
  if (!oauthState) return connectionFailed(request, "state-not-found-or-expired");

  const { data: consumedState } = await supabase
    .from("naver_oauth_states")
    .update({ consumed_at: now })
    .eq("id", oauthState.id)
    .is("consumed_at", null)
    .select("id")
    .maybeSingle();
  if (!consumedState) return connectionFailed(request, "state-not-consumed");

  const config = getNaverOAuthConfig();
  if (!config) return connectionFailed(request, "invalid-oauth-config");
  if (!isExpectedNaverCallback(config.callbackUrl, request.url)) return connectionFailed(request, "unexpected-callback-url");
  if (request.nextUrl.searchParams.has("error")) return connectionFailed(request, "naver-returned-error");

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return connectionFailed(request, "missing-authorization-code");

  try {
    const tokenResponse = await fetch("https://nid.naver.com/oauth2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-store" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.callbackUrl,
        code,
        state,
      }),
      cache: "no-store",
    });
    if (!tokenResponse.ok) return connectionFailed(request, `token-exchange-http-${tokenResponse.status}`);

    const tokens = await tokenResponse.json() as TokenResponse;
    if (typeof tokens.access_token !== "string" || !tokens.access_token) return connectionFailed(request, "token-response-missing-access-token");
    const refreshToken = typeof tokens.refresh_token === "string" ? tokens.refresh_token : null;
    const expiresIn = typeof tokens.expires_in === "string" || typeof tokens.expires_in === "number" ? Number(tokens.expires_in) : Number.NaN;
    const tokenExpiresAt = Number.isFinite(expiresIn) && expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    const adminClient = createAdminClient();
    if (!adminClient) return connectionFailed(request, "missing-admin-client");

    const { error } = await adminClient.from("naver_oauth_connections").upsert({
      owner_user_id: current.user.id,
      encrypted_access_token: encryptNaverToken(tokens.access_token, config.encryptionKey),
      encrypted_refresh_token: refreshToken ? encryptNaverToken(refreshToken, config.encryptionKey) : null,
      token_expires_at: tokenExpiresAt,
      connected_at: now,
      updated_at: now,
      disconnected_at: null,
    }, { onConflict: "owner_user_id" });
    if (error) {
      // Log only a fixed error category; never emit OAuth values, tokens, keys, or raw database messages.
      console.error("Naver OAuth callback failed", {
        stage: "token-upsert-failed",
        code: error.code,
        reason: getSafeDatabaseFailureKind(error.code, error.message),
      });
      return redirect(request, "/settings/naver?notice=connection-failed");
    }

    return redirect(request, "/settings/naver?notice=connected");
  } catch {
    return connectionFailed(request, "unexpected-exception");
  }
}
