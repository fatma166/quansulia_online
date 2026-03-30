-- Insert default application statuses if they don't exist
INSERT INTO application_statuses (name_ar, name_en, color, description, is_active, order_index)
VALUES 
  ('قيد المراجعة', 'Under Review', '#3B82F6', 'الطلب قيد المراجعة من قبل الموظفين', true, 1),
  ('قيد المعالجة', 'In Progress', '#F59E0B', 'جاري معالجة الطلب', true, 2),
  ('بانتظار المستندات', 'Awaiting Documents', '#EF4444', 'في انتظار تقديم المستندات المطلوبة', true, 3),
  ('مكتمل', 'Completed', '#10B981', 'تم إكمال الطلب بنجاح', true, 4),
  ('مرفوض', 'Rejected', '#DC2626', 'تم رفض الطلب', true, 5),
  ('محجوز موعد', 'Appointment Scheduled', '#8B5CF6', 'تم حجز موعد للطلب', true, 6),
  ('قيد التسليم', 'In Delivery', '#06B6D4', 'الطلب قيد التسليم', true, 7)
ON CONFLICT (name_ar) DO NOTHING;
