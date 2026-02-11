export const endorsementsConfig = {
  id: 'endorsements',
  title: 'الإفادات',
  description: 'إصدار إفادات رسمية لمختلف الأغراض',
  icon: 'FileText',
  category: 'documents',
  requirements: [
    'بطاقة الرقم الوطني أو الإقامة',
    'نموذج طلب الإفادة',
    'المستندات الداعمة حسب نوع الإفادة'
  ],
  fees: { base: 60, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع الإفادة المطلوبة',
    'تقديم المستندات المطلوبة',
    'مراجعة البيانات',
    'دفع الرسوم',
    'إصدار الإفادة'
  ],
  steps: [
    {
      id: 'endorsement-details',
      title: 'تفاصيل الإفادة',
      fields: [
        {
          name: 'endorseType',
          label: 'نوع الإفادة',
          type: 'select',
          options: [
            { value: 'salary', label: 'إفادة راتب' },
            { value: 'employment', label: 'إفادة عمل' },
            { value: 'study', label: 'إفادة دراسة' },
            { value: 'conduct', label: 'حسن سير وسلوك' },
            { value: 'residence', label: 'إفادة سكن' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          validation: { required: 'نوع الإفادة مطلوب' }
        },
        {
          name: 'purpose',
          label: 'الغرض من الإفادة',
          type: 'textarea',
          required: true,
          rows: 3,
          validation: { required: 'الغرض من الإفادة مطلوب' }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'nationalIdCopy',
          label: 'صورة الرقم الوطني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الرقم الوطني مطلوبة' }
        },
        {
          name: 'supportingDocs',
          label: 'المستندات الداعمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: false,
          maxSize: '5MB',
          help: 'مستندات تدعم طلب الإفادة'
        }
      ]
    }
  ]
};
export default endorsementsConfig;
