export const courtsConfig = {
  id: 'courts',
  title: 'محاكم وقضايا ودعاوي',
  description: 'توكيل خاص بالمرافعات والقضايا القانونية والدعاوي',
  icon: 'Scale',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'تحديد نوع القضية',
    'المستندات المتعلقة بالقضية',
    'تحديد الغرض من التوكيل بوضوح'
  ],
  fees: { base: 250, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع القضية',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'case-details',
      title: 'تفاصيل القضية',
      fields: [
        // 1) نوع القضية أولاً
        {
          name: 'caseType',
          label: 'نوع القضية',
          type: 'searchable-select',
          options: [
            { value: 'land_litigation', label: 'تقاضي بشأن قطعة أرض', description: 'دعاوى متعلقة بالأراضي' },
            { value: 'property_litigation', label: 'تقاضي بشأن عقار', description: 'دعاوى متعلقة بالعقارات' },
            { value: 'irrigation_litigation', label: 'تقاضي بشأن ساقية', description: 'دعاوى متعلقة بالمياه والري' },
            { value: 'custody_litigation', label: 'تقاضي بشأن حضانة شخصية', description: 'دعاوى الحضانة' },
            { value: 'file_lawsuit', label: 'إقامة دعوى', description: 'رفع دعوى قضائية جديدة' },
            { value: 'name_correction_form', label: 'استمارة إشهاد تصحيح الاسم', description: 'تصحيح الاسم في الوثائق الرسمية' },
            { value: 'saudi_courts_form', label: 'استمارة المحاكم السعودية', description: 'المرافعة في المحاكم السعودية' },
            { value: 'egyptian_courts_form', label: 'استمارة مقاضاة بالمحاكم المصرية', description: 'المرافعة في المحاكم المصرية' },
            { value: 'land_property_litigation', label: 'تقاضي بشأن قطعة أرض أو عقار', description: 'دعاوى الأراضي والعقارات' },
            { value: 'other_courts', label: 'أخرى', description: 'قضايا قانونية أخرى' }
          ],
          required: true,
          validation: { required: 'نوع القضية مطلوب' }
        },

        // 2) كل العناصر المشروطة مباشرة بعد النوع
        // اسم المحكمة (مشروط ببعض الأنواع)
        {
          name: 'courtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: {
            field: 'caseType',
            values: [
              'land_litigation',
              'property_litigation',
              'land_property_litigation',
              'egyptian_courts_form'
            ]
          },
          validation: { required: 'اسم المحكمة مطلوب' }
        },

        // ——— أرض ———
        {
          name: 'landPlotNumber',
          label: 'رقم قطعة الأرض',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_litigation'] },
          validation: { required: 'رقم قطعة الأرض مطلوب' }
        },
        {
          name: 'landArea',
          label: 'المساحة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_litigation'] },
          validation: { required: 'المساحة مطلوبة' }
        },
        {
          name: 'landDistrict',
          label: 'المربع/الحي',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_litigation'] },
          validation: { required: 'المربع/الحي مطلوب' }
        },
        {
          name: 'landCity',
          label: 'المدينة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_litigation'] },
          validation: { required: 'المدينة مطلوبة' }
        },
        {
          name: 'landLawsuitNumber',
          label: 'رقم الدعوى المقامة',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['land_litigation'] }
        },
        {
          name: 'landReportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['land_litigation'] }
        },

        // مكان استخدام التوكيل
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

        // ——— عقار ———
        {
          name: 'propertyNumber',
          label: 'رقم العقار',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['property_litigation'] },
          validation: { required: 'رقم العقار مطلوب' }
        },
        {
          name: 'propertyArea',
          label: 'المساحة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['property_litigation'] },
          validation: { required: 'المساحة مطلوبة' }
        },
        {
          name: 'propertyRegion',
          label: 'المنطقة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['property_litigation'] },
          validation: { required: 'المنطقة مطلوبة' }
        },
        {
          name: 'propertyAddress',
          label: 'عنوان العقار',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['property_litigation'] },
          validation: { required: 'عنوان العقار مطلوب' }
        },
        {
          name: 'propertyLawsuitNumber',
          label: 'رقم الدعوى المقامة',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['property_litigation'] }
        },
        {
          name: 'propertyReportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['property_litigation'] }
        },

        // ——— ساقية ———
        {
          name: 'saqiaNumber',
          label: 'رقم الساقية',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['irrigation_litigation'] },
          validation: { required: 'رقم الساقية مطلوب' }
        },
        {
          name: 'saqiaArea',
          label: 'المساحة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['irrigation_litigation'] },
          validation: { required: 'المساحة مطلوبة' }
        },
        {
          name: 'saqiaRegion',
          label: 'المنطقة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['irrigation_litigation'] },
          validation: { required: 'المنطقة مطلوبة' }
        },
        {
          name: 'irrigationDetails',
          label: 'تفاصيل الساقية',
          type: 'textarea',
          rows: 3,
          required: true,
          conditional: { field: 'caseType', values: ['irrigation_litigation'] },
          validation: { required: 'تفاصيل الساقية مطلوبة' }
        },
        {
          name: 'irrigationLawsuitNumber',
          label: 'رقم الدعوى المقامة',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['irrigation_litigation'] }
        },
        {
          name: 'irrigationReportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['irrigation_litigation'] }
        },

        // ——— حضانة شخصية ———
        {
          name: 'custodyChildName',
          label: 'اسم المراد ضم حضانته/ها',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['custody_litigation'] },
          validation: { required: 'اسم الطفل/الشخص مطلوب' }
        },
        {
          name: 'custodyToName',
          label: 'اسم المراد ضم الحضانة له/لها',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['custody_litigation'] },
          validation: { required: 'اسم صاحب/صاحبة الحضانة مطلوب' }
        },
        {
          name: 'custodyRelationship',
          label: 'صلة القرابة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['custody_litigation'] },
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'custodyLawsuitNumber',
          label: 'رقم الدعوى المقامة',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['custody_litigation'] }
        },
        {
          name: 'custodyReportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['custody_litigation'] }
        },

        // ——— إقامة دعوى ———
        {
          name: 'defendantName',
          label: 'اسم المدعى عليه',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['file_lawsuit'] },
          validation: { required: 'اسم المدعى عليه مطلوب' }
        },
        {
          name: 'lawsuitType',
          label: 'نوع الدعوى المقامة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['file_lawsuit'] },
          validation: { required: 'نوع الدعوى مطلوب' }
        },
        {
          name: 'fileLawsuitReportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['file_lawsuit'] }
        },

        // ——— إشهاد تصحيح الاسم ———
        {
          name: 'wrongName',
          label: 'الاسم الوارد بالخطأ',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['name_correction_form'] },
          validation: { required: 'الاسم الوارد بالخطأ مطلوب' }
        },
        {
          name: 'documentWithError',
          label: 'المستند الذي ورد فيه الخطأ',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['name_correction_form'] },
          validation: { required: 'اسم المستند مطلوب' }
        },

        // ——— المحاكم السعودية ———
        {
          name: 'ksaPlaceOfUse',
          label: 'مكان استخدام التوكيل',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['saudi_courts_form'] },
          validation: { required: 'مكان استخدام التوكيل مطلوب' }
        },
        {
          name: 'ksaNationalId',
          label: 'رقم الهوية (السعودية)',
          type: 'text',
          pattern: '\\d{10,14}',
          help: '10–14 رقمًا',
          required: true,
          conditional: { field: 'caseType', values: ['saudi_courts_form'] },
          validation: { required: 'رقم الهوية مطلوب' }
        },

        // ——— المحاكم المصرية ———
        {
          name: 'egyCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['egyptian_courts_form'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },
        {
          name: 'egyLawsuitNumber',
          label: 'رقم الدعوى',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['egyptian_courts_form'] }
        },
        {
          name: 'egyNationalId',
          label: 'رقم الهوية',
          type: 'text',
          pattern: '\\d{10,14}',
          help: '10–14 رقمًا',
          required: true,
          conditional: { field: 'caseType', values: ['egyptian_courts_form'] },
          validation: { required: 'رقم الهوية مطلوب' }
        },

        // ——— قطعة أرض أو عقار (مجمّعة) ———
        {
          name: 'lpNumber',
          label: 'رقم الأرض أو العقار',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_property_litigation'] },
          validation: { required: 'رقم الأرض/العقار مطلوب' }
        },
        {
          name: 'lpArea',
          label: 'المساحة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_property_litigation'] },
          validation: { required: 'المساحة مطلوبة' }
        },
        {
          name: 'lpRegion',
          label: 'المنطقة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_property_litigation'] },
          validation: { required: 'المنطقة مطلوبة' }
        },
        {
          name: 'lpCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'caseType', values: ['land_property_litigation'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },
        {
          name: 'lpLawsuitNumber',
          label: 'رقم الدعوى المقامة',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['land_property_litigation'] }
        },
        {
          name: 'lpReportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: false,
          conditional: { field: 'caseType', values: ['land_property_litigation'] }
        },

        // 3) الحقول العامة بعد كل المشروط
        {
          name: 'caseDescription',
          label: 'وصف القضية',
          type: 'textarea',
          rows: 4,
          className: 'md:col-span-2',
          required: true,
          conditional: { field: 'caseType', values: ['name_correction_form'], exclude: true },
          validation: { required: 'وصف القضية مطلوب' }
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
          name: 'caseDocuments',
          label: 'مستندات القضية',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: true,
          maxSize: '10MB',
          validation: { required: 'مستندات القضية مطلوبة' }
        }
      ]
    }
  ]
};