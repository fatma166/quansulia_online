export const attestationsConfig = {
  id: 'attestations',
  title: 'التوثيق',
  description: 'توثيق الوثائق والمستندات الرسمية',
  icon: 'Award',
  category: 'documents',
  requirements: [
    'أصل المستند المراد تصديقه',
    'صورة واضحة من المستند',
    'إثبات شخصية',
    'نموذج طلب التصديق',
    'يشترط توثيق المستند من وزارة الخارجية في الدولة التي صدر منها (جمهورية السودان أو المملكة العربية السعودية)'
  ],
  fees: { base: 120, currency: 'ريال سعودي' },
  duration: '3-5 أيام عمل',
  process: [
    'تقديم المستند الأصلي',
    'مراجعة صحة المستند',
    'دفع رسوم التصديق',
    'ختم وتوقيع التصديق',
    'تسليم المستند المصدق'
  ],
  steps: [
    {
      id: 'document-details',
      title: 'تفاصيل المستند',
      fields: [
        {
          name: 'docType',
          label: 'نوع المستند',
          type: 'select',
          options: [
            { value: 'educational', label: 'شهادة تعليمية' },
            { value: 'commercial', label: 'مستند تجاري' },
            { value: 'medical', label: 'تقرير طبي' },
            { value: 'legal', label: 'مستند قانوني' },
            { value: 'personal', label: 'مستند شخصي' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          validation: { required: 'نوع المستند مطلوب' }
        },
        {
          name: 'docTypeOther',
          label: 'حدد نوع المستند',
          type: 'text',
          required: true,
          conditional: { field: 'docType', values: ['other'] },
          validation: { required: 'نوع المستند مطلوب' }
        },
        {
          name: 'docTitle',
          label: 'عنوان المستند',
          type: 'text',
          required: true,
          validation: { required: 'عنوان المستند مطلوب' }
        },
        {
          name: 'issuingAuthority',
          label: 'جهة الإصدار',
          type: 'text',
          required: true,
          validation: { required: 'جهة الإصدار مطلوبة' }
        },
        {
          name: 'issueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الإصدار مطلوب' }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'رفع المستندات',
      fields: [
        {
          name: 'originalDocument',
          label: 'المستند الأصلي',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '10MB',
          validation: { required: 'المستند الأصلي مطلوب' }
        },
        {
          name: 'nationalIdCopy',
          label: 'صورة الرقم الوطني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الرقم الوطني مطلوبة' }
        }
      ]
    }
  ]
};

export default attestationsConfig;