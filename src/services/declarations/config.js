export const declarationsConfig = {
  id: 'declarations',
  title: 'الإقرارات',
  description: 'إصدار إقرارات رسمية ومشفوعة باليمين',
  icon: 'FileCheck',
  category: 'legal',
  hasSubcategories: true,
  subcategories: [
    {
      id: 'regular',
      title: 'إقرار',
      description: 'إقرارات عادية لمختلف الأغراض',
      icon: '📄',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      route: '/services/declarations/regular'
    },
    {
      id: 'sworn',
      title: 'إقرار مشفوع باليمين',
      description: 'إقرارات مشفوعة باليمين للأغراض القانونية',
      icon: '⚖️',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      route: '/services/declarations/sworn'
    }
  ],
  requirements: [
    'حضور المقر شخصياً',
    'إثبات الهوية',
    'تحديد موضوع الإقرار بوضوح',
    'شهود (عند الحاجة)'
  ],
  fees: { base: 100, currency: 'ريال سعودي' },
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
      id: 'declaration-type',
      title: 'نوع الإقرار',
      fields: [
        {
          name: 'declarationType',
          label: 'نوع الإقرار الرئيسي',
          type: 'searchable-select',
          options: [
            { value: 'regular', label: 'إقرار', description: 'إقرارات عادية لمختلف الأغراض' },
            { value: 'sworn', label: 'إقرار مشفوع باليمين', description: 'إقرارات مشفوعة باليمين للأغراض القانونية' }
          ],
          required: true,
          validation: { required: 'نوع الإقرار مطلوب' }
        },
        {
          name: 'declarationSubtype',
          label: 'التفاصيل المحددة',
          type: 'searchable-select',
          options: [], // Will be populated dynamically
          required: true,
          validation: { required: 'يرجى اختيار تفاصيل الإقرار' }
        },
        // حقول شرطية للإقرارات العادية
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
          conditional: { field: 'declarationSubtype', values: ['family_travel_consent', 'wife_travel_consent', 'children_travel_companion', 'children_travel_only'] },
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
          name: 'wifeName',
          label: 'اسم الزوجة الكامل',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['wife_travel_consent', 'children_documents_wife_travel', 'children_documents_travel'] },
          validation: { required: 'اسم الزوجة مطلوب' }
        },
        {
          name: 'groomName',
          label: 'اسم العريس الكامل',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'اسم العريس مطلوب' }
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
          name: 'marriageDate',
          label: 'تاريخ الزواج المتوقع',
          type: 'date',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['marriage_no_objection'] },
          validation: { required: 'تاريخ الزواج مطلوب' }
        },
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
        // حقول الإقرارات المشفوعة باليمين
        {
          name: 'declarationSubject',
          label: 'موضوع الإقرار',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['general_sworn', 'general_sworn_2'] },
          validation: { required: 'موضوع الإقرار مطلوب' }
        },
        {
          name: 'declarationContent',
          label: 'نص الإقرار',
          type: 'textarea',
          required: true,
          rows: 5,
          conditional: { field: 'declarationSubtype', values: ['general_sworn', 'general_sworn_2', 'sworn_english'] },
          validation: { required: 'نص الإقرار مطلوب' }
        },
        {
          name: 'personName',
          label: 'اسم الشخص',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['age_of_majority', 'proof_of_life', 'marital_status_single', 'marital_status_widow', 'marital_status_single_2'] },
          validation: { required: 'اسم الشخص مطلوب' }
        },
        {
          name: 'currentAge',
          label: 'العمر الحالي',
          type: 'number',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['age_of_majority'] },
          validation: { required: 'العمر الحالي مطلوب' }
        },
        {
          name: 'childName',
          label: 'اسم الطفل/الشخص',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['paternity_proof'] },
          validation: { required: 'اسم الطفل مطلوب' }
        },
        {
          name: 'fatherName',
          label: 'اسم الوالد',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['paternity_proof'] },
          validation: { required: 'اسم الوالد مطلوب' }
        },
        {
          name: 'motherName',
          label: 'اسم الوالدة',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['paternity_proof'] },
          validation: { required: 'اسم الوالدة مطلوب' }
        },
        {
          name: 'birthPlace',
          label: 'مكان الميلاد',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['paternity_proof'] },
          validation: { required: 'مكان الميلاد مطلوب' }
        },
        {
          name: 'exemptionReason',
          label: 'سبب الإعفاء',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['partial_exit_exemption'] },
          validation: { required: 'سبب الإعفاء مطلوب' }
        },
        {
          name: 'lastSeenDate',
          label: 'تاريخ آخر مشاهدة',
          type: 'date',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['proof_of_life'] },
          validation: { required: 'تاريخ آخر مشاهدة مطلوب' }
        },
        {
          name: 'currentLocation',
          label: 'المكان الحالي للشخص',
          type: 'text',
          required: true,
          conditional: { field: 'declarationSubtype', values: ['proof_of_life'] },
          validation: { required: 'المكان الحالي مطلوب' }
        },
        {
          name: 'landDetails',
          label: 'تفاصيل أراضي الحرفيين',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'declarationSubtype', values: ['craftsmen_lands'] },
          validation: { required: 'تفاصيل أراضي الحرفيين مطلوبة' }
        },
        {
          name: 'agentDismissalReason',
          label: 'سبب عزل الموكل',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['agent_dismissal', 'agent_dismissal_2'] },
          validation: { required: 'سبب عزل الموكل مطلوب' }
        },
        {
          name: 'documentsDetails',
          label: 'تفاصيل الوثائق',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['document_authenticity'] },
          validation: { required: 'تفاصيل الوثائق مطلوبة' }
        },
        {
          name: 'nameIdentityDetails',
          label: 'تفاصيل الأسماء',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'declarationSubtype', values: ['name_identity'] },
          validation: { required: 'تفاصيل الأسماء مطلوبة' }
        },
        {
          name: 'housingPlanDetails',
          label: 'تفاصيل الخطة الإسكانية',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'declarationSubtype', values: ['housing_plan'] },
          validation: { required: 'تفاصيل الخطة الإسكانية مطلوبة' }
        },
        {
          name: 'otherDetails',
          label: 'تفاصيل أخرى',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { field: 'declarationSubtype', values: ['other_regular', 'other_sworn'] },
          validation: { required: 'التفاصيل مطلوبة' }
        },
        // حقول الشهود للإقرارات المشفوعة باليمين
        {
          name: 'witnessName1',
          label: 'اسم الشاهد الأول',
          type: 'text',
          required: true,
          conditional: { field: 'declarationType', values: ['sworn'] },
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witnessId1',
          label: 'رقم هوية الشاهد الأول',
          type: 'text',
          required: true,
          conditional: { field: 'declarationType', values: ['sworn'] },
          validation: { required: 'رقم هوية الشاهد الأول مطلوب' }
        },
        {
          name: 'witnessName2',
          label: 'اسم الشاهد الثاني',
          type: 'text',
          required: false,
          conditional: { field: 'declarationType', values: ['sworn'] }
        },
        {
          name: 'witnessId2',
          label: 'رقم هوية الشاهد الثاني',
          type: 'text',
          required: false,
          conditional: { field: 'declarationType', values: ['sworn'] }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'passportCopy',
          label: 'صورة الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز مطلوبة' }
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
        },
        {
          name: 'witnessId1Copy',
          label: 'صورة هوية الشاهد الأول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'declarationType', values: ['sworn'] },
          validation: { required: 'صورة هوية الشاهد الأول مطلوبة' }
        },
        {
          name: 'witnessId2Copy',
          label: 'صورة هوية الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB',
          conditional: { field: 'declarationType', values: ['sworn'] }
        }
      ]
    }
  ]
};

export const declarationSubtypes = {
  regular: [
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
  sworn: [
    { value: "general_sworn", label: "إقرار مشفوع باليمين", description: "إقرار عام مشفوع باليمين" },
    { value: "age_of_majority", label: "إقرار مشفوع باليمين (بلوغ سن الرشد)", description: "إثبات بلوغ سن الرشد" },
    { value: "paternity_proof", label: "إقرار مشفوع باليمين (إقرار إثبات نسب)", description: "إثبات النسب والقرابة" },
    { value: "partial_exit_exemption", label: "إقرار مشفوع باليمين (إعفاء خروج جزئي)", description: "إقرار إعفاء خروج جزئي" },
    { value: "proof_of_life", label: "إقرار مشفوع باليمين (إثبات حياة)", description: "إثبات أن الشخص على قيد الحياة" },
    { value: "craftsmen_lands", label: "إقرار مشفوع باليمين (أراضي الحرفيين)", description: "إقرار خاص بأراضي الحرفيين" },
    { value: "general_sworn_2", label: "إقرار مشفوع باليمين", description: "إقرار عام مشفوع باليمين" },
    { value: "marriage_no_objection_sworn", label: "استمارة عدم ممانعة وشهادة كفاءة زواج", description: "إقرار عدم ممانعة الزواج مشفوع باليمين" },
    { value: "marital_status_single", label: "إثبات حالة إجتماعية (غير متزوج/ة)", description: "إثبات الحالة الاجتماعية - أعزب" },
    { value: "agent_dismissal", label: "إقرار مشفوع باليمين (إقرار بعزل موكل من وكالة)", description: "إقرار عزل موكل من وكالة" },
    { value: "marital_status_widow", label: "إقرار مشفوع باليمين (إثبات حالة إجتماعية أرملة)", description: "إثبات الحالة الاجتماعية - أرملة" },
    { value: "sworn_english", label: "إقرار باليمين (باللغة الانجليزية)", description: "إقرار مشفوع باليمين باللغة الإنجليزية" },
    { value: "marital_status_single_2", label: "إقرار مشفوع باليمين (إثبات حالة إجتماعية غير متزوج)", description: "إثبات الحالة الاجتماعية - غير متزوج" },
    { value: "agent_dismissal_2", label: "إقرار مشفوع باليمين (إقرار عزل موكل)", description: "إقرار عزل موكل" },
    { value: "document_authenticity", label: "إقرار مشفوع باليمين (إثبات صحة وثائق)", description: "إثبات صحة الوثائق والمستندات" },
    { value: "name_identity", label: "إقرار مشفوع باليمين (إثبات اسمان لذات واحدة)", description: "إثبات أن اسمين لشخص واحد" },
    { value: "housing_plan", label: "إقرار مشفوع باليمين (خطة إسكانية)", description: "إقرار خاص بالخطة الإسكانية" },
    { value: "other_sworn", label: "اخرى", description: "إقرارات أخرى مشفوعة باليمين" }
  ]
};

export default declarationsConfig;
