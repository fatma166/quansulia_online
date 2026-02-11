// General Power of Attorney Configuration
export default {
  id: 'general',
  title: 'تواكيل منوعة',
  description: 'تواكيل منوعة لجميع الأغراض والمعاملات',
  icon: '📋',
  color: 'from-gray-500 to-gray-600',
  bgColor: 'bg-gray-50',
  
  // Subtypes for general POA
  subtypes: [
    { 
      value: "new_id_card", 
      label: "استخراج بطاقة جديدة",
      description: "توكيل لاستخراج بطاقة هوية جديدة من شركة الاتصالات"
    },
    { 
      value: "replacement_sim", 
      label: "استخرج شريحة بدل فاقد",
      description: "توكيل لاستخراج شريحة بديلة في حالة الفقدان"
    },
    { 
      value: "transfer_error_form", 
      label: "استمارة تحويل مبلغ بالخطاء",
      description: "توكيل لتصحيح تحويل مالي خاطئ"
    },
    { 
      value: "account_management", 
      label: "ادارة حساب",
      description: "توكيل لإدارة الحسابات البنكية والمالية"
    },
    { 
      value: "saudi_insurance_form", 
      label: "استمارة التامين السعودي",
      description: "توكيل للتعامل مع شركات التأمين السعودية"
    },
    { 
      value: "general_procedure_form", 
      label: "استمارة عامة لإجراء محدد",
      description: "توكيل عام لإجراء محدد"
    },
    { 
      value: "foreign_embassy_memo", 
      label: "استمارة مذكرة لسفارة أجنبية",
      description: "توكيل للتعامل مع السفارات الأجنبية"
    },
    { 
      value: "document_authentication", 
      label: "اسناد مستندات واثبات صحة",
      description: "توكيل لتوثيق المستندات وإثبات صحتها"
    },
    { 
      value: "other_general", 
      label: "اخري",
      description: "توكيل عام لأغراض أخرى"
    }
  ],

  // Fields configuration for each subtype
  fieldsConfig: {
    new_id_card: {
      // Basic applicant info (inherited from main POA)
      basicFields: [
        {
          name: "principalName",
          label: "اسم الموكل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الموكل مطلوب" }
        },
        {
          name: "principalPassport",
          label: "رقم جواز الموكل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الموكل مطلوب" }
        },
        {
          name: "agentName",
          label: "اسم الوكيل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        },
        {
          name: "agentPassport",
          label: "رقم جواز الوكيل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الوكيل مطلوب" }
        },
        {
          name: "poaUsagePlace",
          label: "مكان استخدام التوكيل (الدولة)",
          type: "text",
          required: true,
          validation: { required: "مكان استخدام التوكيل مطلوب" }
        },
        {
          name: "poaPurpose",
          label: "الغرض من التوكيل",
          type: "textarea",
          required: true,
          rows: 3,
          validation: { required: "الغرض من التوكيل مطلوب" }
        }
      ],

      // Telecom company selection
      telecomFields: [
        {
          name: "telecomCompany",
          label: "اسم شركة الاتصالات",
          type: "select",
          options: [
            { value: "stc", label: "STC - شركة الاتصالات السعودية" },
            { value: "mobily", label: "Mobily - اتحاد اتصالات" },
            { value: "zain", label: "Zain - زين السعودية" },
            { value: "virgin", label: "Virgin Mobile - فيرجن موبايل" },
            { value: "lebara", label: "Lebara - ليبارا" },
            { value: "other", label: "أخرى" }
          ],
          required: true,
          validation: { required: "اسم شركة الاتصالات مطلوب" }
        },
        {
          name: "telecomCompanyOther",
          label: "اسم الشركة الأخرى",
          type: "text",
          required: true,
          conditional: { field: "telecomCompany", values: ["other"] },
          validation: { required: "اسم الشركة مطلوب" }
        }
      ],

      // Witnesses information - with passport numbers
      witnessFields: [
        {
          name: "firstWitnessName",
          label: "اسم الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الأول مطلوب" }
        },
        {
          name: "firstWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        },
        {
          name: "secondWitnessName",
          label: "اسم الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الثاني مطلوب" }
        },
        {
          name: "secondWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        }
      ],

      // Document uploads
      documentFields: [
        {
          name: "firstWitnessIdFile",
          label: "صورة هوية الشاهد الأول",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          required: true,
          maxSize: "5MB",
          validation: { required: "صورة هوية الشاهد الأول مطلوبة" }
        },
        {
          name: "secondWitnessIdFile",
          label: "صورة هوية الشاهد الثاني",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          required: true,
          maxSize: "5MB",
          validation: { required: "صورة هوية الشاهد الثاني مطلوبة" }
        },
        {
          name: "principalIdFile",
          label: "صورة هوية الموكل",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          required: true,
          maxSize: "5MB",
          validation: { required: "صورة هوية الموكل مطلوبة" }
        },
        {
          name: "agentIdFile",
          label: "صورة هوية الوكيل",
          type: "file",
          accept: ".pdf,.jpg,.jpeg,.png",
          required: true,
          maxSize: "5MB",
          validation: { required: "صورة هوية الوكيل مطلوبة" }
        }
      ]
    },

    replacement_sim: {
      basicFields: [
        {
          name: "principalName",
          label: "اسم الموكل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الموكل مطلوب" }
        },
        {
          name: "agentName",
          label: "اسم الوكيل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        }
      ],
      
      simFields: [
        {
          name: "phoneNumber",
          label: "رقم الهاتف المفقود",
          type: "tel",
          required: true,
          validation: { required: "رقم الهاتف المفقود مطلوب" }
        },
        {
          name: "telecomCompany",
          label: "شركة الاتصالات",
          type: "select",
          options: [
            { value: "stc", label: "STC" },
            { value: "mobily", label: "Mobily" },
            { value: "zain", label: "Zain" },
            { value: "other", label: "أخرى" }
          ],
          required: true,
          validation: { required: "شركة الاتصالات مطلوبة" }
        }
      ]
    },

    transfer_error_form: {
      basicFields: [
        {
          name: "principalName",
          label: "اسم الموكل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الموكل مطلوب" }
        },
        {
          name: "principalPassport",
          label: "رقم جواز الموكل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الموكل مطلوب" }
        },
        {
          name: "agentName",
          label: "اسم الوكيل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        },
        {
          name: "agentPassport",
          label: "رقم جواز الوكيل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الوكيل مطلوب" }
        },
        {
          name: "poaUsagePlace",
          label: "مكان استخدام التوكيل (الدولة)",
          type: "text",
          required: true,
          validation: { required: "مكان استخدام التوكيل مطلوب" }
        }
      ],
      transferFields: [
        {
          name: "transferredToName",
          label: "اسم الشخص المحول له بالخطأ",
          type: "text",
          required: true,
          validation: { required: "اسم الشخص المحول له بالخطأ مطلوب" }
        },
        {
          name: "transferredToAccount",
          label: "رقم حساب الشخص المحول له بالخطأ",
          type: "text",
          required: true,
          validation: { required: "رقم الحساب مطلوب" }
        },
        {
          name: "poaPurpose",
          label: "الغرض من التوكيل",
          type: "textarea",
          required: true,
          rows: 3,
          className: "md:col-span-2",
          validation: { required: "الغرض من التوكيل مطلوب" }
        }
      ],
      witnessFields: [
        {
          name: "firstWitnessName",
          label: "اسم الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الأول مطلوب" }
        },
        {
          name: "firstWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        },
        {
          name: "secondWitnessName",
          label: "اسم الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الثاني مطلوب" }
        },
        {
          name: "secondWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        }
      ]
    },

    saudi_insurance_form: {
      basicFields: [
        {
          name: "principalName",
          label: "اسم الموكل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الموكل مطلوب" }
        },
        {
          name: "principalPassport",
          label: "رقم جواز الموكل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الموكل مطلوب" }
        }
      ],
      insuranceFields: [
        {
          name: "insuranceCompanyName",
          label: "اسم شركة التأمين",
          type: "text",
          required: true,
          validation: { required: "اسم شركة التأمين مطلوب" }
        },
        {
          name: "agentName",
          label: "اسم الوكيل (رباعياً)",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        },
        {
          name: "agentIdNumber",
          label: "رقم الهوية",
          type: "text",
          required: true,
          validation: { required: "رقم الهوية مطلوب" }
        },
        {
          name: "bankName",
          label: "اسم البنك",
          type: "text",
          required: true,
          validation: { required: "اسم البنك مطلوب" }
        },
        {
          name: "ibanNumber",
          label: "رقم الآيبان المراد تحويل المبلغ فيه",
          type: "text",
          required: true,
          validation: { required: "رقم الآيبان مطلوب" }
        },
        {
          name: "poaUsagePlace",
          label: "مكان استخدام التوكيل (الدولة)",
          type: "text",
          required: true,
          validation: { required: "مكان استخدام التوكيل مطلوب" }
        }
      ],
      witnessFields: [
        {
          name: "firstWitnessName",
          label: "اسم الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الأول مطلوب" }
        },
        {
          name: "firstWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        },
        {
          name: "secondWitnessName",
          label: "اسم الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الثاني مطلوب" }
        },
        {
          name: "secondWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        }
      ]
    },

    // Add other subtypes configurations here...
    other_general: {
      basicFields: [
        {
          name: "principalName",
          label: "اسم الموكل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الموكل مطلوب" }
        },
        {
          name: "principalPassport",
          label: "رقم جواز الموكل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الموكل مطلوب" }
        },
        {
          name: "agentName",
          label: "اسم الوكيل (رباعي)",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        },
        {
          name: "agentPassport",
          label: "رقم جواز الوكيل",
          type: "text",
          required: true,
          validation: { required: "رقم جواز الوكيل مطلوب" }
        },
        {
          name: "poaUsagePlace",
          label: "مكان استخدام التوكيل (الدولة)",
          type: "text",
          required: true,
          validation: { required: "مكان استخدام التوكيل مطلوب" }
        },
        {
          name: "poaPurpose",
          label: "الغرض من التوكيل",
          type: "textarea",
          required: true,
          rows: 4,
          className: "md:col-span-2",
          help: "حدد بوضوح الصلاحيات الممنوحة للوكيل",
          validation: { required: "الغرض من التوكيل مطلوب" }
        }
      ],
      witnessFields: [
        {
          name: "firstWitnessName",
          label: "اسم الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الأول مطلوب" }
        },
        {
          name: "firstWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الأول",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        },
        {
          name: "secondWitnessName",
          label: "اسم الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "اسم الشاهد الثاني مطلوب" }
        },
        {
          name: "secondWitnessPassport",
          label: "رقم جواز سفر ساري - الشاهد الثاني",
          type: "text",
          required: true,
          validation: { required: "رقم الجواز مطلوب" }
        }
      ]
    }
  }
};