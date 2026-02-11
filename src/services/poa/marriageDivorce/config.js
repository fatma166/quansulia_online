export const marriageDivorceConfig = {
  id: 'marriage-divorce',
  title: 'إجراءات الزواج والطلاق',
  description: 'توكيل خاص بعقود الزواج والطلاق والمأذونية',
  icon: 'Heart',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'المستندات الخاصة بالإجراء المطلوب',
    'شهود (عند الحاجة)'
  ],
  fees: { base: 200, currency: 'ريال سعودي' },
  duration: '2-3 أيام عمل',
  process: [
    'تحديد نوع الإجراء المطلوب',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'marriage-divorce-details',
      title: 'تفاصيل الخدمة',
      fields: [
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
          name: 'procedureType',
          label: 'نوع الإجراء',
          type: 'searchable-select',
          options: [
            { value: 'personal_marriage_contract', label: 'عقد قران شخصي', description: 'توكيل لإجراء عقد قران بحضور شخصي' },
            { value: 'marriage_certificate_authentication', label: 'استخراج وثيقة تصادق زواج', description: 'استخراج وثيقة تصادق رسمية للزواج' },
            { value: 'non_personal_marriage_contract', label: 'عقد قران غير شخصي', description: 'توكيل لإجراء عقد قران بدون حضور شخصي' },
            { value: 'no_objection_marriage_eligibility', label: 'عدم ممانعة وشهادة كفاءة زواج', description: 'استخراج عدم ممانعة وشهادة كفاءة للزواج' },
            { value: 'divorce_pronouncement', label: 'طلاق - إيقاع', description: 'توكيل لإيقاع الطلاق' },
            { value: 'divorce_deed', label: 'طلاق قسيمة', description: 'توكيل لإجراءات قسيمة الطلاق' },
            { value: 'extract_marriage_deed', label: 'استخراج قسيمة زواج', description: 'استخراج قسيمة زواج رسمية' },
            { value: 'authenticate_marriage_deed', label: 'توثيق قسيمة زواج', description: 'توثيق قسيمة زواج' },
            { value: 'marriage_contract', label: 'عقد زواج', description: 'توكيل لإجراء عقد زواج' },
            { value: 'divorce_procedures', label: 'إجراءات طلاق', description: 'توكيل لإجراءات الطلاق' },
            { value: 'marriage_certificate', label: 'شهادة زواج', description: 'استخراج أو تصديق شهادة زواج' },
            { value: 'divorce_certificate', label: 'شهادة طلاق', description: 'استخراج أو تصديق شهادة طلاق' },
            { value: 'marriage_update', label: 'تحديث بيانات زواج', description: 'تحديث أو تصحيح بيانات عقد زواج' },
            { value: 'other_marriage', label: 'أخرى', description: 'إجراء آخر متعلق بالزواج أو الطلاق' }
          ],
          required: true,
          validation: { required: 'نوع الإجراء مطلوب' }
        },
        // حقول عقد القران (شخصي وغير شخصي)
        {
          name: 'brideName',
          label: 'اسم العروس',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['personal_marriage_contract', 'non_personal_marriage_contract', 'marriage_contract']
          },
          validation: { required: 'اسم العروس مطلوب' }
        },
        {
          name: 'groomName',
          label: 'اسم العريس',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['personal_marriage_contract', 'non_personal_marriage_contract', 'marriage_contract']
          },
          validation: { required: 'اسم العريس مطلوب' }
        },

        // حقول استخراج وثيقة تصادق زواج
        {
          name: 'originalMarriageDate',
          label: 'تاريخ الزواج الأصلي',
          type: 'date',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['marriage_certificate_authentication', 'extract_marriage_deed', 'authenticate_marriage_deed']
          },
          validation: { required: 'تاريخ الزواج الأصلي مطلوب' }
        },
        {
          name: 'marriageAuthority',
          label: 'جهة إصدار عقد الزواج',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['marriage_certificate_authentication', 'extract_marriage_deed', 'authenticate_marriage_deed']
          },
          validation: { required: 'جهة إصدار عقد الزواج مطلوبة' }
        },

        // حقول عدم ممانعة وشهادة كفاءة زواج
        {
          name: 'fianceeName',
          label: 'اسم الخطيب/الخطيبة',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['no_objection_marriage_eligibility']
          },
          validation: { required: 'اسم الخطيب/الخطيبة مطلوب' }
        },
        {
          name: 'fianceeNationality',
          label: 'جنسية الخطيب/الخطيبة',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['no_objection_marriage_eligibility']
          },
          validation: { required: 'جنسية الخطيب/الخطيبة مطلوبة' }
        },
        {
          name: 'fianceeReligion',
          label: 'الديانة للخطيب/الخطيبة',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['no_objection_marriage_eligibility']
          },
          validation: { required: 'الديانة مطلوبة' }
        },
        {
          name: 'fianceeBirthDate',
          label: 'تاريخ الميلاد للخطيب/الخطيبة',
          type: 'date',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['no_objection_marriage_eligibility']
          },
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'fianceePassportNumber',
          label: 'رقم الجواز للخطيب/الخطيبة',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          conditional: {
            field: 'procedureType',
            values: ['no_objection_marriage_eligibility']
          },
          validation: { required: 'رقم الجواز مطلوب' }
        },
        {
          name: 'maritalStatus',
          label: 'الحالة الاجتماعية',
          type: 'searchable-select',
          options: [
            { value: 'married', label: 'متزوج' },
            { value: 'divorced', label: 'مطلق' },
            { value: 'widowed', label: 'أرمل/ة' }
          ],
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['no_objection_marriage_eligibility']
          },
          validation: { required: 'الحالة الاجتماعية مطلوبة' }
        },

        // حقول طلاق - إيقاع
        {
          name: 'wifeNameDivorce',
          label: 'اسم الزوجة',
          type: 'text',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['divorce_pronouncement', 'divorce_deed']
          },
          validation: { required: 'اسم الزوجة مطلوب' }
        },
        {
          name: 'marriageContractDate',
          label: 'تاريخ عقد الزواج',
          type: 'date',
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['divorce_pronouncement', 'divorce_deed']
          },
          validation: { required: 'تاريخ عقد الزواج مطلوب' }
        },
        {
          name: 'divorceType',
          label: 'نوع الطلاق',
          type: 'select',
          options: [
            { value: 'revocable', label: 'طلاق رجعي' },
            { value: 'irrevocable_minor', label: 'طلاق بائن بينونة صغرى' },
            { value: 'irrevocable_major', label: 'طلاق بائن بينونة كبرى' },
            { value: 'khula', label: 'خلع' }
          ],
          required: true,
          conditional: {
            field: 'procedureType',
            values: ['divorce_pronouncement']
          },
          validation: { required: 'نوع الطلاق مطلوب' }
        },
        {
          name: 'spouseName',
          label: 'اسم الزوج/الزوجة',
          type: 'text',
          required: true,
          conditional: { field: 'procedureType', values: ['divorce_procedures', 'divorce_certificate'] },
          validation: { required: 'اسم الزوج/الزوجة مطلوب' }
        },
        {
          name: 'marriageDateOriginal',
          label: 'تاريخ الزواج الأصلي',
          type: 'date',
          required: true,
          conditional: { field: 'procedureType', values: ['divorce_procedures', 'marriage_certificate', 'divorce_certificate', 'marriage_update'] },
          validation: { required: 'تاريخ الزواج الأصلي مطلوب' }
        },
        {
          name: 'procedureDetails',
          label: 'تفاصيل الإجراء المطلوب',
          type: 'textarea',
          required: true,
          rows: 4,
          className: 'md:col-span-2',
          help: 'حدد بوضوح الإجراء المطلوب من الوكيل',
          validation: { required: 'تفاصيل الإجراء مطلوبة' }
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
          name: 'marriageDocs',
          label: 'المستندات المتعلقة بالزواج/الطلاق',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'عقد الزواج، شهادات، أو أي مستندات ذات صلة'
        },
        {
          name: 'supportingDocs',
          label: 'مستندات داعمة إضافية',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB'
        }
      ]
    }
  ]
};
