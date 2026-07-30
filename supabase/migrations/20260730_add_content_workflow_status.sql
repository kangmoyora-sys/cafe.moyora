-- 콘텐츠 초안 상태 워크플로우: draft, review, approved

alter table public.content_drafts
  drop constraint if exists content_drafts_status_check;

alter table public.content_drafts
  add constraint content_drafts_status_check
  check (status in ('draft', 'review', 'approved'));

drop policy if exists "content_drafts_insert_own" on public.content_drafts;
create policy "content_drafts_insert_own"
on public.content_drafts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    status in ('draft', 'review')
    or (
      public.is_current_user_content_admin()
      and status = 'approved'
    )
  )
);

drop policy if exists "content_drafts_update_own_or_admin" on public.content_drafts;
create policy "content_drafts_update_own_or_admin"
on public.content_drafts
for update
to authenticated
using (
  user_id = auth.uid()
  or public.is_current_user_content_admin()
)
with check (
  (
    public.is_current_user_content_admin()
    and status in ('draft', 'review', 'approved')
  )
  or (
    user_id = auth.uid()
    and status in ('draft', 'review')
  )
);
