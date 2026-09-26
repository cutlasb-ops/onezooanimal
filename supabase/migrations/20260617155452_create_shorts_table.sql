CREATE TABLE IF NOT EXISTS shorts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published shorts"
  ON shorts FOR SELECT
  TO anon
  USING (is_published = true);

CREATE POLICY "Authenticated can view all shorts"
  ON shorts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert shorts"
  ON shorts FOR INSERT
  TO anon
  WITH CHECK (
    current_setting('request.headers', true)::json->>'x-admin-password' = 'goldenhire'
  );

CREATE POLICY "Admin can update shorts"
  ON shorts FOR UPDATE
  TO anon
  USING (
    current_setting('request.headers', true)::json->>'x-admin-password' = 'goldenhire'
  )
  WITH CHECK (
    current_setting('request.headers', true)::json->>'x-admin-password' = 'goldenhire'
  );

CREATE POLICY "Admin can delete shorts"
  ON shorts FOR DELETE
  TO anon
  USING (
    current_setting('request.headers', true)::json->>'x-admin-password' = 'goldenhire'
  );

CREATE INDEX idx_shorts_published ON shorts(is_published, created_at DESC);
