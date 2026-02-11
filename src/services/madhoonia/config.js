export const madhooniaConfig = {
  id: 'madhoonia',
  title: 'المأذونية',
  description: 'خدمات عقود الزواج والطلاق',
  icon: 'FileHeart',
  category: 'consular',
  requirements: {
    marriage: [
      'إثبات الشخصية: الجواز أو الرقم الوطني (الخاطب، المخطوبة، ولي المخطوبة (الأب)، الشاهدان)',
      'في حال كانت المخطوبة غائبة عن مجلس العقد: يجب احضار إقرار موافقة على الزواج',
      'في حال كانت المخطوبة مطلقة: يجب إحضار أصل وثيقة الطلاق موثقة من الخارجية السودانية',
      'في حال كانت المخطوبة أرملة: يجب احضار وثيقة الزواج وشهادة وفاة الزوج الأول أو الاعلام الشرعي للورثة',
      'في حال غياب والد المخطوبة: يجب احضار أصل توكيل لمن ينوب عنه في الإجراءات موثق من الخارجية السودانية',
      'في حال وجود الولي (والد المخطوبة) خارج السودان: يجب إحضار توكيل لمن ينوب عنه في الإجراءات صادر من السفارة السودانية بمحل إقامته',
      'في حال وفاة ولي المخطوبة (الأب): يجب إبراز اثبات وفاته، أو الإعلام الشرعي للوراثة (الأصل)، وينوب عنه الولي الأقرب على ترتيب الإرث'
    ],
    divorce: [
      'القسيمة',
      'صورة جواز الزوج',
      'صورة جواز الزوجة',
      'صورة جواز الشاهد الأول',
      'صورة جواز الشاهد الثاني',
      'مستندات إضافية إن وجد'
    ]
  },
  fees: { marriage: 210, divorce: 100, currency: 'ريال سعودي' },
  duration: 'يوم واحد',
  process: [
    'تحديد نوع الخدمة (زواج أو طلاق)',
    'تعبئة نموذج الطلب',
    'إرفاق المستندات المطلوبة',
    'الحضور الشخصي مع الشهود',
    'إتمام الإجراء'
  ],
  steps: [
    {
      id: 'service-details',
      title: 'تفاصيل الخدمة',
      fields: [
        {
          name: 'serviceType',
          label: 'نوع الخدمة المطلوبة',
          type: 'radio',
          required: true,
          options: [
            { value: 'marriage', label: 'الزواج' },
            { value: 'divorce', label: 'الطلاق' }
          ],
          validation: { required: 'نوع الخدمة مطلوب' }
        }
      ]
    },
    {
      id: 'groom-info',
      title: 'بيانات الخاطب',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'groomFullName',
          label: 'اسم الخاطب (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الخاطب مطلوب' }
        },
        {
          name: 'groomBirthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'groomPassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'groomPassportIssuePlace',
          label: 'مكان الإصدار',
          type: 'text',
          required: true,
          validation: { required: 'مكان إصدار الجواز مطلوب' }
        },
        {
          name: 'groomPassportIssueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ إصدار الجواز مطلوب' }
        },
        {
          name: 'groomResidenceStatus',
          label: 'حالة الإقامة',
          type: 'select',
          required: true,
          options: [
            { value: 'resident', label: 'مقيم' },
            { value: 'visitor', label: 'زيارة' },
            { value: 'umrah', label: 'عمرة' }
          ],
          validation: { required: 'حالة الإقامة مطلوبة' }
        },
        {
          name: 'groomResidenceNumber',
          label: 'رقم الإقامة',
          type: 'text',
          required: false,
          conditional: (data) => data.groomResidenceStatus === 'resident'
        },
        {
          name: 'groomOccupation',
          label: 'المهنة',
          type: 'text',
          required: true,
          validation: { required: 'المهنة مطلوبة' }
        },
        {
          name: 'groomMaritalStatus',
          label: 'الحالة الإجتماعية',
          type: 'select',
          required: true,
          options: [
            { value: 'single', label: 'لم يسبق له الزواج' },
            { value: 'divorced', label: 'مطلق' },
            { value: 'widower', label: 'أرمل' },
            { value: 'polygamous', label: 'معدد' }
          ],
          validation: { required: 'الحالة الإجتماعية مطلوبة' }
        },
        {
          name: 'groomWivesCount',
          label: 'عدد الزوجات',
          type: 'number',
          required: false,
          conditional: (data) => data.groomMaritalStatus === 'polygamous',
          validation: { min: 1, max: 3 },
          help: 'أدخل عدد الزوجات الحاليات'
        },
        {
          name: 'groomAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'groomMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'groomAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'groomMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'bride-info',
      title: 'بيانات المخطوبة',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'brideFullName',
          label: 'اسم المخطوبة (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم المخطوبة مطلوب' }
        },
        {
          name: 'brideBirthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'bridePassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'bridePassportIssuePlace',
          label: 'مكان الإصدار',
          type: 'text',
          required: true,
          validation: { required: 'مكان إصدار الجواز مطلوب' }
        },
        {
          name: 'bridePassportIssueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ إصدار الجواز مطلوب' }
        },
        {
          name: 'brideResidenceStatus',
          label: 'حالة الإقامة',
          type: 'select',
          required: true,
          options: [
            { value: 'resident', label: 'مقيم' },
            { value: 'visitor', label: 'زيارة' },
            { value: 'umrah', label: 'عمرة' }
          ],
          validation: { required: 'حالة الإقامة مطلوبة' }
        },
        {
          name: 'brideResidenceNumber',
          label: 'رقم الإقامة',
          type: 'text',
          required: false,
          conditional: (data) => data.brideResidenceStatus === 'resident'
        },
        {
          name: 'brideOccupation',
          label: 'المهنة',
          type: 'text',
          required: true,
          validation: { required: 'المهنة مطلوبة' }
        },
        {
          name: 'brideMaritalStatus',
          label: 'الحالة الإجتماعية',
          type: 'select',
          required: true,
          options: [
            { value: 'single', label: 'لم يسبق لها الزواج' },
            { value: 'divorced', label: 'مطلقة' },
            { value: 'widow', label: 'أرملة' }
          ],
          validation: { required: 'الحالة الإجتماعية مطلوبة' }
        },
        {
          name: 'brideDivorceDocNumber',
          label: 'رقم وثيقة الطلاق',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'divorced'
        },
        {
          name: 'brideDivorceDocIssuer',
          label: 'جهة إصدار وثيقة الطلاق',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'divorced'
        },
        {
          name: 'brideMarriageCertNumber',
          label: 'رقم وثيقة الزواج',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideMarriageCertPlace',
          label: 'مكان إصدار وثيقة الزواج',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideMarriageCertDate',
          label: 'تاريخ إصدار وثيقة الزواج',
          type: 'date',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideHusbandDeathCertNumber',
          label: 'رقم شهادة وفاة الزوج',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideHusbandDeathCertPlace',
          label: 'مكان إصدار شهادة الوفاة',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideHusbandDeathCertDate',
          label: 'تاريخ إصدار شهادة الوفاة',
          type: 'date',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideInheritanceDocNumber',
          label: 'رقم الإعلام الشرعي للوراثة',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideInheritanceDocPlace',
          label: 'مكان إصدار الإعلام الشرعي',
          type: 'text',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideInheritanceDocDate',
          label: 'تاريخ إصدار الإعلام الشرعي',
          type: 'date',
          required: false,
          conditional: (data) => data.brideMaritalStatus === 'widow'
        },
        {
          name: 'brideAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'brideMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'brideAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'brideMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'guardian-info',
      title: 'بيانات الولي',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'guardianFullName',
          label: 'اسم الولي (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الولي مطلوب' }
        },
        {
          name: 'guardianRelationship',
          label: 'صفة الولي',
          type: 'select',
          required: true,
          options: [
            { value: 'father', label: 'أب' },
            { value: 'uncle', label: 'عم' },
            { value: 'brother', label: 'أخ' },
            { value: 'grandfather', label: 'جد' },
            { value: 'other', label: 'أخرى' }
          ],
          validation: { required: 'صفة الولي مطلوبة' }
        },
        {
          name: 'guardianPassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'guardianPassportIssuePlace',
          label: 'مكان الإصدار',
          type: 'text',
          required: true,
          validation: { required: 'مكان إصدار الجواز مطلوب' }
        },
        {
          name: 'guardianPassportIssueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ إصدار الجواز مطلوب' }
        },
        {
          name: 'guardianAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'guardianMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'guardianAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'guardianMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'guardian-agent-info',
      title: 'بيانات وكيل (الولي) إن وجد',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'hasGuardianAgent',
          label: 'هل يوجد وكيل للولي؟',
          type: 'radio',
          required: true,
          options: [
            { value: 'yes', label: 'نعم' },
            { value: 'no', label: 'لا' }
          ],
          validation: { required: 'هذا الحقل مطلوب' }
        },
        {
          name: 'guardianAgentFullName',
          label: 'اسم الوكيل (رباعي)',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentPassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentPassportIssuePlace',
          label: 'مكان الإصدار',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentPassportIssueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentPoaNumber',
          label: 'رقم التوكيل',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentPoaDate',
          label: 'تاريخ التوكيل',
          type: 'date',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentPoaIssuer',
          label: 'جهة إصدار التوكيل',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        },
        {
          name: 'guardianAgentMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false,
          conditional: (data) => data.hasGuardianAgent === 'yes'
        }
      ]
    },
    {
      id: 'groom-agent-info',
      title: 'بيانات وكيل (الزوج) إن وجد',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'hasGroomAgent',
          label: 'هل يوجد وكيل للزوج؟',
          type: 'radio',
          required: true,
          options: [
            { value: 'yes', label: 'نعم' },
            { value: 'no', label: 'لا' }
          ],
          validation: { required: 'هذا الحقل مطلوب' }
        },
        {
          name: 'groomAgentFullName',
          label: 'اسم الوكيل (رباعي)',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentPassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentPassportIssuePlace',
          label: 'مكان الإصدار',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentPassportIssueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentPoaNumber',
          label: 'رقم التوكيل',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentPoaDate',
          label: 'تاريخ التوكيل',
          type: 'date',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentPoaIssuer',
          label: 'جهة إصدار التوكيل',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        },
        {
          name: 'groomAgentMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false,
          conditional: (data) => data.hasGroomAgent === 'yes'
        }
      ]
    },
    {
      id: 'dowry-info',
      title: 'بيانات الصداق (المهر)',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'dowryTotal',
          label: 'الصداق',
          type: 'number',
          required: true,
          validation: { required: 'الصداق مطلوب' },
          help: 'المبلغ الإجمالي للصداق'
        },
        {
          name: 'dowryPaid',
          label: 'المقبوض',
          type: 'number',
          required: true,
          validation: { required: 'المقبوض مطلوب' },
          help: 'المبلغ المدفوع مقدماً'
        },
        {
          name: 'dowryDeferred',
          label: 'المؤخر',
          type: 'number',
          required: true,
          validation: { required: 'المؤخر مطلوب' },
          help: 'المبلغ المؤجل'
        }
      ]
    },
    {
      id: 'witnesses-info',
      title: 'الشهود',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'witness1FullName',
          label: 'اسم الشاهد الأول (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witness1PassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'witness1AddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'witness1MobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'witness1AddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'witness1MobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        },
        {
          name: 'witness2FullName',
          label: 'اسم الشاهد الثاني (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الثاني مطلوب' }
        },
        {
          name: 'witness2PassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'witness2AddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'witness2MobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'witness2AddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'witness2MobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'appointment-info',
      title: 'الموعد المقترح لعقد الزواج',
      conditional: (data) => data.serviceType === 'marriage',
      fields: [
        {
          name: 'appointmentNote',
          label: 'معلومات الموعد',
          type: 'info',
          content: 'تتم جميع العقودات بصالة العقودات بالقنصلية العامة لجمهورية السودان بجدة من يوم الأحد إلى يوم الخميس من الساعة 11 صباحاً حتى الساعة 2 ظهراً.'
        },
        {
          name: 'proposedAppointmentDate',
          label: 'الموعد المقترح',
          type: 'date',
          required: true,
          validation: { required: 'الموعد المقترح مطلوب' },
          help: 'اختر الموعد المناسب لك (من الأحد إلى الخميس)'
        }
      ]
    },
    {
      id: 'husband-info',
      title: 'بيانات الزوج (المطلق)',
      conditional: (data) => data.serviceType === 'divorce',
      fields: [
        {
          name: 'husbandFullName',
          label: 'اسم الزوج الكامل (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الزوج مطلوب' }
        },
        {
          name: 'husbandBirthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'husbandNationalId',
          label: 'الرقم الوطني',
          type: 'text',
          required: true,
          validation: { required: 'الرقم الوطني مطلوب' }
        },
        {
          name: 'husbandPassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'husbandPassportIssuePlace',
          label: 'مكان إصدار الجواز',
          type: 'text',
          required: true,
          validation: { required: 'مكان إصدار الجواز مطلوب' }
        },
        {
          name: 'husbandPassportIssueDate',
          label: 'تاريخ إصدار الجواز',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ إصدار الجواز مطلوب' }
        },
        {
          name: 'husbandResidenceStatus',
          label: 'حالة الإقامة',
          type: 'select',
          required: true,
          options: [
            { value: 'resident', label: 'مقيم' },
            { value: 'visitor', label: 'زيارة' },
            { value: 'umrah', label: 'عمرة' }
          ],
          validation: { required: 'حالة الإقامة مطلوبة' }
        },
        {
          name: 'husbandResidenceNumber',
          label: 'رقم الإقامة',
          type: 'text',
          required: false,
          conditional: (data) => data.husbandResidenceStatus === 'resident'
        },
        {
          name: 'husbandOccupation',
          label: 'المهنة',
          type: 'text',
          required: true,
          validation: { required: 'المهنة مطلوبة' }
        },
        {
          name: 'husbandAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'husbandMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'husbandAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'husbandMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'marriage-details',
      title: 'بيانات الزواج',
      conditional: (data) => data.serviceType === 'divorce',
      fields: [
        {
          name: 'marriageCertNumber',
          label: 'رقم وثيقة الزواج',
          type: 'text',
          required: true,
          validation: { required: 'رقم وثيقة الزواج مطلوب' }
        },
        {
          name: 'marriageDate',
          label: 'تاريخ الزواج',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الزواج مطلوب' }
        },
        {
          name: 'marriagePlace',
          label: 'مكان الزواج',
          type: 'text',
          required: true,
          validation: { required: 'مكان الزواج مطلوب' }
        },
        {
          name: 'marriageIssuer',
          label: 'جهة إصدار وثيقة الزواج',
          type: 'text',
          required: true,
          validation: { required: 'جهة الإصدار مطلوبة' }
        },
        {
          name: 'dowryPaid',
          label: 'المهر المقبوض',
          type: 'number',
          required: true,
          validation: { required: 'المهر المقبوض مطلوب' }
        },
        {
          name: 'dowryDeferred',
          label: 'المهر المؤخر',
          type: 'number',
          required: true,
          validation: { required: 'المهر المؤخر مطلوب' }
        }
      ]
    },
    {
      id: 'divorce-details',
      title: 'بيانات الطلاق',
      conditional: (data) => data.serviceType === 'divorce',
      fields: [
        {
          name: 'divorceType',
          label: 'نوع الطلاق',
          type: 'select',
          required: true,
          options: [
            { value: 'revocable', label: 'طلاق رجعي' },
            { value: 'irrevocable_minor', label: 'طلاق بائن بينونة صغرى' },
            { value: 'irrevocable_major', label: 'طلاق بائن بينونة كبرى' }
          ],
          validation: { required: 'نوع الطلاق مطلوب' }
        },
        {
          name: 'divorceCount',
          label: 'عدد الطلقات',
          type: 'select',
          required: true,
          options: [
            { value: 'first', label: 'طلقة أولى' },
            { value: 'second', label: 'طلقة ثانية' },
            { value: 'third', label: 'طلقة ثالثة' }
          ],
          validation: { required: 'عدد الطلقات مطلوب' }
        },
        {
          name: 'divorceDate',
          label: 'تاريخ وقوع الطلاق',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ وقوع الطلاق مطلوب' }
        },
        {
          name: 'divorcePlace',
          label: 'مكان وقوع الطلاق',
          type: 'text',
          required: true,
          validation: { required: 'مكان وقوع الطلاق مطلوب' }
        },
        {
          name: 'divorceReason',
          label: 'سبب الطلاق',
          type: 'textarea',
          rows: 3,
          required: false,
          help: 'اختياري - يمكنك ذكر سبب الطلاق'
        }
      ]
    },
    {
      id: 'divorce-declaration',
      title: 'إقرار الطلاق',
      conditional: (data) => data.serviceType === 'divorce',
      fields: [
        {
          name: 'divorceDeclarationCheckbox',
          label: 'أقر بكامل قواي العقلية وإرادتي الحرة المعتبرة شرعاً وقانوناً بأنني قد طلقت زوجتي المذكورة أعلاه',
          type: 'checkbox',
          required: true,
          validation: {
            required: 'يجب الموافقة على الإقرار',
            validate: (value) => value === true || 'يجب الموافقة على الإقرار'
          }
        },
        {
          name: 'divorceAcknowledgment',
          label: 'وهذا إقرار مني بذلك',
          type: 'checkbox',
          required: true,
          validation: {
            required: 'يجب الموافقة على الإقرار',
            validate: (value) => value === true || 'يجب الموافقة على الإقرار'
          }
        }
      ]
    },
    {
      id: 'wife-info',
      title: 'بيانات الزوجة (المطلقة)',
      conditional: (data) => data.serviceType === 'divorce',
      fields: [
        {
          name: 'wifeFullName',
          label: 'اسم الزوجة الكامل (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الزوجة مطلوب' }
        },
        {
          name: 'wifeBirthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'wifeNationalId',
          label: 'الرقم الوطني',
          type: 'text',
          required: true,
          validation: { required: 'الرقم الوطني مطلوب' }
        },
        {
          name: 'wifePassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'wifePassportIssuePlace',
          label: 'مكان إصدار الجواز',
          type: 'text',
          required: true,
          validation: { required: 'مكان إصدار الجواز مطلوب' }
        },
        {
          name: 'wifePassportIssueDate',
          label: 'تاريخ إصدار الجواز',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ إصدار الجواز مطلوب' }
        },
        {
          name: 'wifeResidenceStatus',
          label: 'حالة الإقامة',
          type: 'select',
          required: true,
          options: [
            { value: 'resident', label: 'مقيم' },
            { value: 'visitor', label: 'زيارة' },
            { value: 'umrah', label: 'عمرة' }
          ],
          validation: { required: 'حالة الإقامة مطلوبة' }
        },
        {
          name: 'wifeResidenceNumber',
          label: 'رقم الإقامة',
          type: 'text',
          required: false,
          conditional: (data) => data.wifeResidenceStatus === 'resident'
        },
        {
          name: 'wifeOccupation',
          label: 'المهنة',
          type: 'text',
          required: true,
          validation: { required: 'المهنة مطلوبة' }
        },
        {
          name: 'wifeAddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'wifeMobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'wifeAddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'wifeMobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'divorce-witnesses',
      title: 'بيانات الشهود',
      conditional: (data) => data.serviceType === 'divorce',
      fields: [
        {
          name: 'witness1FullName',
          label: 'اسم الشاهد الأول (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witness1PassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'witness1AddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'witness1MobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'witness1AddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'witness1MobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        },
        {
          name: 'witness2FullName',
          label: 'اسم الشاهد الثاني (رباعي)',
          type: 'text',
          required: true,
          validation: { required: 'اسم الشاهد الثاني مطلوب' }
        },
        {
          name: 'witness2PassportNumber',
          label: 'رقم جواز السفر',
          type: 'text',
          required: true,
          validation: { required: 'رقم جواز السفر مطلوب' }
        },
        {
          name: 'witness2AddressKSA',
          label: 'العنوان بالسعودية',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسعودية مطلوب' }
        },
        {
          name: 'witness2MobileKSA',
          label: 'رقم الجوال بالسعودية',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الجوال بالسعودية مطلوب' }
        },
        {
          name: 'witness2AddressSudan',
          label: 'العنوان بالسودان',
          type: 'text',
          required: false
        },
        {
          name: 'witness2MobileSudan',
          label: 'رقم الجوال بالسودان',
          type: 'tel',
          required: false
        }
      ]
    },
    {
      id: 'documents',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'groomPassportCopy',
          label: 'إثبات شخصية الخاطب (الجواز أو الرقم الوطني)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB',
          validation: { required: 'إثبات شخصية الخاطب مطلوب' }
        },
        {
          name: 'bridePassportCopy',
          label: 'إثبات شخصية المخطوبة (الجواز أو الرقم الوطني)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB',
          validation: { required: 'إثبات شخصية المخطوبة مطلوب' }
        },
        {
          name: 'guardianPassportCopy',
          label: 'إثبات شخصية ولي المخطوبة (الأب)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB',
          validation: { required: 'إثبات شخصية الولي مطلوب' }
        },
        {
          name: 'witness1PassportCopy',
          label: 'إثبات شخصية الشاهد الأول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB',
          validation: { required: 'إثبات شخصية الشاهد الأول مطلوب' }
        },
        {
          name: 'witness2PassportCopy',
          label: 'إثبات شخصية الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB',
          validation: { required: 'إثبات شخصية الشاهد الثاني مطلوب' }
        },
        {
          name: 'brideConsentLetter',
          label: 'إقرار موافقة المخطوبة على الزواج (في حال غياب المخطوبة)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB',
          help: 'في حال كانت المخطوبة غائبة عن مجلس العقد'
        },
        {
          name: 'brideDivorceCert',
          label: 'أصل وثيقة الطلاق موثقة من الخارجية السودانية (في حال كانت المخطوبة مطلقة)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          conditional: (data) => data.serviceType === 'marriage' && data.brideMaritalStatus === 'divorced',
          maxSize: '5MB'
        },
        {
          name: 'brideWidowDocs',
          label: 'وثيقة الزواج وشهادة وفاة الزوج أو الإعلام الشرعي للورثة (في حال كانت المخطوبة أرملة)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          conditional: (data) => data.serviceType === 'marriage' && data.brideMaritalStatus === 'widow',
          maxSize: '5MB'
        },
        {
          name: 'guardianPowerOfAttorney',
          label: 'توكيل الولي موثق من الخارجية السودانية (في حال غياب والد المخطوبة)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          conditional: (data) => data.serviceType === 'marriage' && data.hasGuardianAgent === 'yes',
          maxSize: '5MB'
        },
        {
          name: 'guardianDeathCert',
          label: 'إثبات وفاة الولي أو الإعلام الشرعي للوراثة (في حال وفاة ولي المخطوبة)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          conditional: (data) => data.serviceType === 'marriage',
          maxSize: '5MB'
        },
        {
          name: 'divorceReceipt',
          label: 'القسيمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'divorce',
          maxSize: '5MB',
          validation: { required: 'القسيمة مطلوبة' },
          description: 'قسيمة الطلاق الرسمية'
        },
        {
          name: 'husbandPassportCopy',
          label: 'صورة جواز الزوج',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'divorce',
          maxSize: '5MB',
          validation: { required: 'صورة جواز الزوج مطلوبة' },
          description: 'صورة واضحة من جواز سفر الزوج'
        },
        {
          name: 'wifePassportCopy',
          label: 'صورة جواز الزوجة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'divorce',
          maxSize: '5MB',
          validation: { required: 'صورة جواز الزوجة مطلوبة' },
          description: 'صورة واضحة من جواز سفر الزوجة'
        },
        {
          name: 'divorceWitness1PassportCopy',
          label: 'صورة جواز الشاهد الأول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'divorce',
          maxSize: '5MB',
          validation: { required: 'صورة جواز الشاهد الأول مطلوبة' },
          description: 'صورة واضحة من جواز سفر الشاهد الأول'
        },
        {
          name: 'divorceWitness2PassportCopy',
          label: 'صورة جواز الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          conditional: (data) => data.serviceType === 'divorce',
          maxSize: '5MB',
          validation: { required: 'صورة جواز الشاهد الثاني مطلوبة' },
          description: 'صورة واضحة من جواز سفر الشاهد الثاني'
        },
        {
          name: 'additionalDocuments',
          label: 'مستندات إضافية إن وجد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          conditional: (data) => data.serviceType === 'divorce',
          maxSize: '5MB',
          description: 'أي مستندات إضافية تود إرفاقها'
        }
      ]
    },
    {
      id: 'acknowledgment',
      title: 'الإقرار',
      fields: [
        {
          name: 'personalAttendance',
          label: 'أقر بأن جميع الأطراف والشهود سيحضرون شخصياً مع جوازات السفر الأصلية',
          type: 'checkbox',
          required: true,
          validation: {
            required: 'يجب الموافقة على الحضور الشخصي',
            validate: (value) => value === true || 'يجب الموافقة على الحضور الشخصي'
          }
        },
        {
          name: 'dataAccuracy',
          label: 'أتعهد بصحة جميع البيانات المذكورة أعلاه',
          type: 'checkbox',
          required: true,
          validation: {
            required: 'يجب تأكيد صحة البيانات',
            validate: (value) => value === true || 'يجب تأكيد صحة البيانات'
          }
        }
      ]
    }
  ]
};

export default madhooniaConfig;
