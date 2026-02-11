export const visasConfig = {
  id: 'visas',
  title: 'التأشيرات',
  description: 'إصدار تأشيرات دخول للسودان',
  icon: 'Plane',
  category: 'travel',

  requirements: {
    general: [
      'أصل جواز السفر ساري المفعول (صلاحية 6 أشهر على الأقل)',
      'صورة شخصية',
      'الرسوم: 375 ريال لكل الجنسيات ماعدا الجنسية الأمريكية 572 ريال',
      'تقديم الطلب بواسطة صاحب الطلب أو ولي أمره أو المندوب الرسمي لجهة العمل الضامنة'
    ],
    sudanese_origin: [
      'صورة من مستند سوداني لصاحب الطلب (جواز سفر - رقم وطني - بطاقة شخصية - بطاقة أصول سودانية)',
      'صورة مستند سوداني لضامن من الدرجة الأولى (أب - أم - أخ - أخت - ابن - ابنة - زوجة)',
      'في حالة الزوجة: إرفاق صورة من قسيمة الزواج',
      'في حالة الأم: إرفاق شهادة الميلاد أو الرقم الوطني لصاحب الطلب'
    ],
    personal_visit: [
      'زيارة شخصية (شخصية إعتبارية - قاضي - وزير)'
    ],
    business_visit: [
      'خطاب من جهة العمل المسجلة بجوازات الأجانب',
      'إرفاق هوية المندوب الرسمي المسجل بجوازات الأجانب'
    ]
  },

  fees: {
    regular: { base: 375, currency: 'ريال سعودي' },
    american: { base: 572, currency: 'ريال سعودي' }
  },

  duration: '3-5 أيام عمل',

  process: [
    'تحديد نوع التأشيرة',
    'تقديم المستندات المطلوبة',
    'مراجعة الطلب',
    'دفع الرسوم',
    'إصدار التأشيرة'
  ],

  steps: [
    {
      id: 'visa-details',
      title: 'تفاصيل الخدمة',
      fields: [
        {
          name: 'visaType',
          label: 'نوع التأشيرة',
          type: 'radio',
          options: [
            { value: 'sudanese_origin', label: 'للأصول السودانية', description: 'تأشيرة للأصول السودانية' },
            { value: 'personal_visit', label: 'زيارة شخصية', description: 'شخصية إعتبارية - قاضي - وزير' },
            { value: 'business_visit', label: 'زيارة الأعمال', description: 'للأعمال التجارية' }
          ],
          required: true,
          validation: { required: 'نوع التأشيرة مطلوب' }
        },
        {
          name: 'passportExpiry',
          label: 'تاريخ انتهاء الجواز',
          type: 'date',
          required: true,
          help: 'يجب أن يكون صالحاً لمدة 6 أشهر على الأقل',
          validation: { required: 'تاريخ انتهاء الجواز مطلوب' }
        },
        {
          name: 'nationality',
          label: 'الجنسية',
          type: 'searchable-select',
          options: [
            { value: 'usa', label: 'الولايات المتحدة الأمريكية' },
            { value: 'uk', label: 'المملكة المتحدة' },
            { value: 'canada', label: 'كندا' },
            { value: 'australia', label: 'أستراليا' },
            { value: 'germany', label: 'ألمانيا' },
            { value: 'france', label: 'فرنسا' },
            { value: 'italy', label: 'إيطاليا' },
            { value: 'spain', label: 'إسبانيا' },
            { value: 'egypt', label: 'مصر' },
            { value: 'jordan', label: 'الأردن' },
            { value: 'uae', label: 'الإمارات' },
            { value: 'kuwait', label: 'الكويت' },
            { value: 'qatar', label: 'قطر' },
            { value: 'bahrain', label: 'البحرين' },
            { value: 'oman', label: 'عمان' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          validation: { required: 'الجنسية مطلوبة' }
        },
        {
          name: 'nationalityOther',
          label: 'حدد الجنسية',
          type: 'text',
          required: true,
          conditional: { field: 'nationality', values: ['other'] },
          validation: { required: 'الجنسية مطلوبة' }
        },
        {
          name: 'arrivalDate',
          label: 'تاريخ الوصول المتوقع',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الوصول مطلوب' }
        }
      ]
    },
    {
      id: 'applicant-info',
      title: 'معلومات المتقدم',
      fields: [
        {
          name: 'applicantType',
          label: 'الشخص المقدم للطلب',
          type: 'radio',
          options: [
            { value: 'self', label: 'صاحب الطلب' },
            { value: 'guardian', label: 'ولي الأمر' },
            { value: 'representative', label: 'المندوب الرسمي لجهة العمل' }
          ],
          required: true,
          validation: { required: 'يرجى تحديد الشخص المقدم للطلب' }
        },
        {
          name: 'guardianName',
          label: 'اسم ولي الأمر',
          type: 'text',
          required: true,
          conditional: { field: 'applicantType', values: ['guardian'] },
          validation: { required: 'اسم ولي الأمر مطلوب' }
        },
        {
          name: 'guardianRelation',
          label: 'صلة القرابة',
          type: 'select',
          options: [
            { value: 'father', label: 'أب' },
            { value: 'mother', label: 'أم' },
            { value: 'brother', label: 'أخ' },
            { value: 'sister', label: 'أخت' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'applicantType', values: ['guardian'] },
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'representativeName',
          label: 'اسم المندوب الرسمي',
          type: 'text',
          required: true,
          conditional: { field: 'applicantType', values: ['representative'] },
          validation: { required: 'اسم المندوب الرسمي مطلوب' }
        },
        {
          name: 'representativeCompany',
          label: 'جهة العمل الضامنة',
          type: 'text',
          required: true,
          conditional: { field: 'applicantType', values: ['representative'] },
          validation: { required: 'جهة العمل الضامنة مطلوبة' }
        }
      ]
    },
    {
      id: 'sudanese-origin-info',
      title: 'معلومات الأصول السودانية',
      conditional: { field: 'visaType', values: ['sudanese_origin'] },
      fields: [
        {
          name: 'applicantSudaneseDoc',
          label: 'هل لديك مستند سوداني؟',
          type: 'radio',
          options: [
            { value: 'yes', label: 'نعم' },
            { value: 'no', label: 'لا' }
          ],
          required: true,
          validation: { required: 'يرجى تحديد ما إذا كان لديك مستند سوداني' }
        },
        {
          name: 'applicantSudaneseDocType',
          label: 'نوع المستند السوداني',
          type: 'select',
          options: [
            { value: 'passport', label: 'جواز سفر سوداني' },
            { value: 'national_id', label: 'رقم وطني' },
            { value: 'personal_card', label: 'بطاقة شخصية' },
            { value: 'sudanese_origin_card', label: 'بطاقة أصول سودانية' }
          ],
          required: true,
          conditional: { field: 'applicantSudaneseDoc', values: ['yes'] },
          validation: { required: 'نوع المستند السوداني مطلوب' }
        },
        {
          name: 'applicantSudaneseDocNumber',
          label: 'رقم المستند السوداني',
          type: 'text',
          required: true,
          conditional: { field: 'applicantSudaneseDoc', values: ['yes'] },
          validation: { required: 'رقم المستند السوداني مطلوب' }
        },
        {
          name: 'guarantorName',
          label: 'اسم الضامن (من الدرجة الأولى)',
          type: 'text',
          required: true,
          help: 'أب - أم - أخ - أخت - ابن - ابنة - زوجة',
          validation: { required: 'اسم الضامن مطلوب' }
        },
        {
          name: 'guarantorRelation',
          label: 'صلة القرابة بالضامن',
          type: 'select',
          options: [
            { value: 'father', label: 'أب' },
            { value: 'mother', label: 'أم' },
            { value: 'brother', label: 'أخ' },
            { value: 'sister', label: 'أخت' },
            { value: 'son', label: 'ابن' },
            { value: 'daughter', label: 'ابنة' },
            { value: 'wife', label: 'زوجة' }
          ],
          required: true,
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'guarantorSudaneseDocType',
          label: 'نوع مستند الضامن السوداني',
          type: 'select',
          options: [
            { value: 'passport', label: 'جواز سفر سوداني' },
            { value: 'national_id', label: 'رقم وطني' },
            { value: 'personal_card', label: 'بطاقة شخصية' },
            { value: 'sudanese_origin_card', label: 'بطاقة أصول سودانية' }
          ],
          required: true,
          validation: { required: 'نوع مستند الضامن مطلوب' }
        },
        {
          name: 'guarantorSudaneseDocNumber',
          label: 'رقم مستند الضامن السوداني',
          type: 'text',
          required: true,
          validation: { required: 'رقم مستند الضامن مطلوب' }
        }
      ]
    },
    {
      id: 'business-info',
      title: 'معلومات زيارة الأعمال',
      conditional: { field: 'visaType', values: ['business_visit'] },
      fields: [
        {
          name: 'companyName',
          label: 'اسم جهة العمل',
          type: 'text',
          required: true,
          help: 'يجب أن تكون مسجلة بجوازات الأجانب',
          validation: { required: 'اسم جهة العمل مطلوب' }
        },
        {
          name: 'companyRegistrationNumber',
          label: 'رقم التسجيل بجوازات الأجانب',
          type: 'text',
          required: true,
          validation: { required: 'رقم التسجيل مطلوب' }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'passportOriginal',
          label: 'أصل جواز السفر ساري المفعول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          help: 'يجب أن يكون صالحاً لمدة 6 أشهر على الأقل',
          validation: { required: 'أصل جواز السفر مطلوب' }
        },
        {
          name: 'personalPhoto',
          label: 'صورة شخصية',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الشخصية مطلوبة' }
        },
        {
          name: 'applicantSudaneseDocCopy',
          label: 'صورة من المستند السوداني لصاحب الطلب',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'visaType', values: ['sudanese_origin'] },
          help: 'جواز سفر - رقم وطني - بطاقة شخصية - بطاقة أصول سودانية',
          validation: { required: 'صورة المستند السوداني مطلوبة' }
        },
        {
          name: 'guarantorSudaneseDocCopy',
          label: 'صورة المستند السوداني للضامن',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'visaType', values: ['sudanese_origin'] },
          validation: { required: 'صورة مستند الضامن مطلوبة' }
        },
        {
          name: 'marriageCertificate',
          label: 'صورة من قسيمة الزواج',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'guarantorRelation', values: ['wife'] },
          help: 'في حالة الزوجة',
          validation: { required: 'صورة قسيمة الزواج مطلوبة' }
        },
        {
          name: 'birthCertificate',
          label: 'صورة من شهادة الميلاد أو الرقم الوطني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'guarantorRelation', values: ['mother'] },
          help: 'في حالة الأم كضامن',
          validation: { required: 'صورة شهادة الميلاد أو الرقم الوطني مطلوبة' }
        },
        {
          name: 'companyLetter',
          label: 'خطاب من جهة العمل المسجلة بجوازات الأجانب',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'visaType', values: ['business_visit'] },
          validation: { required: 'خطاب جهة العمل مطلوب' }
        },
        {
          name: 'representativeId',
          label: 'هوية المندوب الرسمي المسجل بجوازات الأجانب',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'visaType', values: ['business_visit'] },
          validation: { required: 'هوية المندوب الرسمي مطلوبة' }
        },
        {
          name: 'supportingDocs',
          label: 'مستندات أخرى داعمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'ملاحظة: قد يتطلب الإجراء إحضار بعض المستندات الأخرى المؤيدة لطلب الحصول على التأشيرة'
        }
      ]
    }
  ]
};

export default visasConfig;
