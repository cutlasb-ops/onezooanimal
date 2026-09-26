/*
  # Create promo_banners table

  1. New Tables
    - `promo_banners`
      - `id` (uuid, primary key)
      - `headline` (text) - Main banner headline
      - `subtext` (text) - Supporting description text
      - `badge_label` (text) - Small badge text (e.g. "NEW", "SALE")
      - `button_text` (text) - Call-to-action button text
      - `button_action` (text) - What the button does: 'open_coin_shop', 'open_link'
      - `button_link` (text) - Optional external URL for 'open_link' action
      - `gradient` (text) - CSS gradient string for background
      - `accent_color` (text) - Hex accent color
      - `icon_name` (text) - Lucide icon name to display
      - `display_order` (integer) - Controls slide order
      - `is_active` (boolean) - Whether banner is visible
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `promo_banners` table
    - Add SELECT policy for all users (public content)
    - Add INSERT/UPDATE/DELETE policies for authenticated admin users
*/

CREATE TABLE IF NOT EXISTS promo_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  headline text NOT NULL DEFAULT '',
  subtext text NOT NULL DEFAULT '',
  badge_label text NOT NULL DEFAULT 'NEW',
  button_text text NOT NULL DEFAULT 'Get Coins',
  button_action text NOT NULL DEFAULT 'open_coin_shop',
  button_link text NOT NULL DEFAULT '',
  gradient text NOT NULL DEFAULT 'linear-gradient(135deg, #1a3c2a 0%, #0f2318 40%, #1a3520 100%)',
  accent_color text NOT NULL DEFAULT '#f59e0b',
  icon_name text NOT NULL DEFAULT 'coins',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE promo_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo banners"
  ON promo_banners
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert promo banners"
  ON promo_banners
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update promo banners"
  ON promo_banners
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete promo banners"
  ON promo_banners
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
