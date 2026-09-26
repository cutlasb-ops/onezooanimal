/*
  # Create Videos Storage Bucket

  1. New Storage
    - Create 'videos' bucket for storing uploaded video files
    - Set bucket to public for easy access
    - Configure file size limits and allowed MIME types

  2. Notes
    - Videos will be stored in the 'videos' bucket
    - File paths will be stored in the database
    - Public access allows direct video streaming
    - Storage policies are managed by Supabase automatically
*/

-- Create the videos bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 524288000,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];