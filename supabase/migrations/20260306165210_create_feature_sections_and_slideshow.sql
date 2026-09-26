/*
  # Create feature sections and slideshow tables

  1. New Tables
    - `feature_sections` - Accordion items displayed in the Apple-style feature showcase
      - `id` (uuid, primary key)
      - `title` (text) - Accordion header text
      - `description` (text) - Expanded content body
      - `image_url` (text) - Image shown on the right side when expanded
      - `display_order` (integer) - Controls the ordering
      - `is_active` (boolean) - Whether the item is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `slideshow_images` - Instagram-style reels/images carousel
      - `id` (uuid, primary key)
      - `image_url` (text) - URL of the image
      - `caption` (text) - Optional caption text
      - `link_url` (text) - Optional link when clicked
      - `display_order` (integer) - Controls the ordering
      - `is_active` (boolean) - Whether the image is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Public SELECT for active items (anon + authenticated)
    - INSERT/UPDATE/DELETE restricted to authenticated users
*/

CREATE TABLE IF NOT EXISTS feature_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feature_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active feature sections"
  ON feature_sections
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert feature sections"
  ON feature_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update feature sections"
  ON feature_sections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete feature sections"
  ON feature_sections
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);


CREATE TABLE IF NOT EXISTS slideshow_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE slideshow_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active slideshow images"
  ON slideshow_images
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert slideshow images"
  ON slideshow_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update slideshow images"
  ON slideshow_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete slideshow images"
  ON slideshow_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
