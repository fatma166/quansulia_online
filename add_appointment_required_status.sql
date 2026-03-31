-- إضافة حالة "يتطلب حجز موعد" إلى جدول الحالات
INSERT INTO application_statuses (name_ar, name_en, color, description, is_active, order_index)
VALUES 
  ('يتطلب حجز موعد', 'Appointment Required', '#3B82F6', 'الطلب يتطلب حجز موعد لإكمال الإجراءات', true, 7)
ON CONFLICT (name_ar) DO UPDATE
SET 
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  is_active = EXCLUDED.is_active;
