export const khartoomBankConfig = {
  id: 'khartoomBank',
  title: 'بنك الخرطوم',
  description: 'خدمات بنك الخرطوم للعملاء (تنشيط حساب، تحديث بيانات، خدمة تطبيق بنكك)',
  icon: 'Building2',
  category: 'consular',
  requirements: [
    'الحضور الشخصي لصاحب الحساب',
    'إحضار جواز أصل ساري المفعول',
    'لا يتم التعامل مع التوكيلات أو أي شخص ينوب عن العميل'
  ],
  fees: { base: 0, currency: 'مجاناً' },
  duration: 'فوري',
  process: [
    'تحديد نوع الخدمة المطلوبة',
    'تعبئة نموذج الطلب',
    'الحضور الشخصي مع الجواز الأصل',
    'مراجعة البيانات',
    'إتمام الإجراء'
  ],
  steps: [
    {
      id: 'bank-info',
      title: 'تفاصيل الطلب',
      fields: [
        {
          name: 'serviceType',
          label: 'نوع الخدمة المطلوبة',
          type: 'radio',
          required: true,
          options: [
            { value: 'activate', label: 'تنشيط حساب' },
            { value: 'update', label: 'تحديث بيانات' },
            { value: 'bankak', label: 'خدمة تطبيق بنكك' }
          ],
          validation: { required: 'نوع الخدمة مطلوب' }
        },
        {
          name: 'accountNumber',
          label: 'رقم الحساب (إن وجد)',
          type: 'text',
          required: false,
          help: 'اختياري - في حال كان لديك حساب بالفعل'
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
          help: 'يرجى إرفاق صورة واضحة من جواز السفر',
          validation: { required: 'صورة الجواز مطلوبة' }
        }
      ]
    }
  ]
};

export default khartoomBankConfig;
