-- 모여라 카페 콘텐츠센터: 콘텐츠 초안 MVP
-- Supabase SQL Editor에서 대표자 검토 후 한 번만 실행합니다.

create table if not exists public.content_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  keyword text not null check (char_length(trim(keyword)) between 1 and 100),
  purpose text not null check (char_length(trim(purpose)) between 1 and 1000),
  length text not null check (length in ('short', 'medium', 'long')),
  tone text not null check (tone in ('friendly_informative', 'practical_guide')),
  body text not null check (char_length(trim(body)) between 1 and 10000),
  status text not null default 'draft' check (status in ('draft')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists content_drafts_user_id_updated_at_idx
  on public.content_drafts (user_id, updated_at desc);

create index if not exists content_drafts_updated_at_idx
  on public.content_drafts (updated_at desc);

create or replace function public.set_content_drafts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists set_content_drafts_updated_at on public.content_drafts;
create trigger set_content_drafts_updated_at
before update on public.content_drafts
for each row execute function public.set_content_drafts_updated_at();

-- profiles 테이블의 역할을 확인하되, 호출자는 자신의 역할만 간접적으로 사용합니다.
create or replace function public.is_current_user_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_current_user_content_admin() from public;
grant execute on function public.is_current_user_content_admin() to authenticated;

alter table public.content_drafts enable row level security;

grant select, insert, update on public.content_drafts to authenticated;
revoke all on public.content_drafts from anon;

drop policy if exists "content_drafts_select_own_or_admin" on public.content_drafts;
create policy "content_drafts_select_own_or_admin"
on public.content_drafts
for select
to authenticated
using (user_id = auth.uid() or public.is_current_user_content_admin());

drop policy if exists "content_drafts_insert_own" on public.content_drafts;
create policy "content_drafts_insert_own"
on public.content_drafts
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "content_drafts_update_own_or_admin" on public.content_drafts;
create policy "content_drafts_update_own_or_admin"
on public.content_drafts
for update
to authenticated
using (user_id = auth.uid() or public.is_current_user_content_admin())
with check (user_id = auth.uid() or public.is_current_user_content_admin());
