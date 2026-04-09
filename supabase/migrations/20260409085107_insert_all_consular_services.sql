/*
  # Insert All Consular Services

  Adds all the main consular services shown in the services page:
  - جوازات السفر (Passports)
  - التصديقات (Attestations)
  - خدمة خارجية (External Service)
  - الأحوال المدنية (Civil Registry)
  - الممصادقات (Endorsements)
  - التوكيلات (Power of Attorney)
  - التأشيرات (Visas)
  - الإقرارات (Declarations)
  - الشؤون الأسرية (Family Affairs)
  - ساق الجثمان (Body Covering)
  - بنك الخرطوم (Khartoum Bank)
  - العمل والسجون (Work and Prisons)
  - الخدمات التعليمية (Educational Services)
  - المذونة (Madhoonia)
*/

INSERT INTO services (name_ar, name_en, slug, description_ar, description_en, icon, category, is_active, order_index, fees, duration)
VALUES
  (
    'جوازات السفر',
    'Passports',
    'passports',
    'إصدار وتجديد جوازات السفر السودانية',
    'Issuance and renewal of Sudanese passports',
    'FileText',
    'travel',
    true,
    1,
    'حسب نوع الخدمة',
    '14 - 21 يوم عمل'
  ),
  (
    'التصديقات',
    'Attestations',
    'attestations',
    'تصديق الوثائق والشهادات الرسمية',
    'Attestation of official documents and certificates',
    'FileCheck',
    'documents',
    true,
    2,
    'حسب نوع الوثيقة',
    '3 - 5 أيام عمل'
  ),
  (
    'الأحوال المدنية',
    'Civil Registry',
    'civil-registry',
    'خدمات الأحوال المدنية والوثائق السودانية',
    'Civil registry services and Sudanese documents',
    'Users',
    'documents',
    true,
    3,
    'حسب نوع الخدمة',
    '7 - 14 يوم عمل'
  ),
  (
    'الممصادقات',
    'Endorsements',
    'endorsements',
    'مصادقة المستندات والوثائق الرسمية',
    'Endorsement of official documents and papers',
    'Award',
    'documents',
    true,
    4,
    'حسب نوع الخدمة',
    '3 - 5 أيام عمل'
  ),
  (
    'التوكيلات',
    'Power of Attorney',
    'power-of-attorney',
    'إصدار توكيلات رسمية بأنواعها المختلفة',
    'Issuance of various types of power of attorney',
    'Scale',
    'legal',
    true,
    5,
    'حسب نوع التوكيل',
    '1 - 3 أيام عمل'
  ),
  (
    'التأشيرات',
    'Visas',
    'visas',
    'تأشيرات الدخول إلى السودان للمقيمين في الخارج',
    'Entry visas to Sudan for residents abroad',
    'Plane',
    'travel',
    true,
    6,
    'حسب نوع التأشيرة',
    '3 - 5 أيام عمل'
  ),
  (
    'الإقرارات',
    'Declarations',
    'declarations',
    'إقرارات رسمية ومصادق عليها بأنواعها',
    'Official and certified declarations of all types',
    'FileText',
    'legal',
    true,
    7,
    'حسب نوع الإقرار',
    '1 يوم عمل'
  ),
  (
    'الشؤون الأسرية',
    'Family Affairs',
    'family-affairs',
    'خدمات الشؤون الأسرية والزواج والطلاق',
    'Family affairs services including marriage and divorce',
    'Heart',
    'personal',
    true,
    8,
    'حسب نوع الخدمة',
    '3 - 5 أيام عمل'
  ),
  (
    'ساق الجثمان',
    'Body Covering',
    'body-covering',
    'إجراءات نقل الجثامين والتوثيق اللازم',
    'Procedures for body transfer and required documentation',
    'FileHeart',
    'personal',
    true,
    9,
    'بدون رسوم',
    '1 - 3 أيام عمل'
  ),
  (
    'بنك الخرطوم',
    'Khartoum Bank',
    'khartoum-bank',
    'خدمات بنك الخرطوم والعمليات المصرفية',
    'Khartoum Bank services and banking operations',
    'Briefcase',
    'financial',
    true,
    10,
    'حسب العملية',
    '2 - 5 أيام عمل'
  ),
  (
    'العمل والسجون',
    'Work and Prisons',
    'work-and-prisons',
    'خدمات العمل والسجون والتوثيق المتعلق بها',
    'Work and prisons services and related documentation',
    'Briefcase',
    'legal',
    true,
    11,
    'حسب نوع الخدمة',
    '3 - 7 أيام عمل'
  ),
  (
    'الخدمات التعليمية',
    'Educational Services',
    'education',
    'الخدمات التعليمية وتصديق الشهادات الدراسية',
    'Educational services and academic certificate attestation',
    'GraduationCap',
    'education',
    true,
    12,
    'حسب نوع الخدمة',
    '7 - 14 يوم عمل'
  ),
  (
    'المذونة',
    'Madhoonia',
    'madhoonia',
    'خدمات المذونة والشؤون الدينية',
    'Madhoonia and religious affairs services',
    'Heart',
    'personal',
    true,
    13,
    'حسب نوع الخدمة',
    'حسب الحالة'
  )
ON CONFLICT (slug) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  description_ar = EXCLUDED.description_ar,
  icon = EXCLUDED.icon,
  category = EXCLUDED.category,
  is_active = EXCLUDED.is_active,
  order_index = EXCLUDED.order_index,
  fees = EXCLUDED.fees,
  duration = EXCLUDED.duration;
