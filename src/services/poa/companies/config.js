export const companiesConfig = {
  id: 'companies',
  title: 'الشركات',
  description: 'توكيل للمعاملات التجارية وإدارة الشركات',
  icon: 'Building',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'السجل التجاري أو عقد تأسيس الشركة',
    'تحديد الغرض من التوكيل بوضوح',
    'المستندات المتعلقة بالشركة'
  ],
  fees: { base: 280, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع المعاملة التجارية',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'company-details',
      title: 'تفاصيل الشركة',
      fields: [
        {
          name: 'companyTransactionType',
          label: 'نوع المعاملة التجارية',
          type: 'searchable-select',
          options: [
            { value: 'company_registration_form', label: 'استمارة تسجيل شركة', description: 'توكيل لتسجيل شركة جديدة' },
            { value: 'business_name_form', label: 'استمارة تأسيس اسم عمل', description: 'توكيل لتسجيل اسم تجاري' },
            { value: 'shares_disposal', label: 'التصرف في اسهم', description: 'توكيل للتصرف في الأسهم' },
            { value: 'other_companies', label: 'اخرى', description: 'معاملات شركات أخرى' }
          ],
          required: true,
          validation: { required: 'نوع المعاملة التجارية مطلوب' }
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
        },
        {
          name: 'companyName',
          label: 'اسم الشركة',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشركة مطلوب' }
        },
        {
          name: 'companyType',
          label: 'نوع الشركة',
          type: 'select',
          options: [
            { value: 'llc', label: 'شركة ذات مسؤولية محدودة' },
            { value: 'joint_stock', label: 'شركة مساهمة' },
            { value: 'partnership', label: 'شركة تضامن' },
            { value: 'sole_proprietorship', label: 'مؤسسة فردية' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'companyTransactionType', values: ['company_registration_form'] },
          validation: { required: 'نوع الشركة مطلوب' }
        },
        {
          name: 'businessName',
          label: 'اسم العمل التجاري',
          type: 'text',
          required: true,
          conditional: { field: 'companyTransactionType', values: ['business_name_form'] },
          validation: { required: 'اسم العمل التجاري مطلوب' }
        },
        {
          name: 'sharesCount',
          label: 'عدد الأسهم',
          type: 'number',
          required: true,
          conditional: { field: 'companyTransactionType', values: ['shares_disposal'] },
          validation: { required: 'عدد الأسهم مطلوب' }
        },
        {
          name: 'commercialRegister',
          label: 'رقم السجل التجاري',
          type: 'text',
          required: false
        },
        {
          name: 'companyAddress',
          label: 'عنوان الشركة',
          type: 'text',
          required: true,
          validation: { required: 'عنوان الشركة مطلوب' }
        },
        {
          name: 'companyActivity',
          label: 'نشاط الشركة',
          type: 'textarea',
          required: true,
          rows: 3,
          className: 'md:col-span-2',
          validation: { required: 'نشاط الشركة مطلوب' }
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
          name: 'commercialRegisterCopy',
          label: 'صورة السجل التجاري',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB'
        },
        {
          name: 'companyContract',
          label: 'عقد تأسيس الشركة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '10MB',
          conditional: { field: 'companyTransactionType', values: ['company_registration_form'] },
          validation: { required: 'عقد تأسيس الشركة مطلوب' }
        },
        {
          name: 'sharesDocuments',
          label: 'مستندات الأسهم',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: true,
          maxSize: '10MB',
          conditional: { field: 'companyTransactionType', values: ['shares_disposal'] },
          validation: { required: 'مستندات الأسهم مطلوبة' }
        }
      ]
    }
  ]
};