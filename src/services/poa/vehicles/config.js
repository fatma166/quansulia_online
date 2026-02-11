export const vehiclesConfig = {
  id: 'vehicles',
  title: 'سيارات',
  description: 'توكيل خاص بمعاملات السيارات والمركبات',
  icon: 'Car',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'استمارة السيارة أو رخصة القيادة',
    'شهادة بحث السيارة (إثبات ملكية)',
    'تحديد بيانات المركبة بدقة',
    'تحديد الغرض من التوكيل بوضوح'
  ],
  fees: { base: 220, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع معاملة السيارة',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'vehicle-details',
      title: 'تفاصيل السيارة',
      fields: [
        {
          name: 'vehicleTransactionType',
          label: 'نوع معاملة السيارة',
          type: 'searchable-select',
          options: [
            { value: 'vehicle_sale', label: 'بيع سيارة', description: 'توكيل لبيع مركبة' },
            { value: 'vehicle_receipt', label: 'استلام سيارة', description: 'توكيل لاستلام مركبة' },
            { value: 'vehicle_shipping', label: 'شحن سيارة', description: 'توكيل لشحن مركبة' },
            { value: 'vehicle_waiver', label: 'تنازل عن سيارة', description: 'توكيل للتنازل عن مركبة' },
            { value: 'vehicle_licensing', label: 'ترخيص سيارة', description: 'توكيل لترخيص أو تجديد ترخيص' },
            { value: 'vehicle_customs', label: 'تخليص جمركي لسيارة', description: 'توكيل للتخليص الجمركي' },
            { value: 'other_vehicles', label: 'اخري', description: 'معاملات مركبات أخرى' }
          ],
          required: true,
          validation: { required: 'نوع معاملة السيارة مطلوب' }
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
          name: 'vehicleMake',
          label: 'ماركة السيارة',
          type: 'text',
          required: true,
          validation: { required: 'ماركة السيارة مطلوبة' }
        },
        {
          name: 'vehicleModel',
          label: 'موديل السيارة',
          type: 'text',
          required: true,
          validation: { required: 'موديل السيارة مطلوب' }
        },
        {
          name: 'vehicleYear',
          label: 'سنة الصنع',
          type: 'number',
          required: true,
          validation: { required: 'سنة الصنع مطلوبة' }
        },
        {
          name: 'plateNumber',
          label: 'رقم اللوحة',
          type: 'text',
          required: true,
          validation: { required: 'رقم اللوحة مطلوب' }
        },
        {
          name: 'chassisNumber',
          label: 'رقم الشاسيه',
          type: 'text',
          required: false
        },
        {
          name: 'vehicleColor',
          label: 'لون السيارة',
          type: 'text',
          required: false
        },
        {
          name: 'buyerDetails',
          label: 'بيانات المشتري',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_sale'] },
          validation: { required: 'بيانات المشتري مطلوبة' }
        },
        {
          name: 'shippingDestination',
          label: 'وجهة الشحن',
          type: 'text',
          required: true,
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_shipping'] },
          validation: { required: 'وجهة الشحن مطلوبة' }
        },
        {
          name: 'waiveReason',
          label: 'سبب التنازل',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_waiver'] },
          validation: { required: 'سبب التنازل مطلوب' }
        },
        {
          name: 'licensingType',
          label: 'نوع الترخيص',
          type: 'select',
          options: [
            { value: 'new', label: 'ترخيص جديد' },
            { value: 'renewal', label: 'تجديد ترخيص' },
            { value: 'transfer', label: 'نقل ملكية' }
          ],
          required: true,
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_licensing'] },
          validation: { required: 'نوع الترخيص مطلوب' }
        },
        {
          name: 'customsDetails',
          label: 'تفاصيل التخليص الجمركي',
          type: 'textarea',
          required: true,
          rows: 3,
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_customs'] },
          validation: { required: 'تفاصيل التخليص الجمركي مطلوبة' }
        },
        {
          name: 'receiptLocation',
          label: 'مكان الاستلام',
          type: 'text',
          required: true,
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_receipt'] },
          validation: { required: 'مكان الاستلام مطلوب' }
        },
        {
          name: 'vehicleDescription',
          label: 'وصف إضافي للسيارة',
          type: 'textarea',
          required: false,
          rows: 3,
          className: 'md:col-span-2'
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
          name: 'vehicleRegistration',
          label: 'استمارة السيارة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'استمارة السيارة مطلوبة' }
        },
        {
          name: 'drivingLicense',
          label: 'رخصة القيادة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB'
        },
        {
          name: 'vehicleSearchCertificate',
          label: 'شهادة بحث السيارة (إثبات ملكية)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          description: 'شهادة بحث رسمية تثبت ملكية السيارة',
          validation: { required: 'شهادة بحث السيارة مطلوبة' }
        },
        {
          name: 'saleContract',
          label: 'عقد البيع',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_sale'] },
          validation: { required: 'عقد البيع مطلوب' }
        },
        {
          name: 'customsDocuments',
          label: 'مستندات التخليص الجمركي',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: true,
          maxSize: '10MB',
          conditional: { field: 'vehicleTransactionType', values: ['vehicle_customs'] },
          validation: { required: 'مستندات التخليص الجمركي مطلوبة' }
        }
      ]
    }
  ]
};