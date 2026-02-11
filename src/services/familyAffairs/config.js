export const familyAffairsConfig = {
  id: 'familyAffairs',
  title: 'الشؤون القانونية والأسرية',
  description: 'خدمات قانونية وأسرية متنوعة',
  icon: 'Heart',
  category: 'legal',
  requirements: [
    'إثباتات هوية الأطراف',
    'المستندات الداعمة حسب نوع القضية',
    'شهود (عند الحاجة)'
  ],
  fees: { base: 150, currency: 'ريال سعودي' },
  duration: '3-7 أيام عمل',
  process: [
    'تحديد نوع القضية',
    'تقديم المستندات المطلوبة',
    'مراجعة الحالة',
    'دفع الرسوم',
    'إصدار الوثيقة أو القرار'
  ],
  steps: [
    {
      id: 'case-details',
      title: 'تفاصيل القضية',
      fields: [
        {
          name: 'visaType',
          label: 'نوع التأشيرة',
          type: 'select',
          options: [
            { value: 'resident', label: 'مقيم' },
            { value: 'visit', label: 'زيارة' },
            { value: 'umrah', label: 'عمرة' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          validation: { required: 'نوع التأشيرة مطلوب' }
        },
        {
          name: 'iqamaNumber',
          label: 'رقم الإقامة',
          type: 'text',
          required: true,
          pattern: '[0-9]{10}',
          help: 'أدخل 10 أرقام',
          validation: { required: 'رقم الإقامة مطلوب' }
        },
        {
          name: 'issuePlace',
          label: 'مكان الإصدار',
          type: 'text',
          required: true,
          validation: { required: 'مكان الإصدار مطلوب' }
        },
        {
          name: 'issueDate',
          label: 'تاريخ الإصدار',
          type: 'date',
          required: true,
          validation: { required: 'تاريخ الإصدار مطلوب' }
        },
        {
          name: 'maritalStatus',
          label: 'الحالة الاجتماعية',
          type: 'select',
          options: [
            { value: 'single', label: 'عازب/ة' },
            { value: 'married', label: 'متزوج/ة' },
            { value: 'widowed', label: 'أرمل/ة' },
            { value: 'divorced', label: 'مطلق/ة' }
          ],
          required: true,
          validation: { required: 'الحالة الاجتماعية مطلوبة' }
        },
        {
          name: 'caseType',
          label: 'نوع الطلب',
          type: 'select',
          options: [
            { value: 'legal-case', label: 'قضايا قانونية' },
            { value: 'legal-consultation', label: 'استشارة قانونية' },
            { value: 'legal-support', label: 'طلب دعم قانوني' },
            { value: 'family-disputes', label: 'خلافات أسرية' },
            { value: 'external-relations', label: 'مخاطبة الجهات ذات العلاقة الخارجية (جوازات - شرطة - سجون - تعليم - أخرى)' },
            { value: 'aid', label: 'مساعدات' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          validation: { required: 'نوع الطلب مطلوب' }
        },
        {
          name: 'caseDescription',
          label: 'وصف القضية',
          type: 'textarea',
          required: true,
          rows: 4,
          validation: { required: 'وصف القضية مطلوب' }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'passportCopy',
          label: 'صورة الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز مطلوبة' }
        },
        {
          name: 'iqamaCopy',
          label: 'صورة الإقامة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الإقامة مطلوبة' }
        },
        {
          name: 'requestDocuments',
          label: 'إرفاق المستندات الخاصة بالطلب',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          required: true,
          maxSize: '5MB',
          validation: { required: 'المستندات الخاصة بالطلب مطلوبة' }
        }
      ]
    }
  ]
};
export default familyAffairsConfig;
