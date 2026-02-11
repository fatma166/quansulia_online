// Marriage and Divorce POA Configuration
export default {
  id: 'marriage_divorce',
  title: 'إجراءات الزواج والطلاق',
  description: 'توكيل خاص بعقود الزواج والطلاق والمأذونية',
  icon: '💍',
  color: 'from-pink-500 to-pink-600',
  bgColor: 'bg-pink-50',
  
  subtypes: [
    { 
      value: "marriage_contract", 
      label: "عقد زواج",
      description: "توكيل لإجراء عقد زواج"
    },
    { 
      value: "divorce_procedures", 
      label: "إجراءات طلاق",
      description: "توكيل لإجراءات الطلاق"
    },
    { 
      value: "other_marriage", 
      label: "اخرى",
      description: "توكيل لإجراءات زواج أو طلاق أخرى"
    }
  ],

  fieldsConfig: {
    marriage_contract: {
      marriageFields: [
        {
          name: "brideName",
          label: "اسم العروس",
          type: "text",
          required: true,
          validation: { required: "اسم العروس مطلوب" }
        },
        {
          name: "groomName",
          label: "اسم العريس",
          type: "text",
          required: true,
          validation: { required: "اسم العريس مطلوب" }
        },
        {
          name: "marriageDate",
          label: "تاريخ الزواج المتوقع",
          type: "date",
          required: true,
          validation: { required: "تاريخ الزواج مطلوب" }
        }
      ]
    }
  }
};