/*
  # Add image_url to promo_banners

  1. Changes
    - Add `image_url` column to `promo_banners` (text, optional). When set, the
      homepage promo slide renders this image as the full slide background
      instead of the gradient/icon layout.
    - Adds optional `button_label_suffix` — unchanged, keeping RLS and data safe.
  2. Security
    - No RLS changes. Existing policies remain intact.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'promo_banners' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE promo_banners ADD COLUMN image_url text NOT NULL DEFAULT '';
  END IF;
END $$;
