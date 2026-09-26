/*
  # Create Animal Feeds Schema

  1. New Tables
    - `animal_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name like "Big Cats", "Birds", "Marine Life"
      - `description` (text) - Category description
      - `icon` (text) - Icon name for the category
      - `created_at` (timestamp)
    
    - `animal_feeds`
      - `id` (uuid, primary key)
      - `category_id` (uuid, foreign key) - References animal_categories
      - `title` (text) - Feed title like "Lion Pride Cam"
      - `description` (text) - Feed description
      - `video_url` (text) - URL to video stream or video file
      - `thumbnail_url` (text) - Thumbnail image URL
      - `feed_type` (text) - Either 'live' or 'looped'
      - `is_active` (boolean) - Whether feed is currently active
      - `view_count` (integer) - Number of views
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (this is a public-facing website)
    - Only authenticated admins can write (future enhancement)
*/

-- Create animal_categories table
CREATE TABLE IF NOT EXISTS animal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  icon text DEFAULT 'paw-print',
  created_at timestamptz DEFAULT now()
);

-- Create animal_feeds table
CREATE TABLE IF NOT EXISTS animal_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES animal_categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  feed_type text NOT NULL CHECK (feed_type IN ('live', 'looped')),
  is_active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE animal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_feeds ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Anyone can view animal categories"
  ON animal_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view active animal feeds"
  ON animal_feeds FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_animal_feeds_category_id ON animal_feeds(category_id);
CREATE INDEX IF NOT EXISTS idx_animal_feeds_feed_type ON animal_feeds(feed_type);
CREATE INDEX IF NOT EXISTS idx_animal_feeds_is_active ON animal_feeds(is_active);