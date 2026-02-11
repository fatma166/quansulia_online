export const regularDeclarationsConfig = {
  id: 'regular_declarations',
  title: 'الإقرارات العادية',
  description: 'إصدار إقرارات عادية لمختلف الأغراض',
  icon: 'FileText',
  category: 'legal',
  requirements: [
    'حضور المقر شخصياً',
    'إثبات الهوية',
    'تحديد موضوع الإقرار بوضوح'
  ],
  fees: { base: 80, currency: 'ريال سعودي' },
  duration: '1 يوم عمل',
  process: [
    'تحديد نوع الإقرار المطلوب',
    'ملء البيانات المطلوبة',
    'حضور المقر شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق الإقرار'
  ],
  steps: [
    {
      id: 'declaration-details',
      title: 'تفاصيل الإقرار',
      fields: [
        {
          name: 'declarationAuthority',
          label: 'جهة الإقرار',
          type: 'text',
          required: true,
          validation: { required: 'جهة الإقرار مطلوبة' }
        },
        {
          name: 'declarationSubtype',
          label: 'نوع الإقرار',
          type: 'searchable-select',
          options: [
            { value: "family_travel_consent", label: "موافقة بالسفر لأفراد أسرة", description: "إقرار موافقة على سفر أفراد الأسرة" },
            { value: "wife_travel_consent", label: "موافقة سفر الزوجة", description: "إقرار موافقة على سفر الزوجة" },
            { value: "marriage_no_objection", label: "استمارة عدم ممانعة وشهادة كفاءة زواج", description: "إقرار عدم الممانعة وشهادة الكفاءة للزواج" },
            { value: "family_support", label: "إقرار إعالة أسرية", description: "إقرار بالإعالة الأسرية" },
            { value: "children_travel_documents", label: "إقرار بموافقة السفر واستخراج مستندات للابناء", description: "إقرار موافقة السفر واستخراج مستندات للأطفال" },
            { value: "children_documents_wife_travel", label: "إقرار بموافقة استخراج مستندات للأبناء والسفر بمرافقة الزوجة", description: "إقرار موافقة استخراج مستندات للأطفال والسفر مع الزوجة" },
            { value: "children_id_passport", label: "إقرار باستخراج رقم وطني وجواز سفر للأبناء", description: "إقرار موافقة استخراج هوية وجواز للأطفال" },
            { value: "children_travel_companion", label: "موافقة بسفر للأبناء برفقة مرافق غير الزوجة", description: "إقرار موافقة سفر الأطفال مع مرافق آخر" },
            { value: "children_documents_travel", label: "موافقة استخراج مستندات للأبناء والسفر بمرافقة الزوجة", description: "إقرار موافقة استخراج مستندات والسفر مع الزوجة" },
            { value: "children_travel_only", label: "موافقة بسفر للأبناء", description: "إقرار موافقة سفر الأطفال فقط" },
            { value: "sponsorship_transfer_to_applicant", label: "إقرار بنقل كفالة طرف ثاني إلى كفالة مقدم الطلب", description: "إقرار نقل كفالة من طرف ثاني إلى مقدم الطلب" },
            { value: "sponsorship_transfer_from_applicant", label: "إقرار بنقل كفالة مقدم الطلب إلى كفالة طرف ثاني", description: "إقرار نقل كفالة من مقدم الطلب إلى طرف ثاني" },
            { value: "recruitment_third_party", label: "إقرار باستقدام على كفالة طرف ثاني", description: "إقرار استقدام على كفالة طرف ثاني" },
            { value: "sponsored_transfer", label: "إقرار بنقل كفالة مكفول مقدم الطلب إلى كفالة طرف ثاني", description: "إقرار نقل كفالة مكفول إلى طرف ثاني" },
            { value: "name_attribution", label: "إقرار بإسناد اسمين أو عدة اسماء لذات واحدة", description: "إقرار إسناد أسماء متعددة لشخص واحد" },
            { value: "family_details", label: "إقرار بتفاصل أفراد الأسرة", description: "إقرار تفاصيل أفراد الأسرة" },
            { value: "name_correction_form", label: "استمارة اشهاد تصحيح الاسم", description: "إقرار تصحيح الاسم في الوثائق" },
            { value: "court_appearance", label: "الظهور في دعوى", description: "إقرار الظهور في دعوى قضائية" },
            { value: "vehicle_procedures", label: "إجراءات سيارة", description: "إقرار خاص بإجراءات السيارات" },
            { value: "waiver_declaration", label: "إقرار بالتنازل", description: "إقرار تنازل عن حق أو ملكية" },
            { value: "agreement_declaration", label: "إقرار بالاتفاق", description: "إقرار اتفاق بين الأطراف" },
            { value: "study_support_foreign_english", label: "إقرار لدعم دراسة بدولة أجنبية (إنجليزي)", description: "إقرار دعم دراسة بدولة أجنبية - يملأ باللغة الإنجليزية" },
            { value: "study_support_foreign", label: "إقرار لدعم دراسة بدولة أجنبية", description: "إقرار دعم دراسة بدولة أجنبية" },
            { value: "study_georgia_english", label: "إقرار بالموافقة للدراسة بجورجيا (إنجليزي)", description: "إقرار موافقة للدراسة في جورجيا - يملأ باللغة الإنجليزية" },
            { value: "family_separation", label: "إقرار بإفراد الأسرة", description: "إقرار إفراد الأسرة" },
            { value: "work_travel_no_objection", label: "عدم ممانعة السفر للعمل", description: "إقرار عدم ممانعة السفر للعمل" },
            { value: "body_covering", label: "إقرار بشأن ستر جثمان", description: "إقرار خاص بستر الجثمان" },
            { value: "other_regular", label: "اخرى", description: "إقرارات أخرى" }
          ],
          required: true,
          validation: { required: 'نوع الإقرار مطلوب' }
        },
        // حقول شرطية للسفر
        {
          name: 'familyMembers',
          label: 'أفراد الأسرة المسافرين',
          type: 'dynamic-list',
          required: true,
          buttonText: 'إضافة عائلة',
          fields: [
            { name: 'name', label: 'الاسم', type: 'text', required: true },
            {
              name: 'birthDay',
              label: 'اليوم',
              label_ar: 'اليوم',
              type: 'select',
              options: Array.from({ length: 31 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1)
              })),
              required: true,
              validation: { required: 'اليوم مطلوب' }
            },
            {
              name: 'birthMonth',
              label: 'الشهر',
              label_ar: 'الشهر',
              type: 'select',
              options: [
                { value: '1', label: 'يناير' },
                { value: '2', label: 'فبراير' },
                { value: '3', label: 'مارس' },
                { value: '4', label: 'أبريل' },
                { value: '5', label: 'مايو' },
                { value: '6', label: 'يونيو' },
                { value: '7', label: 'يوليو' },
                { value: '8', label: 'أغسطس' },
                { value: '9', label: 'سبتمبر' },
                { value: '10', label: 'أكتوبر' },
                { value: '11', label: 'نوفمبر' },
                { value: '12', label: 'ديسمبر' }
              ],
              required: true,
              validation: { required: 'الشهر مطلوب' }
            },
            {
              name: 'birthYear',
              label: 'السنة',
              label_ar: 'السنة',
              type: 'select',
              options: Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return { value: String(year), label: String(year) };
              }),
              required: true,
              validation: { required: 'السنة مطلوبة' }
            },
            { name: 'relationship', label: 'صلة القرابة', type: 'select', required: true, options: [
              { value: 'son', label: 'ابن' },
              { value: 'daughter', label: 'ابنة' },
              { value: 'wife', label: 'زوجة' },
              { value: 'father', label: 'والد' },
              { value: 'mother', label: 'والدة' },
              { value: 'brother', label: 'أخ' },
              { value: 'sister', label: 'أخت' },
              { value: 'other', label: 'أخرى' }
            ]}
          ],
          conditional: { field: 'declarationSubtype', values: ['family_travel_consent'] },
          validation: { required: 'يجب إضافة فرد واحد على الأقل' }
        },
        {
          name: 'travelDestination',
          label: 'وجهة السفر',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['family_travel_consent', 'wife_travel_consent', 'children_travel_companion', 'children_travel_only', 'work_travel_no_objection'] },
          validation: { required: 'وجهة السفر مطلوبة' }
        },
        {
          name: 'travelPurpose',
          label: 'الغرض من السفر',
          type: 'select',
          options: [
            { value: 'tourism', label: 'سياحة' },
            { value: 'medical', label: 'علاج' },
            { value: 'education', label: 'تعليم' },
            { value: 'work', label: 'عمل' },
            { value: 'family_visit', label: 'زيارة أقارب' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'declarationSubtype', values: ['family_travel_consent', 'wife_travel_consent', 'children_travel_companion', 'children_travel_only', 'work_travel_no_objection'] },
          validation: { required: 'الغرض من السفر مطلوب' }
        },
        {
          name: 'travelDuration',
          label: 'مدة السفر',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['family_travel_consent', 'wife_travel_consent'] },
          validation: { required: 'مدة السفر مطلوبة' }
        },
        // حقول الزوجة
        {
          name: 'wifeName',
          label: 'اسم الزوجة الكامل',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['wife_travel_consent', 'children_documents_wife_travel', 'children_documents_travel'] },
          validation: { required: 'اسم الزوجة مطلوب' }
        },
        {
          name: 'wifeNationalId',
          label: 'رقم هوية الزوجة',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['wife_travel_consent'] },
          validation: { required: 'رقم هوية الزوجة مطلوب' }
        },
        {
          name: 'accompaniedByHusband',
          label: 'هل ستسافر بصحبة الزوج؟',
          type: 'radio',
          options: [
            { value: 'yes', label: 'نعم' },
            { value: 'no', label: 'لا' }
          ],
          required: true,
          conditional: { field: 'declarationSubtype', values: ['wife_travel_consent'] },
          validation: { required: 'يرجى تحديد ما إذا كانت ستسافر مع الزوج' }
        },
        // حقول الزواج
        {
          name: 'groomName',
          label: 'اسم العريس الكامل',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'اسم العريس مطلوب' }
        },
        {
          name: 'groomNationalId',
          label: 'رقم هوية العريس',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'رقم هوية العريس مطلوب' }
        },
        {
          name: 'brideName',
          label: 'اسم العروس الكامل',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'اسم العروس مطلوب' }
        },
        {
          name: 'brideNationalId',
          label: 'رقم هوية العروس',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'رقم هوية العروس مطلوب' }
        },
        {
          name: 'marriageDate',
          label: 'تاريخ الزواج المتوقع',
          type: 'date',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'تاريخ الزواج مطلوب' }
        },
        {
          name: 'marriageLocation',
          label: 'مكان إجراء الزواج',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'مكان الزواج مطلوب' }
        },
        // حقول الإعالة الأسرية
        {
          name: 'supportedPersonName',
          label: 'اسم الشخص المُعال',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['family_support'] },
          validation: { required: 'اسم الشخص المُعال مطلوب' }
        },
        {
          name: 'relationshipToSupported',
          label: 'صلة القرابة',
          type: 'select',
          options: [
            { value: 'son', label: 'ابن' },
            { value: 'daughter', label: 'ابنة' },
            { value: 'wife', label: 'زوجة' },
            { value: 'father', label: 'والد' },
            { value: 'mother', label: 'والدة' },
            { value: 'brother', label: 'أخ' },
            { value: 'sister', label: 'أخت' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'declarationSubtype', values: ['family_support'] },
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'supportReason',
          label: 'سبب الإعالة',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['family_support'] },
          validation: { required: 'سبب الإعالة مطلوب' }
        },
        // حقول الأطفال
        {
          name: 'childrenList',
          label: 'بيانات الأطفال',
          type: 'dynamic-list',
          required: true,
          buttonText: 'إضافة عائلة',
          fields: [
            { name: 'name', label: 'الاسم', type: 'text', required: true },
            { name: 'birthDate', label: 'تاريخ الميلاد', type: 'date', required: true },
            { name: 'relationship', label: 'صلة القرابة', type: 'select', required: true, options: [
              { value: 'son', label: 'ابن' },
              { value: 'daughter', label: 'ابنة' }
            ]}
          ],
          conditional: { field: 'declarationSubtype', values: ['children_travel_documents', 'children_documents_wife_travel', 'children_id_passport', 'children_travel_companion', 'children_documents_travel', 'children_travel_only'] },
          validation: { required: 'يجب إضافة طفل واحد على الأقل' }
        },
        {
          name: 'companionName',
          label: 'اسم المرافق',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['children_travel_companion'] },
          validation: { required: 'اسم المرافق مطلوب' }
        },
        {
          name: 'companionRelation',
          label: 'صلة القرابة بالمرافق',
          type: 'select',
          options: [
            { value: 'uncle', label: 'عم' },
            { value: 'aunt', label: 'عمة' },
            { value: 'grandfather', label: 'جد' },
            { value: 'grandmother', label: 'جدة' },
            { value: 'brother', label: 'أخ' },
            { value: 'sister', label: 'أخت' },
            { value: 'friend', label: 'صديق' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'declarationSubtype', values: ['children_travel_companion'] },
          validation: { required: 'صلة القرابة بالمرافق مطلوبة' }
        },
        // حقول الكفالة
        {
          name: 'sponsorshipFromParty',
          label: 'اسم الطرف الثاني (المحول منه)',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['sponsorship_transfer_to_applicant'] },
          validation: { required: 'اسم الطرف الثاني مطلوب' }
        },
        {
          name: 'sponsorshipToParty',
          label: 'اسم الطرف الثاني (المحول إليه)',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['sponsorship_transfer_from_applicant', 'recruitment_third_party', 'sponsored_transfer'] },
          validation: { required: 'اسم الطرف الثاني مطلوب' }
        },
        {
          name: 'sponsorshipReason',
          label: 'سبب نقل الكفالة',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['sponsorship_transfer_to_applicant', 'sponsorship_transfer_from_applicant', 'recruitment_third_party', 'sponsored_transfer'] },
          validation: { required: 'سبب نقل الكفالة مطلوب' }
        },
        // حقول أخرى
        {
          name: 'namesDetails',
          label: 'تفاصيل الأسماء',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['name_attribution'] },
          validation: { required: 'تفاصيل الأسماء مطلوبة' }
        },
        {
          name: 'familyDetailsList',
          label: 'أفراد الأسرة',
          type: 'dynamic-list',
          required: true,
          buttonText: 'إضافة عائلة',
          fields: [
            { name: 'name', label: 'الاسم', type: 'text', required: true },
            { name: 'birthDate', label: 'تاريخ الميلاد', type: 'date', required: true },
            { name: 'relationship', label: 'صلة القرابة', type: 'select', required: true, options: [
              { value: 'son', label: 'ابن' },
              { value: 'daughter', label: 'ابنة' },
              { value: 'wife', label: 'زوجة' },
              { value: 'father', label: 'والد' },
              { value: 'mother', label: 'والدة' },
              { value: 'brother', label: 'أخ' },
              { value: 'sister', label: 'أخت' },
              { value: 'other', label: 'أخرى' }
            ]}
          ],
          conditional: { field: 'declarationSubtype', values: ['family_details', 'family_separation'] },
          validation: { required: 'يجب إضافة فرد واحد على الأقل' }
        },
        {
          name: 'nameCorrection',
          label: 'تفاصيل تصحيح الاسم',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['name_correction_form'] },
          validation: { required: 'تفاصيل تصحيح الاسم مطلوبة' }
        },
        {
          name: 'caseDetails',
          label: 'تفاصيل الدعوى',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'declarationSubtype', values: ['court_appearance'] },
          validation: { required: 'تفاصيل الدعوى مطلوبة' }
        },
        {
          name: 'vehicleDetails',
          label: 'تفاصيل إجراءات السيارة',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['vehicle_procedures'] },
          validation: { required: 'تفاصيل إجراءات السيارة مطلوبة' }
        },
        {
          name: 'waiveDetails',
          label: 'تفاصيل التنازل',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['waiver_declaration'] },
          validation: { required: 'تفاصيل التنازل مطلوبة' }
        },
        {
          name: 'agreementDetails',
          label: 'تفاصيل الاتفاق',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'declarationSubtype', values: ['agreement_declaration'] },
          validation: { required: 'تفاصيل الاتفاق مطلوبة' }
        },
        {
          name: 'studyCountry',
          label: 'دولة الدراسة',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['study_support_foreign_english', 'study_support_foreign', 'study_georgia_english'] },
          validation: { required: 'دولة الدراسة مطلوبة' }
        },
        {
          name: 'universityName',
          label: 'اسم الجامعة',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['study_support_foreign_english', 'study_support_foreign', 'study_georgia_english'] },
          validation: { required: 'اسم الجامعة مطلوب' }
        },
        {
          name: 'studentName',
          label: 'اسم الطالب',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['study_support_foreign_english', 'study_support_foreign', 'study_georgia_english'] },
          validation: { required: 'اسم الطالب مطلوب' }
        },
        {
          name: 'workDestination',
          label: 'وجهة العمل',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['work_travel_no_objection'] },
          validation: { required: 'وجهة العمل مطلوبة' }
        },
        {
          name: 'bodyDetails',
          label: 'تفاصيل ستر الجثمان',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['body_covering'] },
          validation: { required: 'تفاصيل ستر الجثمان مطلوبة' }
        },
        {
          name: 'otherDetails',
          label: 'تفاصيل أخرى',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'declarationSubtype', values: ['other_regular'] },
          validation: { required: 'التفاصيل مطلوبة' }
        },
        {
          name: 'witness1Name',
          label: 'اسم الشاهد الأول',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witness1Id',
          label: 'رقم جواز الشاهد الأول',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          validation: { required: 'رقم جواز الشاهد الأول مطلوب' }
        },
        {
          name: 'witness2Name',
          label: 'اسم الشاهد الثاني',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الثاني مطلوب' }
        },
        {
          name: 'witness2Id',
          label: 'رقم جواز الشاهد الثاني',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          validation: { required: 'رقم جواز الشاهد الثاني مطلوب' }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'passportCopy',
          label: 'صورة الجواز أو الإقامة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز أو الإقامة مطلوبة' }
        },
        {
          name: 'supportingDocs',
          label: 'مستندات داعمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'أي مستندات إضافية تدعم الإقرار'
        }
      ]
    }
  ]
};