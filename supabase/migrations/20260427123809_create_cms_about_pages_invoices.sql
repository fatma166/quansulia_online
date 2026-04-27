/*
  # Create CMS About Pages, Invoices, and Additional Tables

  1. New Tables
    - `about_consulate_content` - about the consulate page content
    - `about_sudan_content` - about Sudan page content
    - `services_guide_content` - services guide page content
    - `invoices` - application invoices
    - `application_notes` - notes on applications
    - `application_pricing` - pricing for applications
    - `shipments` - shipping tracking
    - `shipping_companies` - shipping company info
    - `educational_cards` - student educational cards
    - `export_report_templates` - export/report templates
    - `additional_pages` - dynamic additional pages
    - `digital_library` - digital library items
    - `chatbot_sessions` - chatbot conversation sessions

  2. Security - RLS enabled on all
*/

-- about_consulate_content
CREATE TABLE IF NOT EXISTS about_consulate_content (
  id serial PRIMARY KEY,
  section_key text UNIQUE NOT NULL,
  title_ar text DEFAULT '',
  title_en text DEFAULT '',
  content_ar text DEFAULT '',
  content_en text DEFAULT '',
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE about_consulate_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read about consulate"
  ON about_consulate_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage about consulate"
  ON about_consulate_content FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update about consulate"
  ON about_consulate_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- about_sudan_content
CREATE TABLE IF NOT EXISTS about_sudan_content (
  id serial PRIMARY KEY,
  section_key text UNIQUE NOT NULL,
  title_ar text DEFAULT '',
  title_en text DEFAULT '',
  content_ar text DEFAULT '',
  content_en text DEFAULT '',
  image_url text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE about_sudan_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read about sudan"
  ON about_sudan_content FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated can manage about sudan"
  ON about_sudan_content FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update about sudan"
  ON about_sudan_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  status text NOT NULL DEFAULT 'pending',
  items jsonb DEFAULT '[]',
  notes text DEFAULT '',
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read invoices"
  ON invoices FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert invoices"
  ON invoices FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update invoices"
  ON invoices FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- application_notes
CREATE TABLE IF NOT EXISTS application_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  note text NOT NULL DEFAULT '',
  is_internal boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read application notes"
  ON application_notes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert application notes"
  ON application_notes FOR INSERT TO authenticated WITH CHECK (true);

-- application_pricing
CREATE TABLE IF NOT EXISTS application_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE CASCADE,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  additional_fees jsonb DEFAULT '[]',
  total_price numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'SAR',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE application_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read application pricing"
  ON application_pricing FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert application pricing"
  ON application_pricing FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update application pricing"
  ON application_pricing FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- shipping_companies
CREATE TABLE IF NOT EXISTS shipping_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL DEFAULT '',
  name_en text NOT NULL DEFAULT '',
  logo_url text,
  website text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active shipping companies"
  ON shipping_companies FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Authenticated can manage shipping companies"
  ON shipping_companies FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update shipping companies"
  ON shipping_companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete shipping companies"
  ON shipping_companies FOR DELETE TO authenticated USING (true);

-- shipments
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  tracking_number text,
  company_id uuid REFERENCES shipping_companies(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  estimated_delivery timestamptz,
  actual_delivery timestamptz,
  notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read shipments"
  ON shipments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert shipments"
  ON shipments FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update shipments"
  ON shipments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- educational_cards
CREATE TABLE IF NOT EXISTS educational_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES applications(id) ON DELETE SET NULL,
  student_name_ar text NOT NULL DEFAULT '',
  student_name_en text DEFAULT '',
  school_name text DEFAULT '',
  grade text DEFAULT '',
  academic_year text DEFAULT '',
  card_number text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  issued_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE educational_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read educational cards"
  ON educational_cards FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert educational cards"
  ON educational_cards FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update educational cards"
  ON educational_cards FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- export_report_templates
CREATE TABLE IF NOT EXISTS export_report_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL DEFAULT '',
  name_en text DEFAULT '',
  fields jsonb DEFAULT '[]',
  column_order jsonb DEFAULT '[]',
  custom_columns jsonb DEFAULT '[]',
  filters jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE export_report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read export templates"
  ON export_report_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated can insert export templates"
  ON export_report_templates FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update export templates"
  ON export_report_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete export templates"
  ON export_report_templates FOR DELETE TO authenticated USING (true);

-- additional_pages
CREATE TABLE IF NOT EXISTS additional_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  title_en text DEFAULT '',
  content_ar text DEFAULT '',
  content_en text DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  show_in_nav boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE additional_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published pages"
  ON additional_pages FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "Authenticated can manage additional pages"
  ON additional_pages FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update additional pages"
  ON additional_pages FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete additional pages"
  ON additional_pages FOR DELETE TO authenticated USING (true);

-- digital_library
CREATE TABLE IF NOT EXISTS digital_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT '',
  title_en text DEFAULT '',
  description_ar text DEFAULT '',
  description_en text DEFAULT '',
  file_url text,
  cover_url text,
  category text DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE digital_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active library items"
  ON digital_library FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Authenticated can manage library"
  ON digital_library FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update library"
  ON digital_library FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete library"
  ON digital_library FOR DELETE TO authenticated USING (true);

-- conditional_pricing (service pricing rules)
CREATE TABLE IF NOT EXISTS conditional_pricing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  conditions jsonb DEFAULT '[]',
  price numeric(10,2) NOT NULL DEFAULT 0,
  label_ar text DEFAULT '',
  label_en text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conditional_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read conditional pricing"
  ON conditional_pricing FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Authenticated can manage conditional pricing"
  ON conditional_pricing FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update conditional pricing"
  ON conditional_pricing FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete conditional pricing"
  ON conditional_pricing FOR DELETE TO authenticated USING (true);
