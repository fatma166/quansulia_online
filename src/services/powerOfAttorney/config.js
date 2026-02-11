// src/services/powerOfAttorney/config.js

// ===== 1) خريطة الأنواع الفرعية لكل نوع رئيسي =====
export const poaSubtypes = {
  general: [
    { value: "new_id_card",             label: "استخراج بطاقة جديدة",            description: "استخراج بطاقة/هوية/بديل لأول مرة حسب الجهة" },
    { value: "replacement_sim",         label: "استخرج شريحة بدل فاقد",          description: "استخراج شريحة هاتف بدل فاقد" },
    { value: "transfer_error_form",     label: "استمارة تحويل مبلغ بالخطاء",      description: "معالجة تحويل مالي تم بالخطأ" },
    { value: "account_management",      label: "ادارة حساب",                      description: "إدارة حساب بنكي/خدمات مرتبطة" },
    { value: "saudi_insurance_form",    label: "استمارة التامين السعودي",         description: "إجراءات متعلقة بشركات التأمين السعودية" },
    { value: "general_procedure_form",  label: "استمارة عامة لإجراء محدد",       description: "إنهاء إجراء إداري محدد لدى جهة ما" },
    { value: "foreign_embassy_memo",    label: "استمارة مذكرة لسفارة أجنبية",    description: "مخاطبة/مراسلة سفارة أجنبية" },
    { value: "document_authentication", label: "اسناد مستندات واثبات صحة",        description: "توثيق/تصديق مستندات وإثبات صحتها" },
    { value: "other_general",           label: "اخري",                             description: "طلب عام غير مصنّف" }
  ],
  courts: [
    { value: "land_litigation",     label: "تقاضي بشأن قطعة ارض",  description: "دعاوى أرض/عقار" },
    { value: "property_litigation", label: "تقاضي بشأن عقار",      description: "قضايا عقارية" },
    { value: "file_lawsuit",        label: "إقامة دعوى",           description: "رفع دعوى قضائية" },
    { value: "other_courts",        label: "اخري",                 description: "قضايا أخرى" }
  ],
  inheritance: [
    { value: "inheritance_inventory_form", label: "استمارة حصر ورثة", description: "حصر الورثة والأنصبة" },
    { value: "inheritance_waiver",         label: "تنازل عن نصيب في ورثة", description: "تنازل عن نصيب" },
    { value: "inheritance_receipt",        label: "استلام ورثة", description: "استلام نصيب الميراث" },
    { value: "other_inheritance",          label: "اخرى", description: "شؤون ميراث أخرى" }
  ],
  real_estate: [
    { value: "buy_land_property", label: "شراء ارض أو عقار", description: "شراء أراضي/عقارات" },
    { value: "land_sale",         label: "بيع قطعة أرض",    description: "بيع أرض" },
    { value: "property_sale",     label: "بيع عقار",        description: "بيع عقار" },
    { value: "other_real_estate", label: "اخري",            description: "معاملات عقارية أخرى" }
  ],
  vehicles: [
    { value: "vehicle_sale",     label: "بيع سيارة",    description: "بيع مركبة" },
    { value: "vehicle_receipt",  label: "استلام سيارة", description: "استلام مركبة" },
    { value: "vehicle_licensing",label: "ترخيص سيارة",  description: "ترخيص/تجديد" },
    { value: "other_vehicles",   label: "اخري",         description: "أعمال مركبات أخرى" }
  ],
  companies: [
    { value: "company_registration_form", label: "استمارة تسجيل شركة", description: "تسجيل شركة" },
    { value: "business_name_form",        label: "استمارة تأسيس اسم عمل", description: "اسم تجاري" },
    { value: "other_companies",           label: "اخرى", description: "شؤون شركات أخرى" }
  ],
  marriage_divorce: [
    { value: "marriage_contract",  label: "عقد زواج",     description: "إتمام عقد زواج" },
    { value: "divorce_procedures", label: "إجراءات طلاق", description: "إجراءات الطلاق" },
    { value: "other_marriage",     label: "اخرى",         description: "أخرى" }
  ],
  birth_certificates: [
    { value: "birth_certificate_issuance", label: "استخراج شهادات ميلاد", description: "استخراج شهادة ميلاد" }
  ],
  educational: [
    { value: "educational_certificate_issuance", label: "إستخراج شهادة دراسية", description: "استخراج شهادة" },
    { value: "university_egypt",                 label: "دراسة جامعية بمصر",     description: "إجراءات الدراسة" },
    { value: "other_educational",                label: "اخرى",                   description: "شؤون تعليمية أخرى" }
  ]
};


// ===== 2) الإعدادات الرئيسية للخدمة =====
export const powerOfAttorneyConfig = {
  id: 'powerOfAttorney',
  title: 'التوكيلات',
  description: 'إصدار توكيلات رسمية لمختلف الأغراض',
  icon: 'Scale',
  category: 'legal',
  hasSubcategories: true,

  subcategories: [
    { id: 'general', title: 'تواكيل منوعة', description: 'تواكيل منوعة لجميع الأغراض والمعاملات', icon: '📋', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', route: '/services/poa/general' },
    { id: 'courts', title: 'محاكم وقضايا ودعاوي', description: 'توكيل خاص بالمرافعات والقضايا القانونية والدعاوي', icon: '⚖️', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', route: '/services/poa/courts' },
    { id: 'inheritance', title: 'الورثة', description: 'توكيل خاص بقسمة التركات وشؤون الورثة', icon: '👨‍👩‍👧‍👦', color: 'from-amber-500 to-amber-600', bgColor: 'bg-amber-50', route: '/services/poa/inheritance' },
    { id: 'real_estate', title: 'عقارات وأراضي', description: 'توكيل للمعاملات العقارية وبيع وشراء الأراضي', icon: '🏠', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', route: '/services/poa/real-estate' },
    { id: 'vehicles', title: 'سيارات', description: 'توكيل خاص بمعاملات السيارات والمركبات', icon: '🚗', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', route: '/services/poa/vehicles' },
    { id: 'companies', title: 'الشركات', description: 'توكيل للمعاملات التجارية وإدارة الشركات', icon: '🏢', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', route: '/services/poa/companies' },
    { id: 'marriage_divorce', title: 'إجراءات الزواج والطلاق', description: 'توكيل خاص بعقود الزواج والطلاق والمأذونية', icon: '💍', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50', route: '/services/poa/marriage-divorce' },
    { id: 'birth_certificates', title: 'شهادات ميلاد', description: 'توكيل لاستلام شهادات الميلاد والوثائق المدنية', icon: '👶', color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50', route: '/services/poa/birth-certificates' },
    { id: 'educational', title: 'شهادة دراسية', description: 'توكيل لاستلام الشهادات الدراسية والوثائق التعليمية', icon: '🎓', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-50', route: '/services/poa/educational' }
  ],

  requirements: [
    'حضور الموكل شخصياً',
    'إثبات هوية الموكل',
    'إثبات هوية الوكيل',
    'تحديد الغرض من التوكيل بوضوح'
  ],
  fees: { base: 200, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع التوكيل المطلوب',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],

  steps: [
    // 1) اختيار النوع الفرعي + فيلداته الشرطية
    {
      id: 'poa-subtype-selection',
      title: 'بيانات التوكيل',
      fields: [
        // اسم الوكيل - يظهر لجميع أنواع التوكيلات
        {
          name: 'agentFullName',
          label: 'اسم الوكيل رباعياً',
          type: 'text',
          required: true,
          validation: { required: 'اسم الوكيل رباعياً مطلوب' }
        },

        // ---- فيلدات متوقعة لكل نوع (General + أمثلة لباقي الأنواع) ----

        // General
        { name: 'telecomCompany', label: 'شركة الاتصالات', type: 'searchable-select',
          options: [{value:'stc',label:'STC'},{value:'mobily',label:'Mobily'},{value:'zain',label:'Zain'},{value:'virgin',label:'Virgin Mobile'},{value:'lebara',label:'Lebara'},{value:'other',label:'أخرى'}],
          required: true, conditional: { field: 'poaSubtype', values: ['replacement_sim'] }
        },
        { name: 'phoneNumber', label: 'رقم الجوال المرتبط', type: 'tel', required: true,
          conditional: { field: 'poaSubtype', values: ['replacement_sim'] }
        },
        { name: 'idIssuingAuthority', label: 'الجهة المصدرة', type: 'searchable-select',
          options: [{value:'civil_affairs_sa',label:'الأحوال المدنية (السعودية)'},{value:'embassy_sudan',label:'السفارة/القنصلية السودانية'},{value:'other',label:'أخرى'}],
          required: true, conditional: { field: 'poaSubtype', values: ['new_id_card'] }
        },
        { name: 'bankName', label: 'اسم البنك', type: 'searchable-select',
          options: [{value:'alahli',label:'الأهلي'},{value:'alrajhi',label:'الراجحي'},{value:'riyad',label:'بنك الرياض'},{value:'inma',label:'الإنماء'},{value:'other',label:'بنك آخر'}],
          required: true, conditional: { field: 'poaSubtype', values: ['transfer_error_form','account_management'] }
        },

        // Courts
        { name: 'courtName', label: 'اسم المحكمة', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['land_litigation','property_litigation','file_lawsuit','other_courts'] }
        },
        { name: 'caseType', label: 'نوع الدعوى', type: 'text', required: false,
          conditional: { field: 'poaSubtype', values: ['land_litigation','property_litigation','file_lawsuit'] }
        },

        // Inheritance
        { name: 'heirsCount', label: 'عدد الورثة', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['inheritance_inventory_form','inheritance_receipt','inheritance_waiver','other_inheritance'] }
        },

        // Real estate
        { name: 'propertyType', label: 'نوع العقار/الأرض', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['buy_land_property','land_sale','property_sale','other_real_estate'] }
        },
        { name: 'propertyCity', label: 'مدينة/موقع العقار', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['buy_land_property','land_sale','property_sale','other_real_estate'] }
        },

        // Vehicles
        { name: 'vehiclePlate', label: 'رقم اللوحة', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['vehicle_sale','vehicle_receipt','vehicle_licensing','other_vehicles'] }
        },

        // Companies
        { name: 'companyName', label: 'اسم الشركة/الكيان', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['company_registration_form','business_name_form','other_companies'] }
        },

        // Marriage/Divorce
        { name: 'partyOneName', label: 'اسم الطرف الأول', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['marriage_contract','divorce_procedures','other_marriage'] }
        },
        { name: 'partyTwoName', label: 'اسم الطرف الثاني', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['marriage_contract','divorce_procedures','other_marriage'] }
        },

        // Birth certificates
        { name: 'personName', label: 'اسم صاحب الشهادة', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['birth_certificate_issuance'] }
        },

        // Educational
        { name: 'certificateType', label: 'نوع الشهادة الدراسية', type: 'text', required: true,
          conditional: { field: 'poaSubtype', values: ['educational_certificate_issuance','university_egypt','other_educational'] }
        }
      ]
    },

    // 4) المستندات (أساسية + شرطية)
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        // أساسي دائمًا
        {
          name: 'principalIdCopy',
          label: 'صورة هوية الموكل',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة هوية الموكل مطلوبة' }
        },
        {
          name: 'agentIdCopy',
          label: 'صورة هوية الوكيل',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة هوية الوكيل مطلوبة' }
        },

        // أمثلة شرطية
        { name: 'transferProof', label: 'إثبات التحويل (إيصال/كشف)', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', required: true, maxSize: '10MB',
          conditional: { field: 'poaSubtype', values: ['transfer_error_form'] }
        },
        { name: 'simLossReport', label: 'إفادة فقدان الشريحة (إن وُجدت)', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', required: false, maxSize: '5MB',
          conditional: { field: 'poaSubtype', values: ['replacement_sim'] }
        },
        { name: 'docScan', label: 'نسخة المستند المراد توثيقه', type: 'file', accept: '.pdf,.jpg,.jpeg,.png', required: true, maxSize: '10MB',
          conditional: { field: 'poaSubtype', values: ['document_authentication'] }
        }
      ]
    }
  ]
};

export default powerOfAttorneyConfig;
