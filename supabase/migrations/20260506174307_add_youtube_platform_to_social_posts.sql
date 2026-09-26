/*
  # Add youtube platform to social_media_posts

  1. Changes
    - Drop old platform CHECK constraint that restricted to instagram/tiktok only
    - Add new CHECK constraint that also allows 'youtube' for YouTube Shorts

  2. Security
    - No RLS changes; existing policies continue to apply
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'social_media_posts_platform_check'
  ) THEN
    ALTER TABLE social_media_posts DROP CONSTRAINT social_media_posts_platform_check;
  END IF;
END $$;

ALTER TABLE social_media_posts
  ADD CONSTRAINT social_media_posts_platform_check
  CHECK (platform IN ('instagram', 'tiktok', 'youtube'));
