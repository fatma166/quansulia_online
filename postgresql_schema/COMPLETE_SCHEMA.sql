-- =====================================================
-- PostgreSQL Database Schema - Sudanese Consulate System
-- Generated: 2024-12-21
-- Version: 1.0
-- =====================================================
--
-- هذا الملف يحتوي على Schema كامل للنظام
-- يتضمن جميع الجداول والعلاقات والـ Indexes
--
-- للاستيراد:
-- psql -U your_user -d your_database -f COMPLETE_SCHEMA.sql
--
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES - الجداول الأساسية
-- =====================================================

-- Regions Table - المناطق
CREATE TABLE IF NOT EXISTS regions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories Table - الفئات
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subcategories Table - الفئات الفرعية
CREATE TABLE IF NOT EXISTS subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SERVICES MANAGEMENT - إدارة الخدمات
-- =====================================================

-- Services Table - الخدمات
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    price DECIMAL(10,2) DEFAULT 0,
    processing_time_ar TEXT,
    processing_time_en TEXT,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    icon TEXT,
    age_based_pricing JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Fields - حقول الخدمة
CREATE TABLE IF NOT EXISTS service_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    label_en TEXT NOT NULL,
    type TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    placeholder_ar TEXT,
    placeholder_en TEXT,
    options JSONB,
    validation JSONB,
    conditional_logic JSONB,
    order_index INTEGER DEFAULT 0,
    width TEXT DEFAULT 'full',
    help_text_ar TEXT,
    help_text_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Requirements - متطلبات الخدمة
CREATE TABLE IF NOT EXISTS service_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    text_ar TEXT NOT NULL,
    text_en TEXT NOT NULL,
    conditional_logic JSONB,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Documents - مستندات الخدمة
CREATE TABLE IF NOT EXISTS service_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    label_ar TEXT NOT NULL,
    label_en TEXT NOT NULL,
    required BOOLEAN DEFAULT false,
    max_size INTEGER DEFAULT 5242880,
    allowed_types TEXT[] DEFAULT ARRAY['application/pdf', 'image/jpeg', 'image/png'],
    conditional_logic JSONB,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conditional Pricing Rules - قواعد التسعير الشرطي
CREATE TABLE IF NOT EXISTS conditional_pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    conditions JSONB NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- APPLICATIONS - الطلبات
-- =====================================================

-- Applications Table - الطلبات
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    reference_number TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    documents JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Pricing - تسعير الطلبات
CREATE TABLE IF NOT EXISTS application_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) DEFAULT 0,
    conditional_prices JSONB DEFAULT '[]'::jsonb,
    final_price DECIMAL(10,2) NOT NULL,
    calculation_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status History - سجل الحالات
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    notes TEXT,
    changed_by UUID,
    staff_name TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Notes - ملاحظات الطلبات
CREATE TABLE IF NOT EXISTS application_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    staff_id UUID,
    staff_name TEXT,
    note TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices - الفواتير
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_method TEXT,
    payment_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STAFF MANAGEMENT - إدارة الموظفين
-- =====================================================

-- Staff Table - الموظفون
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    phone TEXT,
    region_id UUID REFERENCES regions(id),
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff Permissions - صلاحيات الموظفين
CREATE TABLE IF NOT EXISTS staff_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID UNIQUE REFERENCES staff(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
    allowed_services UUID[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- APPOINTMENTS & SHIPPING - المواعيد والشحن
-- =====================================================

-- Appointment Settings - إعدادات المواعيد
CREATE TABLE IF NOT EXISTS appointment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID UNIQUE REFERENCES services(id) ON DELETE CASCADE,
    slots_per_day INTEGER DEFAULT 10,
    duration_minutes INTEGER DEFAULT 30,
    advance_booking_days INTEGER DEFAULT 30,
    working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Closed Days - الأيام المغلقة
CREATE TABLE IF NOT EXISTS closed_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    reason_ar TEXT,
    reason_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments - المواعيد
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Companies - شركات الشحن
CREATE TABLE IF NOT EXISTS shipping_companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    contact_phone TEXT,
    contact_email TEXT,
    website TEXT,
    tracking_url_template TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments - الشحنات
CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    shipping_company_id UUID REFERENCES shipping_companies(id),
    tracking_number TEXT,
    status TEXT DEFAULT 'preparing',
    recipient_name TEXT NOT NULL,
    recipient_phone TEXT NOT NULL,
    recipient_address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    shipped_date TIMESTAMPTZ,
    delivered_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking Updates - تحديثات التتبع
CREATE TABLE IF NOT EXISTS tracking_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description_ar TEXT,
    description_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EDUCATIONAL SERVICES - الخدمات التعليمية
-- =====================================================

-- Educational Cards - البطاقات التعليمية
CREATE TABLE IF NOT EXISTS educational_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name TEXT NOT NULL,
    national_id TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    school_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    region_id UUID REFERENCES regions(id),
    status TEXT DEFAULT 'pending',
    card_number TEXT UNIQUE,
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CMS - نظام إدارة المحتوى
-- =====================================================

-- CMS Sections - أقسام الصفحة الرئيسية
CREATE TABLE IF NOT EXISTS cms_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT,
    content_en TEXT,
    visible BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hero Slides - شرائح العرض الرئيسية
CREATE TABLE IF NOT EXISTS cms_hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_ar TEXT,
    subtitle_en TEXT,
    image_url TEXT,
    button_text_ar TEXT,
    button_text_en TEXT,
    button_link TEXT,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Important Links - روابط مهمة
CREATE TABLE IF NOT EXISTS cms_important_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT,
    description_ar TEXT,
    description_en TEXT,
    active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Counters - العدادات
CREATE TABLE IF NOT EXISTS cms_counters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label_ar TEXT NOT NULL,
    label_en TEXT NOT NULL,
    value INTEGER NOT NULL DEFAULT 0,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- News - الأخبار
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    excerpt_ar TEXT,
    excerpt_en TEXT,
    image_url TEXT,
    category TEXT,
    published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    author_id UUID,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events - الفعاليات
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    image_url TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    location_ar TEXT,
    location_en TEXT,
    registration_enabled BOOLEAN DEFAULT false,
    max_participants INTEGER,
    published BOOLEAN DEFAULT false,
    author_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event Registrations - تسجيلات الفعاليات
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    additional_info TEXT,
    status TEXT DEFAULT 'confirmed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Breaking News Ticker - الأخبار العاجلة
CREATE TABLE IF NOT EXISTS breaking_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_ar TEXT NOT NULL,
    text_en TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements - الإعلانات
CREATE TABLE IF NOT EXISTS cms_announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    message_ar TEXT NOT NULL,
    message_en TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    active BOOLEAN DEFAULT true,
    show_on_homepage BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Maintenance Mode - وضع الصيانة
CREATE TABLE IF NOT EXISTS cms_maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    enabled BOOLEAN DEFAULT false,
    title_ar TEXT,
    title_en TEXT,
    message_ar TEXT,
    message_en TEXT,
    estimated_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- About Sudan Content - محتوى عن السودان
CREATE TABLE IF NOT EXISTS cms_about_sudan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CONTACT & COMMUNICATION - التواصل
-- =====================================================

-- Contact Messages - رسائل التواصل
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new',
    replied BOOLEAN DEFAULT false,
    reply_text TEXT,
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Messages - رسائل الدردشة
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    sender_id UUID,
    message TEXT NOT NULL,
    attachments JSONB,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHATBOT - المساعد الآلي
-- =====================================================

-- Chatbot Categories - فئات الأسئلة
CREATE TABLE IF NOT EXISTS chatbot_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chatbot Q&A - الأسئلة والأجوبة
CREATE TABLE IF NOT EXISTS chatbot_qa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES chatbot_categories(id) ON DELETE SET NULL,
    question_ar TEXT NOT NULL,
    question_en TEXT NOT NULL,
    answer_ar TEXT NOT NULL,
    answer_en TEXT NOT NULL,
    keywords TEXT[],
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SYSTEM SETTINGS - إعدادات النظام
-- =====================================================

-- System Settings - إعدادات عامة
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export Templates - قوالب التصدير
CREATE TABLE IF NOT EXISTS export_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    columns JSONB NOT NULL,
    filters JSONB,
    column_order JSONB,
    custom_columns JSONB,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Additional Pages - صفحات إضافية
CREATE TABLE IF NOT EXISTS additional_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    content_ar TEXT NOT NULL,
    content_en TEXT NOT NULL,
    meta_description_ar TEXT,
    meta_description_en TEXT,
    published BOOLEAN DEFAULT false,
    show_in_menu BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP Verification - التحقق بالرمز
CREATE TABLE IF NOT EXISTS otp_verification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES - الفهارس
-- =====================================================

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_service_id ON applications(service_id);
CREATE INDEX IF NOT EXISTS idx_applications_region_id ON applications(region_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_reference_number ON applications(reference_number);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_subcategory_id ON services(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);

-- Staff indexes
CREATE INDEX IF NOT EXISTS idx_staff_email ON staff(email);
CREATE INDEX IF NOT EXISTS idx_staff_username ON staff(username);
CREATE INDEX IF NOT EXISTS idx_staff_role ON staff(role);
CREATE INDEX IF NOT EXISTS idx_staff_active ON staff(active);

-- Status history index
CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_status_history_created_at ON status_history(created_at DESC);

-- News & Events indexes
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_published ON events(published);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_application_id ON appointments(application_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Shipments indexes
CREATE INDEX IF NOT EXISTS idx_shipments_application_id ON shipments(application_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS - التعليقات
-- =====================================================

COMMENT ON TABLE applications IS 'جدول الطلبات الرئيسي';
COMMENT ON TABLE services IS 'جدول الخدمات المتاحة';
COMMENT ON TABLE staff IS 'جدول الموظفين';
COMMENT ON TABLE regions IS 'المناطق السعودية';
COMMENT ON TABLE categories IS 'فئات الخدمات';
COMMENT ON TABLE appointments IS 'مواعيد الطلبات';
COMMENT ON TABLE shipments IS 'شحنات الطلبات';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- إنشاء Schema تم بنجاح
-- للخطوة التالية: استيراد البيانات من ملف data export
