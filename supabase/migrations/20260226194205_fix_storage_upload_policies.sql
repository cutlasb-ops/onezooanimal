/*
  # Fix storage upload policies for videos bucket

  The videos bucket has no RLS policies, blocking all uploads.
  This adds permissive policies to allow public uploads and reads
  since the bucket is already marked public and used for admin-managed content.

  1. Allow anyone to upload to the videos bucket
  2. Allow anyone to read from the videos bucket
  3. Allow anyone to update/delete (for admin use)
*/

CREATE POLICY "Allow public uploads to videos bucket"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public reads from videos bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'videos');

CREATE POLICY "Allow public updates in videos bucket"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'videos')
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Allow public deletes in videos bucket"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'videos');
