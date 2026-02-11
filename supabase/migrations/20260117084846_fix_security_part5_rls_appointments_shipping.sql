/*
  # Security Fix Part 5: Fix RLS Policies - Appointments & Shipping
  
  1. Appointments System
     - Fixed appointment slots, settings, closed days
     - Removed always-true policies
  
  2. Shipping System
     - Fixed shipping companies and shipments
     - Secured with proper role checks
  
  3. Rejection Details & Application Statuses
     - Optimized performance
     - Fixed security issues
*/

-- Appointment Slots
DROP POLICY IF EXISTS "Staff can manage appointment slots" ON public.appointment_slots;
CREATE POLICY "Staff can manage appointment slots" ON public.appointment_slots
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Appointment Settings
DROP POLICY IF EXISTS "Authenticated users can delete appointment settings" ON public.appointment_settings;
DROP POLICY IF EXISTS "Authenticated users can insert appointment settings" ON public.appointment_settings;
DROP POLICY IF EXISTS "Authenticated users can update appointment settings" ON public.appointment_settings;
CREATE POLICY "Staff can manage appointment settings" ON public.appointment_settings
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Appointments
DROP POLICY IF EXISTS "Staff can delete appointments" ON public.appointments;
CREATE POLICY "Staff can delete appointments" ON public.appointments
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Authenticated users can update appointments" ON public.appointments;
CREATE POLICY "Staff can manage appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Closed Days
DROP POLICY IF EXISTS "Authenticated users can delete closed days" ON public.closed_days;
DROP POLICY IF EXISTS "Authenticated users can insert closed days" ON public.closed_days;
DROP POLICY IF EXISTS "Authenticated users can update closed days" ON public.closed_days;
CREATE POLICY "Staff can manage closed days" ON public.closed_days
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Shipments
DROP POLICY IF EXISTS "Staff and admins can insert shipments" ON public.shipments;
CREATE POLICY "Staff and admins can insert shipments" ON public.shipments
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff and admins can update shipments" ON public.shipments;
CREATE POLICY "Staff and admins can update shipments" ON public.shipments
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff and admins can delete shipments" ON public.shipments;
CREATE POLICY "Staff and admins can delete shipments" ON public.shipments
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can manage shipments" ON public.shipments;

-- Shipping Companies
DROP POLICY IF EXISTS "Admins and staff can read all shipping companies" ON public.shipping_companies;
CREATE POLICY "Admins and staff can read all shipping companies" ON public.shipping_companies
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Admins and staff can insert shipping companies" ON public.shipping_companies;
CREATE POLICY "Admins and staff can insert shipping companies" ON public.shipping_companies
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admins and staff can update shipping companies" ON public.shipping_companies;
CREATE POLICY "Admins and staff can update shipping companies" ON public.shipping_companies
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admins and staff can delete shipping companies" ON public.shipping_companies;
CREATE POLICY "Admins and staff can delete shipping companies" ON public.shipping_companies
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Rejection Details
DROP POLICY IF EXISTS "Staff can manage rejection details" ON public.rejection_details;
CREATE POLICY "Staff can manage rejection details" ON public.rejection_details
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Application Statuses
DROP POLICY IF EXISTS "Super admins can manage statuses" ON public.application_statuses;
CREATE POLICY "Super admins can manage statuses" ON public.application_statuses
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' = 'super_admin')
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' = 'super_admin');

-- Educational Cards
DROP POLICY IF EXISTS "Staff can view all educational cards" ON public.educational_cards;
CREATE POLICY "Staff can view all educational cards" ON public.educational_cards
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can insert educational cards" ON public.educational_cards;
CREATE POLICY "Staff can insert educational cards" ON public.educational_cards
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can update educational cards" ON public.educational_cards;
CREATE POLICY "Staff can update educational cards" ON public.educational_cards
  FOR UPDATE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

DROP POLICY IF EXISTS "Staff can delete educational cards" ON public.educational_cards;
CREATE POLICY "Staff can delete educational cards" ON public.educational_cards
  FOR DELETE TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));

-- Cities, Regions, Districts
DROP POLICY IF EXISTS "Admins can manage cities" ON public.cities;
CREATE POLICY "Admins manage cities" ON public.cities
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admins can manage regions" ON public.regions;
CREATE POLICY "Admins manage regions" ON public.regions
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Admins can manage districts" ON public.districts;
CREATE POLICY "Admins manage districts" ON public.districts
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));
