export const realEstateConfig = {
  id: 'real_estate',
  title: 'عقارات وأراضي',
  description: 'توكيل للمعاملات العقارية وبيع وشراء الأراضي',
  icon: 'Building',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'صكوك الملكية أو عقود الإيجار',
    'شهادة إثبات الملكية (في حالة البيع)',
    'تحديد العقار أو الأرض بدقة',
    'تحديد الغرض من التوكيل بوضوح'
  ],
  fees: { base: 300, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع المعاملة العقارية',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'property-details',
      title: 'تفاصيل العقار',
      fields: [
        {
          name: 'transactionType',
          label: 'نوع المعاملة العقارية',
          type: 'select',
          options: [
            { value: 'buy_land_property', label: 'شراء ارض أو عقار', description: 'توكيل لشراء أرض أو عقار' },
            { value: 'land_gift', label: 'هبة قطعة ارض', description: 'توكيل لهبة قطعة أرض' },
            { value: 'buy_property_egypt', label: 'شراء عقار بمصر', description: 'توكيل لشراء عقار في مصر' },
            { value: 'release_seizure_sell', label: 'فك حجز وبيع ارض أو عقار', description: 'توكيل لفك الحجز وبيع أرض أو عقار' },
            { value: 'search_certificate', label: 'شهادة بحث بغرض التأكد', description: 'توكيل للحصول على شهادة بحث للتأكد' },
            { value: 'mortgage_land', label: 'رهن قطعة أرض', description: 'توكيل لرهن قطعة أرض' },
            { value: 'register_land', label: 'تسجيل قطعة أرض', description: 'توكيل لتسجيل ملكية قطعة أرض' },
            { value: 'waive_land', label: 'تنازل قطعة أرض', description: 'توكيل للتنازل عن قطعة أرض' },
            { value: 'reserve_land', label: 'حجز قطعة ارض', description: 'توكيل لحجز قطعة أرض' },
            { value: 'sell_land', label: 'بيع قطعة أرض', description: 'توكيل لبيع قطعة أرض' },
            { value: 'supervise_land', label: 'إشراف على قطعة ارض', description: 'توكيل للإشراف على قطعة أرض' },
            { value: 'gift_land_property', label: 'هبة قطعة ارض أو عقار', description: 'توكيل لهبة أرض أو عقار' },
            { value: 'waive_land_property', label: 'تنازل عن قطعة ارض أو عقار', description: 'توكيل للتنازل عن أرض أو عقار' },
            { value: 'sell_land_property', label: 'بيع ارض أو عقار', description: 'توكيل لبيع أرض أو عقار' },
            { value: 'search_certificate_division', label: 'شهادة بحث بغرض التأكد وقسمة الإفراز', description: 'توكيل للحصول على شهادة بحث وقسمة الإفراز' },
            { value: 'accept_gift', label: 'قبول الهبة', description: 'توكيل لقبول الهبة' },
            { value: 'release_seizure_sell_duplicate', label: 'فك حجز وبيع ارض أو عقار', description: 'توكيل لفك الحجز وبيع أرض أو عقار' },
            { value: 'buy_property', label: 'شراء عقار', description: 'توكيل لشراء عقار' },
            { value: 'mortgage_property', label: 'رهن عقار', description: 'توكيل لرهن عقار' },
            { value: 'reserve_property', label: 'حجز عقار', description: 'توكيل لحجز عقار' },
            { value: 'register_property', label: 'تسجيل عقار', description: 'توكيل لتسجيل ملكية عقار' },
            { value: 'sell_property', label: 'بيع عقار', description: 'توكيل لبيع عقار' },
            { value: 'waive_property', label: 'تنازل عن عقار', description: 'توكيل للتنازل عن عقار' },
            { value: 'supervise_property', label: 'إشراف على عقار', description: 'توكيل للإشراف على عقار' },
            { value: 'add_services_property', label: 'ادخال خدمات على عقار', description: 'توكيل لإدخال خدمات على عقار' },
            { value: 'gift_irrigation', label: 'هبة ساقية', description: 'توكيل لهبة ساقية' },
            { value: 'reserve_irrigation', label: 'حجز ساقية', description: 'توكيل لحجز ساقية' },
            { value: 'sell_irrigation', label: 'بيع ساقية', description: 'توكيل لبيع ساقية' },
            { value: 'buy_apartment_egypt', label: 'شراء شقة بمصر', description: 'توكيل لشراء شقة في مصر' },
            { value: 'other_real_estate', label: 'اخري', description: 'توكيل لمعاملات عقارية أخرى' }
          ],
          required: true,
          validation: { required: 'نوع المعاملة العقارية مطلوب' }
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
        // الحقول الشرطية لكل نوع

        // حقول عامة جديدة
        {
          name: 'plotNumber',
          label: 'رقم قطعة الأرض / رقم العقار',
          type: 'text',
          required: true,
          validation: { required: 'رقم قطعة الأرض / رقم العقار مطلوب' }
        },
        {
          name: 'propertyArea',
          label: 'المساحة',
          type: 'text',
          required: true,
          validation: { required: 'المساحة مطلوبة' }
        },
        {
          name: 'propertyCity',
          label: 'المدينة',
          type: 'text',
          required: true,
          validation: { required: 'المدينة مطلوبة' }
        },
        {
          name: 'propertyDistrict',
          label: 'الحي / المربع',
          type: 'text',
          required: true,
          validation: { required: 'الحي / المربع مطلوب' }
        },
        {
          name: 'poaPurpose',
          label: 'الغرض من التوكيل',
          type: 'textarea',
          required: true,
          rows: 3,
          help: 'حدد بوضوح الغرض من التوكيل',
          validation: { required: 'الغرض من التوكيل مطلوب' }
        },
        {
          name: 'propertyLocation',
          label: 'موقع العقار/الأرض',
          type: 'text',
          required: false,
          help: 'وصف إضافي للموقع إذا لزم الأمر'
        },

        // شراء ارض أو عقار: حذف قيمة العقار
        // شراء شقة بمصر: حذف قيمة العقار
        {
          name: 'propertyValue',
          label: 'قيمة العقار/الأرض',
          type: 'number',
          required: true,
          conditional: {
            field: 'transactionType',
            values: [
              'buy_property_egypt', 'sell_land', 'sell_land_property',
              'buy_property', 'sell_property'
            ]
          },
          validation: { required: 'قيمة العقار/الأرض مطلوبة' }
        },
        // هبة قطعة ارض أو عقار: حذف بيانات الموهوب له
        // بيع ارض او عقار: حذف بيانات الموهوب له
        // قبول الهبة: حذف بيانات الموهوب له + إضافة اشهاد الهبة
        {
          name: 'gifteeDetails',
          label: 'بيانات الموهوب له',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: {
            field: 'transactionType',
            values: ['gift_irrigation']
          },
          validation: { required: 'بيانات الموهوب له مطلوبة' }
        },
        {
          name: 'giftCertificate',
          label: 'اشهاد الهبة',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: {
            field: 'transactionType',
            values: ['accept_gift']
          },
          help: 'تفاصيل اشهاد الهبة',
          validation: { required: 'اشهاد الهبة مطلوب' }
        },
        {
          name: 'mortgageAmount',
          label: 'مبلغ الرهن',
          type: 'number',
          required: true,
          conditional: { 
            field: 'transactionType', 
            values: ['mortgage_land', 'mortgage_property'] 
          },
          validation: { required: 'مبلغ الرهن مطلوب' }
        },
        {
          name: 'mortgageDuration',
          label: 'مدة الرهن',
          type: 'text',
          required: true,
          conditional: { 
            field: 'transactionType', 
            values: ['mortgage_land', 'mortgage_property'] 
          },
          validation: { required: 'مدة الرهن مطلوبة' }
        },
        {
          name: 'seizureReason',
          label: 'سبب الحجز',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { 
            field: 'transactionType', 
            values: ['release_seizure_sell', 'reserve_land', 'reserve_property', 'reserve_irrigation'] 
          },
          validation: { required: 'سبب الحجز مطلوب' }
        },
        {
          name: 'searchPurpose',
          label: 'الغرض من البحث',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { 
            field: 'transactionType', 
            values: ['search_certificate', 'search_certificate_division'] 
          },
          validation: { required: 'الغرض من البحث مطلوب' }
        },
        {
          name: 'irrigationDetails',
          label: 'تفاصيل الساقية',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { 
            field: 'transactionType', 
            values: ['gift_irrigation', 'reserve_irrigation', 'sell_irrigation'] 
          },
          validation: { required: 'تفاصيل الساقية مطلوبة' }
        },
        {
          name: 'countryLocation',
          label: 'الموقع في مصر',
          type: 'text',
          required: true,
          conditional: { 
            field: 'transactionType', 
            values: ['buy_property_egypt', 'buy_apartment_egypt'] 
          },
          validation: { required: 'الموقع في مصر مطلوب' }
        },
        {
          name: 'supervisionDuration',
          label: 'مدة الإشراف',
          type: 'text',
          required: true,
          conditional: {
            field: 'transactionType',
            values: ['supervise_land', 'supervise_property']
          },
          validation: { required: 'مدة الإشراف مطلوبة' }
        },
        // إشراف على قطعة ارض / عقار: إضافة رقم البلاغ، رقم الدعوى، اسم المحكمة
        {
          name: 'reportNumber',
          label: 'رقم البلاغ',
          type: 'text',
          required: true,
          conditional: {
            field: 'transactionType',
            values: ['supervise_land', 'supervise_property']
          },
          validation: { required: 'رقم البلاغ مطلوب' }
        },
        {
          name: 'lawsuitNumber',
          label: 'رقم الدعوى المقامة',
          type: 'text',
          required: true,
          conditional: {
            field: 'transactionType',
            values: ['supervise_land', 'supervise_property']
          },
          validation: { required: 'رقم الدعوى المقامة مطلوب' }
        },
        {
          name: 'competentCourt',
          label: 'اسم المحكمة المختصة',
          type: 'text',
          required: true,
          conditional: {
            field: 'transactionType',
            values: ['supervise_land', 'supervise_property']
          },
          validation: { required: 'اسم المحكمة المختصة مطلوب' }
        },
        {
          name: 'waiveReason',
          label: 'سبب التنازل',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { 
            field: 'transactionType', 
            values: ['waive_land', 'waive_property', 'waive_land_property'] 
          },
          validation: { required: 'سبب التنازل مطلوب' }
        },
        {
          name: 'otherDetails',
          label: 'تفاصيل المعاملة',
          type: 'textarea',
          required: true,
          rows: 4,
          conditional: { 
            field: 'transactionType', 
            values: ['other_real_estate'] 
          },
          validation: { required: 'تفاصيل المعاملة مطلوبة' }
        },
        {
          name: 'propertyDescription',
          label: 'وصف العقار/الأرض',
          type: 'textarea',
          required: true,
          rows: 4,
          className: 'md:col-span-2',
          validation: { required: 'وصف العقار/الأرض مطلوب' }
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
          name: 'propertyDeed',
          label: 'صك الملكية أو عقد الإيجار',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '10MB',
          validation: { required: 'صك الملكية مطلوب' }
        },
        {
          name: 'ownershipCertificate',
          label: 'شهادة إثبات الملكية',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '10MB',
          description: 'شهادة رسمية تثبت ملكية العقار/الأرض',
          conditional: {
            field: 'transactionType',
            values: [
              'sell_land',
              'sell_property',
              'sell_land_property',
              'release_seizure_sell',
              'release_seizure_sell_duplicate',
              'sell_irrigation'
            ]
          },
          validation: { required: 'شهادة إثبات الملكية مطلوبة لعمليات البيع' }
        },
        {
          name: 'courtOrder',
          label: 'قرار المحكمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { 
            field: 'transactionType', 
            values: ['release_seizure_sell', 'release_seizure_sell_duplicate'] 
          },
          validation: { required: 'قرار المحكمة مطلوب لفك الحجز' }
        },
        {
          name: 'mortgageContract',
          label: 'عقد الرهن',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { 
            field: 'transactionType', 
            values: ['mortgage_land', 'mortgage_property'] 
          },
          validation: { required: 'عقد الرهن مطلوب' }
        },
        {
          name: 'giftContract',
          label: 'عقد الهبة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: {
            field: 'transactionType',
            values: ['gift_irrigation']
          },
          validation: { required: 'عقد الهبة مطلوب' }
        },
        {
          name: 'giftCertificateDoc',
          label: 'وثيقة اشهاد الهبة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: {
            field: 'transactionType',
            values: ['accept_gift']
          },
          validation: { required: 'وثيقة اشهاد الهبة مطلوبة' }
        },
        {
          name: 'supportingDocs',
          label: 'مستندات داعمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'أي مستندات إضافية تدعم المعاملة العقارية'
        }
      ]
    }
  ]
};