export const educationalConfig = {
  id: 'educational',
  title: 'شهادة دراسية',
  description: 'توكيل لاستلام الشهادات الدراسية والوثائق التعليمية',
  icon: 'GraduationCap',
  category: 'legal',
  skipPersonalStep: true,
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'تحديد نوع الشهادة المطلوبة',
    'تحديد جهة الإصدار',
    'إثبات صلة القرابة (للأقارب)'
  ],
  fees: { base: 150, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع الشهادة',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'general-details',
      title: 'تفاصيل التوكيل',
      fields: [
        // بيانات مقدم الطلب (الموكّل)
        {
          name: 'fullName',
          label: 'الاسم الرباعي للموكّل حسب جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'الاسم الرباعي مطلوب' }
        },
        {
          name: 'nationalId',
          label: 'رقم جواز سفر الموكّل',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          validation: { required: 'رقم الجواز مطلوب' }
        },
        {
          name: 'phoneNumber',
          label: 'رقم الجوال',
          type: 'tel',
          pattern: /^(05|5)\d{8}$/,
          required: true,
          help: '+966 - رقم سعودي يبدأ بـ 05',
          prefix: '+966',
          validation: { required: 'رقم الجوال مطلوب', pattern: 'رقم الجوال غير صحيح' }
        },
        {
          name: 'email',
          label: 'البريد الإلكتروني',
          type: 'email',
          required: true,
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          help: 'يجب إدخال الإيميل بالأحرف الإنجليزية فقط',
          validation: { required: 'البريد الإلكتروني مطلوب' }
        },
        {
          name: 'isAdult',
          label: 'هل الموكّل أكثر من 18 سنة؟',
          type: 'radio',
          options: [{ value: 'yes', label: 'نعم' }, { value: 'no', label: 'لا' }],
          required: true,
          validation: { required: 'يرجى تحديد ما إذا كان الموكّل أكثر من 18 سنة' }
        },
        {
          name: 'dob',
          label: 'تاريخ الميلاد للموكّل',
          type: 'date',
          required: true,
          className: 'md:col-span-2',
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'profession',
          label: 'المهنة',
          type: 'text',
          className: 'md:col-span-1',
          required: true,
          validation: { required: 'المهنة مطلوبة' }
        },
        {
          name: 'workplace',
          label: 'مكان العمل',
          type: 'text',
          className: 'md:col-span-2',
          required: true,
          validation: { required: 'مكان العمل مطلوب' }
        },
        {
          name: 'region',
          label: 'المنطقة',
          type: 'searchable-select',
          options: [],
          required: true,
          validation: { required: 'المنطقة مطلوبة' }
        },
        {
          name: 'city',
          label: 'المدينة',
          type: 'searchable-select',
          options: [],
          required: true,
          validation: { required: 'المدينة مطلوبة' }
        },
        {
          name: 'district',
          label: 'الحي',
          type: 'searchable-select',
          options: [],
          required: true,
          validation: { required: 'الحي مطلوب' }
        },
        {
          name: 'address',
          label: 'العنوان / أقرب معلم',
          type: 'textarea',
          required: true,
          rows: 3,
          className: 'md:col-span-2',
          validation: { required: 'العنوان / أقرب معلم مطلوب' }
        },

        // بيانات الوكيل
        {
          name: 'agentName',
          label: 'اسم الوكيل (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الوكيل مطلوب' }
        },
        {
          name: 'agentId',
          label: 'رقم جواز الوكيل',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          validation: { required: 'رقم جواز الوكيل مطلوب' }
        },

        // تفاصيل الخدمة التعليمية
        {
          name: 'certificateTypeRadio',
          label: 'نوع الشهادة المطلوبة',
          type: 'radio',
          options: [
            { value: 'primary', label: 'الشهادة الابتدائية' },
            { value: 'intermediate', label: 'الشهادة المتوسطة' },
            { value: 'secondary', label: 'الشهادة الثانوية' }
          ],
          required: true,
          validation: { required: 'نوع الشهادة المطلوبة مطلوب' }
        },
        {
          name: 'issuingAuthority',
          label: 'جهة الإصدار',
          type: 'text',
          required: true,
          placeholder: 'مثال: وزارة التربية والتعليم السودانية',
          validation: { required: 'جهة الإصدار مطلوبة' }
        },
        {
          name: 'additionalDetailsText',
          label: 'تفاصيل إضافية',
          type: 'textarea',
          required: false,
          rows: 4,
          className: 'md:col-span-2',
          placeholder: 'طلب استلام شهادة ثانوية للعام 2020',
          help: 'أي تفاصيل إضافية أو ملاحظات خاصة بالطلب'
        },
        {
          name: 'educationalType',
          label: 'نوع الخدمة التعليمية',
          type: 'searchable-select',
          options: [
            { value: 'educational_certificate', label: 'شهادة دراسية', description: 'توكيل لاستلام شهادة دراسية' },
            { value: 'certificate_authentication', label: 'توثيق شهادة دراسية', description: 'توكيل لتوثيق شهادة دراسية' },
            { value: 'university_masters', label: 'دراسة جامعية ماجستير', description: 'توكيل للدراسة الجامعية - ماجستير' },
            { value: 'university_general', label: 'دراسة جامعية', description: 'توكيل للدراسة الجامعية عامة' },
            { value: 'university_turkey', label: 'دراسة جامعية بتركيا', description: 'توكيل للدراسة الجامعية في تركيا' },
            { value: 'university_egypt', label: 'دراسة جامعية بمصر', description: 'توكيل للدراسة الجامعية في مصر' },
            { value: 'egyptian_fellowship', label: 'الزمالة المصرية', description: 'توكيل للزمالة المصرية' },
            { value: 'other_educational', label: 'أخرى', description: 'شؤون تعليمية أخرى' }
          ],
          required: true,
          validation: { required: 'نوع الخدمة التعليمية مطلوب' }
        },
        {
          name: 'otherEducationalDetails',
          label: 'حدد المطلوب',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'educationalType', values: ['other_educational'] },
          validation: { required: 'يرجى تحديد المطلوب' }
        },
        {
          name: 'studentName',
          label: 'اسم الطالب',
          type: 'text',
          required: true,
          validation: { required: 'اسم الطالب مطلوب' }
        },
        {
          name: 'certificateType',
          label: 'نوع الشهادة',
          type: 'select',
          options: [
            { value: 'primary', label: 'ابتدائية' },
            { value: 'intermediate', label: 'متوسطة' },
            { value: 'secondary', label: 'ثانوية' },
            { value: 'diploma', label: 'دبلوم' },
            { value: 'bachelor', label: 'بكالوريوس' },
            { value: 'masters', label: 'ماجستير' },
            { value: 'phd', label: 'دكتوراه' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'educationalType', values: ['educational_certificate', 'certificate_authentication'] },
          validation: { required: 'نوع الشهادة مطلوب' }
        },
        {
          name: 'universityName',
          label: 'اسم الجامعة',
          type: 'text',
          required: true,
          conditional: { field: 'educationalType', values: ['university_masters', 'university_turkey', 'university_egypt', 'university_general'] },
          validation: { required: 'اسم الجامعة مطلوب' }
        },
        {
          name: 'major',
          label: 'التخصص',
          type: 'text',
          required: true,
          conditional: { field: 'educationalType', values: ['university_masters', 'university_turkey', 'university_egypt', 'university_general'] },
          validation: { required: 'التخصص مطلوب' }
        },
        {
          name: 'graduationYear',
          label: 'سنة التخرج',
          type: 'number',
          required: true,
          conditional: { field: 'educationalType', values: ['educational_certificate', 'certificate_authentication'] },
          validation: { required: 'سنة التخرج مطلوبة' }
        },
        {
          name: 'fellowshipDetails',
          label: 'تفاصيل الزمالة',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'educationalType', values: ['egyptian_fellowship'] },
          validation: { required: 'تفاصيل الزمالة مطلوبة' }
        },
        {
          name: 'relationToStudent',
          label: 'صلة القرابة بالطالب',
          type: 'select',
          options: [
            { value: 'self', label: 'نفس الشخص' },
            { value: 'father', label: 'والد' },
            { value: 'mother', label: 'والدة' },
            { value: 'guardian', label: 'ولي أمر' },
            { value: 'relative', label: 'قريب' }
          ],
          required: true,
          validation: { required: 'صلة القرابة بالطالب مطلوبة' }
        },
        {
          name: 'poaScope',
          label: 'الغرض من التوكيل',
          type: 'textarea',
          required: true,
          rows: 6,
          className: 'md:col-span-2',
          help: 'حدد بوضوح الصلاحيات الممنوحة للوكيل',
          validation: { required: 'الغرض من التوكيل مطلوب' }
        },
        {
          name: 'poaUsageCountry',
          label: 'مكان استخدام التوكيل (الدولة)',
          type: 'searchable-select',
          options: [
            { value: 'saudi_arabia', label: 'المملكة العربية السعودية' },
            { value: 'sudan', label: 'جمهورية السودان' },
            { value: 'egypt', label: 'جمهورية مصر العربية' },
            { value: 'uae', label: 'الإمارات العربية المتحدة' },
            { value: 'kuwait', label: 'دولة الكويت' },
            { value: 'qatar', label: 'دولة قطر' },
            { value: 'bahrain', label: 'مملكة البحرين' },
            { value: 'oman', label: 'سلطنة عمان' },
            { value: 'jordan', label: 'المملكة الأردنية الهاشمية' },
            { value: 'other', label: 'دولة أخرى' }
          ],
          required: true,
          validation: { required: 'مكان استخدام التوكيل مطلوب' }
        },
        {
          name: 'poaUsageCountryOther',
          label: 'حدد اسم الدولة',
          type: 'text',
          required: true,
          conditional: { field: 'poaUsageCountry', values: ['other'] },
          validation: { required: 'اسم الدولة مطلوب' }
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
          label: 'رقم جواز سفر الشاهد الأول',
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
          label: 'رقم جواز سفر الشاهد الثاني',
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
          name: 'principalPassportCopy',
          label: 'صورة جواز السفر الموكل',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز السفر الموكل مطلوبة' }
        },
        {
          name: 'agentPassportCopy',
          label: 'صورة جواز السفر الوكيل',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز السفر الوكيل مطلوبة' }
        },
        {
          name: 'witness1PassportCopy',
          label: 'صورة جواز السفر الشاهد الأول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز السفر الشاهد الأول مطلوبة' }
        },
        {
          name: 'witness2PassportCopy',
          label: 'صورة جواز السفر الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز السفر الشاهد الثاني مطلوبة' }
        },
        {
          name: 'relationshipProof',
          label: 'إثبات صلة القرابة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'إثبات صلة القرابة مطلوب' }
        },
        {
          name: 'supportingDocs',
          label: 'مستندات داعمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'أي مستندات إضافية تدعم التوكيل'
        }
      ]
    }
  ]
};
