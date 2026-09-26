/*
  # Create OneMeet Experiences System

  1. New Tables
    - `onemeet_experiences`
      - `id` (uuid, primary key)
      - `title` (text) - name of the activity
      - `description` (text) - what the activity is about
      - `image_url` (text) - picture of the activity
      - `tier` (text) - 'free', 'basic', 'plus', 'premium'
      - `matches_available` (integer) - how many match slots
      - `location` (text) - where it takes place
      - `date_time` (timestamptz) - when it happens
      - `category` (text) - type of activity
      - `is_community` (boolean) - posted by community vs admin
      - `author_id` (uuid) - who created it
      - `author_name` (text) - display name of creator
      - `created_at` (timestamptz)

    - `onemeet_experience_chat`
      - `id` (uuid, primary key)
      - `experience_id` (uuid, FK to onemeet_experiences)
      - `user_id` (uuid) - who sent the message
      - `user_name` (text) - display name
      - `message` (text)
      - `created_at` (timestamptz)

    - `onemeet_experience_joins`
      - `id` (uuid, primary key)
      - `experience_id` (uuid, FK)
      - `user_id` (uuid) - who joined
      - `user_name` (text)
      - `joined_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Authenticated users can view experiences
    - Authenticated users can post community experiences
    - Authenticated users can chat and join experiences
    - Admin operations gated by header password
*/

-- Experiences table
CREATE TABLE IF NOT EXISTS onemeet_experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text DEFAULT '',
  tier text NOT NULL DEFAULT 'free',
  matches_available integer NOT NULL DEFAULT 10,
  location text NOT NULL DEFAULT '',
  date_time timestamptz,
  category text NOT NULL DEFAULT 'general',
  is_community boolean NOT NULL DEFAULT false,
  author_id uuid,
  author_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onemeet_experiences ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all experiences
CREATE POLICY "Authenticated users can view experiences"
  ON onemeet_experiences FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert community experiences (is_community = true)
CREATE POLICY "Authenticated users can post community experiences"
  ON onemeet_experiences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id AND is_community = true);

-- Admin can insert any experience via header password
CREATE POLICY "Admin can insert experiences via password"
  ON onemeet_experiences FOR INSERT
  TO anon
  WITH CHECK (
    current_setting('request.headers', true)::json->>'x-admin-password' = current_setting('app.settings.admin_password', true)
  );

-- Authors can update their own community experiences
CREATE POLICY "Authors can update own community experiences"
  ON onemeet_experiences FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id AND is_community = true)
  WITH CHECK (auth.uid() = author_id AND is_community = true);

-- Authors can delete their own community experiences
CREATE POLICY "Authors can delete own community experiences"
  ON onemeet_experiences FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id AND is_community = true);

-- Allow anon select for public browsing
CREATE POLICY "Anyone can browse experiences"
  ON onemeet_experiences FOR SELECT
  TO anon
  USING (true);


-- Experience chat table
CREATE TABLE IF NOT EXISTS onemeet_experience_chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES onemeet_experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE onemeet_experience_chat ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view experience chat"
  ON onemeet_experience_chat FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can send chat messages"
  ON onemeet_experience_chat FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON onemeet_experience_chat FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);


-- Experience joins table
CREATE TABLE IF NOT EXISTS onemeet_experience_joins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES onemeet_experiences(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  user_name text NOT NULL DEFAULT '',
  joined_at timestamptz DEFAULT now(),
  UNIQUE(experience_id, user_id)
);

ALTER TABLE onemeet_experience_joins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view joins"
  ON onemeet_experience_joins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can join experiences"
  ON onemeet_experience_joins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave experiences"
  ON onemeet_experience_joins FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_onemeet_exp_tier ON onemeet_experiences(tier);
CREATE INDEX IF NOT EXISTS idx_onemeet_exp_community ON onemeet_experiences(is_community);
CREATE INDEX IF NOT EXISTS idx_onemeet_chat_exp ON onemeet_experience_chat(experience_id);
CREATE INDEX IF NOT EXISTS idx_onemeet_joins_exp ON onemeet_experience_joins(experience_id);
