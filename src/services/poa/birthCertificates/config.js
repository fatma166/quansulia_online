export const birthCertificatesConfig = {
  id: 'birth_certificates',
  title: 'شهادات ميلاد',
  description: 'توكيل لاستلام شهادات الميلاد والوثائق المدنية',
  icon: 'Baby',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'إثبات صلة القرابة',
    'تحديد بيانات المولود بدقة'
  ],
  fees: { base: 120, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد بيانات المولود',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'personal-info',
      title: 'البيانات الشخصية',
      fields: [
        {
          name: 'principalName',
          label: 'اسم الموكل (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الموكل مطلوب' }
        },
        {
          name: 'principalId',
          label: 'رقم جواز الموكل',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          validation: { required: 'رقم جواز الموكل مطلوب' }
        },
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
        {
          name: 'phone',
          label: 'رقم الهاتف',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الهاتف مطلوب' }
        },
        {
          name: 'email',
          label: 'البريد الإلكتروني',
          type: 'email',
          required: true,
          validation: { required: 'البريد الإلكتروني مطلوب' }
        }
      ]
    },
    {
      id: 'birth-details',
      title: 'تفاصيل الخدمة',
      fields: [
        {
          name: 'birthCertificateType',
          label: 'نوع الخدمة',
          type: 'select',
          options: [
            { value: 'birth_certificate_issuance', label: 'استخراج شهادات ميلاد', description: 'توكيل لاستخراج شهادة ميلاد' }
          ],
          required: true,
          validation: { required: 'نوع الخدمة مطلوب' }
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
          name: 'principalIdCopy',
          label: 'صورة جواز الموكل',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الموكل مطلوبة' }
        },
        {
          name: 'agentIdCopy',
          label: 'صورة جواز الوكيل',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الوكيل مطلوبة' }
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
          name: 'hospitalRecord',
          label: 'سجل المستشفى',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB',
          help: 'إن وجد'
        }
      ]
    }
  ]
};