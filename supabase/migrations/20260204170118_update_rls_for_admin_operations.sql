/*
  # Update RLS Policies for Admin Operations

  1. Changes
    - Add INSERT policy for animal_feeds (public access for demo)
    - Add UPDATE policy for animal_feeds (public access for demo)
    - Add DELETE policy for animal_feeds (public access for demo)
  
  2. Security Notes
    - These policies allow public access for demonstration purposes
    - In production, these should be restricted to authenticated admin users only
*/

-- Allow anyone to insert animal feeds (for demo purposes)
CREATE POLICY "Allow public insert on animal_feeds"
  ON animal_feeds FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to update animal feeds (for demo purposes)
CREATE POLICY "Allow public update on animal_feeds"
  ON animal_feeds FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete animal feeds (for demo purposes)
CREATE POLICY "Allow public delete on animal_feeds"
  ON animal_feeds FOR DELETE
  TO anon, authenticated
  USING (true);