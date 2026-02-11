export const educationConfig = {
  id: 'education',
  title: 'الخدمات التعليمية',
  description: 'خدمات امتحانات الشهادات الدراسية للمراحل التعليمية المختلفة',
  icon: 'GraduationCap',
  category: 'documents',
  hasSubcategories: true,

  subcategories: [
    {
      id: 'secondary',
      title: 'امتحانات الشهادة الثانوية',
      description: 'التقديم لامتحانات الشهادة الثانوية القسم العلمي والأدبي',
      icon: '📚',
      color: 'from-[#276073] to-[#1e4a5a]',
      bgColor: 'bg-[#276073]/10',
      route: '/services/education/secondary'
    },
    {
      id: 'intermediate',
      title: 'امتحانات الشهادة المتوسطة',
      description: 'التقديم لامتحانات الشهادة المتوسطة (الصف الثامن)',
      icon: '📖',
      color: 'from-[#276073] to-[#1e4a5a]',
      bgColor: 'bg-[#276073]/10',
      route: '/services/education/intermediate'
    },
    {
      id: 'primary',
      title: 'امتحانات الشهادة الابتدائية',
      description: 'التقديم لامتحانات الشهادة الابتدائية (الصف السادس)',
      icon: '📕',
      color: 'from-[#276073] to-[#1e4a5a]',
      bgColor: 'bg-[#276073]/10',
      route: '/services/education/primary'
    },
    {
      id: 'exam-supervision',
      title: 'مراقبة الامتحانات',
      description: 'التقديم للعمل كمراقب في الامتحانات الرسمية',
      icon: '👁️',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      route: '/services/education/exam-supervision'
    }
  ],

  requirements: [
    'الشهادة السابقة أو ما يعادلها',
    'صورة من جواز السفر',
    'صورة شخصية حديثة',
    'دفع الرسوم المقررة'
  ],

  fees: {
    base: 150,
    currency: 'ريال سعودي'
  },

  duration: '5-7 أيام عمل',

  process: [
    'اختيار المرحلة التعليمية',
    'تعبئة البيانات المطلوبة',
    'رفع المستندات',
    'مراجعة الطلب',
    'دفع الرسوم',
    'استلام وثيقة التسجيل'
  ]
};

export const educationSubtypes = {
  primary: {
    id: 'primary',
    label: 'شهادة المرحلة الابتدائية',
    description: 'امتحانات الشهادة الابتدائية (الصف السادس)',
    icon: 'BookOpen',
    fees: { base: 150, currency: 'ريال سعودي' }
  },
  intermediate: {
    id: 'intermediate',
    label: 'شهادة المرحلة المتوسطة',
    description: 'امتحانات الشهادة المتوسطة (الصف الثامن)',
    icon: 'Book',
    fees: { base: 150, currency: 'ريال سعودي' }
  },
  secondary: {
    id: 'secondary',
    label: 'شهادة المرحلة الثانوية',
    description: 'امتحانات الشهادة الثانوية القسم العلمي والأدبي',
    icon: 'Award',
    fees: { base: 150, currency: 'ريال سعودي' }
  },
  'exam-supervision': {
    id: 'exam-supervision',
    label: 'مراقبة الامتحانات',
    description: 'التقديم للعمل كمراقب في الامتحانات الرسمية',
    icon: 'Eye',
    fees: { base: 0, currency: 'مجاناً' }
  }
};

export default educationConfig;
