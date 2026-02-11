/*
  # إنشاء نظام التسعير المشروط

  ## الوصف
  هذا النظام يسمح بتحديد أسعار مختلفة للخدمات بناءً على شروط معينة
  مثل نوع الطلب، الفئة العمرية، أو أي حقل آخر في النموذج.

  ## الجداول الجديدة
  
  ### `service_pricing_rules`
  جدول لتخزين قواعد التسعير المشروط:
  - `id` - معرف فريد
  - `service_id` - معرف الخدمة (مرتبط بجدول services)
  - `service_type_id` - معرف نوع الخدمة (اختياري)
  - `rule_name` - اسم القاعدة
  - `conditions` - شروط تطبيق القاعدة (JSONB)
  - `price` - السعر عند تحقق الشروط
  - `price_under_18` - السعر للأطفال (اختياري)
  - `price_18_and_above` - السعر للبالغين (اختياري)
  - `priority` - أولوية القاعدة (رقم أعلى = أولوية أعلى)
  - `is_active` - حالة القاعدة
  - `created_at` - وقت الإنشاء
  - `updated_at` - وقت آخر تحديث

  ## الأمان
  - تفعيل RLS على الجدول
  - سياسات للقراءة والكتابة للموظفين المصرحين
*/

-- إنشاء جدول قواعد التسعير المشروط
CREATE TABLE IF NOT EXISTS service_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  service_type_id UUID REFERENCES service_types(id) ON DELETE CASCADE,
  rule_name TEXT NOT NULL,
  rule_name_en TEXT,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  price NUMERIC(10, 2),
  price_under_18 NUMERIC(10, 2),
  price_18_and_above NUMERIC(10, 2),
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_pricing_rules_service_id ON service_pricing_rules(service_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_service_type_id ON service_pricing_rules(service_type_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_priority ON service_pricing_rules(priority DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON service_pricing_rules(is_active) WHERE is_active = true;

-- تفعيل RLS
ALTER TABLE service_pricing_rules ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الجميع يمكنهم قراءة القواعد النشطة
CREATE POLICY "Anyone can read active pricing rules"
  ON service_pricing_rules
  FOR SELECT
  USING (is_active = true);

-- سياسة الإدراج: الموظفون المصرحون فقط
CREATE POLICY "Authenticated staff can insert pricing rules"
  ON service_pricing_rules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- سياسة التحديث: الموظفون المصرحون فقط
CREATE POLICY "Authenticated staff can update pricing rules"
  ON service_pricing_rules
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

-- سياسة الحذف: الموظفون المصرحون فقط
CREATE POLICY "Authenticated staff can delete pricing rules"
  ON service_pricing_rules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.user_id = auth.uid()
      AND staff.is_active = true
    )
  );

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_pricing_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- مشغل لتحديث updated_at
DROP TRIGGER IF EXISTS trigger_update_pricing_rules_updated_at ON service_pricing_rules;
CREATE TRIGGER trigger_update_pricing_rules_updated_at
  BEFORE UPDATE ON service_pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_pricing_rules_updated_at();

-- إضافة تعليقات توضيحية
COMMENT ON TABLE service_pricing_rules IS 'جدول لتخزين قواعد التسعير المشروط للخدمات';
COMMENT ON COLUMN service_pricing_rules.conditions IS 'شروط تطبيق القاعدة بصيغة JSONB - مثل نظام الشروط الموجود للحقول';
COMMENT ON COLUMN service_pricing_rules.priority IS 'أولوية القاعدة - القواعد ذات الأولوية الأعلى تطبق أولاً';
COMMENT ON COLUMN service_pricing_rules.price IS 'السعر الموحد إذا لم يكن هناك تسعير حسب العمر';
COMMENT ON COLUMN service_pricing_rules.price_under_18 IS 'السعر للأطفال أقل من 18 سنة';
COMMENT ON COLUMN service_pricing_rules.price_18_and_above IS 'السعر للبالغين 18 سنة فأكثر';
