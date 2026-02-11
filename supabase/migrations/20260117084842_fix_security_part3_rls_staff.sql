/*
  # Security Fix Part 3: Fix RLS Policies - Staff & Core Tables
  
  1. Performance Optimization
     - Wraps auth.uid() and auth.jwt() in SELECT statements
     - Prevents re-evaluation for each row (critical for scale)
  
  2. Security Enhancement
     - Replaces user_metadata with app_metadata
     - User metadata is editable by users, app_metadata is not
  
  3. Tables Fixed
     - staff, staff_services, staff_regions
     - departments, old_regions, roles
     - services, service_types, service_fields
*/

-- Staff Table
DROP POLICY IF EXISTS "السوبر أدمن والأدمن يمكنهم إدارة ا" ON public.staff;
CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة ا" ON public.staff
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "الموظف يمكنه عرض بياناته الخاصة" ON public.staff;
CREATE POLICY "الموظف يمكنه عرض بياناته الخاصة" ON public.staff
  FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()) OR (select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "الموظف يمكنه تحديث بياناته الأساس" ON public.staff;
CREATE POLICY "الموظف يمكنه تحديث بياناته الأساس" ON public.staff
  FOR UPDATE TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- Staff Services
DROP POLICY IF EXISTS "السوبر أدمن والأدمن يمكنهم إدارة ر" ON public.staff_services;
CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة ر" ON public.staff_services
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "الموظف يمكنه عرض خدماته" ON public.staff_services;
CREATE POLICY "الموظف يمكنه عرض خدماته" ON public.staff_services
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff WHERE staff.id = staff_services.staff_id AND staff.user_id = (select auth.uid())) 
         OR (select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Staff Regions
DROP POLICY IF EXISTS "Staff can view own regions" ON public.staff_regions;
CREATE POLICY "Staff can view own regions" ON public.staff_regions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.staff WHERE staff.id = staff_regions.staff_id AND staff.user_id = (select auth.uid())));

DROP POLICY IF EXISTS "Super Admin and Admin can manage staff regions" ON public.staff_regions;
CREATE POLICY "Super Admin and Admin can manage staff regions" ON public.staff_regions
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Departments
DROP POLICY IF EXISTS "السوبر أدمن والأدمن يمكنهم إدارة ا" ON public.departments;
CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة ا" ON public.departments
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Old Regions
DROP POLICY IF EXISTS "السوبر أدمن والأدمن يمكنهم إدارة ا" ON public.old_regions;
CREATE POLICY "السوبر أدمن والأدمن يمكنهم إدارة ا" ON public.old_regions
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Roles
DROP POLICY IF EXISTS "السوبر أدمن يمكنه إدارة الأدوار" ON public.roles;
CREATE POLICY "السوبر أدمن يمكنه إدارة الأدوار" ON public.roles
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' = 'super_admin')
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' = 'super_admin');

DROP POLICY IF EXISTS "الأدمن يمكنه عرض الأدوار" ON public.roles;
CREATE POLICY "الأدمن يمكنه عرض الأدوار" ON public.roles
  FOR SELECT TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Services
DROP POLICY IF EXISTS "Admins and super admins can do everything with services" ON public.services;
CREATE POLICY "Admins and super admins can do everything with services" ON public.services
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Types
DROP POLICY IF EXISTS "Admins and super admins can manage service types" ON public.service_types;
CREATE POLICY "Admins and super admins can manage service types" ON public.service_types
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Fields
DROP POLICY IF EXISTS "Admins and super admins can do everything with service fields" ON public.service_fields;
CREATE POLICY "Admins and super admins can do everything with service fields" ON public.service_fields
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Documents
DROP POLICY IF EXISTS "Admins and super admins can do everything with service document" ON public.service_documents;
CREATE POLICY "Admins and super admins can do everything with service document" ON public.service_documents
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Requirements
DROP POLICY IF EXISTS "Admins and super admins can do everything with service requirem" ON public.service_requirements;
CREATE POLICY "Admins and super admins can do everything with service requirem" ON public.service_requirements
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Field Conditions
DROP POLICY IF EXISTS "Admins and super admins can manage field conditions" ON public.service_field_conditions;
CREATE POLICY "Admins and super admins can manage field conditions" ON public.service_field_conditions
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Document Conditions
DROP POLICY IF EXISTS "Admins and super admins can manage document conditions" ON public.service_document_conditions;
CREATE POLICY "Admins and super admins can manage document conditions" ON public.service_document_conditions
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

-- Service Dynamic List Fields
DROP POLICY IF EXISTS "Admins and super admins can manage dynamic list fields" ON public.service_dynamic_list_fields;
CREATE POLICY "Admins and super admins can manage dynamic list fields" ON public.service_dynamic_list_fields
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS "Authenticated users can manage dynamic list fields" ON public.service_dynamic_list_fields;
CREATE POLICY "Authenticated users can manage dynamic list fields" ON public.service_dynamic_list_fields
  FOR ALL TO authenticated
  USING ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'))
  WITH CHECK ((select auth.jwt()->>'app_metadata')::jsonb->>'role' IN ('super_admin', 'admin', 'staff'));
