// Companies POA Configuration
export default {
  id: 'companies',
  title: 'الشركات',
  description: 'توكيل للمعاملات التجارية وإدارة الشركات',
  icon: '🏢',
  color: 'from-indigo-500 to-indigo-600',
  bgColor: 'bg-indigo-50',
  
  subtypes: [
    { 
      value: "company_registration_form", 
      label: "استمارة تسجيل شركة",
      description: "توكيل لتسجيل شركة جديدة"
    },
    { 
      value: "business_name_form", 
      label: "استمارة تأسيس اسم عمل",
      description: "توكيل لتسجيل اسم تجاري"
    },
    { 
      value: "shares_disposal", 
      label: "التصرف في اسهم",
      description: "توكيل للتصرف في الأسهم"
    },
    { 
      value: "other_companies", 
      label: "اخرى",
      description: "توكيل لمعاملات شركات أخرى"
    }
  ],

  fieldsConfig: {
    company_registration_form: {
      companyFields: [
        {
          name: "companyName",
          label: "اسم الشركة",
          type: "text",
          required: true,
          validation: { required: "اسم الشركة مطلوب" }
        },
        {
          name: "companyType",
          label: "نوع الشركة",
          type: "select",
          options: [
            { value: "llc", label: "شركة ذات مسؤولية محدودة" },
            { value: "joint_stock", label: "شركة مساهمة" },
            { value: "partnership", label: "شركة تضامن" },
            { value: "other", label: "أخرى" }
          ],
          required: true,
          validation: { required: "نوع الشركة مطلوب" }
        }
      ]
    }
  }
};