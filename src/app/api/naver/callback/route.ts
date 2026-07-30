import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { encryptNaverToken, getNaverOAuthConfig, hashOAuthState, isExpectedNaverCallback, statesMatch } from "@/lib/naver-oauth";
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

export async function GET(request: NextRequest) {
  const current = await getCurrentUserRole();
  if (!current) return redirect(request, "/login");
  if (current.role !== "admin") return redirect(request, "/dashboard?notice=admin-only");

  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get("naver_oauth_state")?.value;
  if (!state || !stateCookie || !statesMatch(state, stateCookie)) return redirect(request, "/settings/naver?notice=connection-failed");

  const supabase = await createClient();
  if (!supabase) return redirect(request, "/settings/naver?notice=connection-failed");

  const now = new Date().toISOString();
  const { data: oauthState } = await supabase
    .from("naver_oauth_states")
    .select("id")
    .eq("owner_user_id", current.user.id)
    .eq("state_hash", hashOAuthState(state))
    .is("consumed_at", null)
    .gt("expires_at", now)
    .maybeSingle();
  if (!oauthState) return redirect(request, "/settings/naver?notice=connection-failed");

  const { data: consumedState } = await supabase
    .from("naver_oauth_states")
    .update({ consumed_at: now })
    .eq("id", oauthState.id)
    .is("consumed_at", null)
    .select("id")
    .maybeSingle();
  if (!consumedState) return redirect(request, "/settings/naver?notice=connection-failed");

  const config = getNaverOAuthConfig();
  if (!config) return redirect(request, "/settings/naver?notice=connection-failed");
  if (!isExpectedNaverCallback(config.callbackUrl, request.url)) return redirect(request, "/settings/naver?notice=connection-failed");
  if (request.nextUrl.searchParams.has("error")) return redirect(request, "/settings/naver?notice=connection-failed");

  const code = request.nextUrl.searchParams.get("code");
  if (!code) return redirect(request, "/settings/naver?notice=connection-failed");

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
    if (!tokenResponse.ok) return redirect(request, "/settings/naver?notice=connection-failed");

    const tokens = await tokenResponse.json() as TokenResponse;
    if (typeof tokens.access_token !== "string" || !tokens.access_token) return redirect(request, "/settings/naver?notice=connection-failed");
    const refreshToken = typeof tokens.refresh_token === "string" ? tokens.refresh_token : null;
    const expiresIn = typeof tokens.expires_in === "string" || typeof tokens.expires_in === "number" ? Number(tokens.expires_in) : Number.NaN;
    const tokenExpiresAt = Number.isFinite(expiresIn) && expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    const { error } = await supabase.from("naver_oauth_connections").upsert({
      owner_user_id: current.user.id,
      encrypted_access_token: encryptNaverToken(tokens.access_token, config.encryptionKey),
      encrypted_refresh_token: refreshToken ? encryptNaverToken(refreshToken, config.encryptionKey) : null,
      token_expires_at: tokenExpiresAt,
      connected_at: now,
      updated_at: now,
      disconnected_at: null,
    }, { onConflict: "owner_user_id" });
    if (error) return redirect(request, "/settings/naver?notice=connection-failed");

    return redirect(request, "/settings/naver?notice=connected");
  } catch {
    return redirect(request, "/settings/naver?notice=connection-failed");
  }
}
