/*
  # Add Sample News Data

  1. Sample Data
    - Inserts 8 sample news articles in both Arabic and English
    - Includes various categories: official statements, latest news
    - All articles are active and some are featured
    - Uses images from Pexels
    
  2. Content
    - Official statements about security and services
    - Investment opportunities
    - Cultural events
    - New services and programs
*/

-- Insert sample news articles
INSERT INTO news (
  title_ar, title_en,
  excerpt_ar, excerpt_en,
  content_ar, content_en,
  featured_image,
  category,
  published_date,
  is_featured,
  is_active,
  author_ar,
  author_en,
  created_at,
  updated_at
) VALUES
(
  'بيان رسمي حول الأوضاع الأمنية في السودان',
  'Official Statement on Security Situation in Sudan',
  'أصدرت وزارة الخارجية السودانية بياناً رسمياً حول آخر التطورات الأمنية في البلاد وتأكيد الاستقرار',
  'The Sudanese Ministry of Foreign Affairs issued an official statement on the latest security developments and stability confirmation',
  'أصدرت وزارة الخارجية السودانية بياناً رسمياً حول آخر التطورات الأمنية في البلاد وتأكيد الاستقرار. أكدت الوزارة في بيانها على أن الوضع الأمني في السودان مستقر وأن الحكومة تتخذ كافة الإجراءات اللازمة لضمان سلامة المواطنين والمقيمين. كما دعت الوزارة جميع المواطنين السودانيين في الخارج إلى عدم الانسياق وراء الشائعات والاعتماد على المصادر الرسمية فقط للحصول على المعلومات.',
  'The Sudanese Ministry of Foreign Affairs issued an official statement on the latest security developments and stability confirmation. The ministry confirmed in its statement that the security situation in Sudan is stable and that the government is taking all necessary measures to ensure the safety of citizens and residents. The ministry also called on all Sudanese citizens abroad not to be swayed by rumors and to rely only on official sources for information.',
  'https://images.pexels.com/photos/6077326/pexels-photo-6077326.jpeg?auto=compress&cs=tinysrgb&w=800',
  'official',
  '2025-01-15',
  true,
  true,
  'وزارة الخارجية السودانية',
  'Sudanese Ministry of Foreign Affairs',
  NOW(),
  NOW()
),
(
  'فرص استثمارية جديدة في قطاع الزراعة السوداني',
  'New Investment Opportunities in Sudan''s Agricultural Sector',
  'تفتح الحكومة السودانية المجال أمام استثمارات جديدة في القطاع الزراعي مع حوافز مالية مجزية ودعم حكومي شامل',
  'Sudan opens new agricultural investment opportunities with attractive financial incentives and comprehensive government support',
  'تفتح الحكومة السودانية المجال أمام استثمارات جديدة في القطاع الزراعي مع حوافز مالية مجزية ودعم حكومي شامل. يأتي هذا في إطار خطة الحكومة لتطوير القطاع الزراعي وزيادة الإنتاج الزراعي والصادرات. تشمل الفرص الاستثمارية المتاحة زراعة المحاصيل النقدية، الثروة الحيوانية، الصناعات التحويلية، والخدمات اللوجستية. كما توفر الحكومة إعفاءات ضريبية وتسهيلات جمركية للمستثمرين في هذا القطاع الحيوي.',
  'Sudan opens new agricultural investment opportunities with attractive financial incentives and comprehensive government support. This comes as part of the government''s plan to develop the agricultural sector and increase agricultural production and exports. Available investment opportunities include cash crop cultivation, livestock, processing industries, and logistics services. The government also provides tax exemptions and customs facilities for investors in this vital sector.',
  'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=800',
  'latest',
  '2025-01-12',
  true,
  true,
  'وزارة الاستثمار',
  'Ministry of Investment',
  NOW(),
  NOW()
),
(
  'افتتاح معرض الثقافة السودانية في جدة',
  'Opening of Sudanese Culture Exhibition in Jeddah',
  'ينظم القنصلية معرضاً ثقافياً شاملاً يستعرض التراث والحضارة السودانية العريقة بمشاركة فنانين محليين',
  'The consulate organizes a comprehensive cultural exhibition showcasing Sudan''s rich heritage with local artists participation',
  'ينظم القنصلية معرضاً ثقافياً شاملاً يستعرض التراث والحضارة السودانية العريقة بمشاركة فنانين محليين. يتضمن المعرض أعمالاً فنية تقليدية وحديثة، حرفاً يدوية، أزياء شعبية، ومأكولات سودانية تقليدية. يهدف المعرض إلى تعريف الجمهور السعودي بالثقافة السودانية الغنية وتعزيز الروابط الثقافية بين البلدين الشقيقين. المعرض مفتوح للجميع ويستمر لمدة أسبوعين.',
  'The consulate organizes a comprehensive cultural exhibition showcasing Sudan''s rich heritage with local artists participation. The exhibition includes traditional and modern artworks, handicrafts, folk costumes, and traditional Sudanese cuisine. The exhibition aims to introduce the Saudi public to Sudan''s rich culture and strengthen cultural ties between the two brotherly countries. The exhibition is open to all and will continue for two weeks.',
  'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
  'latest',
  '2025-01-10',
  false,
  true,
  'القنصلية السودانية',
  'Sudanese Consulate',
  NOW(),
  NOW()
),
(
  'تحديث إجراءات الحصول على جوازات السفر',
  'Updated Passport Application Procedures',
  'تعلن القنصلية عن تحديث إجراءات إصدار وتجديد جوازات السفر لتسهيل الخدمة على المواطنين وتقليل أوقات الانتظار',
  'The consulate announces updated passport procedures to facilitate services for citizens and reduce waiting times',
  'تعلن القنصلية عن تحديث إجراءات إصدار وتجديد جوازات السفر لتسهيل الخدمة على المواطنين وتقليل أوقات الانتظار. تشمل التحديثات نظام حجز المواعيد الإلكتروني، تقليل المستندات المطلوبة، وإمكانية متابعة حالة الطلب عبر الإنترنت. كما تم تقليص مدة إصدار الجواز إلى أسبوعين فقط في الحالات العادية. ندعو جميع المواطنين للاستفادة من هذه التسهيلات والخدمات المحسنة.',
  'The consulate announces updated passport procedures to facilitate services for citizens and reduce waiting times. Updates include an electronic appointment booking system, reduced required documents, and the ability to track application status online. The passport issuance period has also been reduced to just two weeks in normal cases. We invite all citizens to take advantage of these facilities and improved services.',
  'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
  'official',
  '2025-01-08',
  true,
  true,
  'القنصلية السودانية',
  'Sudanese Consulate',
  NOW(),
  NOW()
),
(
  'توقيع اتفاقية تعاون تعليمي مع الجامعات السعودية',
  'Educational Cooperation Agreement with Saudi Universities',
  'وقعت القنصلية اتفاقية تعاون مع عدة جامعات سعودية لتبادل الطلاب وتقديم منح دراسية للطلاب السودانيين',
  'The consulate signed cooperation agreements with Saudi universities for student exchange and scholarships for Sudanese students',
  'وقعت القنصلية اتفاقية تعاون مع عدة جامعات سعودية رائدة لتبادل الطلاب وتقديم منح دراسية للطلاب السودانيين. تشمل الاتفاقية برامج البكالوريوس والدراسات العليا في مختلف التخصصات العلمية والأدبية. كما تتضمن برامج تبادل أعضاء هيئة التدريس والبحث العلمي المشترك. هذه الاتفاقية تمثل خطوة مهمة في تعزيز التعاون الأكاديمي بين البلدين وتوفير فرص تعليمية متميزة للطلاب السودانيين.',
  'The consulate signed cooperation agreements with several leading Saudi universities for student exchange and scholarships for Sudanese students. The agreement includes undergraduate and graduate programs in various scientific and literary specializations. It also includes faculty exchange programs and joint scientific research. This agreement represents an important step in enhancing academic cooperation between the two countries and providing distinguished educational opportunities for Sudanese students.',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
  'latest',
  '2025-01-05',
  false,
  true,
  'وزارة التعليم العالي',
  'Ministry of Higher Education',
  NOW(),
  NOW()
),
(
  'إطلاق برنامج دعم رجال الأعمال السودانيين',
  'Launch of Sudanese Businessmen Support Program',
  'أطلقت القنصلية برنامجاً شاملاً لدعم رجال الأعمال السودانيين في المملكة وتسهيل إجراءات الاستثمار والتجارة',
  'The consulate launched a comprehensive program to support Sudanese businessmen in the Kingdom and facilitate investment procedures',
  'أطلقت القنصلية برنامجاً شاملاً لدعم رجال الأعمال السودانيين في المملكة وتسهيل إجراءات الاستثمار والتجارة. يتضمن البرنامج خدمات استشارية مجانية، تنظيم لقاءات دورية مع مستثمرين سعوديين، توفير معلومات عن الفرص الاستثمارية، والمساعدة في إنهاء الإجراءات القانونية والإدارية. كما يوفر البرنامج منصة للتواصل بين رجال الأعمال السودانيين لتبادل الخبرات وتطوير الشراكات التجارية.',
  'The consulate launched a comprehensive program to support Sudanese businessmen in the Kingdom and facilitate investment and trade procedures. The program includes free consulting services, organizing regular meetings with Saudi investors, providing information about investment opportunities, and assistance in completing legal and administrative procedures. The program also provides a platform for communication between Sudanese businessmen to exchange experiences and develop commercial partnerships.',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  'official',
  '2025-01-03',
  false,
  true,
  'القنصلية السودانية',
  'Sudanese Consulate',
  NOW(),
  NOW()
),
(
  'مؤتمر الاستثمار السوداني السعودي المشترك',
  'Joint Sudanese-Saudi Investment Conference',
  'يستعد لانعقاد مؤتمر اقتصادي كبير لتعزيز الاستثمارات المشتركة بين البلدين في مختلف القطاعات الاقتصادية',
  'Preparing for a major economic conference to promote joint investments between the two countries in various economic sectors',
  'يستعد لانعقاد مؤتمر اقتصادي كبير لتعزيز الاستثمارات المشتركة بين البلدين في مختلف القطاعات الاقتصادية. سيشارك في المؤتمر كبار المسؤولين الحكوميين، رجال أعمال، ومستثمرون من البلدين. يهدف المؤتمر إلى استعراض الفرص الاستثمارية المتاحة، مناقشة التحديات، وإبرام اتفاقيات تعاون في قطاعات الزراعة، التعدين، البنية التحتية، والطاقة المتجددة. المؤتمر يمثل منصة مهمة لتعزيز العلاقات الاقتصادية بين السودان والسعودية.',
  'Preparing for a major economic conference to promote joint investments between the two countries in various economic sectors. The conference will be attended by senior government officials, businessmen, and investors from both countries. The conference aims to review available investment opportunities, discuss challenges, and conclude cooperation agreements in agriculture, mining, infrastructure, and renewable energy sectors. The conference represents an important platform for enhancing economic relations between Sudan and Saudi Arabia.',
  'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800',
  'latest',
  '2025-01-01',
  true,
  true,
  'وزارة الاقتصاد',
  'Ministry of Economy',
  NOW(),
  NOW()
),
(
  'تدشين خدمات إلكترونية جديدة للمواطنين',
  'Launch of New Electronic Services for Citizens',
  'دشنت القنصلية منصة إلكترونية متطورة تتيح للمواطنين إنجاز معاملاتهم عبر الإنترنت بسهولة وأمان',
  'The consulate launched an advanced electronic platform allowing citizens to complete their transactions online safely and easily',
  'دشنت القنصلية منصة إلكترونية متطورة تتيح للمواطنين إنجاز معاملاتهم عبر الإنترنت بسهولة وأمان. تشمل الخدمات الإلكترونية المتاحة: طلب الوثائق الرسمية، حجز المواعيد، متابعة حالة الطلبات، الاستفسارات، والدفع الإلكتروني. المنصة مصممة بواجهة سهلة الاستخدام وتدعم اللغتين العربية والإنجليزية. هذه الخدمات تهدف إلى توفير الوقت والجهد على المواطنين وتحسين جودة الخدمات المقدمة.',
  'The consulate launched an advanced electronic platform allowing citizens to complete their transactions online safely and easily. Available electronic services include: requesting official documents, booking appointments, tracking application status, inquiries, and electronic payment. The platform is designed with an easy-to-use interface and supports both Arabic and English languages. These services aim to save citizens time and effort and improve the quality of services provided.',
  'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
  'official',
  '2024-12-28',
  false,
  true,
  'القنصلية السودانية',
  'Sudanese Consulate',
  NOW(),
  NOW()
)
ON CONFLICT DO NOTHING;
