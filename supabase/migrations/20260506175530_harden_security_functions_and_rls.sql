/*
  # Security hardening: function search paths, DEFINER execute rights, tight RLS, storage listing

  1. Function Search Path Fix
    - Sets `search_path = public, pg_temp` on handle_new_user, handle_coin_transaction, notify_welcome_email
      to prevent search path injection attacks against SECURITY DEFINER functions.

  2. SECURITY DEFINER Function Access
    - Revokes EXECUTE on these trigger functions from PUBLIC, anon, and authenticated so they can no longer
      be called via REST /rpc endpoints. They are only invoked by triggers which run as the table owner.

  3. Tighten Always-True RLS Policies
    - Removes anon write access on animal_categories, animal_feeds, blog_posts, btl_streams, social_media_posts.
    - Write operations (INSERT/UPDATE/DELETE) now require the authenticated role. Admin UIs must sign in.
    - Public read access for published content is preserved.

  4. Storage Object Listing
    - Drops the overly-broad SELECT policy on the videos bucket that allowed clients to list every object.
    - Object URLs remain accessible directly because the bucket is public; only the listing capability is removed.

  5. Important Notes
    - Admin panel users MUST be signed in for uploads/edits to succeed. If they aren't, they'll receive RLS
      errors on save — this is the intended, secure behavior.
*/

-- 1 & 2: Lock down SECURITY DEFINER functions
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_coin_transaction() SET search_path = public, pg_temp;
ALTER FUNCTION public.notify_welcome_email() SET search_path = public, pg_temp;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_coin_transaction() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_welcome_email() FROM PUBLIC, anon, authenticated;

-- 3: animal_categories
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='animal_categories' AND policyname='Allow public insert on animal_categories') THEN
    DROP POLICY "Allow public insert on animal_categories" ON public.animal_categories;
  END IF;
END $$;

CREATE POLICY "Authenticated can insert animal categories"
  ON public.animal_categories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- animal_feeds
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='animal_feeds' AND policyname='Allow public insert on animal_feeds') THEN
    DROP POLICY "Allow public insert on animal_feeds" ON public.animal_feeds;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='animal_feeds' AND policyname='Allow public update on animal_feeds') THEN
    DROP POLICY "Allow public update on animal_feeds" ON public.animal_feeds;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='animal_feeds' AND policyname='Allow public delete on animal_feeds') THEN
    DROP POLICY "Allow public delete on animal_feeds" ON public.animal_feeds;
  END IF;
END $$;

CREATE POLICY "Authenticated can insert animal feeds"
  ON public.animal_feeds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update animal feeds"
  ON public.animal_feeds FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete animal feeds"
  ON public.animal_feeds FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- blog_posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Public can insert blog posts') THEN
    DROP POLICY "Public can insert blog posts" ON public.blog_posts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Public can update blog posts') THEN
    DROP POLICY "Public can update blog posts" ON public.blog_posts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='blog_posts' AND policyname='Public can delete blog posts') THEN
    DROP POLICY "Public can delete blog posts" ON public.blog_posts;
  END IF;
END $$;

CREATE POLICY "Authenticated can insert blog posts"
  ON public.blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update blog posts"
  ON public.blog_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete blog posts"
  ON public.blog_posts FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- btl_streams
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btl_streams' AND policyname='Anon can insert btl streams') THEN
    DROP POLICY "Anon can insert btl streams" ON public.btl_streams;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='btl_streams' AND policyname='Anon can delete btl streams') THEN
    DROP POLICY "Anon can delete btl streams" ON public.btl_streams;
  END IF;
END $$;

CREATE POLICY "Authenticated can insert btl streams"
  ON public.btl_streams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete btl streams"
  ON public.btl_streams FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- social_media_posts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename='social_media_posts' AND policyname='Service role can manage social media posts') THEN
    DROP POLICY "Service role can manage social media posts" ON public.social_media_posts;
  END IF;
END $$;

CREATE POLICY "Authenticated can insert social media posts"
  ON public.social_media_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update social media posts"
  ON public.social_media_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete social media posts"
  ON public.social_media_posts FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- 4: Remove broad storage SELECT policy (listing)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
    AND policyname='Allow public reads from videos bucket'
  ) THEN
    DROP POLICY "Allow public reads from videos bucket" ON storage.objects;
  END IF;
END $$;
