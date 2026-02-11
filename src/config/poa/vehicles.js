// Vehicles POA Configuration
export default {
  id: 'vehicles',
  title: 'سيارات',
  description: 'توكيل خاص بمعاملات السيارات والمركبات',
  icon: '🚗',
  color: 'from-blue-500 to-blue-600',
  bgColor: 'bg-blue-50',
  
  subtypes: [
    { 
      value: "vehicle_sale", 
      label: "بيع سيارة",
      description: "توكيل لبيع مركبة"
    },
    { 
      value: "vehicle_receipt", 
      label: "استلام سيارة",
      description: "توكيل لاستلام مركبة"
    },
    { 
      value: "vehicle_shipping", 
      label: "شحن سيارة",
      description: "توكيل لشحن مركبة"
    },
    { 
      value: "vehicle_licensing", 
      label: "ترخيص سيارة",
      description: "توكيل لترخيص مركبة"
    },
    { 
      value: "vehicle_customs", 
      label: "تخليص جمركي لسيارة",
      description: "توكيل للتخليص الجمركي"
    },
    { 
      value: "other_vehicles", 
      label: "اخري",
      description: "توكيل لمعاملات مركبات أخرى"
    }
  ],

  fieldsConfig: {
    vehicle_sale: {
      vehicleFields: [
        {
          name: "vehicleMake",
          label: "ماركة السيارة",
          type: "text",
          required: true,
          validation: { required: "ماركة السيارة مطلوبة" }
        },
        {
          name: "vehicleModel",
          label: "موديل السيارة",
          type: "text",
          required: true,
          validation: { required: "موديل السيارة مطلوب" }
        },
        {
          name: "vehicleYear",
          label: "سنة الصنع",
          type: "number",
          required: true,
          validation: { required: "سنة الصنع مطلوبة" }
        },
        {
          name: "plateNumber",
          label: "رقم اللوحة",
          type: "text",
          required: true,
          validation: { required: "رقم اللوحة مطلوب" }
        }
      ]
    }
  }
};