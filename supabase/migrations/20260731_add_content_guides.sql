-- 재사용 가능한 작성 가이드와 초안별 적용 기록.
-- 실행 전 Production/Preview DB 범위를 별도로 확인한다.

create table if not exists public.content_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 100),
  instructions text not null check (char_length(trim(instructions)) between 1 and 5000),
  is_active boolean not null default true,
  created_by uuid not null default auth.uid() references auth.users(id) on delete restrict,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists content_guides_active_updated_at_idx
  on public.content_guides (is_active, updated_at desc);

drop trigger if exists set_content_guides_updated_at on public.content_guides;
create trigger set_content_guides_updated_at
before update on public.content_guides
for each row execute function public.set_content_drafts_updated_at();

alter table public.content_guides enable row level security;

grant select, insert, update on public.content_guides to authenticated;
revoke all on public.content_guides from anon;

drop policy if exists "content_guides_select_active_or_admin" on public.content_guides;
create policy "content_guides_select_active_or_admin"
on public.content_guides
for select
to authenticated
using (is_active or public.is_current_user_content_admin());

drop policy if exists "content_guides_insert_admin" on public.content_guides;
create policy "content_guides_insert_admin"
on public.content_guides
for insert
to authenticated
with check (public.is_current_user_content_admin() and created_by = auth.uid());

drop policy if exists "content_guides_update_admin" on public.content_guides;
create policy "content_guides_update_admin"
on public.content_guides
for update
to authenticated
using (public.is_current_user_content_admin())
with check (public.is_current_user_content_admin());

alter table public.content_drafts
  add column if not exists writing_guide_id uuid references public.content_guides(id) on delete set null,
  add column if not exists writing_guide_title text,
  add column if not exists writing_guide_instructions text;

alter table public.content_drafts
  drop constraint if exists content_drafts_writing_guide_title_length,
  drop constraint if exists content_drafts_writing_guide_instructions_length;

alter table public.content_drafts
  add constraint content_drafts_writing_guide_title_length
    check (writing_guide_title is null or char_length(trim(writing_guide_title)) between 1 and 100),
  add constraint content_drafts_writing_guide_instructions_length
    check (writing_guide_instructions is null or char_length(trim(writing_guide_instructions)) between 1 and 5000);
