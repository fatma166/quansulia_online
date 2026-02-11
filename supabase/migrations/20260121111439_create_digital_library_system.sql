/*
  # Digital Library System for Educational Integration

  نظام المكتبة الرقمية للطلاب - التكامل مع الأنظمة التعليمية

  1. New Tables
    - `books` - جدول الكتب المتاحة
    - `courses` - جدول الكورسات/المقررات
    - `course_books` - جدول العلاقة بين المقررات والكتب
    - `student_library` - مكتبة الطالب
    - `access_codes` - رموز الوصول
    - `student_courses` - تسجيل الطلاب في المقررات
    - `library_settings` - إعدادات النظام العامة

  2. Security
    - Enable RLS on all tables
    - Add policies for students to view their own data
    - Add policies for staff to manage library content
*/

-- ============================================================================
-- 1. Create Books Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text UNIQUE,
  cover_image text,
  description text,
  publisher text,
  publication_year integer,
  price decimal(10,2) DEFAULT 0,
  digital_file_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 2. Create Courses Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code text UNIQUE NOT NULL,
  course_name text NOT NULL,
  department text,
  semester text,
  academic_year text,
  instructor_id uuid,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. Create Course Books Relationship
-- ============================================================================
CREATE TABLE IF NOT EXISTS course_books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  required boolean DEFAULT true,
  access_method text CHECK (access_method IN ('purchase', 'access_code', 'university_provided')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(course_id, book_id)
);

-- ============================================================================
-- 4. Create Student Library Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  access_method text CHECK (access_method IN ('purchase', 'access_code', 'university_provided')),
  access_code_used text,
  purchase_date timestamptz DEFAULT now(),
  expiry_date timestamptz,
  active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, book_id)
);

-- ============================================================================
-- 5. Create Access Codes Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE SET NULL,
  used_by_student_id uuid,
  used_at timestamptz,
  expiry_date timestamptz,
  max_uses integer DEFAULT 1,
  current_uses integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 6. Create Student Courses Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS student_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- ============================================================================
-- 7. Create Library Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS library_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(course_code);
CREATE INDEX IF NOT EXISTS idx_course_books_course ON course_books(course_id);
CREATE INDEX IF NOT EXISTS idx_course_books_book ON course_books(book_id);
CREATE INDEX IF NOT EXISTS idx_student_library_student ON student_library(student_id);
CREATE INDEX IF NOT EXISTS idx_student_library_book ON student_library(book_id);
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_student_courses_student ON student_courses(student_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_course ON student_courses(course_id);

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for Books
-- ============================================================================
CREATE POLICY "Books are viewable by everyone"
  ON books FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage books"
  ON books FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Courses
-- ============================================================================
CREATE POLICY "Students can view their courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_courses
      WHERE student_courses.course_id = courses.id
      AND student_courses.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Course Books
-- ============================================================================
CREATE POLICY "Students can view course books"
  ON course_books FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM student_courses
      WHERE student_courses.course_id = course_books.course_id
      AND student_courses.student_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage course books"
  ON course_books FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Student Library
-- ============================================================================
CREATE POLICY "Students can view own library"
  ON student_library FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can add to own library"
  ON student_library FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can view all libraries"
  ON student_library FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage libraries"
  ON student_library FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Access Codes
-- ============================================================================
CREATE POLICY "Staff can view access codes"
  ON access_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage access codes"
  ON access_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Student Courses
-- ============================================================================
CREATE POLICY "Students can view own enrollments"
  ON student_courses FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Staff can view all enrollments"
  ON student_courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage enrollments"
  ON student_courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
    )
  );

-- ============================================================================
-- RLS Policies for Library Settings
-- ============================================================================
CREATE POLICY "Settings are readable by authenticated users"
  ON library_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON library_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name = 'super_admin'
    )
  );

-- ============================================================================
-- Functions
-- ============================================================================

CREATE OR REPLACE FUNCTION check_student_book_access(
  p_student_id uuid,
  p_book_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM student_library
    WHERE student_id = p_student_id
    AND book_id = p_book_id
    AND active = true
    AND (expiry_date IS NULL OR expiry_date > now())
  );
END;
$$;

CREATE OR REPLACE FUNCTION use_access_code(
  p_code text,
  p_student_id uuid,
  p_book_id uuid,
  p_course_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_access_code access_codes;
BEGIN
  SELECT * INTO v_access_code
  FROM access_codes
  WHERE code = p_code
  AND book_id = p_book_id
  AND active = true
  AND (expiry_date IS NULL OR expiry_date > now())
  AND current_uses < max_uses;

  IF v_access_code.id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'كود الوصول غير صحيح أو منتهي الصلاحية'
    );
  END IF;

  IF check_student_book_access(p_student_id, p_book_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'الكتاب موجود بالفعل في مكتبتك'
    );
  END IF;

  INSERT INTO student_library (
    student_id,
    book_id,
    course_id,
    access_method,
    access_code_used
  ) VALUES (
    p_student_id,
    p_book_id,
    p_course_id,
    'access_code',
    p_code
  );

  UPDATE access_codes
  SET current_uses = current_uses + 1,
      used_by_student_id = p_student_id,
      used_at = now()
  WHERE id = v_access_code.id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إضافة الكتاب إلى مكتبتك بنجاح'
  );
END;
$$;

CREATE OR REPLACE FUNCTION add_university_book(
  p_student_id uuid,
  p_book_id uuid,
  p_course_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM student_courses
    WHERE student_id = p_student_id
    AND course_id = p_course_id
    AND status = 'active'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'أنت غير مسجل في هذا المقرر'
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM course_books
    WHERE course_id = p_course_id
    AND book_id = p_book_id
    AND access_method = 'university_provided'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'هذا الكتاب غير متاح للإضافة المباشرة'
    );
  END IF;

  IF check_student_book_access(p_student_id, p_book_id) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'الكتاب موجود بالفعل في مكتبتك'
    );
  END IF;

  INSERT INTO student_library (
    student_id,
    book_id,
    course_id,
    access_method
  ) VALUES (
    p_student_id,
    p_book_id,
    p_course_id,
    'university_provided'
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إضافة الكتاب إلى مكتبتك بنجاح'
  );
END;
$$;

INSERT INTO library_settings (setting_key, setting_value, description)
VALUES
  ('payment_enabled', 'true', 'Enable online payment for books'),
  ('access_code_enabled', 'true', 'Enable access code redemption'),
  ('university_provided_enabled', 'true', 'Enable university-provided books')
ON CONFLICT (setting_key) DO NOTHING;