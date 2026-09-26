/*
  # Add video URL field to social media posts

  1. Changes
    - Add `video_url` column to store downloaded and uploaded video URLs
    - Add `thumbnail_url` column for video thumbnails

  2. Notes
    - video_url will store the Supabase Storage URL after downloading from external sources
    - thumbnail_url stores the preview image for the video
*/

-- Add video_url column for TikTok videos
ALTER TABLE social_media_posts
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS thumbnail_url text;