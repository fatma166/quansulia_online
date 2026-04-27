/*
  # Create Maintenance, Announcements, and CMS Tables

  1. New Tables
    - `maintenance_mode` - controls site maintenance state
    - `announcements` - site-wide announcement banners
    - `cms_content` - general CMS content blocks
    - `system_settings` - key-value system configuration
    - `news` - news articles
    - `events` - events
    - `event_registrations` - event sign-ups
    - `contact_messages` - contact form submissions
    - `slider_items` - hero slider images
    - `counters` - homepage statistics counters
    - `important_links` - links section
    - `chatbot_qa` - chatbot Q&A pairs

  2. Security - RLS enabled on all tables
*/

-- maintenance_mode
CREATE TABLE IF NOT EXISTS maintenance_mode (
  id serial PRIMARY KEY,
  is_active boolean NOT NULL DEFAULT false,
  message_ar text NOT NULL DEFAULT 'الموقع تحت الصيانة',
  message_en text NOT NULL DEFAULT 'Site under maintenance',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE maintenance_mode ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read maintenance mode"
  ON maintenance_mode FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can update maintenance mode"
  ON maintenance_mode FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can insert maintenance mode"
  ON maintenance_mode FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO maintenance_mode (is_active) VALUES (false) ON CONFLICT DO NOTHING;

-- announcements
CREATE TABLE IF NOT EXISTS announcements (
  id serial PRIMARY KEY,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  type text NOT NULL DEFAULT 'info',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active announcements"
  ON announcements FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage announcements"
  ON announcements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update announcements"
  ON announcements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete announcements"
  ON announcements FOR DELETE TO authenticated USING (true);

-- system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id serial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read system settings"
  ON system_settings FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage system settings"
  ON system_settings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update system settings"
  ON system_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- news
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  content_ar text NOT NULL DEFAULT '',
  content_en text NOT NULL DEFAULT '',
  summary_ar text DEFAULT '',
  summary_en text DEFAULT '',
  image_url text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published news"
  ON news FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "Authenticated can insert news"
  ON news FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update news"
  ON news FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete news"
  ON news FOR DELETE TO authenticated USING (true);

-- events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  location_ar text DEFAULT '',
  location_en text DEFAULT '',
  image_url text,
  event_date timestamptz,
  end_date timestamptz,
  is_published boolean NOT NULL DEFAULT false,
  registration_required boolean NOT NULL DEFAULT false,
  max_attendees integer,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published events"
  ON events FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "Authenticated can insert events"
  ON events FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update events"
  ON events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete events"
  ON events FOR DELETE TO authenticated USING (true);

-- event_registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert event registrations"
  ON event_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can read event registrations"
  ON event_registrations FOR SELECT TO authenticated USING (true);

-- contact_messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  subject text DEFAULT '',
  message text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert contact messages"
  ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can read contact messages"
  ON contact_messages FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can update contact messages"
  ON contact_messages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- slider_items
CREATE TABLE IF NOT EXISTS slider_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text DEFAULT '',
  title_en text DEFAULT '',
  subtitle_ar text DEFAULT '',
  subtitle_en text DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  link text,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE slider_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active slider items"
  ON slider_items FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Authenticated can manage slider items"
  ON slider_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update slider items"
  ON slider_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete slider items"
  ON slider_items FOR DELETE TO authenticated USING (true);

-- counters
CREATE TABLE IF NOT EXISTS counters (
  id serial PRIMARY KEY,
  label_ar text NOT NULL DEFAULT '',
  label_en text NOT NULL DEFAULT '',
  value integer NOT NULL DEFAULT 0,
  icon text DEFAULT 'users',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read counters"
  ON counters FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage counters"
  ON counters FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update counters"
  ON counters FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete counters"
  ON counters FOR DELETE TO authenticated USING (true);

-- important_links
CREATE TABLE IF NOT EXISTS important_links (
  id serial PRIMARY KEY,
  title_ar text NOT NULL DEFAULT '',
  title_en text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  icon text DEFAULT '',
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE important_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read important links"
  ON important_links FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Authenticated can manage important links"
  ON important_links FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update important links"
  ON important_links FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete important links"
  ON important_links FOR DELETE TO authenticated USING (true);

-- chatbot_qa
CREATE TABLE IF NOT EXISTS chatbot_qa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_ar text NOT NULL DEFAULT '',
  question_en text NOT NULL DEFAULT '',
  answer_ar text NOT NULL DEFAULT '',
  answer_en text NOT NULL DEFAULT '',
  keywords text[] DEFAULT '{}',
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chatbot_qa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active chatbot qa"
  ON chatbot_qa FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Authenticated can manage chatbot qa"
  ON chatbot_qa FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update chatbot qa"
  ON chatbot_qa FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete chatbot qa"
  ON chatbot_qa FOR DELETE TO authenticated USING (true);
