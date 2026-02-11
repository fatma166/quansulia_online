/*
  # Security Fix Part 4 (Final): Fix Chat Staff Policy
  
  chat_staff table uses id/email for identification, not staff_id/user_id
  Allow staff to update based on their email matching
*/

-- Chat Staff - Fixed policy based on actual table structure
DROP POLICY IF EXISTS "Staff can update own chat status" ON public.chat_staff;
CREATE POLICY "Staff can update own chat status" ON public.chat_staff
  FOR UPDATE TO authenticated
  USING (
    email IN (
      SELECT staff.email 
      FROM public.staff 
      WHERE staff.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    email IN (
      SELECT staff.email 
      FROM public.staff 
      WHERE staff.user_id = (select auth.uid())
    )
  );
