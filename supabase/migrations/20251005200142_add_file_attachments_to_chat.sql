/*
  # إضافة دعم المرفقات للشات

  ## التعديلات
  
  ### 1. تحديث جدول chat_messages
  - إضافة حقل `attachment_url` لتخزين رابط الملف
  - إضافة حقل `attachment_type` لنوع الملف (image, audio, file)
  - إضافة حقل `attachment_name` لاسم الملف الأصلي
*/

-- إضافة أعمدة المرفقات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'attachment_url'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN attachment_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'attachment_type'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN attachment_type text CHECK (attachment_type IN ('image', 'audio', 'file', NULL));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'attachment_name'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN attachment_name text;
  END IF;
END $$;