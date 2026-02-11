/*
  # إصلاح العلاقات الخارجية لجدول الموظفين

  1. التغييرات
    - إضافة foreign key constraint بين staff.region_id و regions.id
    - إضافة foreign key constraint بين staff.role_id و roles.id
    - إضافة foreign key constraint بين staff.department_id و departments.id
  
  2. الأمان
    - التأكد من وجود الجداول قبل إضافة العلاقات
*/

-- إضافة foreign key constraint للمنطقة إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'staff_region_id_fkey'
    AND table_name = 'staff'
  ) THEN
    ALTER TABLE staff
    ADD CONSTRAINT staff_region_id_fkey
    FOREIGN KEY (region_id) REFERENCES regions(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- إضافة foreign key constraint للدور الوظيفي إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'staff_role_id_fkey'
    AND table_name = 'staff'
  ) THEN
    ALTER TABLE staff
    ADD CONSTRAINT staff_role_id_fkey
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- إضافة foreign key constraint للقسم إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'staff_department_id_fkey'
    AND table_name = 'staff'
  ) THEN
    ALTER TABLE staff
    ADD CONSTRAINT staff_department_id_fkey
    FOREIGN KEY (department_id) REFERENCES departments(id)
    ON DELETE SET NULL;
  END IF;
END $$;
