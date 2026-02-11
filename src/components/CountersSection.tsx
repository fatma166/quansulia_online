import React, { useState, useEffect, useRef } from 'react';
import { Users, FileText, Calendar, Award, TrendingUp, Globe } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const CountersSection: React.FC = () => {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({
    citizens: 0,
    transactions: 0,
    events: 0,
    services: 0,
    investments: 0,
    partnerships: 0
  });
  const sectionRef = useRef<HTMLDivElement>(null);

  const finalValues = {
    citizens: 25000,
    transactions: 150000,
    events: 450,
    services: 12,
    investments: 85,
    partnerships: 35
  };

  const counterData = [
    {
      key: 'citizens',
      icon: Users,
      title: {
        ar: 'المواطنون المسجلون',
        en: 'Registered Citizens'
      },
      suffix: '+',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      key: 'transactions',
      icon: FileText,
      title: {
        ar: 'المعاملات المنجزة',
        en: 'Completed Transactions'
      },
      suffix: '+',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      key: 'events',
      icon: Calendar,
      title: {
        ar: 'الفعاليات المنظمة',
        en: 'Organized Events'
      },
      suffix: '+',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      key: 'services',
      icon: Award,
      title: {
        ar: 'الخدمات المتاحة',
        en: 'Available Services'
      },
      suffix: '',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      key: 'investments',
      icon: TrendingUp,
      title: {
        ar: 'المشاريع الاستثمارية',
        en: 'Investment Projects'
      },
      suffix: '+',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600'
    },
    {
      key: 'partnerships',
      icon: Globe,
      title: {
        ar: 'الشراكات الدولية',
        en: 'International Partnerships'
      },
      suffix: '+',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          startCountAnimation();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  const startCountAnimation = () => {
    const duration = 2500; // 2.5 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      setCounters({
        citizens: Math.floor(finalValues.citizens * easeOutQuart),
        transactions: Math.floor(finalValues.transactions * easeOutQuart),
        events: Math.floor(finalValues.events * easeOutQuart),
        services: Math.floor(finalValues.services * easeOutQuart),
        investments: Math.floor(finalValues.investments * easeOutQuart),
        partnerships: Math.floor(finalValues.partnerships * easeOutQuart)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(finalValues);
      }
    }, stepDuration);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('ar-SA');
  };

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Section Title */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 text-gray-900 px-4">
            {language === 'ar' ? 'إنجازاتنا بالأرقام' : 'Our Achievements in Numbers'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {language === 'ar'
              ? 'نفخر بما حققناه من إنجازات في خدمة الجالية السودانية وتطوير العلاقات الثنائية'
              : 'We are proud of our achievements in serving the Sudanese community and developing bilateral relations'
            }
          </p>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {counterData.map((item, index) => (
            <div
              key={item.key}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-gray-100 overflow-hidden"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-all duration-500`} />
              
              {/* Floating Particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-current opacity-30 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="absolute top-8 left-6 w-1.5 h-1.5 rounded-full bg-current opacity-20 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="absolute bottom-6 right-8 w-1 h-1 rounded-full bg-current opacity-25 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>

              {/* Icon */}
              <div className={`relative z-10 mb-6 p-4 rounded-full ${item.bgColor} group-hover:bg-white transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:scale-110 inline-flex`}>
                <item.icon className={`w-8 h-8 ${item.iconColor} group-hover:scale-125 transition-all duration-500`} />
              </div>

              {/* Counter */}
              <div className="relative z-10 mb-4">
                <div className={`text-4xl md:text-5xl font-bold ${item.iconColor} group-hover:scale-110 transition-all duration-300 inline-flex items-baseline`}>
                  <span className="tabular-nums">
                    {formatNumber(counters[item.key as keyof typeof counters])}
                  </span>
                  <span className="text-2xl ml-1">{item.suffix}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="relative z-10 text-lg font-bold text-gray-900 group-hover:text-gray-800 transition-colors duration-300">
                {item.title[language]}
              </h3>

              {/* Progress Bar */}
              <div className="relative z-10 mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${item.color} transition-all duration-2000 ease-out`}
                  style={{ 
                    width: isVisible ? '100%' : '0%',
                    transitionDelay: `${index * 100}ms`
                  }}
                />
              </div>

              {/* Pulse Effect */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-10 animate-pulse`} />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 text-center px-4" data-aos="fade-up" data-aos-delay="600">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 bg-white rounded-2xl px-4 sm:px-8 py-4 shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-[#276073]">
                {language === 'ar' ? 'منذ' : 'Since'}
              </div>
              <div className="text-base sm:text-lg text-gray-600">1956</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-[#276073]">
                {language === 'ar' ? 'سنوات الخدمة' : 'Years of Service'}
              </div>
              <div className="text-base sm:text-lg text-gray-600">68+</div>
            </div>
            <div className="hidden sm:block w-px h-12 bg-gray-300" />
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-[#276073]">
                {language === 'ar' ? 'التقييم' : 'Rating'}
              </div>
              <div className="text-base sm:text-lg text-gray-600">⭐ 4.9/5</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CountersSection;