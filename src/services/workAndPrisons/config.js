export const workAndPrisonsConfig = {
  id: 'workAndPrisons',
  title: 'العمل والسجون',
  description: 'خدمات الخروج النهائي النظامي وشؤون السجناء',
  icon: 'Briefcase',
  category: 'documents',

  requirements: {
    finalExit: [
      'صورة من الجواز',
      'عدد 2 صورة بطاقة',
      'الحضور للقنصلية للبصمة'
    ]
  },

  fees: {
    finalExit: { base: 200, currency: 'ريال سعودي' }
  },

  duration: {
    finalExit: '5-7 أيام عمل'
  },

  process: [
    'تقديم الطلب مع المستندات المطلوبة',
    'مراجعة الطلب والمستندات',
    'دفع الرسوم المقررة',
    'التنسيق مع الجهات المعنية',
    'إصدار الموافقة',
    'التسليم أو الإشعار'
  ],

  steps: [
    {
      id: 'personal-info',
      title: 'المعلومات الشخصية',
      fields: [
        {
          name: 'nationalNumber',
          label: 'الرقم الوطني',
          type: 'text',
          required: true,
          pattern: '[0-9]+',
          help: 'أدخل الرقم الوطني',
          validation: { required: 'الرقم الوطني مطلوب' }
        },
        {
          name: 'motherFullName',
          label: 'اسم الأم رباعي',
          type: 'text',
          required: true,
          validation: { required: 'اسم الأم رباعي مطلوب' }
        },
        {
          name: 'requestingAuthority',
          label: 'الجهة الطالبة للفيش',
          type: 'text',
          required: true,
          validation: { required: 'الجهة الطالبة مطلوبة' }
        },
        {
          name: 'requestReason',
          label: 'سبب طلب الفيش',
          type: 'select',
          options: [
            { value: 'work', label: 'للعمل' },
            { value: 'study', label: 'للدراسة' },
            { value: 'travel', label: 'للسفر' },
            { value: 'residence', label: 'للإقامة' },
            { value: 'marriage', label: 'للزواج' },
            { value: 'government', label: 'للجهات الحكومية' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          validation: { required: 'سبب الطلب مطلوب' }
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
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز مطلوبة' }
        },
        {
          name: 'recentPhoto',
          label: 'صورة حديثة',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          help: 'صورة شخصية حديثة',
          validation: { required: 'صورة حديثة مطلوبة' }
        }
      ]
    }
  ]
};

export default workAndPrisonsConfig;
