// Power of Attorney Configurations Index
import generalPOA from './general.js';
import courtsPOA from './courts.js';
import inheritancePOA from './inheritance.js';
import realEstatePOA from './realEstate.js';
import vehiclesPOA from './vehicles.js';
import companiesPOA from './companies.js';
import marriageDivorcePOA from './marriageDivorce.js';
import birthCertificatesPOA from './birthCertificates.js';
import educationalPOA from './educational.js';

export const poaConfigurations = {
  general: generalPOA,
  courts: courtsPOA,
  inheritance: inheritancePOA,
  real_estate: realEstatePOA,
  vehicles: vehiclesPOA,
  companies: companiesPOA,
  marriage_divorce: marriageDivorcePOA,
  birth_certificates: birthCertificatesPOA,
  educational: educationalPOA
};

export const poaSubcategories = [
  {
    id: 'general',
    title: 'تواكيل منوعة',
    description: 'تواكيل منوعة لجميع الأغراض والمعاملات',
    icon: '📋',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50',
    route: '/services/poa/general'
  },
  {
    id: 'courts',
    title: 'محاكم وقضايا ودعاوي',
    description: 'توكيل خاص بالمرافعات والقضايا القانونية والدعاوي',
    icon: '⚖️',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    route: '/services/poa/courts'
  },
  {
    id: 'inheritance',
    title: 'الورثة',
    description: 'توكيل خاص بقسمة التركات وشؤون الورثة',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    route: '/services/poa/inheritance'
  },
  {
    id: 'real_estate',
    title: 'عقارات وأراضي',
    description: 'توكيل للمعاملات العقارية وبيع وشراء الأراضي',
    icon: '🏠',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    route: '/services/poa/real-estate'
  },
  {
    id: 'vehicles',
    title: 'سيارات',
    description: 'توكيل خاص بمعاملات السيارات والمركبات',
    icon: '🚗',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    route: '/services/poa/vehicles'
  },
  {
    id: 'companies',
    title: 'الشركات',
    description: 'توكيل للمعاملات التجارية وإدارة الشركات',
    icon: '🏢',
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-50',
    route: '/services/poa/companies'
  },
  {
    id: 'marriage_divorce',
    title: 'إجراءات الزواج والطلاق',
    description: 'توكيل خاص بعقود الزواج والطلاق والمأذونية',
    icon: '💍',
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-50',
    route: '/services/poa/marriage-divorce'
  },
  {
    id: 'birth_certificates',
    title: 'شهادات ميلاد',
    description: 'توكيل لاستلام شهادات الميلاد والوثائق المدنية',
    icon: '👶',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    route: '/services/poa/birth-certificates'
  },
  {
    id: 'educational',
    title: 'شهادة دراسية',
    description: 'توكيل لاستلام الشهادات الدراسية والوثائق التعليمية',
    icon: '🎓',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    route: '/services/poa/educational'
  }
];

// Helper function to get POA configuration by type
export const getPOAConfiguration = (poaType) => {
  return poaConfigurations[poaType] || null;
};

// Helper function to get all POA subtypes for a specific type
export const getPOASubtypes = (poaType) => {
  const config = poaConfigurations[poaType];
  return config ? config.subtypes : [];
};