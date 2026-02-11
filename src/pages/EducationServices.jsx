import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Calendar,
  FileText,
  ArrowLeft,
  ChevronRight,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Loader2
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';
import { supabase } from '../lib/supabase';

const EducationServices = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [educationServices, setEducationServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEducationServices();
  }, []);

  const loadEducationServices = async () => {
    try {
      const { data: service } = await supabase
        .from('services')
        .select('id')
        .eq('slug', 'education')
        .maybeSingle();

      if (!service) return;

      // جلب الخدمات الفرعية من جدول services
      const { data: subServices, error } = await supabase
        .from('services')
        .select('*')
        .eq('parent_id', service.id)
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;

      if (!subServices || subServices.length === 0) {
        // استخدام البيانات الثابتة إذا لم توجد بيانات في قاعدة البيانات
        setEducationServices([]);
        setLoading(false);
        return;
      }

      // جلب المتطلبات لكل خدمة
      const servicesWithRequirements = await Promise.all(
        subServices.map(async (subService, index) => {
          const { data: requirements } = await supabase
            .from('service_requirements')
            .select('requirement_ar')
            .eq('service_id', subService.id)
            .order('order_index')
            .limit(4);

          const colorMap = {
            0: { color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', icon: '📕' },
            1: { color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', icon: '📗' },
            2: { color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', icon: '📘' },
            3: { color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', icon: '👁️' }
          };
          const colors = colorMap[index] || colorMap[0];

          // متطلبات افتراضية إذا لم تكن موجودة
          const defaultRequirements = [
            'صورة من الرقم الوطني أو جواز السفر',
            'صورة شخصية حديثة',
            'الشهادات الدراسية السابقة',
            'استمارة التقديم مكتملة'
          ];

          return {
            id: subService.id,
            title: {
              ar: subService.name_ar,
              en: subService.name_en || subService.name_ar
            },
            description: {
              ar: subService.description_ar || `التقديم لامتحانات ${subService.name_ar}`,
              en: subService.description_en || `Apply for ${subService.name_ar}`
            },
            icon: colors.icon,
            color: colors.color,
            bgColor: colors.bgColor,
            route: `/services/${subService.slug}`,
            requirements: requirements && requirements.length > 0
              ? requirements.map(r => r.requirement_ar)
              : defaultRequirements,
            duration: subService.duration || '3-4 أشهر',
            fees: subService.fees && subService.fees !== 'غير محدد'
              ? `${subService.fees} ريال`
              : 'حسب التعرفة المعتمدة'
          };
        })
      );

      const formattedServices = servicesWithRequirements;

      setEducationServices(formattedServices);
    } catch (error) {
      console.error('Error loading education services:', error);
    } finally {
      setLoading(false);
    }
  };

  const educationServicesFallback = [
    {
      id: 'primary',
      title: {
        ar: 'امتحانات الشهادة الابتدائية',
        en: 'Primary Certificate Exams'
      },
      description: {
        ar: 'التقديم لامتحانات شهادة إتمام مرحلة الأساس (الصف الثامن)',
        en: 'Apply for Primary Education Certificate examinations (Grade 8)'
      },
      icon: '📘',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      route: '/services/primary',
      requirements: [
        'أصل شهادة الصف الخامس',
        'صورة شخصية حديثة',
        'الرقم الوطني أو جواز السفر',
        'استمارة التقديم مكتملة'
      ],
      duration: '3-4 أشهر',
      fees: 'حسب التعرفة المعتمدة'
    },
    {
      id: 'intermediate',
      title: {
        ar: 'امتحانات الشهادة المتوسطة',
        en: 'Intermediate Certificate Exams'
      },
      description: {
        ar: 'التقديم لامتحانات الشهادة المتوسطة (الصف العاشر)',
        en: 'Apply for Intermediate Education Certificate examinations (Grade 10)'
      },
      icon: '📗',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      route: '/services/intermediate',
      requirements: [
        'شهادة الأساس أو ما يعادلها',
        'صورة شخصية حديثة',
        'الرقم الوطني أو جواز السفر',
        'استمارة التقديم مكتملة'
      ],
      duration: '3-4 أشهر',
      fees: 'حسب التعرفة المعتمدة'
    },
    {
      id: 'secondary',
      title: {
        ar: 'امتحانات الشهادة الثانوية',
        en: 'Secondary Certificate Exams'
      },
      description: {
        ar: 'التقديم لامتحانات الشهادة الثانوية (القسم العلمي والأدبي)',
        en: 'Apply for Secondary Education Certificate examinations (Science & Arts)'
      },
      icon: '📕',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      route: '/services/secondary',
      requirements: [
        'الشهادة المتوسطة أو ما يعادلها',
        'الشهادة الثانوية (للمعيدين)',
        'صورة شخصية حديثة',
        'الرقم الوطني أو جواز السفر'
      ],
      duration: '3-4 أشهر',
      fees: 'حسب التعرفة المعتمدة'
    },
    {
      id: 'exam-supervision',
      title: {
        ar: 'مراقبة الامتحانات',
        en: 'Exam Supervision'
      },
      description: {
        ar: 'التقديم للعمل كمراقب في الامتحانات الرسمية',
        en: 'Apply to work as an exam supervisor in official examinations'
      },
      icon: '👁️',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      route: '/services/education/exam-supervision',
      requirements: [
        'القسيمة',
        'صورة جواز المراقب',
        'المؤهل الدراسي',
        'شهادة حسن السير والسلوك'
      ],
      duration: 'يوم واحد',
      fees: 'حسب التعرفة المعتمدة'
    }
  ];

  const breadcrumbs = [
    { label: 'الرئيسية', href: '/' },
    { label: 'الخدمات', href: '/services' },
    { label: 'التعليم', href: '/services/education' }
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#276073] via-[#1e4a5a] to-[#276073] text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <defs>
              <pattern id="education-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#education-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Breadcrumbs */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ChevronRight className="w-4 h-4 mx-2 rtl:rotate-180 text-white/60" />
                  )}
                  <a
                    href={crumb.href}
                    className={`hover:text-[#87ceeb] transition-colors duration-200 ${
                      index === breadcrumbs.length - 1 ? 'text-[#87ceeb] font-semibold' : 'text-white/80'
                    }`}
                  >
                    {crumb.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-3 rtl:space-x-reverse bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <GraduationCap className="w-6 h-6 text-[#87ceeb]" />
                <span className="text-lg font-semibold">التعليم والامتحانات الرسمية</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              {language === 'ar' ? 'خدمات التعليم' : 'Education Services'}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed"
            >
              {language === 'ar' 
                ? 'اختر الخدمة التعليمية المناسبة للاطلاع على الشروط والتقديم'
                : 'Choose the education service to view requirements and apply'
              }
            </motion.p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-[#276073] animate-spin" />
            </div>
          ) : educationServices.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-600 text-lg">لا توجد خدمات تعليمية متاحة حالياً</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {educationServices.map((service, index) => {
                // تحديد الألوان حسب نوع الخدمة
                const isExamSupervision = service.id === 'exam-supervision' || service.title.ar.includes('مراقبة');
                const bgColor = isExamSupervision ? 'bg-purple-500' : 'bg-[#2c5f6f]';
                const hoverBgColor = isExamSupervision ? 'hover:bg-purple-600' : 'hover:bg-[#234854]';

                return (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    {/* Service Content */}
                    <div className="p-8 text-center">
                      {/* Icon */}
                      <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <div className="text-4xl">{service.icon}</div>
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {service.title[language]}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                        {service.description[language]}
                      </p>

                      {/* Action Button */}
                      <button
                        onClick={() => navigate(service.route)}
                        className={`w-full ${bgColor} ${hoverBgColor} text-white py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg hover:shadow-xl`}
                      >
                        <span>{language === 'ar' ? 'تقديم طلب' : 'Apply Now'}</span>
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Information Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                معلومات مهمة
              </h2>
              <p className="text-lg text-gray-600">
                تعليمات عامة للتقديم في الامتحانات الرسمية
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* General Requirements */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                  <FileText className="w-6 h-6" />
                  <span>الشروط العامة</span>
                </h3>
                <ul className="space-y-3 text-blue-700">
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Star className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>التأكد من صحة جميع البيانات المدخلة</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Star className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>إرفاق جميع المستندات المطلوبة بصيغة واضحة</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Star className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>مطابقة الاسم مع الوثائق الرسمية</span>
                  </li>
                  <li className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Star className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>لن يكتمل التسجيل في حالة نقص المستندات</span>
                  </li>
                </ul>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-green-50 border border-green-200 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
                  <Phone className="w-6 h-6" />
                  <span>للاستفسارات</span>
                </h3>
                <div className="space-y-4 text-green-700">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">الهاتف</p>
                      <p className="text-sm">+966 12 123 4567</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">البريد الإلكتروني</p>
                      <p className="text-sm">education@consulate.gov.sd</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">ساعات العمل</p>
                      <p className="text-sm">الأحد - الخميس: 8:00 ص - 2:00 م</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-[#276073] to-[#1e4a5a] text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">إحصائيات التعليم</h2>
            <p className="text-xl text-white/90">أرقام تعكس التزامنا بخدمة التعليم السوداني</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#87ceeb]" />
              </div>
              <div className="text-3xl font-bold mb-2">2,500+</div>
              <div className="text-white/80 text-sm">طالب مسجل</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-[#87ceeb]" />
              </div>
              <div className="text-3xl font-bold mb-2">95%</div>
              <div className="text-white/80 text-sm">معدل النجاح</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#87ceeb]" />
              </div>
              <div className="text-3xl font-bold mb-2">15</div>
              <div className="text-white/80 text-sm">سنة خبرة</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#87ceeb]" />
              </div>
              <div className="text-3xl font-bold mb-2">3</div>
              <div className="text-white/80 text-sm">مراحل تعليمية</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ChatBot serviceCategory="education" />
    </div>
  );
};

export default EducationServices;