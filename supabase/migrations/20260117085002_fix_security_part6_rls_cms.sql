/*
  # Security Fix Part 6: Fix RLS Policies - CMS Tables
  
  1. Site Settings, Contact Info, Social Links
  2. Slider Items, Page Sections, Footer Content
  3. Counters
  
  All tables secured with proper admin-only access
*/

-- Site Settings
DROP POLICY IF EXISTS "Authenticated staff can insert site settings" ON public.site_settings;
CREATE POLICY "Staff can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update site settings" ON public.site_settings;
CREATE POLICY "Staff can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Contact Info
DROP POLICY IF EXISTS "Authenticated staff can insert contact info" ON public.contact_info;
CREATE POLICY "Staff can insert contact info" ON public.contact_info
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update contact info" ON public.contact_info;
CREATE POLICY "Staff can update contact info" ON public.contact_info
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete contact info" ON public.contact_info;
CREATE POLICY "Staff can delete contact info" ON public.contact_info
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Social Links
DROP POLICY IF EXISTS "Authenticated staff can insert social links" ON public.social_links;
CREATE POLICY "Staff can insert social links" ON public.social_links
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update social links" ON public.social_links;
CREATE POLICY "Staff can update social links" ON public.social_links
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete social links" ON public.social_links;
CREATE POLICY "Staff can delete social links" ON public.social_links
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Slider Items
DROP POLICY IF EXISTS "Authenticated staff can insert slider items" ON public.slider_items;
CREATE POLICY "Staff can insert slider items" ON public.slider_items
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update slider items" ON public.slider_items;
CREATE POLICY "Staff can update slider items" ON public.slider_items
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete slider items" ON public.slider_items;
CREATE POLICY "Staff can delete slider items" ON public.slider_items
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Page Sections
DROP POLICY IF EXISTS "Authenticated staff can insert page sections" ON public.page_sections;
CREATE POLICY "Staff can insert page sections" ON public.page_sections
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update page sections" ON public.page_sections;
CREATE POLICY "Staff can update page sections" ON public.page_sections
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete page sections" ON public.page_sections;
CREATE POLICY "Staff can delete page sections" ON public.page_sections
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Footer Content
DROP POLICY IF EXISTS "Authenticated staff can insert footer content" ON public.footer_content;
CREATE POLICY "Staff can insert footer content" ON public.footer_content
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update footer content" ON public.footer_content;
CREATE POLICY "Staff can update footer content" ON public.footer_content
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete footer content" ON public.footer_content;
CREATE POLICY "Staff can delete footer content" ON public.footer_content
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Counters
DROP POLICY IF EXISTS "Authenticated staff can insert counters" ON public.counters;
CREATE POLICY "Staff can insert counters" ON public.counters
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update counters" ON public.counters;
CREATE POLICY "Staff can update counters" ON public.counters
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete counters" ON public.counters;
CREATE POLICY "Staff can delete counters" ON public.counters
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));
