/*
  # إصلاح سياسات الأمان للسماح بالوصول العام

  1. التغييرات
    - السماح لجميع الزوار (حتى غير المسجلين) بمشاهدة المحتوى النشط
    - الإبقاء على قيود التعديل للإداريين فقط
  
  2. الأمان
    - القراءة: متاحة للجميع للمحتوى النشط
    - الكتابة: للإداريين فقط
*/

-- حذف جميع السياسات القديمة للجداول الأربعة
DO $$ 
BEGIN
    -- about_consulate_sections policies
    DROP POLICY IF EXISTS "Anyone can view active about consulate sections" ON about_consulate_sections;
    DROP POLICY IF EXISTS "Admins can view all about consulate sections" ON about_consulate_sections;
    DROP POLICY IF EXISTS "Public can view active about consulate sections" ON about_consulate_sections;
    
    -- ambassadors policies
    DROP POLICY IF EXISTS "Anyone can view active ambassadors" ON ambassadors;
    DROP POLICY IF EXISTS "Admins can view all ambassadors" ON ambassadors;
    DROP POLICY IF EXISTS "Public can view active ambassadors" ON ambassadors;
    
    -- services_guide_sections policies
    DROP POLICY IF EXISTS "Anyone can view active services guide sections" ON services_guide_sections;
    DROP POLICY IF EXISTS "Admins can view all services guide sections" ON services_guide_sections;
    DROP POLICY IF EXISTS "Public can view active services guide sections" ON services_guide_sections;
    
    -- important_links policies
    DROP POLICY IF EXISTS "Anyone can view active important links" ON important_links;
    DROP POLICY IF EXISTS "Admins can view all important links" ON important_links;
    DROP POLICY IF EXISTS "Public can view active important links" ON important_links;
    
    -- storage policies
    DROP POLICY IF EXISTS "Anyone can view consulate images" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view consulate images" ON storage.objects;
    DROP POLICY IF EXISTS "Anyone can view services guide images" ON storage.objects;
    DROP POLICY IF EXISTS "Public can view services guide images" ON storage.objects;
END $$;

-- سياسات القراءة العامة للجميع (بدون تسجيل دخول) - فقط المحتوى النشط
CREATE POLICY "Public read active about consulate"
  ON about_consulate_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read active ambassadors"
  ON ambassadors FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read active guide sections"
  ON services_guide_sections FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public read active important links"
  ON important_links FOR SELECT
  USING (is_active = true);

-- سياسات Storage للمشاهدة العامة
CREATE POLICY "Public read consulate images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'consulate-images');

CREATE POLICY "Public read services guide images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'services-guide');