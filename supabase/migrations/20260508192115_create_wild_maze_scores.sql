/*
  # Wild Maze leaderboard

  1. New Tables
    - `wild_maze_scores`
      - `id` (uuid, primary key)
      - `name` (text) — display name of the player
      - `score` (integer) — final score
      - `created_at` (timestamptz) — submission time
  2. Security
    - RLS enabled. Anyone (anon + authenticated) can read leaderboard rows
      and insert new scores (arcade leaderboard, no sensitive data).
*/

CREATE TABLE IF NOT EXISTS wild_maze_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'PLAYER',
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wild_maze_scores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='wild_maze_scores' AND policyname='Anyone can read wild maze scores'
  ) THEN
    CREATE POLICY "Anyone can read wild maze scores"
      ON wild_maze_scores FOR SELECT TO anon, authenticated USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='wild_maze_scores' AND policyname='Anyone can submit wild maze scores'
  ) THEN
    CREATE POLICY "Anyone can submit wild maze scores"
      ON wild_maze_scores FOR INSERT TO anon, authenticated
      WITH CHECK (char_length(name) <= 24 AND score >= 0 AND score <= 1000000);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS wild_maze_scores_score_idx
  ON wild_maze_scores (score DESC);
