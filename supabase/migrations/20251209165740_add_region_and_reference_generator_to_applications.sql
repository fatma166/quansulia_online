/*
  # تحديث جدول الطلبات لإضافة المنطقة ودالة الرقم المرجعي

  ## التعديلات
  
  1. إضافة حقول جديدة
     - `applicant_region` - منطقة المتقدم لفلترة الطلبات حسب المنطقة
     - `applicant_phone` - رقم جوال المتقدم للتواصل
     - `applicant_email` - بريد المتقدم
  
  2. إنشاء دالة لتوليد أرقام مرجعية تلقائية
     - تنسيق الرقم: REF-YYYYMMDD-XXXX (مثال: REF-20251209-0001)
  
  3. إنشاء trigger لتوليد الرقم المرجعي تلقائياً
*/

-- إضافة حقول جديدة لجدول applications
DO $$
BEGIN
  -- إضافة حقل المنطقة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applicant_region'
  ) THEN
    ALTER TABLE applications ADD COLUMN applicant_region text;
  END IF;

  -- إضافة حقل رقم الجوال
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applicant_phone'
  ) THEN
    ALTER TABLE applications ADD COLUMN applicant_phone text;
  END IF;

  -- إضافة حقل البريد الإلكتروني
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'applicant_email'
  ) THEN
    ALTER TABLE applications ADD COLUMN applicant_email text;
  END IF;
END $$;

-- إنشاء index للبحث حسب المنطقة
CREATE INDEX IF NOT EXISTS idx_applications_applicant_region ON applications(applicant_region);

-- دالة لتوليد الرقم المرجعي التلقائي
CREATE OR REPLACE FUNCTION generate_reference_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  today_date text;
  sequence_num integer;
  ref_number text;
BEGIN
  -- الحصول على التاريخ بصيغة YYYYMMDD
  today_date := to_char(CURRENT_DATE, 'YYYYMMDD');
  
  -- الحصول على آخر رقم تسلسلي لليوم
  SELECT COALESCE(MAX(
    CAST(
      substring(reference_number FROM 'REF-[0-9]+-([0-9]+)') AS integer
    )
  ), 0) INTO sequence_num
  FROM applications
  WHERE reference_number LIKE 'REF-' || today_date || '-%';
  
  -- زيادة الرقم التسلسلي
  sequence_num := sequence_num + 1;
  
  -- تكوين الرقم المرجعي
  ref_number := 'REF-' || today_date || '-' || LPAD(sequence_num::text, 4, '0');
  
  RETURN ref_number;
END;
$$;

-- Trigger لتوليد الرقم المرجعي تلقائياً عند الإدراج
CREATE OR REPLACE FUNCTION set_reference_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.reference_number IS NULL OR NEW.reference_number = '' THEN
    NEW.reference_number := generate_reference_number();
  END IF;
  RETURN NEW;
END;
$$;

-- حذف trigger القديم إذا كان موجوداً
DROP TRIGGER IF EXISTS trigger_set_reference_number ON applications;

-- إنشاء trigger جديد
CREATE TRIGGER trigger_set_reference_number
BEFORE INSERT ON applications
FOR EACH ROW
EXECUTE FUNCTION set_reference_number();