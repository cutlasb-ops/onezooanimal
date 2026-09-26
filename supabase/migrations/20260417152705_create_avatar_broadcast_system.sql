/*
  # Create OneZoo AI Avatar + BTL Broadcast System

  1. New Tables
    - `onezoo_animals` - Animal profiles with avatar information
    - `onezoo_stream_sessions` - Stream session tracking and stats
    - `onezoo_avatar_messages` - Generated avatar commentary
    - `onezoo_interactions` - Viewer interactions (treats, donations)
    - `onezoo_rare_moments` - Rare behavior detection and viral moments
    - `onezoo_viewer_profiles` - Viewer preferences and stats
    - `onezoo_conservation_tracker` - Monthly conservation impact

  2. Security
    - Enable RLS on all tables
    - Policies for viewer access to public data
    - Admin policies for zoo staff
    - Public read policies for conservation data

  3. Features
    - Real-time avatar knowledge base
    - Behavior pattern tracking
    - Conservation impact calculation
    - Viral moment detection and clipping
    - Viewer engagement analytics
*/

CREATE TABLE IF NOT EXISTS onezoo_animals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  species text NOT NULL,
  age_years integer,
  zoo_id uuid NOT NULL,
  avatar_name text NOT NULL,
  avatar_personality text NOT NULL,
  avatar_emoji text DEFAULT '🐾',
  avatar_color text DEFAULT '#0a2a1a',
  catchphrase text DEFAULT 'Let''s explore!',
  knowledge_base jsonb DEFAULT '{"behaviors":[],"funFacts":[],"conservationStatus":"","habitatInfo":"","dietInfo":"","socialStructure":""}',
  behavior_patterns jsonb DEFAULT '[]',
  feeding_schedule jsonb DEFAULT '[]',
  typical_active_hours integer[] DEFAULT ARRAY[8,9,10,11,14,15,16,17],
  timezone text DEFAULT 'UTC',
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS onezoo_stream_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  animal_id uuid NOT NULL REFERENCES onezoo_animals(id) ON DELETE CASCADE,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  peak_viewers integer DEFAULT 0,
  total_interactions integer DEFAULT 0,
  treats_received integer DEFAULT 0,
  rare_moments_count integer DEFAULT 0,
  revenue_generated numeric DEFAULT 0,
  conservation_donated numeric DEFAULT 0,
  clips_created integer DEFAULT 0,
  status text DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS onezoo_avatar_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  animal_id uuid NOT NULL REFERENCES onezoo_animals(id) ON DELETE CASCADE,
  session_id uuid REFERENCES onezoo_stream_sessions(id) ON DELETE CASCADE,
  message_type text NOT NULL,
  trigger text,
  message text NOT NULL,
  viewer_username text,
  viewer_reaction text,
  likes integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS onezoo_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  animal_id uuid NOT NULL REFERENCES onezoo_animals(id) ON DELETE CASCADE,
  session_id uuid REFERENCES onezoo_stream_sessions(id) ON DELETE CASCADE,
  viewer_id uuid,
  viewer_username text NOT NULL,
  interaction_type text NOT NULL,
  coins_spent integer DEFAULT 0,
  avatar_response text,
  on_screen_animation text
);

CREATE TABLE IF NOT EXISTS onezoo_rare_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  animal_id uuid NOT NULL REFERENCES onezoo_animals(id) ON DELETE CASCADE,
  session_id uuid REFERENCES onezoo_stream_sessions(id) ON DELETE CASCADE,
  moment_type text NOT NULL,
  keeper_description text,
  avatar_commentary text,
  viewers_present integer DEFAULT 0,
  clips_created integer DEFAULT 0,
  social_shares integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS onezoo_viewer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  username text UNIQUE NOT NULL,
  favorite_animals uuid[] DEFAULT '{}',
  total_coins_spent integer DEFAULT 0,
  total_treats_given integer DEFAULT 0,
  conservation_donated numeric DEFAULT 0,
  rare_moments_witnessed integer DEFAULT 0,
  clip_collection jsonb DEFAULT '[]',
  subscription_tier text DEFAULT 'free'
);

CREATE TABLE IF NOT EXISTS onezoo_conservation_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  animal_id uuid NOT NULL REFERENCES onezoo_animals(id) ON DELETE CASCADE,
  month text NOT NULL,
  revenue_from_stream numeric DEFAULT 0,
  donated_to_conservation numeric DEFAULT 0,
  treats_to_trees_planted integer DEFAULT 0,
  species_population integer,
  habitat_status text,
  UNIQUE(animal_id, month)
);

ALTER TABLE onezoo_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE onezoo_stream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onezoo_avatar_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE onezoo_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onezoo_rare_moments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onezoo_viewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE onezoo_conservation_tracker ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Animals are viewable by everyone"
  ON onezoo_animals FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Zoo staff can manage their animals"
  ON onezoo_animals FOR ALL
  TO authenticated
  USING (auth.uid()::text = zoo_id::text)
  WITH CHECK (auth.uid()::text = zoo_id::text);

CREATE POLICY "Avatar messages are viewable by everyone"
  ON onezoo_avatar_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Messages can be created during sessions"
  ON onezoo_avatar_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text);

CREATE POLICY "Stream sessions are viewable by everyone"
  ON onezoo_stream_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Zoo staff can manage sessions"
  ON onezoo_stream_sessions FOR ALL
  TO authenticated
  USING (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text)
  WITH CHECK (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text);

CREATE POLICY "Interactions are viewable by everyone"
  ON onezoo_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create interactions"
  ON onezoo_interactions FOR INSERT
  TO authenticated
  WITH CHECK (viewer_id = auth.uid());

CREATE POLICY "Rare moments are viewable by everyone"
  ON onezoo_rare_moments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Zoo staff can create rare moments"
  ON onezoo_rare_moments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text);

CREATE POLICY "Users can view their own profile"
  ON onezoo_viewer_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can create their own profile"
  ON onezoo_viewer_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON onezoo_viewer_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Conservation data is viewable by everyone"
  ON onezoo_conservation_tracker FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Zoo staff can update conservation data"
  ON onezoo_conservation_tracker FOR ALL
  TO authenticated
  USING (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text)
  WITH CHECK (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text);

CREATE INDEX idx_onezoo_animals_zoo_id ON onezoo_animals(zoo_id);
CREATE INDEX idx_onezoo_animals_is_active ON onezoo_animals(is_active);
CREATE INDEX idx_onezoo_stream_sessions_animal_id ON onezoo_stream_sessions(animal_id);
CREATE INDEX idx_onezoo_stream_sessions_started_at ON onezoo_stream_sessions(started_at);
CREATE INDEX idx_onezoo_avatar_messages_animal_id ON onezoo_avatar_messages(animal_id);
CREATE INDEX idx_onezoo_avatar_messages_session_id ON onezoo_avatar_messages(session_id);
CREATE INDEX idx_onezoo_interactions_animal_id ON onezoo_interactions(animal_id);
CREATE INDEX idx_onezoo_rare_moments_animal_id ON onezoo_rare_moments(animal_id);
CREATE INDEX idx_onezoo_conservation_tracker_animal_id ON onezoo_conservation_tracker(animal_id);
