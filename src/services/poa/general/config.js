export const generalConfig = {
  id: 'general',
  title: 'تواكيل منوعة',
  description: 'تواكيل منوعة لجميع الأغراض والمعاملات',
  icon: 'FileText',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'تحديد الغرض من التوكيل بوضوح',
    'شهود (عند الحاجة)'
  ],
  fees: { base: 180, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد الغرض من التوكيل',
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
          name: 'generalType',
          label: 'نوع التوكيل العام',
          type: 'searchable-select',
          options: [
            { value: 'new_id_card', label: 'استخراج بطاقة جديدة', description: 'استخراج بطاقة/هوية/بديل لأول مرة حسب الجهة' },
            { value: 'replacement_sim', label: 'استخرج شريحة بدل فاقد', description: 'استخراج شريحة هاتف بدل فاقد' },
            { value: 'transfer_error_form', label: 'استمارة تحويل مبلغ بالخطأ', description: 'معالجة تحويل مالي تم بالخطأ' },
            { value: 'account_management', label: 'ادارة حساب', description: 'إدارة حساب بنكي/خدمات مرتبطة' },
            { value: 'saudi_insurance_form', label: 'استمارة التأمين السعودي', description: 'إجراءات متعلقة بشركات التأمين السعودية' },
            { value: 'general_procedure_form', label: 'استمارة عامة لإجراء محدد', description: 'إنهاء إجراء إداري محدد لدى جهة ما' },
            { value: 'foreign_embassy_memo', label: 'استمارة مذكرة لسفارة أجنبية', description: 'مخاطبة/مراسلة سفارة أجنبية' },
            { value: 'document_authentication', label: 'إسناد مستندات وإثبات صحة', description: 'توثيق/تصديق مستندات وإثبات صحتها' },
            { value: 'other_general', label: 'أخرى', description: 'طلب عام غير مصنّف' }
          ],
          required: true,
          validation: { required: 'نوع التوكيل العام مطلوب' }
        },

        // --- شركات الاتصالات (للشريحة/البطاقة) ---
        {
          name: 'telecomCompany',
          label: 'شركة الاتصالات',
          type: 'select',
          options: [
            { value: 'stc', label: 'STC - شركة الاتصالات السعودية' },
            { value: 'mobily', label: 'Mobily - اتحاد اتصالات' },
            { value: 'zain', label: 'Zain - زين السعودية' },
            { value: 'virgin', label: 'Virgin Mobile - فيرجن موبايل' },
            { value: 'lebara', label: 'Lebara - ليبارا' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'generalType', values: ['replacement_sim', 'new_id_card'] },
          validation: { required: 'شركة الاتصالات مطلوبة' }
        },
        {
          name: 'phoneNumber',
          label: 'رقم الجوال المرتبط',
          type: 'tel',
          required: true,
          conditional: { field: 'generalType', values: ['replacement_sim'] },
          validation: { required: 'رقم الجوال مطلوب' }
        },

        // --- بنكي (إدارة حساب/تحويل بالخطأ/التأمين) ---
        {
          name: 'bankName',
          label: 'اسم البنك',
          type: 'select',
          options: [
            { value: 'alahli', label: 'البنك الأهلي السعودي' },
            { value: 'alrajhi', label: 'مصرف الراجحي' },
            { value: 'riyad', label: 'بنك الرياض' },
            { value: 'inma', label: 'بنك الإنماء' },
            { value: 'samba', label: 'بنك سامبا' },
            { value: 'other', label: 'بنك آخر' }
          ],
          required: true,
          conditional: { field: 'generalType', values: ['transfer_error_form', 'account_management', 'saudi_insurance_form'] },
          validation: { required: 'اسم البنك مطلوب' }
        },
        {
          name: 'accountNumber',
          label: 'رقم الحساب',
          type: 'text',
          required: true,
          conditional: { field: 'generalType', values: ['account_management'] },
          validation: { required: 'رقم الحساب مطلوب' }
        },

        // --- تحويل مبلغ بالخطأ: اسم المستفيد ورقم حسابه + مبلغ التحويل ---
        {
          name: 'transferAmount',
          label: 'مبلغ التحويل',
          type: 'number',
          required: true,
          conditional: { field: 'generalType', values: ['transfer_error_form'] },
          validation: { required: 'مبلغ التحويل مطلوب' }
        },
        {
          name: 'beneficiaryName',
          label: 'اسم المستفيد الذي تم التحويل له بالخطأ',
          type: 'text',
          required: true,
          conditional: { field: 'generalType', values: ['transfer_error_form'] },
          validation: { required: 'اسم المستفيد مطلوب' }
        },
        {
          name: 'beneficiaryAccount',
          label: 'رقم حساب المستفيد الذي تم التحويل له بالخطأ',
          type: 'text',
          required: true,
          conditional: { field: 'generalType', values: ['transfer_error_form'] },
          help: 'اكتب رقم الحساب كما يظهر في التحويل',
          validation: { required: 'رقم حساب المستفيد مطلوب' }
        },

        // --- التأمين السعودي: شركة التأمين + آيبان + ملاحظة اختيارية ---
        {
          name: 'insuranceCompany',
          label: 'شركة التأمين',
          type: 'select',
          options: [
            { value: 'tawuniya', label: 'التعاونية للتأمين' },
            { value: 'allianz', label: 'أليانز السعودية' },
            { value: 'bupa', label: 'بوبا العربية' },
            { value: 'medgulf', label: 'مدجلف للتأمين' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'generalType', values: ['saudi_insurance_form'] },
          validation: { required: 'شركة التأمين مطلوبة' }
        },
        {
          name: 'iban',
          label: 'رقم الآيبان لتحويل المبلغ',
          type: 'text',
          required: true,
          conditional: { field: 'generalType', values: ['saudi_insurance_form'] },
          pattern: '^SA\\d{22}$',
          help: 'صيغة آيبان السعودية: يبدأ بـ SA ويليه 22 رقم (مثال: SA0310000000000000000000)',
          validation: {
            required: 'رقم الآيبان مطلوب',
            pattern: 'صيغة الآيبان غير صحيحة (يجب أن يبدأ بـ SA ويليه 22 رقم)'
          }
        },
        {
          name: 'insuranceNote',
          label: 'تفاصيل إضافية لطلب التأمين (اختياري)',
          type: 'textarea',
          rows: 3,
          required: false,
          conditional: { field: 'generalType', values: ['saudi_insurance_form'] }
        },

        // --- مخاطبة سفارة/إجراء عام/أخرى/توثيق مستندات ---
        {
          name: 'procedureDescription',
          label: 'وصف الإجراء المطلوب',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'generalType', values: ['general_procedure_form', 'foreign_embassy_memo', 'other_general'] },
          validation: { required: 'وصف الإجراء مطلوب' }
        },
        {
          name: 'embassyName',
          label: 'اسم السفارة',
          type: 'text',
          required: true,
          conditional: { field: 'generalType', values: ['foreign_embassy_memo'] },
          validation: { required: 'اسم السفارة مطلوب' }
        },
        {
          name: 'documentType',
          label: 'نوع المستند',
          type: 'select',
          options: [
            { value: 'educational', label: 'شهادة تعليمية' },
            { value: 'commercial', label: 'مستند تجاري' },
            { value: 'legal', label: 'مستند قانوني' },
            { value: 'personal', label: 'مستند شخصي' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'generalType', values: ['document_authentication'] },
          validation: { required: 'نوع المستند مطلوب' }
        },

        // --- نص الغرض من التوكيل (موحّد وغير مكرر) ---
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

        // --- مكان استخدام التوكيل ---
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

        // --- الشهود (تُستثنى حالات محددة) ---
        {
          name: 'witness1Name',
          label: 'اسم الشاهد الأول',
          type: 'text',
          required: true,
          conditional: {
            field: 'generalType',
            values: [
              'new_id_card',
              'replacement_sim',
              'transfer_error_form',
              'account_management',
              'saudi_insurance_form',
              'general_procedure_form',
              'other_general'
            ],
            exclude: true
          },
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witness1Id',
          label: 'رقم جواز سفر الشاهد الأول',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          conditional: {
            field: 'generalType',
            values: [
              'new_id_card',
              'replacement_sim',
              'transfer_error_form',
              'account_management',
              'saudi_insurance_form',
              'general_procedure_form',
              'other_general'
            ],
            exclude: true
          },
          validation: { required: 'رقم جواز الشاهد الأول مطلوب' }
        },
        {
          name: 'witness2Name',
          label: 'اسم الشاهد الثاني',
          type: 'text',
          required: true,
          conditional: {
            field: 'generalType',
            values: [
              'new_id_card',
              'replacement_sim',
              'transfer_error_form',
              'account_management',
              'saudi_insurance_form',
              'general_procedure_form',
              'other_general'
            ],
            exclude: true
          },
          validation: { required: 'اسم الشاهد الثاني مطلوب' }
        },
        {
          name: 'witness2Id',
          label: 'رقم جواز سفر الشاهد الثاني',
          type: 'text',
          required: true,
          pattern: '[A-Z][0-9]{7,8}',
          help: 'حرف إنجليزي واحد يليه أرقام (مثال: P1234567)',
          conditional: {
            field: 'generalType',
            values: [
              'new_id_card',
              'replacement_sim',
              'transfer_error_form',
              'account_management',
              'saudi_insurance_form',
              'general_procedure_form',
              'other_general'
            ],
            exclude: true
          },
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
          required: false,
          maxSize: '5MB',
          conditional: {
            field: 'generalType',
            values: [
              'new_id_card',
              'replacement_sim',
              'transfer_error_form',
              'account_management',
              'saudi_insurance_form',
              'general_procedure_form',
              'other_general'
            ],
            exclude: true
          },
          validation: { required: 'صورة جواز السفر الشاهد الأول مطلوبة' }
        },
        {
          name: 'witness2PassportCopy',
          label: 'صورة جواز السفر الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB',
          conditional: {
            field: 'generalType',
            values: [
              'new_id_card',
              'replacement_sim',
              'transfer_error_form',
              'account_management',
              'saudi_insurance_form',
              'general_procedure_form',
              'other_general'
            ],
            exclude: true
          },
          validation: { required: 'صورة جواز السفر الشاهد الثاني مطلوبة' }
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