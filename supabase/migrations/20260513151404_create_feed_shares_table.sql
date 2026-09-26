/*
  # Feed Shares Table

  Tracks personalized share links generated when viewers share a live broadcast.
  Each share gets a short id used in the URL so the broadcast can be reopened
  with attribution to the referring viewer.

  1. New Table
    - `feed_shares`
      - `id` (text, primary key) - short slug used in URL
      - `feed_id` (uuid, references animal_feeds)
      - `referrer_name` (text) - viewer's display handle
      - `created_at` (timestamptz)
      - `click_count` (int) - number of times the share link has been opened

  2. Security
    - RLS enabled
    - Anyone can insert a share (so anonymous viewers can share)
    - Anyone can read shares (so the link is resolvable when opened)
    - Anyone can update click_count (anonymous open tracking)
*/

CREATE TABLE IF NOT EXISTS feed_shares (
  id text PRIMARY KEY,
  feed_id uuid NOT NULL REFERENCES animal_feeds(id) ON DELETE CASCADE,
  referrer_name text NOT NULL DEFAULT '',
  click_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feed_shares_feed_id ON feed_shares(feed_id);

ALTER TABLE feed_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feed shares"
  ON feed_shares FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create a feed share"
  ON feed_shares FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can increment click count"
  ON feed_shares FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
