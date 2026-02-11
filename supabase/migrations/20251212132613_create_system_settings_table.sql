/*
  # إنشاء جدول إعدادات النظام

  1. الجداول الجديدة
    - `system_settings`
      - `id` (integer) - المفتاح الأساسي (دائماً 1)
      - `settings` (jsonb) - كل الإعدادات بصيغة JSON
      - `updated_by` (uuid) - معرف الموظف الذي قام بآخر تحديث
      - `updated_at` (timestamptz) - تاريخ آخر تحديث

  2. الأمان
    - تفعيل RLS
    - السماح للموظفين والإداريين بالقراءة
    - السماح للإداريين فقط بالتحديث
*/

-- إنشاء جدول system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  settings jsonb NOT NULL DEFAULT '{
    "siteName": "القنصلية السودانية",
    "siteNameEn": "Sudanese Consulate",
    "siteEmail": "info@sudanconsulate.sa",
    "sitePhone": "+966 XX XXX XXXX",
    "timezone": "Asia/Riyadh",
    "language": "ar",
    "maxAppointmentsPerDay": 50,
    "appointmentDuration": 30,
    "notificationsEnabled": true,
    "emailNotifications": true,
    "smsNotifications": false,
    "autoBackup": true,
    "backupFrequency": "daily",
    "maintenanceMode": false,
    "maintenanceMessage": "الموقع قيد الصيانة حالياً"
  }'::jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة: جميع المصادق عليهم
CREATE POLICY "Authenticated users can read system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسة للتحديث: الإداريين فقط
CREATE POLICY "Only admins can update system settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- سياسة للإدراج: الإداريين فقط
CREATE POLICY "Only admins can insert system settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- إدراج السجل الافتراضي
INSERT INTO system_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
