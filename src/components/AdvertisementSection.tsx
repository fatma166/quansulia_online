import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

const AdvertisementSection: React.FC = () => {
  const { language } = useLanguage();

  return (
    <section className="relative">
      <div className="grid md:grid-cols-2 gap-1 bg-gray-200">
        {/* Left Advertisement */}
        <div className="relative" data-aos="fade-right">
          <a 
            href="#" 
            className="block relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <img
              src="/WhatsApp Image 2025-08-24 at 2.33.36 PM.jpeg"
              alt={language === 'ar' ? 'إعلان القنصلية السودانية' : 'Sudanese Consulate Advertisement'}
              className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-start p-6 md:p-8 lg:p-12">
              <div className="text-white max-w-lg">
                <h3 className="text-xl md:text-3xl font-bold mb-3 leading-tight">
                  {language === 'ar' 
                    ? 'استثمر في السودان'
                    : 'Invest in Sudan'
                  }
                </h3>
                <p className="text-sm md:text-lg mb-4 opacity-90">
                  {language === 'ar' 
                    ? 'فرص ذهبية في الزراعة والتعدين والطاقة المتجددة'
                    : 'Golden opportunities in agriculture, mining, and renewable energy'
                  }
                </p>
                <div className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors duration-200 inline-block text-sm md:text-base">
                  {language === 'ar' ? 'اعرف المزيد' : 'Learn More'}
                </div>
              </div>
            </div>
          </a>
        </div>

        {/* Right Advertisement */}
        <div className="relative" data-aos="fade-left">
          <a 
            href="#" 
            className="block relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <img
              src="/WhatsApp Image 2025-08-24 at 3.30.53 PM.jpeg"
              alt={language === 'ar' ? 'الخدمات القنصلية' : 'Consular Services'}
              className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/40 to-transparent" />
            
            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-end p-6 md:p-8 lg:p-12">
              <div className="text-white max-w-lg text-right">
                <h3 className="text-xl md:text-3xl font-bold mb-3 leading-tight">
                  {language === 'ar' 
                    ? 'الخدمات القنصلية'
                    : 'Consular Services'
                  }
                </h3>
                <p className="text-sm md:text-lg mb-4 opacity-90">
                  {language === 'ar' 
                    ? 'خدمات متطورة وسريعة لجميع المعاملات القنصلية'
                    : 'Advanced and fast services for all consular transactions'
                  }
                </p>
                <div className="bg-[#87ceeb] hover:bg-[#5dade2] text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold transition-colors duration-200 inline-block text-sm md:text-base">
                  {language === 'ar' ? 'احجز موعد' : 'Book Appointment'}
                </div>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AdvertisementSection;