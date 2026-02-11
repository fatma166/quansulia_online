// Courts and Legal Cases POA Configuration
export default {
  id: 'courts',
  title: 'محاكم وقضايا ودعاوي',
  description: 'توكيل خاص بالمرافعات والقضايا القانونية والدعاوي',
  icon: '⚖️',
  color: 'from-purple-500 to-purple-600',
  bgColor: 'bg-purple-50',

  subtypes: [
    {
      value: "land_litigation",
      label: "تقاضي بشأن قطعة ارض : عقار",
      description: "توكيل للمرافعة في قضايا الأراضي والعقارات"
    },
    {
      value: "irrigation_litigation",
      label: "تقاضي بشأن ساقية",
      description: "توكيل للمرافعة في قضايا السواقي"
    },
    {
      value: "custody_litigation",
      label: "تقاضي بشأن حضانة شخصية",
      description: "توكيل للمرافعة في قضايا الحضانة"
    },
    {
      value: "file_lawsuit",
      label: "إقامة دعوى",
      description: "توكيل لإقامة دعوى قضائية"
    },
    {
      value: "name_correction_form",
      label: "اشهاد تصحيح الاسم",
      description: "توكيل لتصحيح الاسم في الوثائق الرسمية"
    },
    {
      value: "saudi_courts_form",
      label: "المحاكم السعودية",
      description: "توكيل للمرافعة في المحاكم السعودية"
    },
    {
      value: "egyptian_courts_form",
      label: "مقاضاة بالمحاكم المصرية",
      description: "توكيل للمرافعة في المحاكم المصرية"
    },
    {
      value: "other_courts",
      label: "اخري",
      description: "توكيل لقضايا قانونية أخرى"
    }
  ],

  fieldsConfig: {
    land_litigation: {
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
      caseFields: [
        {
          name: "landNumber",
          label: "رقم قطعة الأرض",
          type: "text",
          required: true,
          validation: { required: "رقم قطعة الأرض مطلوب" }
        },
        {
          name: "landArea",
          label: "المساحة",
          type: "text",
          required: true,
          validation: { required: "المساحة مطلوبة" }
        },
        {
          name: "landBlock",
          label: "المربع/الحي",
          type: "text",
          required: true,
          validation: { required: "المربع/الحي مطلوب" }
        },
        {
          name: "landCity",
          label: "المدينة",
          type: "text",
          required: true,
          validation: { required: "المدينة مطلوبة" }
        },
        {
          name: "lawsuitNumber",
          label: "رقم الدعوى المقامة",
          type: "text",
          required: true,
          validation: { required: "رقم الدعوى مطلوب" }
        },
        {
          name: "reportNumber",
          label: "رقم البلاغ",
          type: "text",
          required: true,
          validation: { required: "رقم البلاغ مطلوب" }
        },
        {
          name: "courtName",
          label: "اسم المحكمة",
          type: "text",
          required: true,
          validation: { required: "اسم المحكمة مطلوب" }
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

    irrigation_litigation: {
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
      caseFields: [
        {
          name: "irrigationNumber",
          label: "رقم الساقية",
          type: "text",
          required: true,
          validation: { required: "رقم الساقية مطلوب" }
        },
        {
          name: "irrigationArea",
          label: "المساحة",
          type: "text",
          required: true,
          validation: { required: "المساحة مطلوبة" }
        },
        {
          name: "irrigationRegion",
          label: "المنطقة",
          type: "text",
          required: true,
          validation: { required: "المنطقة مطلوبة" }
        },
        {
          name: "lawsuitNumber",
          label: "رقم الدعوى المقامة",
          type: "text",
          required: true,
          validation: { required: "رقم الدعوى مطلوب" }
        },
        {
          name: "reportNumber",
          label: "رقم البلاغ",
          type: "text",
          required: true,
          validation: { required: "رقم البلاغ مطلوب" }
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

    custody_litigation: {
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
      caseFields: [
        {
          name: "custodyPersonName",
          label: "اسم المراد ضم حضانته/ها",
          type: "text",
          required: true,
          validation: { required: "اسم المراد ضم حضانته مطلوب" }
        },
        {
          name: "custodyToName",
          label: "اسم المراد ضم الحضانة له/لها",
          type: "text",
          required: true,
          validation: { required: "اسم المراد ضم الحضانة له مطلوب" }
        },
        {
          name: "custodyRelation",
          label: "صلة قرابة المراد ضم الحضانة له",
          type: "text",
          required: true,
          validation: { required: "صلة القرابة مطلوبة" }
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

    file_lawsuit: {
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
      caseFields: [
        {
          name: "defendantName",
          label: "اسم المدعى عليه",
          type: "text",
          required: true,
          validation: { required: "اسم المدعى عليه مطلوب" }
        },
        {
          name: "lawsuitType",
          label: "نوع الدعوى المقامة",
          type: "text",
          required: true,
          validation: { required: "نوع الدعوى مطلوب" }
        },
        {
          name: "reportNumber",
          label: "رقم البلاغ",
          type: "text",
          required: true,
          validation: { required: "رقم البلاغ مطلوب" }
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

    name_correction_form: {
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
      caseFields: [
        {
          name: "incorrectName",
          label: "الاسم الوارد خطأ",
          type: "text",
          required: true,
          validation: { required: "الاسم الخاطئ مطلوب" }
        },
        {
          name: "documentWithError",
          label: "المستند الذي ورد فيه الخطأ",
          type: "text",
          required: true,
          validation: { required: "المستند مطلوب" }
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

    saudi_courts_form: {
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
      caseFields: [
        {
          name: "agentFullName",
          label: "اسم الوكيل رباعياً",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        },
        {
          name: "poaUsagePlace",
          label: "مكان استخدام التوكيل",
          type: "text",
          required: true,
          validation: { required: "مكان الاستخدام مطلوب" }
        },
        {
          name: "agentIdNumber",
          label: "رقم الهوية",
          type: "text",
          required: true,
          validation: { required: "رقم الهوية مطلوب" }
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

    egyptian_courts_form: {
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
      caseFields: [
        {
          name: "agentFullName",
          label: "اسم الوكيل",
          type: "text",
          required: true,
          validation: { required: "اسم الوكيل مطلوب" }
        },
        {
          name: "courtName",
          label: "المحكمة",
          type: "text",
          required: true,
          validation: { required: "اسم المحكمة مطلوب" }
        },
        {
          name: "lawsuitNumber",
          label: "رقم الدعوى",
          type: "text",
          required: true,
          validation: { required: "رقم الدعوى مطلوب" }
        },
        {
          name: "agentIdNumber",
          label: "رقم الهوية",
          type: "text",
          required: true,
          validation: { required: "رقم الهوية مطلوب" }
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

    other_courts: {
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
      caseFields: [
        {
          name: "caseDescription",
          label: "وصف القضية",
          type: "textarea",
          required: true,
          rows: 4,
          validation: { required: "وصف القضية مطلوب" }
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
