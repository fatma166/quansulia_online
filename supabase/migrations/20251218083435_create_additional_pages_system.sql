/*
  # Create Additional Pages System (About Consulate, Services Guide, Important Links)

  1. New Tables
    - `about_consulate_sections`
      - Stores different sections (Consul's word, About Consulate)
      - Supports Arabic/English content with images
      - Has ordering and active status
    
    - `ambassadors`
      - Stores information about past and current ambassadors
      - Includes photo, biography, and term dates
      - Ordered chronologically
    
    - `services_guide_sections`
      - Stores services guide content in sections
      - Step-by-step guide for applying to services
      - Supports rich text content and images
    
    - `important_links`
      - Stores links to important official websites
      - Categories for organization
      - Ordered display
  
  2. Storage Buckets
    - Create storage for consul/ambassador photos
    - Create storage for services guide images
  
  3. Security
    - Enable RLS on all tables
    - Public read access for authenticated users
    - Admin-only write access
*/

-- About Consulate Sections Table
CREATE TABLE IF NOT EXISTS about_consulate_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL CHECK (section_type IN ('consul_word', 'about_consulate')),
  title_ar text NOT NULL,
  title_en text,
  content_ar text NOT NULL,
  content_en text,
  image_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Ambassadors Table
CREATE TABLE IF NOT EXISTS ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  photo_url text,
  biography_ar text NOT NULL,
  biography_en text,
  term_start_date date,
  term_end_date date,
  is_current boolean DEFAULT false,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Services Guide Sections Table
CREATE TABLE IF NOT EXISTS services_guide_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text,
  content_ar text NOT NULL,
  content_en text,
  step_number integer,
  image_url text,
  video_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Important Links Table
CREATE TABLE IF NOT EXISTS important_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text,
  description_ar text,
  description_en text,
  url text NOT NULL,
  category text DEFAULT 'general',
  icon text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  opens_new_tab boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_about_consulate_sections_active ON about_consulate_sections(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_about_consulate_sections_type ON about_consulate_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_ambassadors_active ON ambassadors(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_ambassadors_current ON ambassadors(is_current);
CREATE INDEX IF NOT EXISTS idx_services_guide_sections_active ON services_guide_sections(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_important_links_active ON important_links(is_active, category, order_index);

-- Enable RLS
ALTER TABLE about_consulate_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for about_consulate_sections
CREATE POLICY "Anyone can view active about consulate sections"
  ON about_consulate_sections FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all about consulate sections"
  ON about_consulate_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can insert about consulate sections"
  ON about_consulate_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can update about consulate sections"
  ON about_consulate_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can delete about consulate sections"
  ON about_consulate_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- RLS Policies for ambassadors
CREATE POLICY "Anyone can view active ambassadors"
  ON ambassadors FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all ambassadors"
  ON ambassadors FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can insert ambassadors"
  ON ambassadors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can update ambassadors"
  ON ambassadors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can delete ambassadors"
  ON ambassadors FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- RLS Policies for services_guide_sections
CREATE POLICY "Anyone can view active services guide sections"
  ON services_guide_sections FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all services guide sections"
  ON services_guide_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can insert services guide sections"
  ON services_guide_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can update services guide sections"
  ON services_guide_sections FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can delete services guide sections"
  ON services_guide_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- RLS Policies for important_links
CREATE POLICY "Anyone can view active important links"
  ON important_links FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can view all important links"
  ON important_links FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can insert important links"
  ON important_links FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can update important links"
  ON important_links FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can delete important links"
  ON important_links FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('consulate-images', 'consulate-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('services-guide', 'services-guide', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for consulate-images
CREATE POLICY "Anyone can view consulate images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'consulate-images');

CREATE POLICY "Admins can upload consulate images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'consulate-images' AND
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can update consulate images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'consulate-images' AND
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can delete consulate images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'consulate-images' AND
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- Storage policies for services-guide
CREATE POLICY "Anyone can view services guide images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'services-guide');

CREATE POLICY "Admins can upload services guide images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'services-guide' AND
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can update services guide images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'services-guide' AND
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

CREATE POLICY "Admins can delete services guide images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'services-guide' AND
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- Insert sample data
INSERT INTO about_consulate_sections (section_type, title_ar, title_en, content_ar, content_en, order_index)
VALUES 
  ('consul_word', 'كلمة القنصل', 'Consul''s Word', 'نص كلمة القنصل...', 'Consul''s word text...', 1),
  ('about_consulate', 'نبذة عن القنصلية', 'About the Consulate', 'نص تعريفي عن القنصلية وخدماتها...', 'About the consulate and its services...', 2)
ON CONFLICT DO NOTHING;

-- Insert sample important links
INSERT INTO important_links (title_ar, title_en, description_ar, url, category, order_index)
VALUES 
  ('مجلس الوزراء', 'Council of Ministers', 'الموقع الرسمي لمجلس الوزراء', 'https://www.sudan.gov.sd', 'government', 1),
  ('وزارة الخارجية', 'Ministry of Foreign Affairs', 'الموقع الرسمي لوزارة الخارجية', 'https://www.mofa.gov.sd', 'government', 2)
ON CONFLICT DO NOTHING;