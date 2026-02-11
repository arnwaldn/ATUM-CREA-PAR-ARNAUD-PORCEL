-- Migration: Create storage bucket for user files
-- Files are stored with user ID prefix for RLS isolation

-- Create the files bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'files',
  'files',
  false,
  52428800, -- 50MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain', 'application/json']
)
on conflict (id) do nothing;

-- Enable RLS on storage.objects
alter table storage.objects enable row level security;

-- Policy: Users can upload files to their own folder
create policy "Users can upload to own folder"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'files'
  AND authenticative.is_user_authenticated()
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can view their own files
create policy "Users can view own files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'files'
  AND authenticative.is_user_authenticated()
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can update their own files
create policy "Users can update own files"
on storage.objects for update
to authenticated
using (
  bucket_id = 'files'
  AND authenticative.is_user_authenticated()
  AND (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'files'
  AND authenticative.is_user_authenticated()
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own files
create policy "Users can delete own files"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'files'
  AND authenticative.is_user_authenticated()
  AND (storage.foldername(name))[1] = auth.uid()::text
);
