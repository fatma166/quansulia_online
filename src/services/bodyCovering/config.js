export const bodyCoveringConfig = {
  id: 'bodyCovering',
  title: 'خطاب ستر الجثمان',
  description: 'خدمة إصدار خطابات ستر الجثمان لاستلام الجثمان وستره',
  icon: 'FileText',
  category: 'consular',
  requirements: [
    'شهادة الوفاة الأصلية',
    'صورة جواز سفر المتوفى',
    'صورة بطاقة الأحوال / الإقامة',
    'صورة جواز سفر مقدم الطلب',
    'تقرير الشرطة (إن وجد)'
  ],
  fees: { base: 100, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تعبئة نموذج الطلب',
    'رفع المستندات المطلوبة',
    'المراجعة والتدقيق',
    'إصدار الخطاب',
    'التسليم'
  ],
  steps: [
    {
      id: 'deceased-info',
      title: 'تفاصيل الخدمة',
      fields: [
        {
          name: 'deceasedGender',
          label: 'النوع',
          type: 'radio',
          required: true,
          options: [
            { value: 'male', label: 'ذكر' },
            { value: 'female', label: 'أنثى' }
          ],
          validation: { required: 'النوع مطلوب' }
        },
        {
          name: 'deceasedName',
          label: 'اسم المتوفى',
          type: 'text',
          required: true,
          validation: { required: 'اسم المتوفى مطلوب' }
        },
        {
          name: 'deceasedPassportOrResidence',
          label: 'رقم الجواز أو الإقامة للمتوفى',
          type: 'text',
          required: true,
          validation: { required: 'رقم الجواز أو الإقامة مطلوب' }
        },
        {
          name: 'deceasedAge',
          label: 'العمر',
          type: 'number',
          required: true,
          validation: { required: 'العمر مطلوب' }
        },
        {
          name: 'deathType',
          label: 'نوع الوفاة',
          type: 'radio',
          required: true,
          options: [
            { value: 'natural', label: 'طبيعية' },
            { value: 'accident', label: 'حادث مروري' },
            { value: 'criminal', label: 'الحالات الجنائية أو الشبه جنائية' }
          ],
          validation: { required: 'نوع الوفاة مطلوب' }
        },
        {
          name: 'nearestRelativeName',
          label: 'اسم أقرب الأقربين للمتوفى (الشخص المكلف بتكملة الإجراءات لستر الجثمان)',
          type: 'text',
          required: true,
          validation: { required: 'اسم أقرب الأقربين مطلوب' }
        },
        {
          name: 'nearestRelativeRelation',
          label: 'صلة القرابة بالمتوفى',
          type: 'select',
          required: true,
          options: [
            { value: 'father', label: 'الأب' },
            { value: 'mother', label: 'الأم' },
            { value: 'son', label: 'الابن' },
            { value: 'daughter', label: 'الابنة' },
            { value: 'brother', label: 'الأخ' },
            { value: 'sister', label: 'الأخت' },
            { value: 'husband', label: 'الزوج' },
            { value: 'wife', label: 'الزوجة' },
            { value: 'other', label: 'أخرى' }
          ],
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'phoneNumber',
          label: 'رقم الهــــــاتـف',
          type: 'tel',
          required: true,
          validation: { required: 'رقم الهاتف مطلوب' }
        },
        {
          name: 'kingdomAddress',
          label: 'العنوان بالمملكة',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالمملكة مطلوب' }
        },
        {
          name: 'sudanAddress',
          label: 'العنوان بالسودان',
          type: 'text',
          required: true,
          validation: { required: 'العنوان بالسودان مطلوب' }
        }
      ]
    },
    {
      id: 'documents',
      title: 'المستندات المطلوبة',
      fields: [
        {
          name: 'deceasedPassportCopy',
          label: 'صورة جواز المتوفي',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز المتوفي مطلوبة' }
        },
        {
          name: 'responsiblePersonPassport',
          label: 'صورة جواز الشخص المكلف بستر الجثمان',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الشخص المكلف مطلوبة' }
        },
        {
          name: 'deathNotification',
          label: 'بلاغ الوفاة من المستشفى',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'بلاغ الوفاة من المستشفى مطلوب' }
        },
        {
          name: 'deceasedIdOrResidence',
          label: 'صورة الجواز أو إقامة المتوفي',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز أو إقامة المتوفي مطلوبة' }
        },
        {
          name: 'nearestRelativeId',
          label: 'صورة جواز أو إقامة أقرب الأقربين',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز أو إقامة أقرب الأقربين مطلوبة' }
        },
        {
          name: 'powerOfAttorney',
          label: 'توكيل من أسرة المتوفي (في حالة عدم القرابة)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB',
          help: 'مطلوب فقط في حالة عدم وجود صلة قرابة مباشرة'
        },
        {
          name: 'trafficLetter',
          label: 'خطاب مرور (في حالة الحادث)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB',
          conditional: {
            field: 'deathType',
            value: 'accident'
          },
          help: 'مطلوب في حالات الحوادث المرورية'
        },
        {
          name: 'forensicReport',
          label: 'تقرير الطب الشرعي (في الحالات الجنائية)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: false,
          maxSize: '5MB',
          conditional: {
            field: 'deathType',
            value: 'criminal'
          },
          help: 'مطلوب في الحالات الجنائية أو الشبه جنائية'
        }
      ]
    }
  ]
};
