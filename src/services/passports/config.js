// services/passports/config.js

export const passportsConfig = {
  id: 'passports',
  title: 'جوازات السفر',
  description: 'إصدار وتجديد جوازات السفر السودانية',
  icon: 'FileText',
  category: 'documents',

  requirements: {
    common: [
      'صورة من الجواز',
      'حضور مقدم الطلب لمكتب تصوير الجوازات بالقنصلية'
    ],
    minors_new: [
      'صورة من الجواز',
      'صورة من جواز الوصي (الأم والأب)',
      'يجب حضور الوالد وفي حالة عدم وجوده إحضار خطاب عدم ممانعة'
    ],
    minors_renewal_replacement: [
      'صورة من الجواز أو الرقم الوطني',
      'حضور الأب أو الأم'
    ],
    renewal: [
      'الجواز القديم الأصلي',
      'نسخة إلكترونية من الجواز القديم',
      'صورة شخصية حديثة'
    ],
    replacement: [
      'شهادة فقدان صادرة من أقرب قسم شرطة',
      'نسخة من الجواز المفقود (إن وجدت)',
      'صورة شخصية حديثة'
    ],
    emergency_adults: [
      'صورة من الجواز أو الرقم الوطني',
      'عدد 2 صورة شخصية حديثة بحجم جواز'
    ],
    emergency_children: [
      'صورة شخصية حديثة بحجم جواز'
    ]
  },

  fees: {
    children: { base: 450, currency: 'ريال سعودي' },
    adult: { base: 930, currency: 'ريال سعودي' }
  },

  duration: {
    new: '7-10 أيام عمل',
    renewal: '5-7 أيام عمل',
    replacement: '10-14 يوم عمل'
  },

  process: [
    'تقديم الطلب مع المستندات المطلوبة',
    'مراجعة الطلب والمستندات',
    'دفع الرسوم المقررة',
    'التصوير والبصمات',
    'طباعة الجواز',
    'التسليم أو الشحن'
  ],

  steps: [
    {
      id: 'details',
      title: 'تفاصيل الجواز',
      fields: [
        {
          name: 'isAdult',
          label: 'هل المتقدم بالغ (18 سنة فأكثر)؟',
          type: 'radio',
          options: [
            { value: 'yes', label: 'نعم' },
            { value: 'no',  label: 'لا' }
          ],
          required: true,
          validation: { required: 'يرجى تحديد العمر' }
        },
        {
          name: 'parentConsent',
          label: 'إحضار خطاب عدم ممانعة من الوالد',
          type: 'radio',
          options: [
            { value: 'yes', label: 'نعم، سيتم إحضاره' },
            { value: 'no', label: 'لا حاجة، الوالد سيحضر شخصياً' }
          ],
          conditional: { field: 'isAdult', values: ['no'] },
          help: 'مطلوب فقط في حالة الإصدار لأول مرة وعدم حضور الوالد',
          required: true,
          validation: { required: 'يرجى تحديد الخيار المناسب' }
        },
        {
          name: 'passportType',
          label: 'نوع الطلب',
          type: 'radio',
          options: [
            { value: 'new',         label: 'جواز جديد',  description: 'إصدار جواز سفر جديد' },
            { value: 'renewal',     label: 'تجديد',      description: 'تجديد جواز سفر منتهي الصلاحية' },
            { value: 'replacement', label: 'بدل فاقد',   description: 'بدل فاقد أو تالف' },
            { value: 'emergency',   label: 'وثيقة سفر اضطرارية', description: 'وثيقة سفر مؤقتة للحالات الطارئة' }
          ],
          required: true,
          validation: { required: 'نوع الطلب مطلوب' }
        },
        {
          name: 'oldPassportNumber',
          label: 'رقم الجواز القديم',
          type: 'text',
          conditional: { field: 'passportType', values: ['renewal', 'replacement'] },
          required: true,
          pattern: '^[A-Z][0-9]{7,8}$',
          help: 'حرف كبير واحد باللغة الإنجليزية يتبعه أرقام (مثال: P12345678)',
          validation: { required: 'رقم الجواز القديم مطلوب' }
        },
        {
          name: 'lossLocation',
          label: 'مكان الفقدان',
          type: 'text',
          conditional: { field: 'passportType', values: ['replacement'] },
          required: true,
          validation: { required: 'مكان الفقدان مطلوب' }
        },
        {
          name: 'emergencyReason',
          label: 'سبب طلب وثيقة السفر الاضطرارية',
          type: 'textarea',
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          rows: 4,
          help: 'يرجى توضيح السبب الطارئ الذي يتطلب إصدار وثيقة سفر مؤقتة',
          validation: { required: 'سبب الطلب مطلوب' }
        },
        {
          name: 'birthPlace',
          label: 'محل الميلاد',
          type: 'text',
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          validation: { required: 'محل الميلاد مطلوب' }
        },
        {
          name: 'birthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },
        {
          name: 'arrivalDate',
          label: 'تاريخ الوصول للمملكة',
          type: 'date',
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          validation: { required: 'تاريخ الوصول للمملكة مطلوب' }
        },
        {
          name: 'height',
          label: 'الطول (سم)',
          type: 'number',
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          help: 'على المتقدم كتابة وصفه',
          validation: { required: 'الطول مطلوب' }
        },
        {
          name: 'eyeColor',
          label: 'لون العيون',
          type: 'select',
          options: [
            { value: 'black', label: 'أسود' },
            { value: 'brown', label: 'بني' },
            { value: 'green', label: 'أخضر' },
            { value: 'blue', label: 'أزرق' },
            { value: 'hazel', label: 'عسلي' },
            { value: 'other', label: 'أخرى' }
          ],
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          help: 'على المتقدم كتابة وصفه',
          validation: { required: 'لون العيون مطلوب' }
        },
        {
          name: 'hairColor',
          label: 'لون الشعر',
          type: 'select',
          options: [
            { value: 'black', label: 'أسود' },
            { value: 'brown', label: 'بني' },
            { value: 'blonde', label: 'أشقر' },
            { value: 'gray', label: 'رمادي/شايب' },
            { value: 'red', label: 'أحمر' },
            { value: 'other', label: 'أخرى' }
          ],
          conditional: { field: 'passportType', values: ['emergency'] },
          required: true,
          help: 'على المتقدم كتابة وصفه',
          validation: { required: 'لون الشعر مطلوب' }
        },
        {
          name: 'distinctiveMarks',
          label: 'العلامات المميزة',
          type: 'textarea',
          conditional: { field: 'passportType', values: ['emergency'] },
          required: false,
          rows: 2,
          help: 'أي علامات مميزة (مثل: شامة، ندبة، وشم، إلخ)',
          placeholder: 'اختياري'
        },
        {
          name: 'familyMembers',
          label: 'أفراد العائلة',
          type: 'dynamic-list',
          buttonText: 'إضافة عائلة',
          fields: [
            {
              name: 'memberName',
              label: 'الاسم',
              type: 'text',
              required: true,
              validation: { required: 'الاسم مطلوب' }
            },
            {
              name: 'birthDay',
              label: 'اليوم',
              label_ar: 'اليوم',
              type: 'select',
              options: Array.from({ length: 31 }, (_, i) => ({
                value: String(i + 1),
                label: String(i + 1)
              })),
              required: true,
              validation: { required: 'اليوم مطلوب' }
            },
            {
              name: 'birthMonth',
              label: 'الشهر',
              label_ar: 'الشهر',
              type: 'select',
              options: [
                { value: '1', label: 'يناير' },
                { value: '2', label: 'فبراير' },
                { value: '3', label: 'مارس' },
                { value: '4', label: 'أبريل' },
                { value: '5', label: 'مايو' },
                { value: '6', label: 'يونيو' },
                { value: '7', label: 'يوليو' },
                { value: '8', label: 'أغسطس' },
                { value: '9', label: 'سبتمبر' },
                { value: '10', label: 'أكتوبر' },
                { value: '11', label: 'نوفمبر' },
                { value: '12', label: 'ديسمبر' }
              ],
              required: true,
              validation: { required: 'الشهر مطلوب' }
            },
            {
              name: 'birthYear',
              label: 'السنة',
              label_ar: 'السنة',
              type: 'select',
              options: Array.from({ length: 100 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return { value: String(year), label: String(year) };
              }),
              required: true,
              validation: { required: 'السنة مطلوبة' }
            },
            {
              name: 'memberRelationship',
              label: 'صلة القرابة',
              type: 'select',
              options: [
                { value: 'son', label: 'ابن' },
                { value: 'daughter', label: 'ابنة' },
                { value: 'wife', label: 'زوجة' },
                { value: 'husband', label: 'زوج' },
                { value: 'mother', label: 'أم' },
                { value: 'father', label: 'أب' },
                { value: 'other', label: 'أخرى' }
              ],
              required: true,
              validation: { required: 'صلة القرابة مطلوبة' }
            }
          ],
          required: false
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'passportCopy',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'isAdult', values: ['yes'] },
                { field: 'passportType', values: ['renewal', 'replacement', 'travel-document'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز مطلوبة' }
        },
        {
          name: 'nationalIdCopyAdult',
          label: 'صورة من الرقم الوطني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'isAdult', values: ['yes'] },
                { field: 'passportType', values: ['new'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الرقم الوطني مطلوبة' }
        },
        {
          name: 'personalPhoto',
          label: 'صورة شخصية',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: { field: 'isAdult', values: ['yes'] },
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الشخصية مطلوبة' }
        },
        {
          name: 'nationalIdCopyMinor',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'isAdult', values: ['no'] },
                { field: 'passportType', values: ['new'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز مطلوبة' }
        },
        {
          name: 'minorPassportCopy',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'isAdult', values: ['no'] },
                { field: 'passportType', values: ['renewal', 'replacement', 'travel-document'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز مطلوبة' }
        },
        {
          name: 'motherPassportCopy',
          label: 'صورة جواز الأم',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'isAdult', values: ['no'] },
                { field: 'passportType', values: ['new'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الأم مطلوبة' }
        },
        {
          name: 'fatherPassportCopy',
          label: 'صورة جواز الأب',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'isAdult', values: ['no'] },
                { field: 'passportType', values: ['new'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الأب مطلوبة' }
        },
        {
          name: 'childPersonalPhoto',
          label: 'صورة شخصية',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: { field: 'isAdult', values: ['no'] },
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الشخصية مطلوبة' }
        }
      ]
    }
  ]
};

export default passportsConfig;
