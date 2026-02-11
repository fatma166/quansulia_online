/*
  # حذف حقول المستندات المكررة من خدمة الجوازات
  
  1. المشكلة
    - تم إضافة حقول المستندات في service_fields بشكل خاطئ
    - المستندات يجب أن تبقى فقط في service_documents
    - هذا أدى إلى تكرار غير مطلوب
  
  2. الحل
    - حذف جميع حقول المستندات من service_fields
    - الإبقاء على المستندات في service_documents فقط
    
  3. الحقول المحذوفة
    - passportCopy
    - nationalIdCopyAdult
    - personalPhoto
    - nationalIdCopyMinor
    - minorPassportCopy
    - motherPassportCopy
    - fatherPassportCopy
    - childPersonalPhoto
*/

-- حذف جميع حقول المستندات من خطوة documents-upload
DELETE FROM service_fields
WHERE service_id = '07259b33-5364-4e5c-8162-8421813dfb1b'
  AND step_id = 'documents-upload'
  AND field_name IN (
    'passportCopy',
    'nationalIdCopyAdult',
    'personalPhoto',
    'nationalIdCopyMinor',
    'minorPassportCopy',
    'motherPassportCopy',
    'fatherPassportCopy',
    'childPersonalPhoto'
  );
