/*
  # إنشاء نظام الشات بوت الذكي

  ## الجداول الجديدة
  
  1. **chatbot_categories** - تصنيفات الأسئلة
     - `id` (uuid, primary key)
     - `name_ar` (text) - اسم التصنيف بالعربي
     - `name_en` (text) - اسم التصنيف بالإنجليزي
     - `icon` (text) - أيقونة التصنيف
     - `display_order` (integer) - ترتيب العرض
     - `is_active` (boolean) - حالة التفعيل
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

  2. **chatbot_questions_answers** - الأسئلة والإجابات
     - `id` (uuid, primary key)
     - `category_id` (uuid, foreign key) - التصنيف
     - `question_ar` (text) - السؤال بالعربي
     - `question_en` (text) - السؤال بالإنجليزي
     - `answer_ar` (text) - الإجابة بالعربي
     - `answer_en` (text) - الإجابة بالإنجليزي
     - `keywords` (text[]) - كلمات مفتاحية للبحث
     - `priority` (integer) - أولوية الظهور (1-10)
     - `is_active` (boolean) - حالة التفعيل
     - `usage_count` (integer) - عدد مرات الاستخدام
     - `helpful_count` (integer) - عدد مرات التقييم بمفيد
     - `not_helpful_count` (integer) - عدد مرات التقييم بغير مفيد
     - `created_by` (uuid) - من أضاف السؤال
     - `created_at` (timestamp)
     - `updated_at` (timestamp)

  3. **chatbot_conversations** - سجل المحادثات للتحليل
     - `id` (uuid, primary key)
     - `session_id` (text) - معرف الجلسة
     - `user_message` (text) - رسالة المستخدم
     - `bot_response` (text) - رد البوت
     - `matched_qa_id` (uuid) - السؤال المطابق
     - `was_helpful` (boolean) - هل كانت الإجابة مفيدة
     - `user_feedback` (text) - ملاحظات المستخدم
     - `created_at` (timestamp)

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - سياسات للقراءة العامة والكتابة للموظفين فقط
*/

-- إنشاء جدول التصنيفات
CREATE TABLE IF NOT EXISTS chatbot_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  icon text DEFAULT '💬',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الأسئلة والإجابات
CREATE TABLE IF NOT EXISTS chatbot_questions_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES chatbot_categories(id) ON DELETE SET NULL,
  question_ar text NOT NULL,
  question_en text,
  answer_ar text NOT NULL,
  answer_en text,
  keywords text[] DEFAULT '{}',
  priority integer DEFAULT 5,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول سجل المحادثات
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_message text NOT NULL,
  bot_response text NOT NULL,
  matched_qa_id uuid REFERENCES chatbot_questions_answers(id) ON DELETE SET NULL,
  was_helpful boolean,
  user_feedback text,
  created_at timestamptz DEFAULT now()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_chatbot_qa_keywords ON chatbot_questions_answers USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_chatbot_qa_category ON chatbot_questions_answers(category_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_qa_active ON chatbot_questions_answers(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session ON chatbot_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created ON chatbot_conversations(created_at);

-- تفعيل RLS
ALTER TABLE chatbot_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_questions_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_conversations ENABLE ROW LEVEL SECURITY;

-- سياسات القراءة العامة للجميع
CREATE POLICY "Anyone can view active categories"
  ON chatbot_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active QAs"
  ON chatbot_questions_answers FOR SELECT
  USING (is_active = true);

-- سياسات الكتابة للموظفين المصادقين فقط
CREATE POLICY "Authenticated users can insert categories"
  ON chatbot_categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON chatbot_categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON chatbot_categories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage QAs"
  ON chatbot_questions_answers FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- سياسات المحادثات
CREATE POLICY "Anyone can insert conversations"
  ON chatbot_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their feedback"
  ON chatbot_conversations FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all conversations"
  ON chatbot_conversations FOR SELECT
  TO authenticated
  USING (true);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على الجداول
DROP TRIGGER IF EXISTS update_chatbot_categories_updated_at ON chatbot_categories;
CREATE TRIGGER update_chatbot_categories_updated_at
  BEFORE UPDATE ON chatbot_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chatbot_qa_updated_at ON chatbot_questions_answers;
CREATE TRIGGER update_chatbot_qa_updated_at
  BEFORE UPDATE ON chatbot_questions_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- دالة لتحديث usage_count عند استخدام السؤال
CREATE OR REPLACE FUNCTION increment_qa_usage(qa_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE chatbot_questions_answers
  SET usage_count = usage_count + 1
  WHERE id = qa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
