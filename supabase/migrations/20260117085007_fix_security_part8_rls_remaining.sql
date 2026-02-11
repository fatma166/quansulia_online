/*
  # Security Fix Part 8: Fix Remaining RLS Policies
  
  1. System Settings & Maintenance
  2. About Sudan Pages
  3. Contact Messages
  4. Pricing & Export Templates
  5. Invoices & Application Pricing
  6. About Consulate & Related
  7. Chatbot
*/

-- System Maintenance & Announcements
DROP POLICY IF EXISTS "Admin staff can update maintenance settings" ON public.system_maintenance;
CREATE POLICY "Admin can update maintenance settings" ON public.system_maintenance
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admin staff can insert announcements" ON public.system_announcements;
CREATE POLICY "Admin can insert announcements" ON public.system_announcements
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admin staff can update announcements" ON public.system_announcements;
CREATE POLICY "Admin can update announcements" ON public.system_announcements
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admin staff can delete announcements" ON public.system_announcements;
CREATE POLICY "Admin can delete announcements" ON public.system_announcements
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- About Sudan
DROP POLICY IF EXISTS "Authenticated staff can view all pages" ON public.about_sudan_page;
CREATE POLICY "Staff can view all pages" ON public.about_sudan_page
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated staff can insert page" ON public.about_sudan_page;
CREATE POLICY "Staff can insert page" ON public.about_sudan_page
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update page" ON public.about_sudan_page;
CREATE POLICY "Staff can update page" ON public.about_sudan_page
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can view all statistics" ON public.about_sudan_statistics;
DROP POLICY IF EXISTS "Authenticated staff can manage statistics" ON public.about_sudan_statistics;
CREATE POLICY "Staff can manage statistics" ON public.about_sudan_statistics
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can view all sections" ON public.about_sudan_sections;
DROP POLICY IF EXISTS "Authenticated staff can manage sections" ON public.about_sudan_sections;
CREATE POLICY "Staff can manage sections" ON public.about_sudan_sections
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can manage section stats" ON public.about_sudan_section_stats;
CREATE POLICY "Staff can manage section stats" ON public.about_sudan_section_stats
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Contact Messages
DROP POLICY IF EXISTS "Staff and admin can view all messages" ON public.contact_messages;
CREATE POLICY "Staff can view all messages" ON public.contact_messages
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff and admin can update messages" ON public.contact_messages;
CREATE POLICY "Staff can update messages" ON public.contact_messages
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can delete messages" ON public.contact_messages;
CREATE POLICY "Admin can delete messages" ON public.contact_messages
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Pricing Rules
DROP POLICY IF EXISTS "Authenticated staff can insert pricing rules" ON public.service_pricing_rules;
CREATE POLICY "Staff can insert pricing rules" ON public.service_pricing_rules
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can update pricing rules" ON public.service_pricing_rules;
CREATE POLICY "Staff can update pricing rules" ON public.service_pricing_rules
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated staff can delete pricing rules" ON public.service_pricing_rules;
CREATE POLICY "Staff can delete pricing rules" ON public.service_pricing_rules
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Export Templates
DROP POLICY IF EXISTS "Admins can read all templates" ON public.export_report_templates;
DROP POLICY IF EXISTS "Admins can update all templates" ON public.export_report_templates;
DROP POLICY IF EXISTS "Admins can delete all templates" ON public.export_report_templates;
CREATE POLICY "Admins can manage all templates" ON public.export_report_templates
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated users can create templates" ON public.export_report_templates;
CREATE POLICY "Staff can create templates" ON public.export_report_templates
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Users can read public templates or their own" ON public.export_report_templates;
CREATE POLICY "Users can read templates" ON public.export_report_templates
  FOR SELECT TO authenticated
  USING (is_public = true OR created_by = (select auth.uid()) OR (select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Users can update their own templates" ON public.export_report_templates;
CREATE POLICY "Users can update own templates" ON public.export_report_templates
  FOR UPDATE TO authenticated
  USING (created_by = (select auth.uid()) OR (select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK (created_by = (select auth.uid()) OR (select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Users can delete their own templates" ON public.export_report_templates;
CREATE POLICY "Users can delete own templates" ON public.export_report_templates
  FOR DELETE TO authenticated
  USING (created_by = (select auth.uid()) OR (select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Application Pricing Items
DROP POLICY IF EXISTS "Staff can read all pricing items" ON public.application_pricing_items;
DROP POLICY IF EXISTS "Staff can insert pricing items" ON public.application_pricing_items;
DROP POLICY IF EXISTS "Staff can update pricing items" ON public.application_pricing_items;
DROP POLICY IF EXISTS "Staff can delete pricing items" ON public.application_pricing_items;
CREATE POLICY "Staff can manage pricing items" ON public.application_pricing_items
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Application Pricing Summary
DROP POLICY IF EXISTS "Staff can read all pricing summaries" ON public.application_pricing_summary;
DROP POLICY IF EXISTS "Staff can insert pricing summaries" ON public.application_pricing_summary;
DROP POLICY IF EXISTS "Staff can update pricing summaries" ON public.application_pricing_summary;
DROP POLICY IF EXISTS "Staff can delete pricing summaries" ON public.application_pricing_summary;
CREATE POLICY "Staff can manage pricing summaries" ON public.application_pricing_summary
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Invoices
DROP POLICY IF EXISTS "Staff can read all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Staff can delete invoices" ON public.invoices;
CREATE POLICY "Staff can manage invoices" ON public.invoices
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- About Consulate Sections
DROP POLICY IF EXISTS "Admins can insert about consulate sections" ON public.about_consulate_sections;
DROP POLICY IF EXISTS "Admins can update about consulate sections" ON public.about_consulate_sections;
DROP POLICY IF EXISTS "Admins can delete about consulate sections" ON public.about_consulate_sections;
CREATE POLICY "Admins can manage consulate sections" ON public.about_consulate_sections
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Ambassadors
DROP POLICY IF EXISTS "Admins can insert ambassadors" ON public.ambassadors;
DROP POLICY IF EXISTS "Admins can update ambassadors" ON public.ambassadors;
DROP POLICY IF EXISTS "Admins can delete ambassadors" ON public.ambassadors;
CREATE POLICY "Admins can manage ambassadors" ON public.ambassadors
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Services Guide Sections
DROP POLICY IF EXISTS "Admins can insert services guide sections" ON public.services_guide_sections;
DROP POLICY IF EXISTS "Admins can update services guide sections" ON public.services_guide_sections;
DROP POLICY IF EXISTS "Admins can delete services guide sections" ON public.services_guide_sections;
CREATE POLICY "Admins can manage services guide sections" ON public.services_guide_sections
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Important Links
DROP POLICY IF EXISTS "Admins can insert important links" ON public.important_links;
DROP POLICY IF EXISTS "Admins can update important links" ON public.important_links;
DROP POLICY IF EXISTS "Admins can delete important links" ON public.important_links;
CREATE POLICY "Admins can manage important links" ON public.important_links
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- System Settings
DROP POLICY IF EXISTS "Only admins can insert system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Only admins can update system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Additional Pages
DROP POLICY IF EXISTS "Admins can manage additional pages" ON public.additional_pages;
CREATE POLICY "Admins can manage pages" ON public.additional_pages
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Chatbot QA
DROP POLICY IF EXISTS "Authenticated users can manage QAs" ON public.chatbot_questions_answers;
CREATE POLICY "Staff can manage QAs" ON public.chatbot_questions_answers
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Chatbot Categories
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.chatbot_categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.chatbot_categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.chatbot_categories;
CREATE POLICY "Staff can manage categories" ON public.chatbot_categories
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));
