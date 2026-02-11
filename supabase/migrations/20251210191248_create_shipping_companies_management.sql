/*
  # Create Shipping Companies Management System

  1. New Tables
    - `shipping_companies`
      - `id` (uuid, primary key)
      - `name` (text) - اسم الشركة بالعربية
      - `name_en` (text) - اسم الشركة بالإنجليزية
      - `website` (text) - الموقع الإلكتروني
      - `tracking_url` (text) - رابط التتبع (مع متغير {tracking_number})
      - `contact_person_name` (text) - اسم المسؤول
      - `contact_person_phone` (text) - هاتف المسؤول
      - `contact_person_email` (text) - بريد المسؤول
      - `contact_person_position` (text) - منصب المسؤول
      - `address` (text) - عنوان الشركة
      - `city` (text) - المدينة
      - `country` (text) - الدولة
      - `logo_url` (text) - رابط شعار الشركة
      - `is_active` (boolean) - نشطة أم لا
      - `notes` (text) - ملاحظات
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `shipping_companies` table
    - Add policy for public to read active companies
    - Add policy for authenticated staff to manage companies
*/

-- Create shipping_companies table
CREATE TABLE IF NOT EXISTS shipping_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  website text,
  tracking_url text,
  contact_person_name text,
  contact_person_phone text,
  contact_person_email text,
  contact_person_position text,
  address text,
  city text DEFAULT 'الرياض',
  country text DEFAULT 'المملكة العربية السعودية',
  logo_url text,
  is_active boolean DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_shipping_companies_active ON shipping_companies(is_active);
CREATE INDEX IF NOT EXISTS idx_shipping_companies_name ON shipping_companies(name);

-- Enable RLS
ALTER TABLE shipping_companies ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active shipping companies
CREATE POLICY "Anyone can read active shipping companies"
  ON shipping_companies
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policy: Authenticated staff can read all shipping companies
CREATE POLICY "Staff can read all shipping companies"
  ON shipping_companies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy: Authenticated staff can insert shipping companies
CREATE POLICY "Staff can insert shipping companies"
  ON shipping_companies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy: Authenticated staff can update shipping companies
CREATE POLICY "Staff can update shipping companies"
  ON shipping_companies
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Policy: Authenticated staff can delete shipping companies
CREATE POLICY "Staff can delete shipping companies"
  ON shipping_companies
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shipping_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_shipping_companies_updated_at_trigger ON shipping_companies;
CREATE TRIGGER update_shipping_companies_updated_at_trigger
  BEFORE UPDATE ON shipping_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_companies_updated_at();

-- Insert some sample shipping companies
INSERT INTO shipping_companies (name, name_en, website, contact_person_name, contact_person_phone, city, is_active)
VALUES 
  ('شركة سمسا للشحن', 'SMSA Express', 'https://www.smsaexpress.com', 'أحمد محمد', '+966501234567', 'الرياض', true),
  ('شركة أرامكس', 'Aramex', 'https://www.aramex.com', 'خالد عبدالله', '+966502345678', 'جدة', true),
  ('شركة DHL', 'DHL Express', 'https://www.dhl.com.sa', 'محمد سعيد', '+966503456789', 'الرياض', true)
ON CONFLICT DO NOTHING;
