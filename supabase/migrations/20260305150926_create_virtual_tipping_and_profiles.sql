/*
  # Virtual Tipping / "Feed the Animal" System + User Profiles

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `display_name` (text) - user's chosen display name
      - `avatar_url` (text) - optional avatar
      - `coin_balance` (integer, default 0) - current coin balance
      - `total_coins_spent` (integer, default 0) - lifetime coins spent
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `coin_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (integer) - positive for purchases, negative for spending
      - `transaction_type` (text) - 'purchase' or 'tip'
      - `description` (text) - human readable description
      - `feed_id` (uuid, nullable, references animal_feeds) - which feed the tip was for
      - `created_at` (timestamptz)

    - `feed_interactions`
      - `id` (uuid, primary key)
      - `feed_id` (uuid, references animal_feeds)
      - `user_id` (uuid, references profiles)
      - `interaction_type` (text) - type of interaction triggered
      - `coin_cost` (integer) - how many coins it cost
      - `message` (text, nullable) - optional message shown on screen
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Profiles: users can read own profile, update own profile
    - Coin transactions: users can read own transactions
    - Feed interactions: users can read all (public feed), insert own

  3. Triggers
    - Auto-create profile on user signup
    - Auto-update coin balance on transaction insert
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  coin_balance integer NOT NULL DEFAULT 0,
  total_coins_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow anyone to read display_name for showing tips
CREATE POLICY "Anyone can read profile display names"
  ON profiles FOR SELECT
  TO anon
  USING (true);

-- Coin transactions table
CREATE TABLE IF NOT EXISTS coin_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  transaction_type text NOT NULL DEFAULT 'purchase' CHECK (transaction_type IN ('purchase', 'tip')),
  description text NOT NULL DEFAULT '',
  feed_id uuid REFERENCES animal_feeds(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON coin_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON coin_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Feed interactions table
CREATE TABLE IF NOT EXISTS feed_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES animal_feeds(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('throw_fish', 'drop_toy', 'toss_treat', 'spray_water', 'ring_bell')),
  coin_cost integer NOT NULL DEFAULT 0,
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feed_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feed interactions"
  ON feed_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own interactions"
  ON feed_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Function to update coin balance after transaction
CREATE OR REPLACE FUNCTION public.handle_coin_transaction()
RETURNS trigger AS $$
BEGIN
  UPDATE profiles
  SET
    coin_balance = coin_balance + NEW.amount,
    total_coins_spent = CASE WHEN NEW.amount < 0 THEN total_coins_spent + ABS(NEW.amount) ELSE total_coins_spent END,
    updated_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_coin_transaction'
  ) THEN
    CREATE TRIGGER on_coin_transaction
      AFTER INSERT ON coin_transactions
      FOR EACH ROW EXECUTE FUNCTION public.handle_coin_transaction();
  END IF;
END $$;
