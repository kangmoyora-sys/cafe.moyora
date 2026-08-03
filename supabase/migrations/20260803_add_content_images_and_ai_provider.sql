-- 이미지 선택과 AI 생성 서비스를 초안에 기록합니다.
-- 검토 후 Supabase SQL Editor에서 한 번만 실행하세요. 이 파일은 자동 실행하지 않습니다.

alter table public.content_drafts
  add column if not exists ai_provider text not null default 'openai'
    check (ai_provider in ('openai', 'gemini')),
  add column if not exists images jsonb not null default '[]'::jsonb
    check (case when jsonb_typeof(images) = 'array' then jsonb_array_length(images) <= 8 else false end);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('content-images', 'content-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "content_images_insert_own" on storage.objects;
create policy "content_images_insert_own"
on storage.objects
for insert to authenticated
with check (bucket_id = 'content-images' and owner_id = auth.uid()::text);

drop policy if exists "content_images_delete_own_or_admin" on storage.objects;
create policy "content_images_delete_own_or_admin"
on storage.objects
for delete to authenticated
using (bucket_id = 'content-images' and (owner_id = auth.uid()::text or public.is_current_user_content_admin()));
