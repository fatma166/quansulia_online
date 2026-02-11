/*
  # إضافة بيانات تجريبية للصفحات الجديدة

  1. بيانات تجريبية
    - محتوى صفحة عن القنصلية (كلمة القنصل، نبذة عن القنصلية)
    - بيانات السفراء (سفير حالي وسفراء سابقين)
    - دليل المعاملات (خطوات توضيحية)
    - مواقع مهمة (روابط رسمية)
  
  2. ملاحظات
    - جميع البيانات قابلة للتعديل من لوحة التحكم
    - البيانات باللغتين العربية والإنجليزية
    - الصور يمكن رفعها لاحقاً من لوحة التحكم
*/

-- حذف البيانات التجريبية القديمة إن وجدت
DELETE FROM about_consulate_sections;
DELETE FROM ambassadors;
DELETE FROM services_guide_sections;
DELETE FROM important_links;

-- إضافة محتوى كلمة القنصل
INSERT INTO about_consulate_sections (section_type, title_ar, title_en, content_ar, content_en, order_index, is_active)
VALUES (
  'consul_word',
  'كلمة القنصل',
  'Consul''s Word',
  'بسم الله الرحمن الرحيم

أخواتي وإخوتي أبناء الجالية السودانية الكريمة في المملكة العربية السعودية،

السلام عليكم ورحمة الله وبركاته

يسرني أن أرحب بكم في الموقع الإلكتروني الجديد للقنصلية العامة لجمهورية السودان بجدة، والذي يأتي في إطار سعينا الدؤوب لتطوير وتحسين الخدمات القنصلية المقدمة لأبناء جاليتنا الكريمة.

إن القنصلية تضع في مقدمة أولوياتها خدمة المواطن السوداني، وتسهيل إجراءاته القنصلية، وحماية حقوقه ومصالحه. ونحن نعمل بكل جد واجتهاد لتقديم خدمات متميزة تليق بأبناء وطننا الغالي.

هذا الموقع الإلكتروني يوفر لكم:
• تقديم طلبات الخدمات القنصلية إلكترونياً
• متابعة حالة المعاملات
• حجز المواعيد
• الحصول على المعلومات والإرشادات
• التواصل المباشر مع القنصلية

نحن في القنصلية ملتزمون بتقديم أفضل الخدمات، ونرحب بملاحظاتكم واقتراحاتكم التي تساعدنا على التطوير والتحسين المستمر.

أسأل الله العلي القدير أن يحفظ السودان وشعبه، وأن يديم على المملكة العربية السعودية أمنها واستقرارها ورخاءها.

وتفضلوا بقبول فائق الاحترام والتقدير،

القنصل العام
القنصلية العامة لجمهورية السودان بجدة',
  'In the Name of Allah, the Most Gracious, the Most Merciful

Dear Members of the Sudanese Community in the Kingdom of Saudi Arabia,

Peace be upon you and the mercy of Allah and His blessings

It is my pleasure to welcome you to the new website of the Consulate General of the Republic of Sudan in Jeddah, which comes within the framework of our continuous efforts to develop and improve consular services provided to our esteemed community.

The Consulate places the service of Sudanese citizens at the forefront of its priorities, facilitating their consular procedures, and protecting their rights and interests. We work diligently to provide distinguished services worthy of our dear homeland.

This website provides you with:
• Electronic submission of consular service applications
• Tracking the status of transactions
• Appointment booking
• Obtaining information and guidance
• Direct communication with the Consulate

We at the Consulate are committed to providing the best services, and we welcome your comments and suggestions that help us continuously develop and improve.

I ask Allah Almighty to protect Sudan and its people, and to perpetuate the security, stability, and prosperity of the Kingdom of Saudi Arabia.

Please accept my highest respect and appreciation,

The Consul General
Consulate General of the Republic of Sudan in Jeddah',
  1,
  true
);

-- إضافة نبذة عن القنصلية
INSERT INTO about_consulate_sections (section_type, title_ar, title_en, content_ar, content_en, order_index, is_active)
VALUES (
  'about_consulate',
  'نبذة عن القنصلية',
  'About the Consulate',
  'القنصلية العامة لجمهورية السودان بجدة هي الممثل الرسمي لحكومة جمهورية السودان في المنطقة الغربية من المملكة العربية السعودية.

تأسست القنصلية لخدمة الجالية السودانية الكريمة في المملكة العربية السعودية، والتي تعد من أكبر الجاليات العربية المقيمة في المملكة.

رؤيتنا:
أن نكون القنصلية النموذجية في تقديم خدمات قنصلية متميزة وسريعة وميسرة لأبناء الجالية السودانية.

رسالتنا:
تقديم خدمات قنصلية عالية الجودة، وحماية حقوق ومصالح المواطنين السودانيين، وتعزيز العلاقات الثنائية بين السودان والمملكة العربية السعودية.

خدماتنا تشمل:
• إصدار وتجديد جوازات السفر
• توثيق المستندات والوثائق
• الوكالات القانونية
• خدمات الأحوال المدنية
• الخدمات التعليمية والثقافية
• الخدمات الاجتماعية
• متابعة قضايا ومشاكل المواطنين

نحن هنا لخدمتكم دائماً',
  'The Consulate General of the Republic of Sudan in Jeddah is the official representative of the Government of the Republic of Sudan in the Western Region of the Kingdom of Saudi Arabia.

The Consulate was established to serve the esteemed Sudanese community in the Kingdom of Saudi Arabia, which is one of the largest Arab communities residing in the Kingdom.

Our Vision:
To be the model consulate in providing distinguished, fast, and facilitated consular services to members of the Sudanese community.

Our Mission:
Providing high-quality consular services, protecting the rights and interests of Sudanese citizens, and strengthening bilateral relations between Sudan and the Kingdom of Saudi Arabia.

Our services include:
• Issuing and renewing passports
• Authentication of documents
• Legal power of attorney
• Civil status services
• Educational and cultural services
• Social services
• Follow-up on citizens'' issues and problems

We are always here to serve you',
  2,
  true
);

-- إضافة السفير الحالي
INSERT INTO ambassadors (name_ar, name_en, biography_ar, biography_en, term_start_date, is_current, order_index, is_active)
VALUES (
  'السفير محمد أحمد الصادق',
  'Ambassador Mohamed Ahmed Al-Sadiq',
  'السفير محمد أحمد الصادق هو القنصل العام الحالي لجمهورية السودان في جدة.

المؤهلات العلمية:
• بكالوريوس في العلوم السياسية - جامعة الخرطوم
• ماجستير في العلاقات الدولية - جامعة القاهرة
• دبلوم في الدراسات الدبلوماسية - معهد الدراسات الدبلوماسية بالخرطوم

الخبرات العملية:
• سفير سابق في عدة دول
• مدير إدارة الشؤون العربية بوزارة الخارجية السودانية
• عمل في عدة بعثات دبلوماسية سودانية
• خبرة تزيد عن 25 عاماً في العمل الدبلوماسي

الإنجازات:
• تطوير وتحديث الخدمات القنصلية
• تعزيز العلاقات السودانية السعودية
• حل العديد من قضايا المواطنين
• إطلاق نظام الخدمات الإلكترونية

اللغات:
• العربية (اللغة الأم)
• الإنجليزية (إجادة تامة)
• الفرنسية (جيد)',
  'Ambassador Mohamed Ahmed Al-Sadiq is the current Consul General of the Republic of Sudan in Jeddah.

Academic Qualifications:
• Bachelor''s in Political Science - University of Khartoum
• Master''s in International Relations - Cairo University
• Diploma in Diplomatic Studies - Institute of Diplomatic Studies, Khartoum

Professional Experience:
• Former Ambassador to several countries
• Director of Arab Affairs Department at the Sudanese Ministry of Foreign Affairs
• Worked in several Sudanese diplomatic missions
• Over 25 years of experience in diplomatic work

Achievements:
• Development and modernization of consular services
• Strengthening Sudanese-Saudi relations
• Resolving many citizens'' issues
• Launching electronic services system

Languages:
• Arabic (Native)
• English (Fluent)
• French (Good)',
  '2022-01-15',
  true,
  1,
  true
);

-- إضافة سفراء سابقين
INSERT INTO ambassadors (name_ar, name_en, biography_ar, biography_en, term_start_date, term_end_date, is_current, order_index, is_active)
VALUES 
(
  'السفير عبد الرحمن علي حسن',
  'Ambassador Abdulrahman Ali Hassan',
  'السفير عبد الرحمن علي حسن شغل منصب القنصل العام لجمهورية السودان في جدة خلال الفترة من 2018 إلى 2021.

قام خلال فترة عمله بتحديث العديد من الإجراءات القنصلية وتطوير خدمات الجالية السودانية. كان له دور بارز في تعزيز العلاقات الثنائية بين السودان والمملكة العربية السعودية.

من إنجازاته:
• تحسين أوقات إنجاز المعاملات
• افتتاح مكاتب استقبال جديدة
• تطوير نظام المواعيد
• تعزيز التواصل مع الجالية',
  'Ambassador Abdulrahman Ali Hassan served as Consul General of the Republic of Sudan in Jeddah from 2018 to 2021.

During his tenure, he updated many consular procedures and developed services for the Sudanese community. He played a prominent role in strengthening bilateral relations between Sudan and the Kingdom of Saudi Arabia.

His achievements include:
• Improving transaction completion times
• Opening new reception offices
• Developing the appointment system
• Enhancing communication with the community',
  '2018-03-01',
  '2021-12-31',
  false,
  2,
  true
),
(
  'السفير خالد محمد إبراهيم',
  'Ambassador Khaled Mohamed Ibrahim',
  'السفير خالد محمد إبراهيم خدم كقنصل عام لجمهورية السودان في جدة من 2015 إلى 2018.

تميزت فترة عمله بالاهتمام بالشؤون الاجتماعية للجالية والعمل على حل المشكلات والقضايا التي تواجه المواطنين السودانيين في المملكة.

من مساهماته:
• إنشاء قاعدة بيانات للجالية
• تطوير الخدمات الاجتماعية
• تعزيز التعاون مع السلطات السعودية',
  'Ambassador Khaled Mohamed Ibrahim served as Consul General of the Republic of Sudan in Jeddah from 2015 to 2018.

His tenure was characterized by attention to the social affairs of the community and working to solve problems and issues facing Sudanese citizens in the Kingdom.

His contributions include:
• Creating a community database
• Developing social services
• Strengthening cooperation with Saudi authorities',
  '2015-06-01',
  '2018-02-28',
  false,
  3,
  true
);

-- إضافة خطوات دليل المعاملات
INSERT INTO services_guide_sections (title_ar, title_en, content_ar, content_en, step_number, order_index, is_active)
VALUES 
(
  'التسجيل في الموقع الإلكتروني',
  'Website Registration',
  'الخطوة الأولى لاستخدام خدمات القنصلية الإلكترونية هي التسجيل في الموقع:

1. انقر على زر "إنشاء حساب" في أعلى الصفحة
2. أدخل معلوماتك الشخصية:
   - الاسم الكامل
   - رقم الهاتف
   - البريد الإلكتروني
   - رقم الجواز أو الرقم الوطني
3. اختر كلمة مرور قوية
4. أدخل رمز التحقق المرسل إلى هاتفك
5. اضغط على "تسجيل"

ملاحظات مهمة:
• احتفظ ببيانات الدخول في مكان آمن
• استخدم بريد إلكتروني نشط
• تأكد من صحة رقم الهاتف للتواصل',
  'The first step to using the Consulate''s electronic services is to register on the website:

1. Click the "Create Account" button at the top of the page
2. Enter your personal information:
   - Full name
   - Phone number
   - Email address
   - Passport or National ID number
3. Choose a strong password
4. Enter the verification code sent to your phone
5. Click "Register"

Important notes:
• Keep your login credentials in a safe place
• Use an active email address
• Ensure the phone number is correct for communication',
  1,
  1,
  true
),
(
  'اختيار الخدمة المطلوبة',
  'Selecting the Required Service',
  'بعد تسجيل الدخول، يمكنك اختيار الخدمة القنصلية المطلوبة:

1. من القائمة الرئيسية، اختر "الخدمات القنصلية"
2. ستظهر لك قائمة بجميع الخدمات المتاحة:
   - جوازات السفر
   - التوثيقات والشهادات
   - الوكالات القانونية
   - خدمات الأحوال المدنية
   - الخدمات التعليمية
   - وغيرها
3. اضغط على الخدمة المطلوبة
4. اقرأ الشروط والمتطلبات بعناية
5. اضغط على "تقديم طلب"

نصيحة:
راجع قائمة المستندات المطلوبة قبل البدء في تعبئة الطلب لتجهيزها مسبقاً.',
  'After logging in, you can select the required consular service:

1. From the main menu, select "Consular Services"
2. A list of all available services will appear:
   - Passports
   - Attestations and certificates
   - Legal power of attorney
   - Civil status services
   - Educational services
   - And others
3. Click on the required service
4. Read the terms and requirements carefully
5. Click "Submit Application"

Tip:
Review the list of required documents before starting to fill out the application to prepare them in advance.',
  2,
  2,
  true
),
(
  'تعبئة نموذج الطلب',
  'Filling Out the Application Form',
  'قم بتعبئة جميع حقول النموذج بدقة واهتمام:

1. املأ المعلومات الشخصية:
   - الاسم الكامل كما في الجواز
   - تاريخ الميلاد
   - الجنسية
   - مكان الإقامة الحالي
2. أدخل معلومات الاتصال:
   - رقم الهاتف
   - البريد الإلكتروني
   - العنوان
3. املأ البيانات الخاصة بالخدمة المطلوبة
4. راجع جميع المعلومات قبل الحفظ

تنبيهات:
• تأكد من صحة جميع البيانات المدخلة
• الأسماء يجب أن تكون مطابقة للوثائق الرسمية
• استخدم أرقام هواتف نشطة
• يمكنك حفظ النموذج والعودة لإكماله لاحقاً',
  'Fill out all form fields accurately and carefully:

1. Complete personal information:
   - Full name as it appears in passport
   - Date of birth
   - Nationality
   - Current place of residence
2. Enter contact information:
   - Phone number
   - Email address
   - Address
3. Fill in the data specific to the required service
4. Review all information before saving

Alerts:
• Ensure all entered data is correct
• Names must match official documents
• Use active phone numbers
• You can save the form and return to complete it later',
  3,
  3,
  true
),
(
  'رفع المستندات المطلوبة',
  'Uploading Required Documents',
  'يجب رفع جميع المستندات المطلوبة للخدمة:

1. قم بمسح أو تصوير المستندات بوضوح
2. تأكد من أن الصورة واضحة وقابلة للقراءة
3. الصيغ المقبولة: PDF, JPG, PNG
4. الحجم الأقصى لكل ملف: 5 ميجابايت
5. اضغط على "رفع ملف" لكل مستند
6. انتظر حتى يكتمل الرفع

المستندات الأساسية عادة تشمل:
• صورة جواز السفر
• صورة الإقامة (إن وجدت)
• الصورة الشخصية
• مستندات إضافية حسب نوع الخدمة

ملاحظة: المستندات غير الواضحة أو المعيبة قد تؤدي لرفض الطلب.',
  'All required documents for the service must be uploaded:

1. Scan or photograph documents clearly
2. Ensure the image is clear and readable
3. Accepted formats: PDF, JPG, PNG
4. Maximum file size: 5 MB
5. Click "Upload File" for each document
6. Wait until upload is complete

Basic documents usually include:
• Passport photo
• Residence photo (if available)
• Personal photo
• Additional documents according to service type

Note: Unclear or defective documents may lead to application rejection.',
  4,
  4,
  true
),
(
  'الدفع الإلكتروني',
  'Electronic Payment',
  'بعد إكمال النموذج ورفع المستندات، يجب دفع رسوم الخدمة:

1. ستظهر لك تفاصيل الفاتورة مع المبلغ المطلوب
2. اختر طريقة الدفع المناسبة:
   - بطاقة ائتمان/مدى
   - Apple Pay
   - STCPay
   - تحويل بنكي
3. أدخل بيانات الدفع بشكل صحيح
4. اضغط على "إتمام الدفع"
5. انتظر رسالة تأكيد الدفع

بعد الدفع الناجح:
• ستحصل على إيصال إلكتروني
• سيتم تفعيل الطلب تلقائياً
• ستصلك رسالة تأكيد عبر البريد الإلكتروني والرسائل القصيرة

تنبيه: احتفظ برقم الإيصال للمتابعة والاستعلام.',
  'After completing the form and uploading documents, you must pay the service fees:

1. Invoice details with the required amount will be displayed
2. Choose the appropriate payment method:
   - Credit/Debit Card
   - Apple Pay
   - STCPay
   - Bank Transfer
3. Enter payment information correctly
4. Click "Complete Payment"
5. Wait for payment confirmation message

After successful payment:
• You will receive an electronic receipt
• The application will be automatically activated
• You will receive a confirmation message via email and SMS

Alert: Keep the receipt number for follow-up and inquiry.',
  5,
  5,
  true
),
(
  'حجز موعد القنصلية',
  'Booking Consulate Appointment',
  'بعض الخدمات تتطلب حضوراً شخصياً في القنصلية:

1. بعد تقديم الطلب، اختر "حجز موعد"
2. اختر التاريخ المناسب من التقويم
3. اختر الوقت المتاح
4. قم بتأكيد الموعد
5. ستصلك رسالة تأكيد تحتوي على:
   - رقم الموعد
   - التاريخ والوقت
   - المستندات المطلوب إحضارها
   - تعليمات الحضور

عند الحضور للقنصلية:
• أحضر المستندات الأصلية
• التزم بالوقت المحدد
• أحضر نسخة من تأكيد الموعد
• ارتدِ ملابس محتشمة

ملاحظة: يمكنك إلغاء أو تعديل الموعد قبل 24 ساعة على الأقل.',
  'Some services require personal attendance at the Consulate:

1. After submitting the application, select "Book Appointment"
2. Choose the appropriate date from the calendar
3. Select available time
4. Confirm the appointment
5. You will receive a confirmation message containing:
   - Appointment number
   - Date and time
   - Documents required to bring
   - Attendance instructions

When attending the Consulate:
• Bring original documents
• Adhere to the specified time
• Bring a copy of the appointment confirmation
• Wear modest clothing

Note: You can cancel or modify the appointment at least 24 hours in advance.',
  6,
  6,
  true
),
(
  'تتبع حالة الطلب',
  'Tracking Application Status',
  'يمكنك متابعة حالة طلبك في أي وقت:

1. سجل الدخول إلى حسابك
2. اذهب إلى "طلباتي"
3. اختر الطلب الذي تريد متابعته
4. ستظهر لك حالة الطلب:
   - قيد المراجعة
   - تم القبول
   - قيد المعالجة
   - جاهز للاستلام
   - مكتمل

يمكنك أيضاً:
• تتبع الطلب برقم المرجع من صفحة "تتبع المعاملة"
• استلام إشعارات عند تغيير الحالة
• التواصل مع القنصلية للاستفسار

طرق الاستعلام:
• عبر الموقع الإلكتروني
• عبر رسالة SMS
• عبر البريد الإلكتروني
• بالاتصال الهاتفي',
  'You can follow the status of your application at any time:

1. Log in to your account
2. Go to "My Applications"
3. Select the application you want to follow
4. The application status will be displayed:
   - Under Review
   - Accepted
   - In Processing
   - Ready for Collection
   - Completed

You can also:
• Track the application by reference number from the "Track Transaction" page
• Receive notifications when status changes
• Contact the Consulate for inquiries

Inquiry methods:
• Via the website
• Via SMS message
• Via email
• By phone call',
  7,
  7,
  true
),
(
  'استلام الوثيقة',
  'Document Collection',
  'بعد اكتمال معالجة طلبك:

1. ستصلك رسالة إشعار بجاهزية الوثيقة
2. اختر طريقة الاستلام:
   • الاستلام من القنصلية مباشرة
   • الشحن عبر شركة الشحن

للاستلام من القنصلية:
• أحضر بطاقة الهوية الأصلية
• أحضر إيصال الدفع
• أحضر رقم الطلب
• التزم بأوقات الدوام الرسمي

للشحن:
• اختر شركة الشحن المفضلة
• أدخل عنوان الشحن بدقة
• ادفع رسوم الشحن
• تابع رحلة الشحن

مهم:
• تحقق من صحة البيانات في الوثيقة فور استلامها
• أي ملاحظات يجب إبلاغ القنصلية بها فوراً
• احتفظ بالوثيقة في مكان آمن',
  'After your application processing is complete:

1. You will receive a notification message that the document is ready
2. Choose the collection method:
   • Direct collection from the Consulate
   • Shipping via shipping company

For collection from the Consulate:
• Bring original ID card
• Bring payment receipt
• Bring application number
• Adhere to official working hours

For shipping:
• Choose preferred shipping company
• Enter shipping address accurately
• Pay shipping fees
• Track the shipment

Important:
• Verify the accuracy of the data in the document upon receipt
• Any comments must be reported to the Consulate immediately
• Keep the document in a safe place',
  8,
  8,
  true
);

-- إضافة روابط المواقع المهمة
INSERT INTO important_links (title_ar, title_en, description_ar, description_en, url, category, order_index, opens_new_tab, is_active)
VALUES 
-- جهات حكومية
(
  'وزارة الخارجية السودانية',
  'Sudanese Ministry of Foreign Affairs',
  'الموقع الرسمي لوزارة الخارجية السودانية',
  'Official website of the Sudanese Ministry of Foreign Affairs',
  'https://www.mofa.gov.sd',
  'ministry',
  1,
  true,
  true
),
(
  'رئاسة الجمهورية',
  'Presidency of the Republic',
  'الموقع الرسمي لرئاسة جمهورية السودان',
  'Official website of the Presidency of the Republic of Sudan',
  'https://www.presidency.gov.sd',
  'government',
  2,
  true,
  true
),
(
  'مجلس الوزراء السوداني',
  'Sudanese Council of Ministers',
  'الموقع الرسمي لمجلس الوزراء',
  'Official website of the Council of Ministers',
  'https://www.sudan.gov.sd',
  'government',
  3,
  true,
  true
),
-- وزارات
(
  'وزارة الداخلية',
  'Ministry of Interior',
  'الموقع الرسمي لوزارة الداخلية السودانية',
  'Official website of the Sudanese Ministry of Interior',
  'https://www.moi.gov.sd',
  'ministry',
  4,
  true,
  true
),
(
  'وزارة العدل',
  'Ministry of Justice',
  'الموقع الرسمي لوزارة العدل السودانية',
  'Official website of the Sudanese Ministry of Justice',
  'https://www.moj.gov.sd',
  'ministry',
  5,
  true,
  true
),
(
  'وزارة التربية والتعليم',
  'Ministry of Education',
  'الموقع الرسمي لوزارة التربية والتعليم',
  'Official website of the Ministry of Education',
  'https://www.moe.gov.sd',
  'education',
  6,
  true,
  true
),
(
  'وزارة التعليم العالي والبحث العلمي',
  'Ministry of Higher Education',
  'الموقع الرسمي لوزارة التعليم العالي والبحث العلمي',
  'Official website of the Ministry of Higher Education',
  'https://www.mohe.gov.sd',
  'education',
  7,
  true,
  true
),
-- جهات سعودية مهمة
(
  'منصة أبشر',
  'Absher Platform',
  'منصة أبشر للخدمات الإلكترونية في المملكة',
  'Absher platform for electronic services in the Kingdom',
  'https://www.absher.sa',
  'government',
  8,
  true,
  true
),
(
  'المديرية العامة للجوازات',
  'General Directorate of Passports',
  'المديرية العامة للجوازات - المملكة العربية السعودية',
  'General Directorate of Passports - Saudi Arabia',
  'https://www.gdp.gov.sa',
  'government',
  9,
  true,
  true
),
(
  'وزارة الخارجية السعودية',
  'Saudi Ministry of Foreign Affairs',
  'الموقع الرسمي لوزارة الخارجية السعودية',
  'Official website of Saudi Ministry of Foreign Affairs',
  'https://www.mofa.gov.sa',
  'ministry',
  10,
  true,
  true
),
-- منظمات وهيئات
(
  'الأمم المتحدة',
  'United Nations',
  'موقع الأمم المتحدة',
  'United Nations website',
  'https://www.un.org',
  'general',
  11,
  true,
  true
),
(
  'جامعة الدول العربية',
  'Arab League',
  'الموقع الرسمي لجامعة الدول العربية',
  'Official website of the Arab League',
  'https://www.arableagueonline.org',
  'general',
  12,
  true,
  true
),
-- خدمات مفيدة
(
  'البنك المركزي السوداني',
  'Central Bank of Sudan',
  'الموقع الرسمي للبنك المركزي السوداني',
  'Official website of the Central Bank of Sudan',
  'https://www.cbos.gov.sd',
  'general',
  13,
  true,
  true
),
(
  'هيئة الطيران المدني السوداني',
  'Sudan Civil Aviation Authority',
  'الموقع الرسمي لهيئة الطيران المدني',
  'Official website of Sudan Civil Aviation Authority',
  'https://www.scaa.gov.sd',
  'general',
  14,
  true,
  true
);

-- عرض ملخص البيانات المضافة
DO $$
BEGIN
  RAISE NOTICE 'تم إضافة البيانات التجريبية بنجاح:';
  RAISE NOTICE '- % أقسام عن القنصلية', (SELECT COUNT(*) FROM about_consulate_sections);
  RAISE NOTICE '- % سفراء', (SELECT COUNT(*) FROM ambassadors);
  RAISE NOTICE '- % خطوات دليل المعاملات', (SELECT COUNT(*) FROM services_guide_sections);
  RAISE NOTICE '- % روابط مواقع مهمة', (SELECT COUNT(*) FROM important_links);
END $$;