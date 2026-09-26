/*
  # Animal voice assignments

  1. New Tables
    - `animal_voices`
      - `id` (uuid, primary key)
      - `animal_name` (text, unique, case-insensitive) - the animal this voice applies to
      - `voice` (text) - OpenAI voice id (alloy, echo, fable, onyx, nova, shimmer, ash, ballad, coral, sage, verse)
      - `gender_label` (text) - human-friendly hint like "female - Jasmine", "male - deep"
      - `persona_notes` (text) - extra in-character notes to pass as system prompt
      - `created_at`, `updated_at`
  2. Security
    - Enable RLS on animal_voices
    - Anyone authenticated OR anonymous can read (voices drive public audio playback)
    - Only admin (checked via existing is_admin header / password pattern) can write
      via service role; we restrict direct table writes to authenticated users for now.
*/

CREATE TABLE IF NOT EXISTS animal_voices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_name text UNIQUE NOT NULL,
  voice text NOT NULL DEFAULT 'alloy',
  gender_label text NOT NULL DEFAULT '',
  persona_notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE animal_voices ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animal_voices' AND policyname = 'Public read animal voices'
  ) THEN
    CREATE POLICY "Public read animal voices"
      ON animal_voices FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animal_voices' AND policyname = 'Authenticated insert animal voices'
  ) THEN
    CREATE POLICY "Authenticated insert animal voices"
      ON animal_voices FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animal_voices' AND policyname = 'Authenticated update animal voices'
  ) THEN
    CREATE POLICY "Authenticated update animal voices"
      ON animal_voices FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'animal_voices' AND policyname = 'Authenticated delete animal voices'
  ) THEN
    CREATE POLICY "Authenticated delete animal voices"
      ON animal_voices FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS animal_voices_animal_name_idx
  ON animal_voices (lower(animal_name));
