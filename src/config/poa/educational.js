// Educational POA Configuration
export default {
  id: 'educational',
  title: 'شهادة دراسية',
  description: 'توكيل لاستلام الشهادات الدراسية والوثائق التعليمية',
  icon: '🎓',
  color: 'from-teal-500 to-teal-600',
  bgColor: 'bg-teal-50',
  
  subtypes: [
    { 
      value: "university_masters", 
      label: "دراسة جامعية ماجستير",
      description: "توكيل لاستلام شهادة الماجستير"
    },
    { 
      value: "egyptian_fellowship_form", 
      label: "استمارة الزمالة المصرية",
      description: "توكيل للزمالة المصرية"
    },
    { 
      value: "educational_certificate_issuance", 
      label: "إستخراج شهادة دراسية",
      description: "توكيل لاستخراج شهادة دراسية"
    },
    { 
      value: "university_egypt", 
      label: "دراسة جامعية بمصر",
      description: "توكيل للدراسة الجامعية في مصر"
    },
    { 
      value: "university_turkey", 
      label: "دراسة جامعية بتركيا",
      description: "توكيل للدراسة الجامعية في تركيا"
    },
    { 
      value: "other_educational", 
      label: "اخرى",
      description: "توكيل لشؤون تعليمية أخرى"
    }
  ],

  fieldsConfig: {
    educational_certificate_issuance: {
      educationFields: [
        {
          name: "studentName",
          label: "اسم الطالب",
          type: "text",
          required: true,
          validation: { required: "اسم الطالب مطلوب" }
        },
        {
          name: "certificateType",
          label: "نوع الشهادة",
          type: "select",
          options: [
            { value: "primary", label: "ابتدائية" },
            { value: "intermediate", label: "متوسطة" },
            { value: "secondary", label: "ثانوية" },
            { value: "university", label: "جامعية" }
          ],
          required: true,
          validation: { required: "نوع الشهادة مطلوب" }
        },
        {
          name: "graduationYear",
          label: "سنة التخرج",
          type: "number",
          required: true,
          validation: { required: "سنة التخرج مطلوبة" }
        }
      ]
    }
  }
};