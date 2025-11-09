-- Configure bucket settings for file size and MIME type restrictions
UPDATE storage.buckets
SET 
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id IN ('avatars', 'event-ads');

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event ads" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own event ads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own event ads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view event ads" ON storage.objects;

-- RLS policies for avatars bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- RLS policies for event-ads bucket
CREATE POLICY "Authenticated users can upload event ads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'event-ads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own event ads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'event-ads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own event ads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'event-ads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Anyone can view event ads"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-ads');