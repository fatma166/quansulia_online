/*
  # Add Sample Data for Digital Library System

  Sample data for testing:
  - 5 books
  - 2 courses
  - Course-book relationships
  - Access codes
  - Student enrollments
*/

-- Insert sample books
INSERT INTO books (id, title, author, isbn, cover_image, description, publisher, publication_year, price) VALUES
(gen_random_uuid(), 'مقدمة في علم الحاسوب', 'د. أحمد محمد', '978-1-234567-89-0', 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400', 'كتاب شامل يغطي أساسيات علم الحاسوب للمبتدئين', 'دار النشر العربي', 2023, 120.00),
(gen_random_uuid(), 'برمجة الويب المتقدمة', 'د. فاطمة علي', '978-1-234567-90-6', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400', 'تعلم تطوير تطبيقات الويب الحديثة باستخدام React و Node.js', 'دار التقنية', 2024, 180.00),
(gen_random_uuid(), 'قواعد البيانات', 'د. خالد حسن', '978-1-234567-91-3', 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400', 'دليل شامل لتصميم وإدارة قواعد البيانات', 'دار المعرفة', 2023, 150.00),
(gen_random_uuid(), 'الذكاء الاصطناعي', 'د. سارة عبدالله', '978-1-234567-92-0', 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400', 'مقدمة شاملة للذكاء الاصطناعي والتعلم الآلي', 'دار العلوم', 2024, 200.00),
(gen_random_uuid(), 'أمن المعلومات', 'د. محمود أحمد', '978-1-234567-93-7', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400', 'كتاب متخصص في أمن المعلومات والحماية السيبرانية', 'دار الأمن', 2023, 160.00)
ON CONFLICT (isbn) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (id, course_code, course_name, department, semester, academic_year, active) VALUES
(gen_random_uuid(), 'CS101', 'مقدمة في علوم الحاسب', 'علوم الحاسب', 'الفصل الأول', '2024-2025', true),
(gen_random_uuid(), 'CS201', 'برمجة متقدمة', 'علوم الحاسب', 'الفصل الثاني', '2024-2025', true)
ON CONFLICT (course_code) DO NOTHING;

-- Link books to courses with different access methods
DO $$
DECLARE
  v_course1_id uuid;
  v_course2_id uuid;
  v_book1_id uuid;
  v_book2_id uuid;
  v_book3_id uuid;
  v_book4_id uuid;
  v_book5_id uuid;
BEGIN
  -- Get course IDs
  SELECT id INTO v_course1_id FROM courses WHERE course_code = 'CS101' LIMIT 1;
  SELECT id INTO v_course2_id FROM courses WHERE course_code = 'CS201' LIMIT 1;

  -- Get book IDs
  SELECT id INTO v_book1_id FROM books WHERE isbn = '978-1-234567-89-0' LIMIT 1;
  SELECT id INTO v_book2_id FROM books WHERE isbn = '978-1-234567-90-6' LIMIT 1;
  SELECT id INTO v_book3_id FROM books WHERE isbn = '978-1-234567-91-3' LIMIT 1;
  SELECT id INTO v_book4_id FROM books WHERE isbn = '978-1-234567-92-0' LIMIT 1;
  SELECT id INTO v_book5_id FROM books WHERE isbn = '978-1-234567-93-7' LIMIT 1;

  -- Course 1 books
  IF v_course1_id IS NOT NULL AND v_book1_id IS NOT NULL THEN
    INSERT INTO course_books (course_id, book_id, required, access_method) 
    VALUES (v_course1_id, v_book1_id, true, 'university_provided')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_course1_id IS NOT NULL AND v_book3_id IS NOT NULL THEN
    INSERT INTO course_books (course_id, book_id, required, access_method)
    VALUES (v_course1_id, v_book3_id, true, 'access_code')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Course 2 books
  IF v_course2_id IS NOT NULL AND v_book2_id IS NOT NULL THEN
    INSERT INTO course_books (course_id, book_id, required, access_method)
    VALUES (v_course2_id, v_book2_id, true, 'purchase')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_course2_id IS NOT NULL AND v_book4_id IS NOT NULL THEN
    INSERT INTO course_books (course_id, book_id, required, access_method)
    VALUES (v_course2_id, v_book4_id, false, 'purchase')
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_course2_id IS NOT NULL AND v_book5_id IS NOT NULL THEN
    INSERT INTO course_books (course_id, book_id, required, access_method)
    VALUES (v_course2_id, v_book5_id, false, 'university_provided')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Create sample access codes
  IF v_book3_id IS NOT NULL THEN
    INSERT INTO access_codes (code, book_id, course_id, max_uses, active)
    VALUES ('BOOK-CS101-2024', v_book3_id, v_course1_id, 100, true)
    ON CONFLICT (code) DO NOTHING;
  END IF;

END $$;