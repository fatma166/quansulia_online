// Real Estate POA Configuration
export default {
  id: 'real_estate',
  title: 'عقارات وأراضي',
  description: 'توكيل للمعاملات العقارية وبيع وشراء الأراضي',
  icon: '🏠',
  color: 'from-green-500 to-green-600',
  bgColor: 'bg-green-50',
  
  subtypes: [
    { 
      value: "buy_land_property", 
      label: "شراء ارض أو عقار",
      description: "توكيل لشراء الأراضي والعقارات"
    },
    { 
      value: "land_gift", 
      label: "هبة قطعة ارض",
      description: "توكيل لهبة قطعة أرض"
    },
    { 
      value: "buy_property_egypt", 
      label: "شراء عقار بمصر",
      description: "توكيل لشراء عقار في مصر"
    },
    { 
      value: "land_sale", 
      label: "بيع قطعة أرض",
      description: "توكيل لبيع قطعة أرض"
    },
    { 
      value: "property_sale", 
      label: "بيع عقار",
      description: "توكيل لبيع عقار"
    },
    { 
      value: "land_registration", 
      label: "تسجيل قطعة أرض",
      description: "توكيل لتسجيل ملكية أرض"
    },
    { 
      value: "property_registration", 
      label: "تسجيل عقار",
      description: "توكيل لتسجيل ملكية عقار"
    },
    { 
      value: "other_real_estate", 
      label: "اخري",
      description: "توكيل لمعاملات عقارية أخرى"
    }
  ],

  fieldsConfig: {
    buy_land_property: {
      propertyFields: [
        {
          name: "propertyLocation",
          label: "موقع العقار/الأرض",
          type: "text",
          required: true,
          validation: { required: "موقع العقار مطلوب" }
        },
        {
          name: "propertyArea",
          label: "المساحة",
          type: "text",
          required: true,
          validation: { required: "المساحة مطلوبة" }
        },
        {
          name: "estimatedPrice",
          label: "السعر المتوقع",
          type: "number",
          required: false
        }
      ]
    }
  }
};