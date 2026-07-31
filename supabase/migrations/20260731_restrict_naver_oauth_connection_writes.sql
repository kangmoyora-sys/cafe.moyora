-- OAuth 토큰 저장은 서버 전용 Service Role client만 수행한다.
-- 인증 사용자에게는 연결 상태 조회 권한만 남긴다.

revoke insert (
  owner_user_id,
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections from authenticated;

revoke update (
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections from authenticated;

drop policy if exists "naver_oauth_connections_admin_own_insert" on public.naver_oauth_connections;
drop policy if exists "naver_oauth_connections_admin_own_update" on public.naver_oauth_connections;
