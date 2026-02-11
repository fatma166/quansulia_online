-- =====================================================
-- Services Management - إدارة الخدمات
-- =====================================================

-- Services Table
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

-- Service Fields
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

-- Service Requirements
CREATE TABLE IF NOT EXISTS service_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    text_ar TEXT NOT NULL,
    text_en TEXT NOT NULL,
    conditional_logic JSONB,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Documents
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

-- Conditional Pricing Rules
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
