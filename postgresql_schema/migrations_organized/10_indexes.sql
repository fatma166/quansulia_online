-- =====================================================
-- Indexes - الفهارس
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
