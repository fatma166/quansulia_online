/*
  # Create Breaking News Ticker Management System

  1. New Tables
    - `breaking_news_ticker`
      - `id` (uuid, primary key)
      - `title_ar` (text) - عنوان الخبر بالعربية
      - `title_en` (text) - عنوان الخبر بالإنجليزية
      - `link` (text, optional) - رابط الخبر (اختياري)
      - `is_active` (boolean) - حالة التفعيل
      - `priority` (integer) - ترتيب الأولوية (الأعلى يظهر أولاً)
      - `start_date` (timestamptz, optional) - تاريخ بدء العرض
      - `end_date` (timestamptz, optional) - تاريخ انتهاء العرض
      - `created_by` (uuid) - معرف الموظف الذي أضاف الخبر
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `breaking_news_ticker` table
    - Add policies for:
      - Public users: read only active news within date range
      - Authenticated staff: full CRUD operations
      - Super admin: full access to all operations
*/

-- Create breaking_news_ticker table
CREATE TABLE IF NOT EXISTS breaking_news_ticker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL,
  title_en text NOT NULL,
  link text,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_breaking_news_active ON breaking_news_ticker(is_active, priority DESC);
CREATE INDEX IF NOT EXISTS idx_breaking_news_dates ON breaking_news_ticker(start_date, end_date);

-- Enable RLS
ALTER TABLE breaking_news_ticker ENABLE ROW LEVEL SECURITY;

-- Public users can view only active news within date range
CREATE POLICY "Public can view active breaking news"
  ON breaking_news_ticker
  FOR SELECT
  TO public
  USING (
    is_active = true
    AND (start_date IS NULL OR start_date <= now())
    AND (end_date IS NULL OR end_date >= now())
  );

-- Authenticated users (staff) can view all breaking news
CREATE POLICY "Staff can view all breaking news"
  ON breaking_news_ticker
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (staff) can insert breaking news
CREATE POLICY "Staff can insert breaking news"
  ON breaking_news_ticker
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- Authenticated users (staff) can update breaking news
CREATE POLICY "Staff can update breaking news"
  ON breaking_news_ticker
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users (staff) can delete breaking news
CREATE POLICY "Staff can delete breaking news"
  ON breaking_news_ticker
  FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_breaking_news_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_breaking_news_updated_at ON breaking_news_ticker;
CREATE TRIGGER trigger_update_breaking_news_updated_at
  BEFORE UPDATE ON breaking_news_ticker
  FOR EACH ROW
  EXECUTE FUNCTION update_breaking_news_updated_at();

-- Add some sample data
INSERT INTO breaking_news_ticker (title_ar, title_en, is_active, priority) VALUES
  ('مرحباً بكم في موقع القنصلية السودانية في جدة', 'Welcome to the Sudanese Consulate in Jeddah Website', true, 100),
  ('يمكنكم الآن حجز المواعيد إلكترونياً', 'You can now book appointments online', true, 90),
  ('نعتذر عن أي تأخير في معالجة الطلبات', 'We apologize for any delay in processing requests', true, 80);
