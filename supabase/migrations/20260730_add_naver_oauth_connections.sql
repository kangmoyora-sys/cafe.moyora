create table if not exists public.naver_oauth_states (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id),
  state_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.naver_oauth_connections (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null unique references auth.users(id),
  encrypted_access_token text not null,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  disconnected_at timestamptz
);

create index if not exists naver_oauth_states_owner_expires_idx on public.naver_oauth_states (owner_user_id, expires_at);

drop trigger if exists set_naver_oauth_connections_updated_at on public.naver_oauth_connections;
create trigger set_naver_oauth_connections_updated_at
before update on public.naver_oauth_connections
for each row execute function public.set_content_drafts_updated_at();

alter table public.naver_oauth_states enable row level security;
alter table public.naver_oauth_connections enable row level security;

revoke all on table public.naver_oauth_states from anon;
revoke all on table public.naver_oauth_connections from anon;
grant select, insert, update on public.naver_oauth_states to authenticated;
grant select (owner_user_id, token_expires_at, connected_at, updated_at, disconnected_at) on public.naver_oauth_connections to authenticated;
grant insert (owner_user_id, encrypted_access_token, encrypted_refresh_token, token_expires_at, connected_at, updated_at, disconnected_at) on public.naver_oauth_connections to authenticated;
grant update (encrypted_access_token, encrypted_refresh_token, token_expires_at, connected_at, updated_at, disconnected_at) on public.naver_oauth_connections to authenticated;

drop policy if exists "naver_oauth_states_admin_own_select" on public.naver_oauth_states;
create policy "naver_oauth_states_admin_own_select"
on public.naver_oauth_states for select to authenticated
using (owner_user_id = auth.uid() and public.is_current_user_content_admin());

drop policy if exists "naver_oauth_states_admin_own_insert" on public.naver_oauth_states;
create policy "naver_oauth_states_admin_own_insert"
on public.naver_oauth_states for insert to authenticated
with check (owner_user_id = auth.uid() and public.is_current_user_content_admin());

drop policy if exists "naver_oauth_states_admin_own_update" on public.naver_oauth_states;
create policy "naver_oauth_states_admin_own_update"
on public.naver_oauth_states for update to authenticated
using (owner_user_id = auth.uid() and public.is_current_user_content_admin())
with check (owner_user_id = auth.uid() and public.is_current_user_content_admin());

drop policy if exists "naver_oauth_connections_admin_own_select" on public.naver_oauth_connections;
create policy "naver_oauth_connections_admin_own_select"
on public.naver_oauth_connections for select to authenticated
using (owner_user_id = auth.uid() and public.is_current_user_content_admin());

drop policy if exists "naver_oauth_connections_admin_own_insert" on public.naver_oauth_connections;
create policy "naver_oauth_connections_admin_own_insert"
on public.naver_oauth_connections for insert to authenticated
with check (owner_user_id = auth.uid() and public.is_current_user_content_admin());

drop policy if exists "naver_oauth_connections_admin_own_update" on public.naver_oauth_connections;
create policy "naver_oauth_connections_admin_own_update"
on public.naver_oauth_connections for update to authenticated
using (owner_user_id = auth.uid() and public.is_current_user_content_admin())
with check (owner_user_id = auth.uid() and public.is_current_user_content_admin());
