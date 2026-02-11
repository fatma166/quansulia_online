-- =====================================================
-- Appointments & Shipping - المواعيد والشحن
-- =====================================================

CREATE TABLE IF NOT EXISTS appointment_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID UNIQUE REFERENCES services(id) ON DELETE CASCADE,
    slots_per_day INTEGER DEFAULT 10,
    duration_minutes INTEGER DEFAULT 30,
    advance_booking_days INTEGER DEFAULT 30,
    working_hours JSONB DEFAULT '{"start": "09:00", "end": "17:00"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS closed_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    reason_ar TEXT,
    reason_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS tracking_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    location TEXT,
    description_ar TEXT,
    description_en TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
