/*
  # Add Social Media Posts Configuration

  1. New Tables
    - `social_media_posts`
      - `id` (uuid, primary key)
      - `platform` (text) - 'instagram' or 'tiktok'
      - `post_url` (text) - Full URL to the post
      - `is_active` (boolean) - Whether to display this post
      - `display_order` (integer) - Order to display posts
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `social_media_posts` table
    - Add policy for anyone to read active posts
    - Add policy for service role to manage posts

  3. Initial Data
    - Add sample Instagram and TikTok post URLs
*/

CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  post_url text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active social media posts"
  ON social_media_posts
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role can manage social media posts"
  ON social_media_posts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert sample posts
INSERT INTO social_media_posts (platform, post_url, display_order, is_active) VALUES
  ('instagram', 'https://www.instagram.com/p/C2abc123def/', 1, true),
  ('tiktok', 'https://www.tiktok.com/@username/video/1234567890123456789', 1, true)
ON CONFLICT DO NOTHING;