// Inheritance POA Configuration
export default {
  id: 'inheritance',
  title: 'الورثة',
  description: 'توكيل خاص بقسمة التركات وشؤون الورثة',
  icon: '👨‍👩‍👧‍👦',
  color: 'from-amber-500 to-amber-600',
  bgColor: 'bg-amber-50',

  subtypes: [
    {
      value: "inheritance_inventory_form",
      label: "حصر الورثة",
      description: "توكيل لحصر الورثة وتحديد الأنصبة"
    },
    {
      value: "inheritance_waiver",
      label: "تنازل عن نصيب في ورثة",
      description: "توكيل للتنازل عن نصيب في الميراث"
    },
    {
      value: "inheritance_litigation",
      label: "تقاضي ورثة",
      description: "توكيل للمرافعة في قضايا الميراث"
    },
    {
      value: "inheritance_supervision",
      label: "إشراف ورثة",
      description: "توكيل للإشراف على تقسيم الميراث"
    },
    {
      value: "inheritance_disposal",
      label: "تصرف في ورثة",
      description: "توكيل للتصرف في أموال الميراث"
    },
    {
      value: "inheritance_receipt",
      label: "استلام ورثة",
      description: "توكيل لاستلام نصيب الميراث"
    },
    {
      value: "other_inheritance",
      label: "اخرى",
      description: "توكيل لشؤون ميراث أخرى"
    }
  ],

  fieldsConfig: {
    inheritance_inventory_form: {
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
      purposeFields: [
        {
          name: "poaPurpose",
          label: "الغرض من التوكيل",
          type: "select",
          options: [
            { value: "inventory", label: "حصر ورثة" },
            { value: "certificate", label: "إصدار إعلام شرعي" },
            { value: "other", label: "أخرى" }
          ],
          required: true,
          validation: { required: "الغرض من التوكيل مطلوب" }
        },
        {
          name: "otherPurpose",
          label: "حدد الغرض",
          type: "text",
          required: true,
          conditional: { field: "poaPurpose", values: ["other"] },
          validation: { required: "يرجى تحديد الغرض" }
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

    inheritance_waiver: {
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
      waiverFields: [
        {
          name: "inheritedPersonName",
          label: "اسم المورِّث",
          type: "text",
          required: true,
          validation: { required: "اسم المورِّث مطلوب" }
        },
        {
          name: "legalNoticeNumber",
          label: "رقم الإعلام الشرعي / إعلام الورثة",
          type: "text",
          required: true,
          validation: { required: "رقم الإعلام مطلوب" }
        },
        {
          name: "estateNumber",
          label: "رقم التركة",
          type: "text",
          required: true,
          validation: { required: "رقم التركة مطلوب" }
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

    inheritance_litigation: {
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
      litigationFields: [
        {
          name: "inheritedPersonName",
          label: "اسم المورُّوث",
          type: "text",
          required: true,
          validation: { required: "اسم المورُّوث مطلوب" }
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

    inheritance_supervision: {
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

    inheritance_disposal: {
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

    inheritance_receipt: {
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

    other_inheritance: {
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
          name: "inheritanceDescription",
          label: "وصف معاملة الورثة",
          type: "textarea",
          required: true,
          rows: 4,
          validation: { required: "وصف المعاملة مطلوب" }
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
