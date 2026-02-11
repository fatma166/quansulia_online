/*
  # نظام رسائل التواصل (Contact Messages System)

  ## الجداول الجديدة
  
  ### `contact_messages`
  جدول لحفظ رسائل الزوار من صفحة "تواصل معنا"
  
  الحقول:
  - `id` - معرف فريد للرسالة
  - `name` - اسم المرسل
  - `email` - البريد الإلكتروني للمرسل
  - `phone` - رقم هاتف المرسل
  - `subject` - موضوع الرسالة
  - `message` - محتوى الرسالة
  - `service_type` - نوع الخدمة المطلوبة (passport, visa, attestation, etc.)
  - `urgency` - مستوى الأولوية (low, normal, high)
  - `status` - حالة الرسالة (new, in_progress, resolved, closed)
  - `assigned_to` - موظف مسؤول عن الرد (UUID reference to staff)
  - `admin_notes` - ملاحظات داخلية للإدارة
  - `responded_at` - تاريخ الرد على الرسالة
  - `created_at` - تاريخ استلام الرسالة
  
  ## الأمان (RLS)
  - سماح للجميع بإضافة رسالة جديدة
  - الموظفين والإدارة فقط يمكنهم قراءة وتحديث الرسائل
*/

-- إنشاء جدول رسائل التواصل
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  service_type text NOT NULL CHECK (service_type IN ('passport', 'visa', 'attestation', 'civil', 'legal', 'investment', 'tourism', 'other')),
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')),
  assigned_to uuid REFERENCES staff(id) ON DELETE SET NULL,
  admin_notes text,
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_urgency ON contact_messages(urgency);
CREATE INDEX IF NOT EXISTS idx_contact_messages_service_type ON contact_messages(service_type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_assigned_to ON contact_messages(assigned_to);

-- تفعيل RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- سياسة: السماح لأي شخص بإضافة رسالة جديدة (للزوار)
CREATE POLICY "Anyone can create contact message"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- سياسة: الموظفين والإدارة يمكنهم قراءة جميع الرسائل
CREATE POLICY "Staff and admin can view all messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- سياسة: الموظفين والإدارة يمكنهم تحديث الرسائل
CREATE POLICY "Staff and admin can update messages"
  ON contact_messages
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

-- سياسة: الموظفين يمكنهم حذف الرسائل
CREATE POLICY "Staff can delete messages"
  ON contact_messages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- إضافة تعليقات توضيحية
COMMENT ON TABLE contact_messages IS 'جدول رسائل التواصل من الزوار';
COMMENT ON COLUMN contact_messages.status IS 'حالة الرسالة: new (جديدة), in_progress (قيد المعالجة), resolved (تم الحل), closed (مغلقة)';
COMMENT ON COLUMN contact_messages.urgency IS 'مستوى الأولوية: low (عادي), normal (متوسط), high (عاجل)';
COMMENT ON COLUMN contact_messages.service_type IS 'نوع الخدمة المطلوبة';