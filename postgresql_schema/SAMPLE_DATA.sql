-- =====================================================
-- Sample Data - بيانات تجريبية للاختبار
-- =====================================================
--
-- هذا الملف يحتوي على بيانات تجريبية لاختبار النظام
-- يمكن استيراده بعد استيراد الـ Schema
--
-- =====================================================

-- ====== المناطق ======
INSERT INTO regions (name_ar, name_en, code) VALUES
('الرياض', 'Riyadh', 'RD'),
('مكة المكرمة', 'Makkah', 'MK'),
('المدينة المنورة', 'Madinah', 'MD'),
('الشرقية', 'Eastern Province', 'EP'),
('القصيم', 'Qassim', 'QS'),
('عسير', 'Asir', 'AS'),
('تبوك', 'Tabuk', 'TB'),
('حائل', 'Hail', 'HL'),
('الحدود الشمالية', 'Northern Borders', 'NB'),
('جازان', 'Jazan', 'JZ'),
('نجران', 'Najran', 'NJ'),
('الباحة', 'Al Bahah', 'BH'),
('الجوف', 'Al Jouf', 'JF')
ON CONFLICT (code) DO NOTHING;

-- ====== الفئات ======
INSERT INTO categories (name_ar, name_en, icon, order_index) VALUES
('الخدمات القنصلية', 'Consular Services', 'FileText', 1),
('الوثائق الشخصية', 'Personal Documents', 'User', 2),
('الشؤون العائلية', 'Family Affairs', 'Users', 3),
('الخدمات التعليمية', 'Educational Services', 'GraduationCap', 4)
ON CONFLICT DO NOTHING;

-- ====== موظف تجريبي (Super Admin) ======
-- Username: admin
-- Password: admin123
INSERT INTO staff (email, username, password, full_name, role, active) VALUES
('admin@consulate.sd', 'admin', '$2a$10$rN8Ej5LjEQvxTjMm9VqCJu7Y8xF3FqKpXlGxBvQ8kSx.Z7W3LX7xu', 'مدير النظام', 'super_admin', true)
ON CONFLICT (email) DO NOTHING;

-- ====== إعدادات النظام ======
INSERT INTO system_settings (key, value, description) VALUES
('site_name', '{"ar": "القنصلية السودانية", "en": "Sudanese Consulate"}', 'اسم الموقع'),
('contact_email', '"info@consulate.sd"', 'البريد الإلكتروني'),
('contact_phone', '"+966112345678"', 'رقم الهاتف'),
('working_hours', '{"ar": "من الأحد إلى الخميس: 9 صباحاً - 5 مساءً", "en": "Sunday to Thursday: 9 AM - 5 PM"}', 'ساعات العمل')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ====== CMS Sections ======
INSERT INTO cms_sections (section_key, title_ar, title_en, content_ar, content_en, visible) VALUES
('hero', 'مرحباً بكم', 'Welcome', 'القنصلية السودانية في المملكة العربية السعودية', 'Sudanese Consulate in Saudi Arabia', true),
('about', 'عن القنصلية', 'About Us', 'نقدم خدمات قنصلية متميزة للمواطنين السودانيين', 'We provide distinguished consular services to Sudanese citizens', true),
('services', 'خدماتنا', 'Our Services', 'نوفر مجموعة واسعة من الخدمات القنصلية', 'We offer a wide range of consular services', true)
ON CONFLICT (section_key) DO UPDATE SET visible = EXCLUDED.visible;

-- ====== Hero Slides ======
INSERT INTO cms_hero_slides (title_ar, title_en, subtitle_ar, subtitle_en, button_text_ar, button_text_en, button_link, active, order_index) VALUES
('القنصلية السودانية', 'Sudanese Consulate', 'خدمات قنصلية متميزة', 'Distinguished Consular Services', 'الخدمات المتاحة', 'Available Services', '/services', true, 1),
('التقديم الإلكتروني', 'Online Application', 'قدم طلبك الآن بسهولة', 'Apply Now Easily', 'ابدأ الآن', 'Start Now', '/services', true, 2);

-- ====== Important Links ======
INSERT INTO cms_important_links (title_ar, title_en, url, icon, active, order_index) VALUES
('وزارة الخارجية السودانية', 'Sudan Ministry of Foreign Affairs', 'https://www.mofa.gov.sd', 'Globe', true, 1),
('السفارة السودانية', 'Sudan Embassy', 'https://www.embassy.sd', 'Building', true, 2),
('وزارة الخارجية السعودية', 'Saudi Ministry of Foreign Affairs', 'https://www.mofa.gov.sa', 'Flag', true, 3);

-- ====== Counters ======
INSERT INTO cms_counters (label_ar, label_en, value, icon, order_index) VALUES
('الطلبات المكتملة', 'Completed Applications', 1250, 'CheckCircle', 1),
('العملاء الراضون', 'Satisfied Customers', 950, 'Users', 2),
('الخدمات المتاحة', 'Available Services', 15, 'FileText', 3),
('الموظفون', 'Staff Members', 25, 'UserCheck', 4);

-- ====== Chatbot Categories ======
INSERT INTO chatbot_categories (name_ar, name_en, icon, order_index) VALUES
('الأسئلة العامة', 'General Questions', 'HelpCircle', 1),
('الجوازات', 'Passports', 'Plane', 2),
('التأشيرات', 'Visas', 'FileText', 3),
('التعليم', 'Education', 'GraduationCap', 4)
ON CONFLICT DO NOTHING;

-- ====== Chatbot Q&A ======
INSERT INTO chatbot_qa (category_id, question_ar, question_en, answer_ar, answer_en, keywords, active) VALUES
(
    (SELECT id FROM chatbot_categories WHERE name_en = 'General Questions' LIMIT 1),
    'ما هي ساعات العمل؟',
    'What are the working hours?',
    'نعمل من الأحد إلى الخميس من الساعة 9 صباحاً حتى 5 مساءً',
    'We work from Sunday to Thursday from 9 AM to 5 PM',
    ARRAY['ساعات', 'العمل', 'working', 'hours'],
    true
),
(
    (SELECT id FROM chatbot_categories WHERE name_en = 'Passports' LIMIT 1),
    'كيف أجدد جوازي؟',
    'How do I renew my passport?',
    'يمكنك تجديد جوازك من خلال تقديم طلب إلكتروني عبر الموقع مع المستندات المطلوبة',
    'You can renew your passport by submitting an online application through the website with the required documents',
    ARRAY['تجديد', 'جواز', 'renew', 'passport'],
    true
);

-- ====== Shipping Companies ======
INSERT INTO shipping_companies (name_ar, name_en, contact_phone, website, active) VALUES
('DHL السعودية', 'DHL Saudi Arabia', '+966920000777', 'https://www.dhl.com/sa', true),
('أرامكس', 'Aramex', '+966920003344', 'https://www.aramex.com', true),
('سمسا', 'SMSA Express', '+966920006666', 'https://www.smsaexpress.com', true);

-- ====== CMS Announcements ======
INSERT INTO cms_announcements (title_ar, title_en, message_ar, message_en, type, active) VALUES
('ترحيب', 'Welcome', 'مرحباً بكم في النظام الإلكتروني للقنصلية السودانية', 'Welcome to the Sudanese Consulate Electronic System', 'info', true);

-- ====== About Sudan Content ======
INSERT INTO cms_about_sudan (section_key, title_ar, title_en, content_ar, content_en, order_index) VALUES
('geography', 'الجغرافيا', 'Geography', 'السودان دولة عربية أفريقية تقع في شمال شرق أفريقيا', 'Sudan is an Arab-African country located in Northeast Africa', 1),
('culture', 'الثقافة', 'Culture', 'يتمتع السودان بتنوع ثقافي غني', 'Sudan enjoys a rich cultural diversity', 2)
ON CONFLICT (section_key) DO UPDATE SET order_index = EXCLUDED.order_index;

-- =====================================================
-- تم إدراج البيانات التجريبية بنجاح
-- =====================================================

-- للتحقق:
-- SELECT COUNT(*) FROM regions;           -- يجب أن يكون 13
-- SELECT COUNT(*) FROM categories;        -- يجب أن يكون 4
-- SELECT COUNT(*) FROM staff;             -- يجب أن يكون 1 على الأقل
-- SELECT * FROM staff WHERE role = 'super_admin';
