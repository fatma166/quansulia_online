export const inheritanceConfig = {
  id: 'inheritance',
  title: 'الورثة',
  description: 'توكيل خاص بقسمة التركات وشؤون الورثة',
  icon: 'Users',
  category: 'legal',
  requirements: [
    'حضور الموكل شخصياً',
    'إثبات جواز الموكل والوكيل',
    'شهادة وفاة المورث',
    'إعلام الورثة',
    'تحديد الغرض من التوكيل بوضوح'
  ],
  fees: { base: 200, currency: 'ريال سعودي' },
  duration: '1-2 يوم عمل',
  process: [
    'تحديد نوع توكيل الورثة',
    'ملء البيانات المطلوبة',
    'حضور الموكل شخصياً',
    'التوقيع أمام الموظف المختص',
    'ختم وتوثيق التوكيل'
  ],
  steps: [
    {
      id: 'inheritance-details',
      title: 'تفاصيل الورثة',
      fields: [
        // 1) نوع التوكيل أولاً
        {
          name: 'inheritanceType',
          label: 'نوع توكيل الورثة',
          type: 'searchable-select',
          options: [
            { value: 'inheritance_inventory_form', label: 'استمارة حصر ورثة', description: 'حصر الورثة وتحديد الأنصبة' },
            { value: 'inheritance_waiver', label: 'تنازل عن نصيب في ورثة', description: 'التنازل عن نصيب في الميراث' },
            { value: 'inheritance_litigation', label: 'تقاضي ورثة', description: 'المرافعة في قضايا الميراث' },
            { value: 'inheritance_supervision', label: 'إشراف ورثة', description: 'الإشراف على تقسيم الميراث' },
            { value: 'inheritance_disposal', label: 'تصرف في ورثة', description: 'التصرف في أموال الميراث' },
            { value: 'inheritance_receipt', label: 'استلام ورثة', description: 'استلام نصيب الميراث' },
            { value: 'inheritance_form', label: 'استمارة ورثة', description: 'استمارة عامة للورثة' },
            { value: 'other_inheritance', label: 'أخرى', description: 'شؤون ميراث أخرى' }
          ],
          required: true,
          validation: { required: 'نوع توكيل الورثة مطلوب' }
        },

        // 2) الحقول "المشروطة" تظهر مباشرة بعد النوع

        // ===== بيانات المتوفى العامة (تظهر فقط في حصر الورثة واستمارة ورثة وأخرى) =====
        {
          name: 'deceasedName',
          label: 'اسم المتوفى',
          type: 'text',
          required: true,
          conditional: {
            field: 'inheritanceType',
            values: ['inheritance_inventory_form', 'inheritance_form', 'other_inheritance']
          },
          validation: { required: 'اسم المتوفى مطلوب' }
        },
        {
          name: 'deathDate',
          label: 'تاريخ الوفاة',
          type: 'date',
          required: true,
          conditional: {
            field: 'inheritanceType',
            values: ['inheritance_inventory_form', 'inheritance_form', 'other_inheritance']
          },
          validation: { required: 'تاريخ الوفاة مطلوب' }
        },
        {
          name: 'deathPlace',
          label: 'مكان الوفاة',
          type: 'text',
          required: true,
          conditional: {
            field: 'inheritanceType',
            values: ['inheritance_inventory_form', 'inheritance_form', 'other_inheritance']
          },
          validation: { required: 'مكان الوفاة مطلوب' }
        },

        // ===== حصر الورثة: الغرض من التوكيل =====
        {
          name: 'inventoryPurpose',
          label: 'الغرض من التوكيل (حصر الورثة)',
          type: 'select',
          options: [
            { value: 'inventory_only', label: 'حصر ورثة' },
            { value: 'issue_notice', label: 'إصدار إعلام شرعي' },
            { value: 'other', label: 'أخرى' }
          ],
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_inventory_form'] },
          validation: { required: 'الغرض من التوكيل مطلوب' }
        },
        {
          name: 'inventoryPurposeOther',
          label: 'اذكر الغرض',
          type: 'text',
          required: true,
          conditional: { field: 'inventoryPurpose', values: ['other'] },
          validation: { required: 'يُرجى تحديد الغرض' }
        },

        // ===== تنازل عن نصيب: حقول خاصة =====
        // حذف (اسم/مكان/تاريخ الوفاة + مبلغ النصيب) تم عبر الشروط أعلاه، وتغيير شرط مبلغ النصيب بالأسفل
        {
          name: 'waiverDecedentName',
          label: 'اسم المورّث',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_waiver'] },
          validation: { required: 'اسم المورّث مطلوب' }
        },
        {
          name: 'waiverNoticeNumber',
          label: 'رقم الإعلام الشرعي / إعلام الورثة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_waiver'] },
          validation: { required: 'رقم الإعلام الشرعي مطلوب' }
        },
        {
          name: 'waiverEstateNumber',
          label: 'رقم التركة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_waiver'] },
          validation: { required: 'رقم التركة مطلوب' }
        },
        {
          name: 'waiverCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_waiver'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },

        // ===== تقاضي ورثة: حقول خاصة =====
        {
          name: 'litigationInheritorName',
          label: 'اسم الموروث',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_litigation'] },
          validation: { required: 'اسم الموروث مطلوب' }
        },
        {
          name: 'litigationNoticeNumber',
          label: 'رقم الإعلام الشرعي / إعلام الورثة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_litigation'] },
          validation: { required: 'رقم الإعلام الشرعي مطلوب' }
        },
        {
          name: 'litigationEstateNumber',
          label: 'رقم التركة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_litigation'] },
          validation: { required: 'رقم التركة مطلوب' }
        },
        {
          name: 'litigationCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_litigation'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },

        // ===== إشراف ورثة: حقول خاصة =====
        {
          name: 'supervisionInheritorName',
          label: 'اسم الموروث',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_supervision'] },
          validation: { required: 'اسم الموروث مطلوب' }
        },
        {
          name: 'supervisionNoticeNumber',
          label: 'رقم الإعلام الشرعي / إعلام الورثة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_supervision'] },
          validation: { required: 'رقم الإعلام الشرعي مطلوب' }
        },
        {
          name: 'supervisionEstateNumber',
          label: 'رقم التركة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_supervision'] },
          validation: { required: 'رقم التركة مطلوب' }
        },
        {
          name: 'supervisionCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_supervision'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },

        // ===== تصرف في ورثة: حقول خاصة =====
        {
          name: 'disposalInheritorName',
          label: 'اسم الموروث',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_disposal'] },
          validation: { required: 'اسم الموروث مطلوب' }
        },
        {
          name: 'disposalNoticeNumber',
          label: 'رقم الإعلام الشرعي / إعلام الورثة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_disposal'] },
          validation: { required: 'رقم الإعلام الشرعي مطلوب' }
        },
        {
          name: 'disposalEstateNumber',
          label: 'رقم التركة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_disposal'] },
          validation: { required: 'رقم التركة مطلوب' }
        },
        {
          name: 'disposalCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_disposal'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },

        // ===== استلام ورثة: حقول خاصة =====
        {
          name: 'receiptInheritorName',
          label: 'اسم الموروث',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_receipt'] },
          validation: { required: 'اسم الموروث مطلوب' }
        },
        {
          name: 'receiptNoticeNumber',
          label: 'رقم الإعلام الشرعي / إعلام الورثة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_receipt'] },
          validation: { required: 'رقم الإعلام الشرعي مطلوب' }
        },
        {
          name: 'receiptEstateNumber',
          label: 'رقم التركة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_receipt'] },
          validation: { required: 'رقم التركة مطلوب' }
        },
        {
          name: 'receiptCourtName',
          label: 'اسم المحكمة',
          type: 'text',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_receipt'] },
          validation: { required: 'اسم المحكمة مطلوب' }
        },

        // ===== إشراف/تصرف/استلام/استمارة/أخرى: الحقول الداعمة =====
        {
          name: 'inheritanceAssets',
          label: 'نوع الميراث',
          type: 'select',
          options: [
            { value: 'money', label: 'أموال' },
            { value: 'property', label: 'عقارات' },
            { value: 'land', label: 'أراضي' },
            { value: 'mixed', label: 'مختلط' }
          ],
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_inventory_form', 'inheritance_disposal'] },
          validation: { required: 'نوع الميراث مطلوب' }
        },
        {
          name: 'heirsCount',
          label: 'عدد الورثة',
          type: 'number',
          required: true,
          conditional: { field: 'inheritanceType', values: ['inheritance_inventory_form', 'inheritance_supervision'] },
          validation: { required: 'عدد الورثة مطلوب' }
        },

        // ===== الوصف العام بعد المشروط =====
        {
          name: 'inheritanceDescription',
          label: 'وصف الميراث',
          type: 'textarea',
          required: true,
          rows: 4,
          className: 'md:col-span-2',
          validation: { required: 'وصف الميراث مطلوب' }
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

        // ===== الشهود (ثابتة) =====
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
          name: 'deathCertificate',
          label: 'شهادة الوفاة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          // لو عندك منطق لإخفائها في "تنازل" و"تقاضي" يمكن جعله شرطياً
          // conditional: { field: 'inheritanceType', values: ['inheritance_waiver','inheritance_litigation'], exclude: true },
          validation: { required: 'شهادة الوفاة مطلوبة' }
        },
        {
          name: 'inheritanceNotice',
          label: 'إعلام الورثة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          validation: { required: 'إعلام الورثة مطلوب' }
        },
        {
          name: 'courtDecision',
          label: 'قرار المحكمة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          required: true,
          maxSize: '5MB',
          conditional: { field: 'inheritanceType', values: ['inheritance_litigation'] },
          validation: { required: 'قرار المحكمة مطلوب للتقاضي' }
        }
      ]
    }
  ]
};