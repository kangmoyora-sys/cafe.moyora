-- OAuth 토큰 저장은 서버 전용 Service Role client만 수행한다.
-- 충돌 대상 확인에 필요한 owner_user_id 외에는 토큰 값을 조회할 수 없다.

grant insert (
  owner_user_id,
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections to service_role;

grant update (
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections to service_role;

grant select (
  owner_user_id
) on table public.naver_oauth_connections to service_role;
