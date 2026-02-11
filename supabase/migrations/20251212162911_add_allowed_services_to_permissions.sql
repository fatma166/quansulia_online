/*
  # إضافة دعم فلترة الخدمات للموظفين
  
  1. التغييرات
    - إضافة حقل allowed_services في permissions (مصفوفة من slugs الخدمات)
    - تحديث أمثلة على الموظفين لتشمل allowed_services
    
  2. الاستخدام
    - إذا can_access_all_services = true، الموظف يرى كل الخدمات
    - إذا can_access_all_services = false، الموظف يرى فقط الخدمات في permissions.allowed_services
*/

-- لا حاجة لتغيير بنية الجدول لأن permissions هو jsonb ويمكن إضافة أي حقول فيه
-- فقط نوثق البنية المتوقعة في التعليقات

-- بنية permissions المتوقعة:
-- {
--   "dashboard_sections": ["applications", "appointments", ...],
--   "allowed_regions": ["riyadh", "makkah", ...],
--   "allowed_services": ["passports", "attestations", ...], -- slugs للخدمات المسموح بها
--   "application_actions": {
--     "view": true,
--     "update_status": true,
--     "approve": true,
--     "reject": true,
--     "request_changes": true
--   }
-- }

-- إنشاء دالة مساعدة لفحص صلاحيات الخدمات
CREATE OR REPLACE FUNCTION check_staff_service_access(
  staff_user_id uuid,
  service_slug text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  staff_record record;
BEGIN
  -- جلب سجل الموظف
  SELECT 
    can_access_all_services,
    permissions
  INTO staff_record
  FROM staff
  WHERE user_id = staff_user_id AND is_active = true;
  
  -- إذا لم يوجد الموظف، إرجاع false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- إذا الموظف يمكنه الوصول لكل الخدمات
  IF staff_record.can_access_all_services THEN
    RETURN true;
  END IF;
  
  -- فحص إذا الخدمة في القائمة المسموح بها
  IF staff_record.permissions ? 'allowed_services' THEN
    RETURN service_slug = ANY(
      ARRAY(
        SELECT jsonb_array_elements_text(staff_record.permissions->'allowed_services')
      )
    );
  END IF;
  
  -- إذا لم يوجد allowed_services، إرجاع false
  RETURN false;
END;
$$;

COMMENT ON FUNCTION check_staff_service_access IS 'فحص إذا كان الموظف يمكنه الوصول لخدمة معينة';
