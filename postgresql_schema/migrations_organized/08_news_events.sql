-- =====================================================
-- News & Events - الأخبار والفعاليات
-- =====================================================

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

CREATE TABLE IF NOT EXISTS breaking_news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text_ar TEXT NOT NULL,
    text_en TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
