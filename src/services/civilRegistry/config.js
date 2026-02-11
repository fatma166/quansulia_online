export const civilRegistryConfig = {
  id: 'civilRegistry',
  title: 'السجل المدني',
  description: 'خدمات السجل المدني والأحوال الشخصية',
  icon: 'Users',
  category: 'documents',
  requirements: {
    national_id_replacement: [
      'صورة من الرقم الوطني أو الجواز',
      'صورة حديثة'
    ],
    national_id_newborn: [
      'صورة من الجواز أو الرقم الوطني للوالد والوالدة',
      'شهادة ميلاد أو تبليغ ولادة معتمد',
      'قسيمة الزواج',
      'صورة فوتوغرافية حديثة للطفل',
      'حضور الوالد والطفل'
    ],
    national_id_under12: [
      'الحضور المباشر للقنصلية بعد تأكيد الموعد',
      'شاهد من العصب',
      'شهادة ميلاد',
      'عدد 2 صورة فوتوغرافية'
    ],
    name_correction: [
      'صورة من الرقم الوطني',
      'شهادة الميلاد',
      'صورة من الجواز',
      'إشهاد شرعي',
      'نشر الجريدة الرسمية',
      'إفادة قوائم الحظر والسيطرة',
      'إفادة من الإنتربول',
      'كتابة طلب لتوضيح الأسباب بخط اليد',
      'صورة حديثة'
    ],
    age_correction: [
      'صورة من الرقم الوطني',
      'شهادة الميلاد',
      'صورة من الجواز',
      'كتابة طلب لتوضيح الأسباب بخط اليد',
      'مستندات داعمة ذات صلة',
      'صورة حديثة'
    ],
    conduct_certificate: [
      'صورة من الجواز',
      'عدد 2 صورة بطاقة',
      'الحضور للقنصلية للبصمة'
    ],
    towhomitmayconcern: [
      'صورة من الجواز'
    ]
  },
  fees: { base: 80, currency: 'ريال سعودي' },
  duration: '2-3 أيام عمل',
  process: [
    'تحديد نوع الخدمة المطلوبة',
    'تقديم المستندات المطلوبة',
    'مراجعة البيانات',
    'دفع الرسوم',
    'إصدار الوثيقة'
  ],
  steps: [
    {
      id: 'service-details',
      title: 'تفاصيل الخدمة',
      fields: [
        {
          name: 'recordType',
          label: 'نوع السجل',
          type: 'select',
          options: [
            { value: 'national_id', label: 'الرقم الوطني' },
            { value: 'conduct_certificate', label: 'شهادة حسن السير والسلوك (الفيش)' },
            { value: 'towhomitmayconcern', label: 'إفادات لمن يهمهم الأمر' }
          ],
          required: true,
          validation: { required: 'نوع السجل مطلوب' }
        },
        {
          name: 'idType',
          label: 'نوع الخدمة',
          type: 'radio',
          options: [
            { value: 'replacement', label: 'بدل فاقد', description: 'الرقم الوطني بدل فاقد' },
            { value: 'newborn', label: 'رقم وطني للأطفال حديثي الولادة حتى 12 سنة', description: 'للأطفال من الولادة حتى 12 سنة' },
            { value: 'under12', label: 'رقم وطني لمن دون سن 12 عام', description: 'للأطفال دون 12 عام (حالات خاصة)' },
            { value: 'name_correction', label: 'تعديل الاسم أو تغييره', description: 'في حالة الأخطاء' },
            { value: 'age_correction', label: 'تعديل العمر', description: 'حالة خاصة - زيادة أو نقصان' }
          ],
          conditional: { field: 'recordType', values: ['national_id'] },
          required: true,
          validation: { required: 'نوع الخدمة مطلوب' }
        },

        // بدل فاقد - العناصر
        {
          name: 'nationalId',
          label: 'اكتب الرقم الوطني',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['replacement', 'name_correction', 'age_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'الرقم الوطني مطلوب' }
        },
        {
          name: 'motherFullName',
          label: 'اسم الأم رباعي',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['replacement', 'newborn', 'under12', 'name_correction', 'age_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'اسم الأم رباعي مطلوب' }
        },
        {
          name: 'birthDate',
          label: 'تاريخ الميلاد',
          type: 'date',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['replacement', 'newborn', 'under12', 'name_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'تاريخ الميلاد مطلوب' }
        },

        // حديثي الولادة والأطفال - العناصر
        {
          name: 'childGender',
          label: 'نوع المولود',
          type: 'radio',
          options: [
            { value: 'male', label: 'ذكر' },
            { value: 'female', label: 'أنثى' }
          ],
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'نوع المولود مطلوب' }
        },
        {
          name: 'childFullNameArabic',
          label: 'اسم الطفل رباعي',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'اسم الطفل رباعي مطلوب' }
        },
        {
          name: 'childFullNameEnglish',
          label: "Child's Full Name (Four Parts)",
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: "Child's full name in English is required" }
        },
        {
          name: 'bloodType',
          label: 'فصيلة الدم',
          type: 'select',
          options: [
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' }
          ],
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'فصيلة الدم مطلوبة' }
        },
        {
          name: 'birthRegion',
          label: 'مكان الميلاد - المنطقة',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'المنطقة مطلوبة' }
        },
        {
          name: 'birthCity',
          label: 'مكان الميلاد - المدينة',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'المدينة مطلوبة' }
        },
        {
          name: 'birthHospital',
          label: 'مكان الميلاد - المستشفى',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn', 'under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'المستشفى مطلوب' }
        },

        // دون 12 سنة - حضور الوالد
        {
          name: 'fatherAttending',
          label: 'هل سيحضر الوالد؟',
          type: 'radio',
          options: [
            { value: 'yes', label: 'نعم' },
            { value: 'no', label: 'لا - سيحضر شهود' }
          ],
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'يرجى تحديد حضور الوالد' }
        },

        // الشاهد الأول
        {
          name: 'witness1Name',
          label: 'اسم الشاهد الأول',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'اسم الشاهد الأول مطلوب' }
        },
        {
          name: 'witness1PassportNumber',
          label: 'رقم جواز الشاهد الأول',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'رقم الجواز مطلوب' }
        },
        {
          name: 'witness1Relation',
          label: 'صلة القرابة للشاهد الأول',
          type: 'select',
          options: [
            { value: 'uncle_paternal', label: 'عم' },
            { value: 'brother', label: 'أخ شقيق' }
          ],
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'witness1Phone',
          label: 'رقم هاتف الشاهد الأول',
          type: 'tel',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'رقم الهاتف مطلوب' }
        },

        // الشاهد الثاني
        {
          name: 'witness2Name',
          label: 'اسم الشاهد الثاني',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'اسم الشاهد الثاني مطلوب' }
        },
        {
          name: 'witness2PassportNumber',
          label: 'رقم جواز الشاهد الثاني',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'رقم الجواز مطلوب' }
        },
        {
          name: 'witness2Relation',
          label: 'صلة القرابة للشاهد الثاني',
          type: 'select',
          options: [
            { value: 'uncle_paternal', label: 'عم' },
            { value: 'brother', label: 'أخ شقيق' }
          ],
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'صلة القرابة مطلوبة' }
        },
        {
          name: 'witness2Phone',
          label: 'رقم هاتف الشاهد الثاني',
          type: 'tel',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'رقم الهاتف مطلوب' }
        },

        // تعديل الاسم - العناصر
        {
          name: 'correctedName',
          label: 'الاسم المعدل',
          type: 'text',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'الاسم المعدل مطلوب' }
        },
        {
          name: 'nameCorrectionReason',
          label: 'وضح أسباب التعديل',
          type: 'textarea',
          rows: 4,
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'أسباب التعديل مطلوبة' }
        },

        // تعديل العمر - العناصر
        {
          name: 'wrongBirthDate',
          label: 'تاريخ الميلاد الخطأ',
          type: 'date',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'تاريخ الميلاد الخطأ مطلوب' }
        },
        {
          name: 'correctBirthDate',
          label: 'تاريخ الميلاد الصحيح',
          type: 'date',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'تاريخ الميلاد الصحيح مطلوب' }
        },
        {
          name: 'ageCorrectionReason',
          label: 'وضح أسباب التعديل',
          type: 'textarea',
          rows: 4,
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          validation: { required: 'أسباب التعديل مطلوبة' }
        },

        // شهادة حسن السير والسلوك (الفيش)
        {
          name: 'nationalNumber',
          label: 'الرقم الوطني',
          type: 'text',
          conditional: { field: 'recordType', values: ['conduct_certificate'] },
          required: true,
          pattern: '[0-9]+',
          help: 'أدخل الرقم الوطني',
          validation: { required: 'الرقم الوطني مطلوب' }
        },
        {
          name: 'motherFullName',
          label: 'اسم الأم رباعي',
          type: 'text',
          conditional: { field: 'recordType', values: ['conduct_certificate'] },
          required: true,
          validation: { required: 'اسم الأم رباعي مطلوب' }
        },
        {
          name: 'requestingAuthority',
          label: 'الجهة الطالبة للفيش',
          type: 'text',
          conditional: { field: 'recordType', values: ['conduct_certificate'] },
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
          conditional: { field: 'recordType', values: ['conduct_certificate'] },
          required: true,
          validation: { required: 'سبب الطلب مطلوب' }
        },

        // إفادات لمن يهمهم الأمر
        {
          name: 'concernSubject',
          label: 'الموضوع',
          type: 'text',
          conditional: { field: 'recordType', values: ['towhomitmayconcern'] },
          required: true,
          help: 'عنوان أو موضوع الإفادة',
          validation: { required: 'الموضوع مطلوب' }
        },
        {
          name: 'civilRegistryData',
          label: 'بيانات السجل المدني',
          type: 'textarea',
          rows: 3,
          conditional: { field: 'recordType', values: ['towhomitmayconcern'] },
          required: true,
          help: 'أدخل بياناتك من السجل المدني (الاسم الرباعي، الرقم الوطني، تاريخ الميلاد، مكان الميلاد، إلخ)',
          validation: { required: 'بيانات السجل المدني مطلوبة' }
        },
        {
          name: 'requestExplanation',
          label: 'شرح الطلب',
          type: 'textarea',
          rows: 5,
          conditional: { field: 'recordType', values: ['towhomitmayconcern'] },
          required: true,
          help: 'اشرح تفاصيل الطلب والغرض من الإفادة والمعلومات المطلوب إثباتها',
          validation: { required: 'شرح الطلب مطلوب' }
        }
      ]
    },
    {
      id: 'documents-upload',
      title: 'المستندات المطلوبة',
      fields: [
        // بدل فاقد - المستندات
        {
          name: 'replacementIdOrPassport',
          label: 'صورة من الرقم الوطني أو الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['replacement'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الرقم الوطني أو الجواز مطلوبة' }
        },
        {
          name: 'replacementPhoto',
          label: 'صورة حديثة',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['replacement'] }
              ]
            }
          ],
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الحديثة مطلوبة' }
        },

        // حديثي الولادة - المستندات
        {
          name: 'newbornFatherIdOrPassport',
          label: 'صورة من الجواز أو الرقم الوطني للوالد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز أو الرقم الوطني للوالد مطلوبة' }
        },
        {
          name: 'newbornMotherIdOrPassport',
          label: 'صورة من الجواز أو الرقم الوطني للوالدة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز أو الرقم الوطني للوالدة مطلوبة' }
        },
        {
          name: 'newbornBirthCertificate',
          label: 'شهادة ميلاد أو تبليغ ولادة معتمد (للأطفال تحت 90 يوم)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          help: 'شهادة ميلاد أو تبليغ ولادة معتمد من دولة التمثيل في حالة الطفل لا يتجاوز 90 يوم',
          validation: { required: 'شهادة الميلاد أو تبليغ الولادة مطلوبة' }
        },
        {
          name: 'newbornMarriageCertificate',
          label: 'قسيمة الزواج',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'قسيمة الزواج مطلوبة' }
        },
        {
          name: 'newbornChildPhoto',
          label: 'صورة فوتوغرافية حديثة للطفل',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['newborn'] }
              ]
            }
          ],
          required: true,
          maxSize: '2MB',
          validation: { required: 'صورة الطفل مطلوبة' }
        },

        // دون 12 سنة - المستندات
        {
          name: 'under12FatherIdOrPassport',
          label: 'صورة من الجواز أو الرقم الوطني للوالد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز أو الرقم الوطني للوالد مطلوبة' }
        },
        {
          name: 'under12MotherIdOrPassport',
          label: 'صورة من الجواز أو الرقم الوطني للوالدة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز أو الرقم الوطني للوالدة مطلوبة' }
        },
        {
          name: 'under12BirthCertificate',
          label: 'شهادة الميلاد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'شهادة الميلاد مطلوبة' }
        },
        {
          name: 'under12MarriageCertificate',
          label: 'قسيمة الزواج',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'قسيمة الزواج مطلوبة' }
        },
        {
          name: 'under12Photo',
          label: 'صورة فوتوغرافية حديثة',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] }
              ]
            }
          ],
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الفوتوغرافية مطلوبة' }
        },
        {
          name: 'witness1Passport',
          label: 'صورة جواز الشاهد الأول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الشاهد الأول مطلوبة' }
        },
        {
          name: 'witness2Passport',
          label: 'صورة جواز الشاهد الثاني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['under12'] },
                { field: 'fatherAttending', values: ['no'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة جواز الشاهد الثاني مطلوبة' }
        },

        // تعديل الاسم - المستندات
        {
          name: 'nameCorrectionNationalId',
          label: 'صورة من الرقم الوطني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الرقم الوطني مطلوبة' }
        },
        {
          name: 'nameCorrectionBirthCertificate',
          label: 'شهادة الميلاد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'شهادة الميلاد مطلوبة' }
        },
        {
          name: 'nameCorrectionPassport',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز مطلوبة' }
        },
        {
          name: 'nameCorrectionLegalAffidavit',
          label: 'إشهاد شرعي',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'الإشهاد الشرعي مطلوب' }
        },
        {
          name: 'nameCorrectionGazettePublication',
          label: 'نشر الجريدة الرسمية',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'نشر الجريدة الرسمية مطلوب' }
        },
        {
          name: 'nameCorrectionSanctionsClearance',
          label: 'إفادة قوائم الحظر والسيطرة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'إفادة قوائم الحظر والسيطرة مطلوبة' }
        },
        {
          name: 'nameCorrectionInterpolClearance',
          label: 'إفادة من الإنتربول',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'إفادة من الإنتربول مطلوبة' }
        },
        {
          name: 'nameCorrectionHandwrittenRequest',
          label: 'كتابة طلب لتوضيح الأسباب بخط اليد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          help: 'يجب أن يكون الطلب مكتوباً بخط اليد',
          validation: { required: 'الطلب المكتوب بخط اليد مطلوب' }
        },
        {
          name: 'nameCorrectionPhoto',
          label: 'صورة حديثة',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['name_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الحديثة مطلوبة' }
        },

        // تعديل العمر - المستندات
        {
          name: 'ageCorrectionNationalId',
          label: 'صورة من الرقم الوطني',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الرقم الوطني مطلوبة' }
        },
        {
          name: 'ageCorrectionBirthCertificate',
          label: 'شهادة الميلاد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'شهادة الميلاد مطلوبة' }
        },
        {
          name: 'ageCorrectionPassport',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة الجواز مطلوبة' }
        },
        {
          name: 'ageCorrectionHandwrittenRequest',
          label: 'كتابة طلب لتوضيح الأسباب بخط اليد',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          help: 'يجب أن يكون الطلب مكتوباً بخط اليد',
          validation: { required: 'الطلب المكتوب بخط اليد مطلوب' }
        },
        {
          name: 'ageCorrectionSupportingDocs',
          label: 'مستندات داعمة ذات صلة',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '5MB',
          help: 'أي مستندات تدعم طلب تعديل العمر',
          validation: { required: 'المستندات الداعمة مطلوبة' }
        },
        {
          name: 'ageCorrectionPhoto',
          label: 'صورة حديثة',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: [
            {
              operator: 'AND',
              conditions: [
                { field: 'recordType', values: ['national_id'] },
                { field: 'idType', values: ['age_correction'] }
              ]
            }
          ],
          required: true,
          maxSize: '2MB',
          validation: { required: 'الصورة الحديثة مطلوبة' }
        },

        // شهادة حسن السير والسلوك (الفيش) - المستندات
        {
          name: 'conductPassportCopy',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: { field: 'recordType', values: ['conduct_certificate'] },
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز مطلوبة' }
        },
        {
          name: 'conductRecentPhoto',
          label: 'صورة حديثة',
          type: 'file',
          accept: '.jpg,.jpeg,.png',
          conditional: { field: 'recordType', values: ['conduct_certificate'] },
          required: true,
          maxSize: '5MB',
          help: 'صورة شخصية حديثة',
          validation: { required: 'صورة حديثة مطلوبة' }
        },

        // إفادات لمن يهمهم الأمر - المستندات
        {
          name: 'concernPassportCopy',
          label: 'صورة من الجواز',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          conditional: { field: 'recordType', values: ['towhomitmayconcern'] },
          required: true,
          maxSize: '5MB',
          validation: { required: 'صورة من الجواز مطلوبة' }
        },
        {
          name: 'concernRelatedFiles',
          label: 'ملفات ذات صلة (إن وجدت)',
          type: 'file',
          accept: '.pdf,.jpg,.jpeg,.png',
          multiple: true,
          conditional: { field: 'recordType', values: ['towhomitmayconcern'] },
          required: false,
          maxSize: '5MB',
          help: 'أي ملفات أو مستندات ذات صلة بالطلب (اختياري)'
        }
      ]
    }
  ]
};

export default civilRegistryConfig;
