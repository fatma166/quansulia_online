/*
  # Security Fix Part 7: Fix RLS Policies - News & Events
  
  1. Breaking News Ticker
  2. News Articles
  3. Events
  4. Event Registrations
*/

-- Breaking News
DROP POLICY IF EXISTS "Staff can insert breaking news" ON public.breaking_news_ticker;
CREATE POLICY "Staff can insert breaking news" ON public.breaking_news_ticker
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can delete breaking news" ON public.breaking_news_ticker;
CREATE POLICY "Staff can delete breaking news" ON public.breaking_news_ticker
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can update breaking news" ON public.breaking_news_ticker;
CREATE POLICY "Staff can update breaking news" ON public.breaking_news_ticker
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- News
DROP POLICY IF EXISTS "Authenticated staff can view all news" ON public.news;
CREATE POLICY "Staff can view all news" ON public.news
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can insert news" ON public.news;
CREATE POLICY "Staff can insert news" ON public.news
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can update news" ON public.news;
CREATE POLICY "Staff can update news" ON public.news
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can delete news" ON public.news;
CREATE POLICY "Staff can delete news" ON public.news
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Events
DROP POLICY IF EXISTS "Authenticated staff can view all events" ON public.events;
CREATE POLICY "Staff can view all events" ON public.events
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can insert events" ON public.events;
CREATE POLICY "Staff can insert events" ON public.events
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can update events" ON public.events;
CREATE POLICY "Staff can update events" ON public.events
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can delete events" ON public.events;
CREATE POLICY "Staff can delete events" ON public.events
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Event Registrations
DROP POLICY IF EXISTS "Staff and admins can view registrations" ON public.event_registrations;
CREATE POLICY "Staff can view registrations" ON public.event_registrations
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can update registrations" ON public.event_registrations;
CREATE POLICY "Staff can manage registrations" ON public.event_registrations
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));
