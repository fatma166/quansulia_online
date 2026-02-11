/*
  # إصلاح صلاحيات function log_status_change

  1. المشكلة
    - الـ function log_status_change() تعمل بصلاحيات المستخدم الحالي (SECURITY INVOKER)
    - عندما يغير موظف الحالة، الـ trigger يحاول إضافة سجل في status_history
    - لكن RLS policy تمنع الإضافة لأن المستخدم ليس في جدول staff

  2. الحل
    - تغيير الـ function إلى SECURITY DEFINER
    - هذا يجعلها تعمل بصلاحيات صاحب الـ function (postgres)
    - بالتالي تتجاوز RLS policies

  3. الأمان
    - الـ function بسيطة وآمنة (تضيف سجل واحد فقط)
    - لا توجد مدخلات من المستخدم
    - SECURITY DEFINER آمن هنا
*/

-- إعادة إنشاء الـ function بصلاحيات SECURITY DEFINER
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER
SECURITY DEFINER -- ⭐ هذا هو التغيير المهم
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_history (application_id, old_status, new_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status updated');
  END IF;
  RETURN NEW;
END;
$$;
