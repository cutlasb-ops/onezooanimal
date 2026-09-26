/*
  # Create chat_messages table

  1. New Tables
    - `chat_messages`
      - `id` (uuid, primary key)
      - `feed_id` (uuid, references animal_feeds)
      - `username` (text, display name chosen by user)
      - `message` (text, the chat message content)
      - `created_at` (timestamptz, when message was sent)

  2. Security
    - Enable RLS on `chat_messages` table
    - Public read policy: anyone can view messages
    - Public insert policy: anyone can send messages (anonymous chat)

  3. Notes
    - This is an anonymous public chat — no auth required to send/view messages
    - Messages are tied to a specific feed via feed_id
    - Username is provided by the user at chat time (stored as text)
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id uuid NOT NULL REFERENCES animal_feeds(id) ON DELETE CASCADE,
  username text NOT NULL DEFAULT 'Anonymous',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_feed_id_idx ON chat_messages(feed_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(message) > 0 AND
    length(message) <= 500 AND
    length(username) > 0 AND
    length(username) <= 30
  );
