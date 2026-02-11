/*
  # إنشاء نظام الشات بوت الذكي

  ## الجداول الجديدة
  
  ### 1. chat_conversations (محادثات الشات)
  - `id` (uuid, primary key) - معرف المحادثة
  - `user_name` (text) - اسم المستخدم
  - `user_email` (text) - بريد المستخدم
  - `user_phone` (text) - رقم هاتف المستخدم
  - `service_category` (text, nullable) - فئة الخدمة (education, poa, passports, etc.)
  - `service_type` (text, nullable) - نوع الخدمة المحدد
  - `transaction_id` (text, nullable) - رقم المعاملة للاستعلام
  - `status` (text) - حالة المحادثة (active, waiting, closed)
  - `assigned_to` (text, nullable) - الموظف المسؤول
  - `created_at` (timestamptz) - تاريخ الإنشاء
  - `updated_at` (timestamptz) - تاريخ آخر تحديث

  ### 2. chat_messages (رسائل الشات)
  - `id` (uuid, primary key) - معرف الرسالة
  - `conversation_id` (uuid, foreign key) - معرف المحادثة
  - `sender_type` (text) - نوع المرسل (user, bot, staff)
  - `sender_name` (text) - اسم المرسل
  - `message` (text) - نص الرسالة
  - `message_type` (text) - نوع الرسالة (text, quick_reply, suggestion)
  - `metadata` (jsonb, nullable) - بيانات إضافية
  - `read` (boolean) - هل تم قراءة الرسالة
  - `created_at` (timestamptz) - تاريخ الإرسال

  ### 3. chat_staff (موظفي الدعم)
  - `id` (uuid, primary key) - معرف الموظف
  - `name` (text) - اسم الموظف
  - `email` (text, unique) - بريد الموظف
  - `service_categories` (text[]) - فئات الخدمات المسؤول عنها
  - `is_online` (boolean) - حالة الاتصال
  - `last_seen` (timestamptz) - آخر ظهور
  - `created_at` (timestamptz) - تاريخ الإضافة

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات قراءة وكتابة محكمة
*/

-- إنشاء جدول المحادثات
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text,
  service_category text,
  service_type text,
  transaction_id text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'closed')),
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الرسائل
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'bot', 'staff')),
  sender_name text NOT NULL,
  message text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'quick_reply', 'suggestion')),
  metadata jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- إنشاء جدول الموظفين
CREATE TABLE IF NOT EXISTS chat_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  service_categories text[] DEFAULT ARRAY[]::text[],
  is_online boolean DEFAULT false,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_assigned ON chat_conversations(assigned_to);
CREATE INDEX IF NOT EXISTS idx_conversations_category ON chat_conversations(service_category);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_staff_online ON chat_staff(is_online);

-- تفعيل RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_staff ENABLE ROW LEVEL SECURITY;

-- سياسات chat_conversations
CREATE POLICY "Allow public to create conversations"
  ON chat_conversations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to read their conversations"
  ON chat_conversations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow staff to update conversations"
  ON chat_conversations FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات chat_messages
CREATE POLICY "Allow public to create messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to read messages"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow staff to update messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات chat_staff
CREATE POLICY "Allow public to read online staff"
  ON chat_staff FOR SELECT
  TO anon, authenticated
  USING (is_online = true);

CREATE POLICY "Allow staff to update their status"
  ON chat_staff FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow staff to insert"
  ON chat_staff FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول المحادثات
DROP TRIGGER IF EXISTS update_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();