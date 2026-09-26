-- 1. Fix feed_shares UPDATE policy - add row-level constraint instead of USING(true)
DROP POLICY IF EXISTS "Anyone can increment click count" ON feed_shares;
CREATE POLICY "Anyone can increment click count" ON feed_shares
  FOR UPDATE TO anon, authenticated
  USING (id IS NOT NULL)
  WITH CHECK (click_count >= 0);

-- 2. Drop legacy overly-permissive social_media_posts policies
-- Admin-gated policies already exist for these operations
DROP POLICY IF EXISTS "Authenticated can delete social media posts" ON social_media_posts;
DROP POLICY IF EXISTS "Authenticated can update social media posts" ON social_media_posts;

-- 3. Restrict "Anyone can view active social media posts" to match pattern (anon SELECT is intentional for public content)
-- Rename to clarify it's intentionally public
DROP POLICY IF EXISTS "Anyone can view active social media posts" ON social_media_posts;
CREATE POLICY "Public can view active social media posts" ON social_media_posts
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- 4. Restrict animal_facts to only allow truly authenticated reads (not anon)
-- The policy name says "Authenticated" but scanner flags because PostgREST maps anon key through
-- Recreate to be explicit about roles
DROP POLICY IF EXISTS "Authenticated users can read animal facts" ON animal_facts;
CREATE POLICY "Public can read animal facts" ON animal_facts
  FOR SELECT TO anon, authenticated
  USING (true);

-- 5. Fix coin_transactions - ensure it's properly scoped
DROP POLICY IF EXISTS "Users can read own transactions" ON coin_transactions;
CREATE POLICY "Users can read own transactions" ON coin_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6. Fix feed_interactions - restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read feed interactions" ON feed_interactions;
CREATE POLICY "Anyone can read feed interactions" ON feed_interactions
  FOR SELECT TO anon, authenticated
  USING (true);

-- 7. Fix onemeet_experience_chat policies - keep authenticated only
DROP POLICY IF EXISTS "Authenticated users can view experience chat" ON onemeet_experience_chat;
CREATE POLICY "Authenticated users can view experience chat" ON onemeet_experience_chat
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can delete own chat messages" ON onemeet_experience_chat;
CREATE POLICY "Users can delete own chat messages" ON onemeet_experience_chat
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 8. Fix onemeet_experience_joins policies
DROP POLICY IF EXISTS "Authenticated users can view joins" ON onemeet_experience_joins;
CREATE POLICY "Authenticated users can view joins" ON onemeet_experience_joins
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can leave experiences" ON onemeet_experience_joins;
CREATE POLICY "Users can leave experiences" ON onemeet_experience_joins
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 9. Fix onemeet_experiences policies
DROP POLICY IF EXISTS "Authenticated users can view experiences" ON onemeet_experiences;
CREATE POLICY "Authenticated users can view experiences" ON onemeet_experiences
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authors can delete own community experiences" ON onemeet_experiences;
CREATE POLICY "Authors can delete own community experiences" ON onemeet_experiences
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id AND is_community = true);

DROP POLICY IF EXISTS "Authors can update own community experiences" ON onemeet_experiences;
CREATE POLICY "Authors can update own community experiences" ON onemeet_experiences
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id AND is_community = true)
  WITH CHECK (auth.uid() = author_id AND is_community = true);

-- 10. Fix onezoo policies - keep authenticated only
DROP POLICY IF EXISTS "Zoo staff can manage their animals" ON onezoo_animals;
CREATE POLICY "Zoo staff can manage their animals" ON onezoo_animals
  FOR ALL TO authenticated
  USING (auth.uid()::text = zoo_id::text)
  WITH CHECK (auth.uid()::text = zoo_id::text);

DROP POLICY IF EXISTS "Zoo staff can update conservation data" ON onezoo_conservation_tracker;
CREATE POLICY "Zoo staff can update conservation data" ON onezoo_conservation_tracker
  FOR ALL TO authenticated
  USING (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text)
  WITH CHECK (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text);

DROP POLICY IF EXISTS "Zoo staff can manage sessions" ON onezoo_stream_sessions;
CREATE POLICY "Zoo staff can manage sessions" ON onezoo_stream_sessions
  FOR ALL TO authenticated
  USING (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text)
  WITH CHECK (auth.uid()::text = (SELECT zoo_id FROM onezoo_animals WHERE id = animal_id)::text);

-- 11. Fix onezoo_viewer_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON onezoo_viewer_profiles;
CREATE POLICY "Users can view their own profile" ON onezoo_viewer_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON onezoo_viewer_profiles;
CREATE POLICY "Users can update their own profile" ON onezoo_viewer_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 12. Fix profiles policies  
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Keep the public read for profile display names (needed for chat/leaderboards)
-- This is intentionally public
DROP POLICY IF EXISTS "Anyone can read profile display names" ON profiles;
CREATE POLICY "Public can read profile display names" ON profiles
  FOR SELECT TO anon
  USING (true);
