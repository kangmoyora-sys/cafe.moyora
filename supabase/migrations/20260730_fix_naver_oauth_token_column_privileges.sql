revoke all privileges on table public.naver_oauth_connections from public, anon, authenticated;
revoke all privileges (
  id,
  owner_user_id,
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections from public, anon, authenticated;

grant select (
  owner_user_id,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections to authenticated;

grant insert (
  owner_user_id,
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections to authenticated;

grant update (
  encrypted_access_token,
  encrypted_refresh_token,
  token_expires_at,
  connected_at,
  updated_at,
  disconnected_at
) on table public.naver_oauth_connections to authenticated;
