import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import servicesData from '../data/services.json';

const ServicesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    // Simple icon mapping - you can expand this
    const iconMap: { [key: string]: string } = {
      FileText: '📄',
      GraduationCap: '🎓',
      TrendingUp: '📈',
      MapPin: '📍'
    };
    return iconMap[iconName] || '📋';
  };

  const handleServiceClick = (service: any) => {
    // Navigate to the service link
    window.location.href = service.link;
  };

  return (
    <section className="py-20 bg-white" id="services">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 px-4">
            {t('hero.servicesTitle')}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {t('hero.servicesText')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          {servicesData.map((service, index) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-[#276073]/20"
              data-aos="fade-up"
              data-aos-delay={index * 100}
              onMouseEnter={() => setHoveredService(service.id.toString())}
              onMouseLeave={() => setHoveredService(null)}
              onClick={() => handleServiceClick(service)}
            >
              {/* Icon */}
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {getIcon(service.icon)}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#276073] transition-colors duration-300">
                {service.title[language]}
              </h3>

              {/* Summary */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {service.summary[language]}
              </p>

              {/* Arrow */}
              <div className="flex items-center text-[#276073] opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 rtl:group-hover:-translate-x-0 rtl:translate-x-2">
                <span className="text-sm font-semibold mr-2 rtl:mr-0 rtl:ml-2">
                  {language === 'ar' ? 'المزيد' : 'Learn More'}
                </span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              </div>
            </div>
          ))}
        </div>

        {/* All Services Button */}
        <div className="text-center" data-aos="fade-up" data-aos-delay="400">
          <button 
            onClick={() => window.location.href = '/services'}
            className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t('hero.allServices')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;