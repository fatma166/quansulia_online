/*
  # Create About Sudan CMS System

  1. New Tables
    - `about_sudan_page`
      - `id` (uuid, primary key)
      - `title_ar` (text) - Page title in Arabic
      - `title_en` (text) - Page title in English
      - `video_url` (text) - Main video URL
      - `video_poster` (text) - Video poster image
      - `is_active` (boolean) - Page visibility
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `updated_by` (uuid) - References staff.user_id
    
    - `about_sudan_statistics`
      - `id` (uuid, primary key)
      - `stat_key` (text) - Unique key for the statistic
      - `label_ar` (text) - Label in Arabic
      - `label_en` (text) - Label in English
      - `value` (numeric) - Numeric value
      - `display_value_ar` (text) - Formatted display value in Arabic
      - `display_value_en` (text) - Formatted display value in English
      - `icon` (text) - Icon name from lucide-react
      - `display_order` (int) - Display order
      - `is_active` (boolean) - Visibility
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `about_sudan_sections`
      - `id` (uuid, primary key)
      - `section_key` (text) - Unique key for the section
      - `title_ar` (text) - Section title in Arabic
      - `title_en` (text) - Section title in English
      - `content_ar` (text) - Content in Arabic
      - `content_en` (text) - Content in English
      - `image_url` (text) - Section image
      - `icon` (text) - Icon name
      - `display_order` (int) - Display order
      - `is_active` (boolean) - Visibility
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `about_sudan_section_stats`
      - `id` (uuid, primary key)
      - `section_id` (uuid) - References about_sudan_sections
      - `label_ar` (text) - Stat label in Arabic
      - `label_en` (text) - Stat label in English
      - `value` (text) - Stat value
      - `icon` (text) - Icon name
      - `display_order` (int) - Display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated staff to manage content
*/

-- Create about_sudan_page table
CREATE TABLE IF NOT EXISTS about_sudan_page (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar text NOT NULL DEFAULT 'عن السودان',
  title_en text NOT NULL DEFAULT 'About Sudan',
  video_url text DEFAULT '',
  video_poster text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES staff(user_id)
);

-- Create about_sudan_statistics table
CREATE TABLE IF NOT EXISTS about_sudan_statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_key text UNIQUE NOT NULL,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  value numeric NOT NULL,
  display_value_ar text NOT NULL,
  display_value_en text NOT NULL,
  icon text DEFAULT 'TrendingUp',
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create about_sudan_sections table
CREATE TABLE IF NOT EXISTS about_sudan_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text UNIQUE NOT NULL,
  title_ar text NOT NULL,
  title_en text NOT NULL,
  content_ar text NOT NULL,
  content_en text NOT NULL,
  image_url text DEFAULT '',
  icon text DEFAULT 'Globe',
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create about_sudan_section_stats table
CREATE TABLE IF NOT EXISTS about_sudan_section_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid REFERENCES about_sudan_sections(id) ON DELETE CASCADE,
  label_ar text NOT NULL,
  label_en text NOT NULL,
  value text NOT NULL,
  icon text DEFAULT 'Star',
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE about_sudan_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sudan_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sudan_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_sudan_section_stats ENABLE ROW LEVEL SECURITY;

-- Policies for about_sudan_page
CREATE POLICY "Anyone can view active page"
  ON about_sudan_page FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated staff can view all pages"
  ON about_sudan_page FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can update page"
  ON about_sudan_page FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can insert page"
  ON about_sudan_page FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

-- Policies for about_sudan_statistics
CREATE POLICY "Anyone can view active statistics"
  ON about_sudan_statistics FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated staff can view all statistics"
  ON about_sudan_statistics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can manage statistics"
  ON about_sudan_statistics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

-- Policies for about_sudan_sections
CREATE POLICY "Anyone can view active sections"
  ON about_sudan_sections FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Authenticated staff can view all sections"
  ON about_sudan_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated staff can manage sections"
  ON about_sudan_sections FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

-- Policies for about_sudan_section_stats
CREATE POLICY "Anyone can view section stats"
  ON about_sudan_section_stats FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM about_sudan_sections 
      WHERE about_sudan_sections.id = section_id 
      AND is_active = true
    )
  );

CREATE POLICY "Authenticated staff can manage section stats"
  ON about_sudan_section_stats FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff WHERE staff.user_id = auth.uid()
    )
  );

-- Insert default page data
INSERT INTO about_sudan_page (title_ar, title_en, video_url, is_active)
VALUES ('عن السودان', 'About Sudan', '', true)
ON CONFLICT DO NOTHING;

-- Insert default statistics
INSERT INTO about_sudan_statistics (stat_key, label_ar, label_en, value, display_value_ar, display_value_en, icon, display_order) VALUES
('area', 'المساحة', 'Area', 1861484, '1.86 مليون كم²', '1.86M km²', 'MapPin', 1),
('population', 'السكان', 'Population', 45000000, '45 مليون نسمة', '45M people', 'Users', 2),
('history', 'عمر الحضارة', 'Civilization Age', 5000, '5000+ سنة', '5000+ years', 'Calendar', 3),
('languages', 'اللغات', 'Languages', 114, '114 لغة', '114 languages', 'Globe', 4),
('agriculture', 'الأراضي الزراعية', 'Agricultural Land', 200000000, '200 مليون فدان', '200M acres', 'Wheat', 5),
('gold', 'إنتاج الذهب', 'Gold Production', 75, '75 طن سنوياً', '75 tons/year', 'Gem', 6),
('tourism', 'السياح سنوياً', 'Annual Tourists', 500000, '500 ألف زائر', '500K visitors', 'Camera', 7),
('nile', 'نهر النيل', 'Nile River', 6650, '6650 كم', '6650 km', 'Mountain', 8)
ON CONFLICT (stat_key) DO NOTHING;

-- Insert default sections
INSERT INTO about_sudan_sections (section_key, title_ar, title_en, content_ar, content_en, image_url, icon, display_order) VALUES
(
  'strategic-location',
  'الموقع الاستراتيجي',
  'Strategic Location',
  'يقع السودان في موقع استراتيجي فريد يربط بين قارتي أفريقيا وآسيا، ويطل على البحر الأحمر بساحل يمتد لأكثر من 853 كيلومتراً. هذا الموقع جعله جسراً حضارياً وتجارياً عبر التاريخ، ونقطة التقاء بين الثقافات العربية والأفريقية.',
  'Sudan is located in a unique strategic position linking Africa and Asia, overlooking the Red Sea with a coastline extending over 853 kilometers. This location has made it a civilizational and commercial bridge throughout history.',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Globe',
  1
),
(
  'food-security',
  'سلة غذاء العالم',
  'World''s Food Basket',
  'يُعرف السودان بـ"سلة غذاء العالم" لما يمتلكه من أراضي زراعية خصبة تقدر بأكثر من 200 مليون فدان، ومياه وفيرة من النيل وروافده. ينتج السودان محاصيل استراتيجية مثل القمح والذرة والسمسم والفول السوداني والقطن، مما يجعله قادراً على إطعام مليار شخص.',
  'Sudan is known as the "World''s Food Basket" with over 200 million acres of fertile agricultural land and abundant water from the Nile. Sudan produces strategic crops that can feed a billion people.',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Wheat',
  2
),
(
  'historical-depth',
  'العمق التاريخي',
  'Historical Depth',
  'يمتد تاريخ السودان لأكثر من 5000 سنة، حيث قامت على أرضه حضارات عظيمة مثل مملكة كوش ومملكة مروي والممالك المسيحية النوبية. يضم السودان أكثر من 255 هرماً، أكثر من مصر، وآثاراً تشهد على عراقة هذه الأرض وحضارتها المتجذرة.',
  'Sudan''s history spans over 5000 years, with great civilizations like the Kingdom of Kush and Meroe. Sudan has more than 255 pyramids, more than Egypt, testament to its ancient civilization.',
  'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Crown',
  3
),
(
  'tourism-potential',
  'الإمكانات السياحية',
  'Tourism Potential',
  'يتمتع السودان بتنوع سياحي فريد يشمل السياحة الأثرية في مروي والبجراوية، والسياحة البحرية على ساحل البحر الأحمر، والسياحة البيئية في محميات الدندر وسنقنيب، والسياحة الثقافية التي تعكس تنوع الثقافات والتقاليد السودانية الأصيلة.',
  'Sudan enjoys unique tourism diversity including archaeological tourism in Meroe, marine tourism on the Red Sea coast, eco-tourism in reserves, and cultural tourism reflecting diverse Sudanese traditions.',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Camera',
  4
),
(
  'cultural-diversity',
  'التنوع الثقافي',
  'Cultural Diversity',
  'السودان بلد التنوع الثقافي بامتياز، حيث تتعايش أكثر من 500 قبيلة و114 لغة في انسجام تام. هذا التنوع يظهر جلياً في الفنون والموسيقى والأزياء التقليدية والمطبخ السوداني الغني بالنكهات المتنوعة التي تمزج بين الأصالة العربية والإفريقية.',
  'Sudan is a country of cultural diversity par excellence, with over 500 tribes and 114 languages coexisting in harmony. This diversity is evident in arts, music, traditional costumes, and Sudanese cuisine.',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Palette',
  5
),
(
  'natural-resources',
  'الثروات الطبيعية',
  'Natural Resources',
  'يمتلك السودان ثروات طبيعية هائلة تشمل الذهب والنفط والمعادن النفيسة. ينتج السودان حوالي 75 طناً من الذهب سنوياً، بالإضافة إلى احتياطيات ضخمة من النحاس والحديد والكروم والمنغنيز. كما يمتلك ثروة حيوانية تقدر بأكثر من 100 مليون رأس.',
  'Sudan possesses enormous natural resources including gold, oil, and precious minerals. Sudan produces about 75 tons of gold annually, plus huge reserves of copper, iron, chromium, and manganese.',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'Gem',
  6
)
ON CONFLICT (section_key) DO NOTHING;