import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserRole } from "@/lib/auth";
import { createNaverAuthorizationUrl, createOAuthState, getNaverOAuthConfig, getOAuthStateExpiry, hashOAuthState } from "@/lib/naver-oauth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function redirect(request: NextRequest, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function GET(request: NextRequest) {
  const current = await getCurrentUserRole();
  if (!current) return redirect(request, "/login");
  if (current.role !== "admin") return redirect(request, "/dashboard?notice=admin-only");

  const config = getNaverOAuthConfig();
  if (!config) return redirect(request, "/settings/naver?notice=not-configured");

  const supabase = await createClient();
  if (!supabase) return redirect(request, "/settings/naver?notice=connection-failed");

  const state = createOAuthState();
  const { error } = await supabase.from("naver_oauth_states").insert({
    owner_user_id: current.user.id,
    state_hash: hashOAuthState(state),
    expires_at: getOAuthStateExpiry(),
  });
  if (error) return redirect(request, "/settings/naver?notice=connection-failed");

  const response = NextResponse.redirect(createNaverAuthorizationUrl(config, state));
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set({
    name: "naver_oauth_state",
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/naver",
    maxAge: 10 * 60,
  });
  return response;
}
