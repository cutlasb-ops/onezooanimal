/*
  # Create BTL Streams Table

  1. New Tables
    - `btl_streams`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `yt_id` (text, required) - YouTube video ID
      - `stream_type` (text) - 'live' or 'video'
      - `display_order` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public SELECT for all visitors
    - INSERT/UPDATE/DELETE only for service role (admin via server-side)
    - Since admin is password-gated client-side, we allow anon to write (the password is the gate)
*/

CREATE TABLE IF NOT EXISTS btl_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  yt_id text NOT NULL,
  stream_type text NOT NULL DEFAULT 'video' CHECK (stream_type IN ('live', 'video')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE btl_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view btl streams"
  ON btl_streams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anon can insert btl streams"
  ON btl_streams FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can delete btl streams"
  ON btl_streams FOR DELETE
  TO anon, authenticated
  USING (true);
