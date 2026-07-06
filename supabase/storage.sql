-- Creates the "post-images" bucket used by the New Post upload flow, plus
-- policies so anyone can view images but only the owner can upload/manage
-- their own. Run this in the Supabase SQL editor after schema.sql.

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "public read access to post images"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "users upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users manage own uploaded files"
  on storage.objects for update using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own uploaded files"
  on storage.objects for delete using (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Uploads from the app go to: post-images/<user_id>/<uuid>.<ext>
-- which is exactly what components/NewPostModal.tsx does.
