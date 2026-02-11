// Birth Certificates POA Configuration
export default {
  id: 'birth_certificates',
  title: 'شهادات ميلاد',
  description: 'توكيل لاستلام شهادات الميلاد والوثائق المدنية',
  icon: '👶',
  color: 'from-cyan-500 to-cyan-600',
  bgColor: 'bg-cyan-50',
  
  subtypes: [
    { 
      value: "birth_certificate_issuance", 
      label: "استخراج شهادات ميلاد",
      description: "توكيل لاستخراج شهادة ميلاد"
    }
  ],

  fieldsConfig: {
    birth_certificate_issuance: {
      birthFields: [
        {
          name: "childName",
          label: "اسم الطفل",
          type: "text",
          required: true,
          validation: { required: "اسم الطفل مطلوب" }
        },
        {
          name: "birthDate",
          label: "تاريخ الميلاد",
          type: "date",
          required: true,
          validation: { required: "تاريخ الميلاد مطلوب" }
        },
        {
          name: "birthPlace",
          label: "مكان الميلاد",
          type: "text",
          required: true,
          validation: { required: "مكان الميلاد مطلوب" }
        }
      ]
    }
  }
};