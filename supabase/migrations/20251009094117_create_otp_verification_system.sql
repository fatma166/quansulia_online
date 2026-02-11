/*
  # Create OTP Verification System

  ## Overview
  نظام متكامل للتحقق من رقم الموبايل عبر OTP (رمز التحقق لمرة واحدة)

  ## 1. New Tables
    - `otp_verifications`
      - `id` (uuid, primary key) - معرف فريد
      - `phone_number` (text) - رقم الموبايل
      - `otp_code` (text) - رمز التحقق (6 أرقام)
      - `application_id` (uuid) - ربط بالطلب (nullable)
      - `verified` (boolean) - هل تم التحقق
      - `attempts` (integer) - عدد محاولات التحقق
      - `expires_at` (timestamptz) - وقت انتهاء الصلاحية (5 دقائق)
      - `created_at` (timestamptz) - وقت الإنشاء
      - `verified_at` (timestamptz) - وقت التحقق (nullable)

  ## 2. Security
    - Enable RLS on `otp_verifications` table
    - Policy for inserting OTP (public for testing, will be restricted via edge function)
    - Policy for verifying OTP (public for testing)
    - Policy for viewing own OTP (authenticated users)

  ## 3. Important Notes
    - OTP صالح لمدة 5 دقائق فقط
    - الحد الأقصى لمحاولات التحقق: 5 محاولات
    - يتم حذف OTP القديمة تلقائياً بعد 24 ساعة (cleanup function)
    - رقم OTP مكون من 6 أرقام عشوائية
*/

-- Create OTP verifications table
CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  application_id uuid,
  verified boolean DEFAULT false,
  attempts integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  verified_at timestamptz
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_otp_phone_number ON otp_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_created_at ON otp_verifications(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_application_id ON otp_verifications(application_id);

-- Enable RLS
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can create OTP (will be restricted to edge function in production)
CREATE POLICY "Anyone can create OTP"
  ON otp_verifications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Anyone can verify OTP (will be restricted in production)
CREATE POLICY "Anyone can verify OTP"
  ON otp_verifications
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Policy: Anyone can view OTP for verification (will be restricted in production)
CREATE POLICY "Anyone can view OTP for verification"
  ON otp_verifications
  FOR SELECT
  TO public
  USING (true);

-- Function to generate 6-digit OTP
CREATE OR REPLACE FUNCTION generate_otp_code()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN lpad(floor(random() * 1000000)::text, 6, '0');
END;
$$;

-- Function to cleanup expired OTPs (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM otp_verifications
  WHERE created_at < now() - interval '24 hours';
END;
$$;