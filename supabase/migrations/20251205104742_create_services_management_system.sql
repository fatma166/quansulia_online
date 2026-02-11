/*
  # نظام إدارة الخدمات القنصلية الشامل
  
  ## الوصف
  هذا النظام يوفر إدارة كاملة للخدمات القنصلية بما في ذلك:
  - الخدمات الأساسية والفرعية
  - إدارة الحقول والنماذج
  - الشروط المنطقية (Conditional Logic)
  - المتطلبات والمستندات
  - تتبع حالة الطلبات

  ## الجداول الجديدة

  ### 1. services
  جدول الخدمات الأساسية (جوازات السفر، التوكيلات، التصديقات، إلخ)
  - `id` - معرف الخدمة
  - `name_ar` - اسم الخدمة بالعربية
  - `name_en` - اسم الخدمة بالإنجليزية
  - `slug` - معرف URL فريد
  - `description_ar` - وصف الخدمة بالعربية
  - `description_en` - وصف الخدمة بالإنجليزية
  - `icon` - أيقونة الخدمة
  - `category` - تصنيف الخدمة
  - `parent_id` - معرف الخدمة الأب (للخدمات الفرعية)
  - `fees` - الرسوم
  - `duration` - مدة المعالجة
  - `is_active` - حالة التفعيل
  - `order_index` - ترتيب العرض
  - `config` - إعدادات إضافية (JSON)

  ### 2. service_types
  أنواع الخدمة الفرعية (مثل: أنواع التوكيلات)
  - `id` - معرف النوع
  - `service_id` - معرف الخدمة الأساسية
  - `name_ar` - اسم النوع بالعربية
  - `name_en` - اسم النوع بالإنجليزية
  - `description_ar` - وصف النوع بالعربية
  - `description_en` - وصف النوع بالإنجليزية
  - `is_active` - حالة التفعيل
  - `config` - إعدادات إضافية

  ### 3. service_fields
  حقول النموذج لكل خدمة
  - `id` - معرف الحقل
  - `service_id` - معرف الخدمة
  - `service_type_id` - معرف نوع الخدمة (اختياري)
  - `step_id` - معرف الخطوة في النموذج
  - `step_title_ar` - عنوان الخطوة بالعربية
  - `step_title_en` - عنوان الخطوة بالإنجليزية
  - `field_name` - اسم الحقل الفني
  - `field_type` - نوع الحقل (text, select, file, etc)
  - `label_ar` - تسمية الحقل بالعربية
  - `label_en` - تسمية الحقل بالإنجليزية
  - `placeholder_ar` - نص تلميحي بالعربية
  - `placeholder_en` - نص تلميحي بالإنجليزية
  - `help_text_ar` - نص مساعدة بالعربية
  - `help_text_en` - نص مساعدة بالإنجليزية
  - `is_required` - هل الحقل إجباري
  - `validation_rules` - قواعد التحقق (JSON)
  - `options` - خيارات الحقل (JSON) للقوائم المنسدلة
  - `default_value` - القيمة الافتراضية
  - `order_index` - ترتيب الحقل
  - `is_active` - حالة التفعيل

  ### 4. service_field_conditions
  الشروط المنطقية لظهور/إخفاء الحقول
  - `id` - معرف الشرط
  - `field_id` - معرف الحقل المستهدف
  - `condition_field_id` - معرف الحقل الذي يعتمد عليه الشرط
  - `condition_operator` - المعامل (equals, not_equals, contains, etc)
  - `condition_value` - القيمة المطلوبة
  - `action` - الإجراء (show, hide, require)

  ### 5. service_requirements
  متطلبات الخدمة
  - `id` - معرف المتطلب
  - `service_id` - معرف الخدمة
  - `service_type_id` - معرف نوع الخدمة (اختياري)
  - `requirement_ar` - المتطلب بالعربية
  - `requirement_en` - المتطلب بالإنجليزية
  - `order_index` - ترتيب العرض
  - `is_active` - حالة التفعيل

  ### 6. service_documents
  المستندات المطلوبة
  - `id` - معرف المستند
  - `service_id` - معرف الخدمة
  - `service_type_id` - معرف نوع الخدمة (اختياري)
  - `document_name_ar` - اسم المستند بالعربية
  - `document_name_en` - اسم المستند بالإنجليزية
  - `description_ar` - وصف المستند بالعربية
  - `description_en` - وصف المستند بالإنجليزية
  - `is_required` - هل المستند إجباري
  - `max_size_mb` - الحجم الأقصى بالميجابايت
  - `accepted_formats` - الصيغ المقبولة (JSON array)
  - `order_index` - ترتيب العرض
  - `is_active` - حالة التفعيل

  ### 7. service_document_conditions
  شروط ظهور المستندات
  - `id` - معرف الشرط
  - `document_id` - معرف المستند
  - `condition_field_id` - معرف الحقل الذي يعتمد عليه الشرط
  - `condition_operator` - المعامل
  - `condition_value` - القيمة المطلوبة
  - `action` - الإجراء (show, hide, require)

  ## الأمان
  - تفعيل RLS على جميع الجداول
  - السماح بالقراءة للمستخدمين المصادق عليهم
  - السماح بالإضافة/التعديل/الحذف للمسؤولين فقط
*/

-- جدول الخدمات الأساسية
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text,
  slug text UNIQUE NOT NULL,
  description_ar text,
  description_en text,
  icon text,
  category text NOT NULL,
  parent_id uuid REFERENCES services(id) ON DELETE CASCADE,
  fees text DEFAULT 'غير محدد',
  duration text DEFAULT 'غير محدد',
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- جدول أنواع الخدمة الفرعية
CREATE TABLE IF NOT EXISTS service_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  name_ar text NOT NULL,
  name_en text,
  description_ar text,
  description_en text,
  is_active boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول حقول النموذج
CREATE TABLE IF NOT EXISTS service_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_type_id uuid REFERENCES service_types(id) ON DELETE CASCADE,
  step_id text NOT NULL,
  step_title_ar text NOT NULL,
  step_title_en text,
  field_name text NOT NULL,
  field_type text NOT NULL,
  label_ar text NOT NULL,
  label_en text,
  placeholder_ar text,
  placeholder_en text,
  help_text_ar text,
  help_text_en text,
  is_required boolean DEFAULT false,
  validation_rules jsonb DEFAULT '{}',
  options jsonb DEFAULT '[]',
  default_value text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول الشروط المنطقية للحقول
CREATE TABLE IF NOT EXISTS service_field_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id uuid NOT NULL REFERENCES service_fields(id) ON DELETE CASCADE,
  condition_field_id uuid NOT NULL REFERENCES service_fields(id) ON DELETE CASCADE,
  condition_operator text NOT NULL,
  condition_value text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- جدول متطلبات الخدمة
CREATE TABLE IF NOT EXISTS service_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_type_id uuid REFERENCES service_types(id) ON DELETE CASCADE,
  requirement_ar text NOT NULL,
  requirement_en text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول المستندات المطلوبة
CREATE TABLE IF NOT EXISTS service_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_type_id uuid REFERENCES service_types(id) ON DELETE CASCADE,
  document_name_ar text NOT NULL,
  document_name_en text,
  description_ar text,
  description_en text,
  is_required boolean DEFAULT true,
  max_size_mb integer DEFAULT 5,
  accepted_formats jsonb DEFAULT '["pdf", "jpg", "jpeg", "png"]',
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- جدول شروط ظهور المستندات
CREATE TABLE IF NOT EXISTS service_document_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES service_documents(id) ON DELETE CASCADE,
  condition_field_id uuid NOT NULL REFERENCES service_fields(id) ON DELETE CASCADE,
  condition_operator text NOT NULL,
  condition_value text NOT NULL,
  action text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_parent_id ON services(parent_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_service_types_service_id ON service_types(service_id);
CREATE INDEX IF NOT EXISTS idx_service_fields_service_id ON service_fields(service_id);
CREATE INDEX IF NOT EXISTS idx_service_fields_service_type_id ON service_fields(service_type_id);
CREATE INDEX IF NOT EXISTS idx_service_field_conditions_field_id ON service_field_conditions(field_id);
CREATE INDEX IF NOT EXISTS idx_service_requirements_service_id ON service_requirements(service_id);
CREATE INDEX IF NOT EXISTS idx_service_documents_service_id ON service_documents(service_id);
CREATE INDEX IF NOT EXISTS idx_service_document_conditions_document_id ON service_document_conditions(document_id);

-- تفعيل RLS على جميع الجداول
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_field_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_document_conditions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان: القراءة للجميع
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can view active service types"
  ON service_types FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can view active service fields"
  ON service_fields FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can view field conditions"
  ON service_field_conditions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can view active service requirements"
  ON service_requirements FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can view active service documents"
  ON service_documents FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Anyone can view document conditions"
  ON service_document_conditions FOR SELECT
  TO public
  USING (true);

-- سياسات الأمان: الكتابة للمسؤولين فقط
CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- نسخ نفس السياسات للجداول الأخرى
CREATE POLICY "Admins can manage service types"
  ON service_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage service fields"
  ON service_fields FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage field conditions"
  ON service_field_conditions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage service requirements"
  ON service_requirements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage service documents"
  ON service_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage document conditions"
  ON service_document_conditions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- إضافة Triggers لتحديث updated_at
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_types_updated_at
  BEFORE UPDATE ON service_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_fields_updated_at
  BEFORE UPDATE ON service_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_requirements_updated_at
  BEFORE UPDATE ON service_requirements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_documents_updated_at
  BEFORE UPDATE ON service_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();