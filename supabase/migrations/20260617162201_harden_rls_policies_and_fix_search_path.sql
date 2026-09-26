-- 1. Fix mutable search_path on is_admin_request function
CREATE OR REPLACE FUNCTION public.is_admin_request()
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SET search_path = ''
AS $$
SELECT coalesce(
  (current_setting('request.headers', true)::json ->> 'x-admin-password') = 'goldenhire',
  false
);
$$;

-- 2. Fix RLS Always True on animal_voices (replace open policies with admin-gated ones)
DROP POLICY IF EXISTS "Authenticated delete animal voices" ON animal_voices;
DROP POLICY IF EXISTS "Authenticated insert animal voices" ON animal_voices;
DROP POLICY IF EXISTS "Authenticated update animal voices" ON animal_voices;

CREATE POLICY "Admin can insert animal voices" ON animal_voices
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can update animal voices" ON animal_voices
  FOR UPDATE TO anon, authenticated
  USING (public.is_admin_request())
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can delete animal voices" ON animal_voices
  FOR DELETE TO anon, authenticated
  USING (public.is_admin_request());

-- 3. Fix RLS Always True on feed_shares (tighten INSERT and UPDATE)
DROP POLICY IF EXISTS "Anyone can create a feed share" ON feed_shares;
DROP POLICY IF EXISTS "Anyone can increment click count" ON feed_shares;

CREATE POLICY "Anyone can create a feed share" ON feed_shares
  FOR INSERT TO anon, authenticated
  WITH CHECK (feed_id IS NOT NULL AND click_count = 0);

CREATE POLICY "Anyone can increment click count" ON feed_shares
  FOR UPDATE TO anon, authenticated
  USING (true)
  WITH CHECK (click_count >= 0);

-- 4. Drop legacy overly-permissive policies on animal_feeds (admin-gated ones already exist)
DROP POLICY IF EXISTS "Authenticated can delete animal feeds" ON animal_feeds;
DROP POLICY IF EXISTS "Authenticated can update animal feeds" ON animal_feeds;

-- 5. Drop legacy overly-permissive policies on blog_posts (admin-gated ones already exist)
DROP POLICY IF EXISTS "Authenticated can delete blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Authenticated can update blog posts" ON blog_posts;

-- 6. Drop legacy overly-permissive policy on btl_streams (admin-gated one exists)
DROP POLICY IF EXISTS "Authenticated can delete btl streams" ON btl_streams;

-- 7. Fix feature_sections - replace auth.uid() IS NOT NULL with admin check
DROP POLICY IF EXISTS "Authenticated users can delete feature sections" ON feature_sections;
DROP POLICY IF EXISTS "Authenticated users can insert feature sections" ON feature_sections;
DROP POLICY IF EXISTS "Authenticated users can update feature sections" ON feature_sections;

CREATE POLICY "Admin can insert feature sections" ON feature_sections
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can update feature sections" ON feature_sections
  FOR UPDATE TO anon, authenticated
  USING (public.is_admin_request())
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can delete feature sections" ON feature_sections
  FOR DELETE TO anon, authenticated
  USING (public.is_admin_request());

-- 8. Fix promo_banners - replace auth.uid() IS NOT NULL with admin check
DROP POLICY IF EXISTS "Authenticated users can delete promo banners" ON promo_banners;
DROP POLICY IF EXISTS "Authenticated users can insert promo banners" ON promo_banners;
DROP POLICY IF EXISTS "Authenticated users can update promo banners" ON promo_banners;

CREATE POLICY "Admin can insert promo banners" ON promo_banners
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can update promo banners" ON promo_banners
  FOR UPDATE TO anon, authenticated
  USING (public.is_admin_request())
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can delete promo banners" ON promo_banners
  FOR DELETE TO anon, authenticated
  USING (public.is_admin_request());

-- 9. Fix slideshow_images - replace auth.uid() IS NOT NULL with admin check
DROP POLICY IF EXISTS "Authenticated users can delete slideshow images" ON slideshow_images;
DROP POLICY IF EXISTS "Authenticated users can insert slideshow images" ON slideshow_images;
DROP POLICY IF EXISTS "Authenticated users can update slideshow images" ON slideshow_images;

CREATE POLICY "Admin can insert slideshow images" ON slideshow_images
  FOR INSERT TO anon, authenticated
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can update slideshow images" ON slideshow_images
  FOR UPDATE TO anon, authenticated
  USING (public.is_admin_request())
  WITH CHECK (public.is_admin_request());

CREATE POLICY "Admin can delete slideshow images" ON slideshow_images
  FOR DELETE TO anon, authenticated
  USING (public.is_admin_request());

-- 10. Fix storage.objects - gate writes behind admin password
DROP POLICY IF EXISTS "Allow public deletes in videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates in videos bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads to videos bucket" ON storage.objects;

CREATE POLICY "Admin can upload to videos bucket" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'videos'
    AND (current_setting('request.headers', true)::json ->> 'x-admin-password') = 'goldenhire'
  );

CREATE POLICY "Admin can update videos bucket" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (
    bucket_id = 'videos'
    AND (current_setting('request.headers', true)::json ->> 'x-admin-password') = 'goldenhire'
  )
  WITH CHECK (
    bucket_id = 'videos'
    AND (current_setting('request.headers', true)::json ->> 'x-admin-password') = 'goldenhire'
  );

CREATE POLICY "Admin can delete from videos bucket" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (
    bucket_id = 'videos'
    AND (current_setting('request.headers', true)::json ->> 'x-admin-password') = 'goldenhire'
  );

-- 11. Fix shorts - merge duplicate SELECT policies into one with proper gating
DROP POLICY IF EXISTS "Authenticated can view all shorts" ON shorts;
DROP POLICY IF EXISTS "Anyone can view published shorts" ON shorts;

CREATE POLICY "Anyone can view published shorts or admin sees all" ON shorts
  FOR SELECT TO anon, authenticated
  USING (is_published = true OR public.is_admin_request());
