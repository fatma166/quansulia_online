/*
  # Create Comprehensive CMS Content Management System

  1. New Tables
    - `site_settings`
      - Global site settings (site name, logo, primary color, etc.)
    - `contact_info`
      - Contact details (phones, emails, addresses, working hours)
    - `social_links`
      - Social media links with order and visibility
    - `slider_items`
      - Hero slider content (images, titles, descriptions, CTAs)
    - `page_sections`
      - Dynamic page sections content
    - `footer_content`
      - Footer specific content
    
  2. Security
    - Enable RLS on all tables
    - Public read access for all content tables
    - Admin/Staff write access for content management
*/

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  value_ar text,
  value_en text,
  type text DEFAULT 'text',
  category text DEFAULT 'general',
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Contact Information Table
CREATE TABLE IF NOT EXISTS contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  label text NOT NULL,
  label_ar text,
  label_en text,
  value text NOT NULL,
  icon text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Social Media Links Table
CREATE TABLE IF NOT EXISTS social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  label text NOT NULL,
  label_ar text,
  label_en text,
  url text NOT NULL,
  icon text,
  color text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Slider Items Table
CREATE TABLE IF NOT EXISTS slider_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  description_ar text,
  description_en text,
  image_url text,
  button_text_ar text,
  button_text_en text,
  button_link text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Page Sections Table (for dynamic content sections)
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_name text NOT NULL,
  section_key text NOT NULL,
  title_ar text,
  title_en text,
  content_ar text,
  content_en text,
  image_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id),
  UNIQUE(page_name, section_key)
);

-- Footer Content Table
CREATE TABLE IF NOT EXISTS footer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title_ar text,
  title_en text,
  content_ar text,
  content_en text,
  link_text_ar text,
  link_text_en text,
  link_url text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_contact_info_type ON contact_info(type);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links(platform);
CREATE INDEX IF NOT EXISTS idx_slider_items_order ON slider_items(display_order);
CREATE INDEX IF NOT EXISTS idx_page_sections_page ON page_sections(page_name);
CREATE INDEX IF NOT EXISTS idx_footer_content_key ON footer_content(section_key);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read site settings"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can read active contact info"
  ON contact_info FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can read active social links"
  ON social_links FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can read active slider items"
  ON slider_items FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can read active page sections"
  ON page_sections FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can read active footer content"
  ON footer_content FOR SELECT
  TO public
  USING (is_active = true);

-- Admin/Staff write policies
CREATE POLICY "Authenticated staff can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can insert contact info"
  ON contact_info FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update contact info"
  ON contact_info FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete contact info"
  ON contact_info FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can insert social links"
  ON social_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update social links"
  ON social_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete social links"
  ON social_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can insert slider items"
  ON slider_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update slider items"
  ON slider_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete slider items"
  ON slider_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can insert page sections"
  ON page_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update page sections"
  ON page_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete page sections"
  ON page_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can insert footer content"
  ON footer_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update footer content"
  ON footer_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can delete footer content"
  ON footer_content FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Insert default site settings
INSERT INTO site_settings (key, value, value_ar, value_en, category, description) VALUES
  ('site_name_ar', 'القنصلية السودانية - جدة', 'القنصلية السودانية - جدة', 'Sudanese Consulate - Jeddah', 'general', 'Site name in Arabic'),
  ('site_name_en', 'Sudanese Consulate - Jeddah', 'القنصلية السودانية - جدة', 'Sudanese Consulate - Jeddah', 'general', 'Site name in English'),
  ('site_logo_text', 'SD', 'SD', 'SD', 'general', 'Logo text abbreviation'),
  ('primary_color', '#276073', '#276073', '#276073', 'design', 'Primary brand color'),
  ('secondary_color', '#87ceeb', '#87ceeb', '#87ceeb', 'design', 'Secondary brand color')
ON CONFLICT (key) DO NOTHING;

-- Insert default contact information
INSERT INTO contact_info (type, label, label_ar, label_en, value, icon, display_order, is_active) VALUES
  ('address', 'العنوان', 'العنوان', 'Address', 'شارع الأمير سلطان، حي الروضة، جدة 21442، المملكة العربية السعودية', 'MapPin', 1, true),
  ('phone', 'الهاتف', 'الهاتف', 'Phone', '+966 12 123 4567', 'Phone', 2, true),
  ('email', 'البريد الإلكتروني', 'البريد الإلكتروني', 'Email', 'info@sudanconsulate-jeddah.gov.sd', 'Mail', 3, true),
  ('working_hours', 'ساعات العمل', 'ساعات العمل', 'Working Hours', 'الأحد - الخميس: 8:00 ص - 2:00 م', 'Clock', 4, true)
ON CONFLICT DO NOTHING;

-- Insert default social media links
INSERT INTO social_links (platform, label, label_ar, label_en, url, icon, color, display_order, is_active) VALUES
  ('facebook', 'Facebook', 'فيسبوك', 'Facebook', 'https://www.facebook.com/share/16WJFoATDt/', 'Facebook', '#1877F2', 1, true),
  ('twitter', 'Twitter', 'تويتر', 'Twitter', 'https://twitter.com/sudanconsjed', 'Twitter', '#1DA1F2', 2, true),
  ('instagram', 'Instagram', 'إنستغرام', 'Instagram', 'https://www.instagram.com/sudanconsjed', 'Instagram', '#E4405F', 3, true),
  ('telegram', 'Telegram', 'تيليجرام', 'Telegram', 'https://t.me/ConsSudanJeddah', 'MessageCircle', '#0088cc', 4, true),
  ('whatsapp', 'WhatsApp', 'واتساب', 'WhatsApp', 'https://whatsapp.com/channel/0029VbACJWJFi8xWz0XuzJ1v', 'MessageCircle', '#25D366', 5, true)
ON CONFLICT DO NOTHING;

-- Insert default slider items (you can customize these later through the admin panel)
INSERT INTO slider_items (title_ar, title_en, subtitle_ar, subtitle_en, description_ar, description_en, button_text_ar, button_text_en, button_link, display_order, is_active) VALUES
  (
    'القنصلية السودانية العامة بجدة',
    'Sudanese Consulate General in Jeddah',
    'خدمات قنصلية متميزة',
    'Distinguished Consular Services',
    'نسعد بخدمة الجالية السودانية في المملكة العربية السعودية',
    'We are pleased to serve the Sudanese community in Saudi Arabia',
    'استعرض الخدمات',
    'Browse Services',
    '/services',
    1,
    true
  ),
  (
    'خدمات إلكترونية متطورة',
    'Advanced Electronic Services',
    'سهولة وسرعة في الإنجاز',
    'Easy and Fast Completion',
    'احصل على خدماتك القنصلية بسهولة من خلال منصتنا الإلكترونية',
    'Get your consular services easily through our electronic platform',
    'ابدأ الآن',
    'Start Now',
    '/services',
    2,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert default footer content
INSERT INTO footer_content (section_key, title_ar, title_en, content_ar, content_en, display_order, is_active) VALUES
  (
    'about_consulate',
    'عن القنصلية',
    'About the Consulate',
    'نسعد بخدمة الجالية السودانية وتقديم كافة الخدمات القنصلية والاستثمارية والتعليمية بأعلى معايير الجودة والكفاءة.',
    'We are pleased to serve the Sudanese community and provide all consular, investment, and educational services with the highest standards of quality and efficiency.',
    1,
    true
  )
ON CONFLICT (section_key) DO NOTHING;
