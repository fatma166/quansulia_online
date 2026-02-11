/*
  # إضافة صفحة معركة الكرامة
  
  1. إنشاء جدول additional_pages
  2. إضافة بيانات صفحة معركة الكرامة
  3. إضافة محتوى الأقسام في page_sections الموجود
*/

-- إنشاء جدول الصفحات الإضافية
CREATE TABLE IF NOT EXISTS additional_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title_ar text NOT NULL,
  title_en text,
  subtitle_ar text,
  subtitle_en text,
  hero_image_url text,
  is_active boolean DEFAULT true,
  show_in_menu boolean DEFAULT true,
  menu_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء الفهارس
CREATE INDEX IF NOT EXISTS idx_additional_pages_slug ON additional_pages(slug);
CREATE INDEX IF NOT EXISTS idx_additional_pages_active ON additional_pages(is_active, menu_order);

-- تفعيل RLS
ALTER TABLE additional_pages ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
DROP POLICY IF EXISTS "Anyone can view active additional pages" ON additional_pages;
CREATE POLICY "Anyone can view active additional pages"
  ON additional_pages FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage additional pages" ON additional_pages;
CREATE POLICY "Admins can manage additional pages"
  ON additional_pages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff
      JOIN roles ON staff.role_id = roles.id
      WHERE staff.user_id = auth.uid()
      AND roles.name IN ('super_admin', 'admin')
      AND staff.is_active = true
    )
  );

-- إضافة صفحة معركة الكرامة
INSERT INTO additional_pages (
  slug,
  title_ar,
  title_en,
  subtitle_ar,
  subtitle_en,
  hero_image_url,
  is_active,
  show_in_menu,
  menu_order
) VALUES (
  'karama-battle',
  'معركة الكرامة',
  'Battle of Dignity',
  'صمود الشعب السوداني في الدفاع عن وحدة الأرض والشعب',
  'The Sudanese people''s resilience in defending the unity of land and people',
  'https://images.pexels.com/photos/3551836/pexels-photo-3551836.jpeg',
  true,
  true,
  3
)
ON CONFLICT (slug) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  title_en = EXCLUDED.title_en,
  subtitle_ar = EXCLUDED.subtitle_ar,
  subtitle_en = EXCLUDED.subtitle_en,
  updated_at = now();

-- إضافة محتوى الأقسام في جدول page_sections الموجود
INSERT INTO page_sections (page_name, section_key, title_ar, title_en, content_ar, content_en, image_url, display_order, is_active)
VALUES 
(
  'karama-battle',
  'intro',
  'مقدمة عن معركة الكرامة',
  'Introduction to the Battle of Dignity',
  'منذ منتصف عام 2023، يواجه السودان تحديات عصيبة تهدد وحدة أراضيه واستقرار شعبه. في هذه الأوقات العصيبة، أظهر الشعب السوداني صموداً استثنائياً وعزيمة لا تلين في الدفاع عن كرامته ووطنه.

معركة الكرامة ليست مجرد صراع عسكري، بل هي رمز لإرادة شعب يرفض الانكسار ويصر على حماية وحدته الوطنية وسيادته. إنها قصة صمود وبطولة تكتب بأحرف من نور في تاريخ السودان الحديث.',
  'Since mid-2023, Sudan has faced critical challenges threatening the unity of its territories and the stability of its people. In these difficult times, the Sudanese people have shown exceptional resilience and unwavering determination in defending their dignity and homeland.

The Battle of Dignity is not merely a military conflict, but a symbol of the will of a people who refuse to be broken and insist on protecting their national unity and sovereignty. It is a story of resilience and heroism written in letters of light in modern Sudanese history.',
  'https://images.pexels.com/photos/8111847/pexels-photo-8111847.jpeg',
  1,
  true
),
(
  'karama-battle',
  'unity',
  'الوحدة الوطنية قوتنا',
  'National Unity is Our Strength',
  'في أحلك الظروف، أثبت الشعب السوداني أن الوحدة الوطنية هي السلاح الأقوى في مواجهة التحديات. تجاوزت هذه الوحدة كل الحدود الإقليمية والقبلية والسياسية، لتجسد روح السودان الواحد الموحد.

المواطنون من جميع أنحاء البلاد، من الشرق والغرب والشمال والجنوب، وقفوا صفاً واحداً في الدفاع عن الوطن. هذا التلاحم الوطني هو أعظم إنجاز حققه الشعب السوداني في هذه المحنة.

إن الحفاظ على هذه الوحدة والبناء عليها هو السبيل الوحيد لضمان مستقبل مشرق لأجيالنا القادمة.',
  'In the darkest circumstances, the Sudanese people proved that national unity is the strongest weapon in facing challenges. This unity transcended all regional, tribal, and political boundaries, embodying the spirit of one unified Sudan.

Citizens from all parts of the country, from the east and west, north and south, stood as one in defending the homeland. This national cohesion is the greatest achievement made by the Sudanese people in this ordeal.

Maintaining and building upon this unity is the only way to ensure a bright future for our coming generations.',
  'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg',
  2,
  true
),
(
  'karama-battle',
  'courage',
  'تضحيات الشعب السوداني',
  'Sacrifices of the Sudanese People',
  'قدم الشعب السوداني تضحيات جسيمة في سبيل الحفاظ على وحدة الوطن وكرامته. آلاف الأسر نزحت من ديارها، وملايين المواطنين تأثروا بالصراع، لكن روح المقاومة لم تنكسر.

رغم كل المعاناة، استمر المواطنون في تقديم الدعم لبعضهم البعض. تشكلت مبادرات شعبية لمساعدة النازحين، وأقيمت مراكز إيواء، ونظمت حملات إغاثة. هذه المبادرات تعكس أصالة الشعب السوداني وتراحمه.

إن هذه التضحيات لن تذهب سدى، بل ستبقى نبراساً يضيء طريق الأجيال القادمة نحو سودان أقوى وأكثر تماسكاً.',
  'The Sudanese people have made immense sacrifices to preserve the unity and dignity of the homeland. Thousands of families were displaced from their homes, and millions of citizens were affected by the conflict, but the spirit of resistance was not broken.

Despite all the suffering, citizens continued to support each other. Popular initiatives were formed to help the displaced, shelters were established, and relief campaigns were organized. These initiatives reflect the authenticity and compassion of the Sudanese people.

These sacrifices will not be in vain, but will remain a beacon lighting the way for future generations towards a stronger and more cohesive Sudan.',
  'https://images.pexels.com/photos/6646914/pexels-photo-6646914.jpeg',
  3,
  true
),
(
  'karama-battle',
  'future',
  'نحو مستقبل أفضل',
  'Towards a Better Future',
  'رغم التحديات الراهنة، يبقى الأمل في مستقبل أفضل للسودان حياً في قلوب شعبه. الدروس المستفادة من هذه المحنة ستكون أساساً لبناء سودان أقوى وأكثر استقراراً.

الطريق نحو المستقبل يتطلب:
• الحفاظ على الوحدة الوطنية وتعزيزها
• إعادة بناء ما تهدم بروح من التعاون والتكاتف
• الاستثمار في التعليم والصحة والبنية التحتية
• تعزيز قيم التسامح والعدالة والمساواة
• حماية حقوق جميع المواطنين دون تمييز

معاً، بإرادتنا وعزيمتنا، سنبني السودان الذي نحلم به - سودان الأمن والسلام والازدهار.',
  'Despite current challenges, hope for a better future for Sudan remains alive in the hearts of its people. The lessons learned from this ordeal will be the foundation for building a stronger and more stable Sudan.

The path to the future requires:
• Maintaining and strengthening national unity
• Rebuilding what was destroyed with a spirit of cooperation and solidarity
• Investing in education, health, and infrastructure
• Promoting values of tolerance, justice, and equality
• Protecting the rights of all citizens without discrimination

Together, with our will and determination, we will build the Sudan we dream of - a Sudan of security, peace, and prosperity.',
  'https://images.pexels.com/photos/3184430/pexels-photo-3184430.jpeg',
  4,
  true
)
ON CONFLICT (page_name, section_key) DO UPDATE SET
  title_ar = EXCLUDED.title_ar,
  title_en = EXCLUDED.title_en,
  content_ar = EXCLUDED.content_ar,
  content_en = EXCLUDED.content_en,
  image_url = EXCLUDED.image_url,
  updated_at = now();
