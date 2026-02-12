import React, { useState, useEffect } from 'react';
import { ArrowDown, Phone, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

const HeroSlider: React.FC = () => {
  const { t, language, isRTL } = useLanguage();
  const [sliderItems, setSliderItems] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load slider items from database
  useEffect(() => {
    loadSliderItems();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('slider_items_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'slider_items' },
        (payload) => {
          console.log('Slider items changed:', payload);
          loadSliderItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (sliderItems.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderItems.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [sliderItems]);

  const loadSliderItems = async () => {
    try {
      const { data, error } = await supabase
        .from('slider_items')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        // Process image URLs for items from Supabase Storage
        const processedItems = data.map(item => {
          if (item.image_url && !item.image_url.startsWith('http') && !item.image_url.startsWith('/')) {
            // Generate public URL for storage files
            const { data: urlData } = supabase.storage
              .from('slider-images')
              .getPublicUrl(item.image_url);

            console.log('Processing slider image:', item.image_url);
            console.log('Public URL:', urlData?.publicUrl);

            return {
              ...item,
              image_url: urlData?.publicUrl || item.image_url
            };
          }
          return item;
        });

        console.log('Processed slider items:', processedItems);
        setSliderItems(processedItems);
      } else {
        // Use default slider if no items in database
        setSliderItems([{
          id: 'default',
          title_ar: 'القنصلية العامة لجمهورية السودان بجدة',
          title_en: 'General Consulate of the Republic of Sudan in Jeddah',
          subtitle_ar: '',
          subtitle_en: '',
          description_ar: 'نخدم الجالية السودانية بكل فخر واعتزاز، ونقدم خدمات قنصلية متميزة تليق بأبناء السودان الكرام في المملكة العربية السعودية',
          description_en: 'We proudly serve the Sudanese community with distinguished consular services worthy of the honorable Sudanese people in the Kingdom of Saudi Arabia',
          image_url: '/consular-services.jpeg'
        }]);
      }
    } catch (error) {
      console.error('Error loading slider items:', error);
      // Use default on error
      setSliderItems([{
        id: 'default',
        title_ar: 'القنصلية العامة لجمهورية السودان بجدة',
        title_en: 'General Consulate of the Republic of Sudan in Jeddah',
        description_ar: 'نخدم الجالية السودانية بكل فخر واعتزاز',
        description_en: 'We proudly serve the Sudanese community',
        image_url: '/image.png'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderItems.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderItems.length) % sliderItems.length);
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden bg-gray-900 max-w-full" style={{ minHeight: '80vh' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const currentItem = sliderItems[currentSlide];

  return (
    <div className="relative overflow-hidden max-w-full" style={{ minHeight: '80vh' }}>
      {/* Background Image with transition */}
      <div className="absolute inset-0">
        {sliderItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={item.image_url || '/consular-services.jpeg'}
              alt={language === 'ar' ? item.title_ar : item.title_en}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Failed to load image:', item.image_url);
                e.currentTarget.src = '/consular-services.jpeg';
              }}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Navigation Arrows */}
      {sliderItems.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {sliderItems.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 rtl:space-x-reverse">
          {sliderItems.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 flex items-center justify-center" style={{ height: '80vh' }}>
        <div className="max-w-4xl text-center">
          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-4" data-aos="fade-up" data-aos-delay="100">
            <span className="block text-white">
              {language === 'ar' ? currentItem.title_ar : currentItem.title_en}
            </span>
            {currentItem.subtitle_ar && (
              <span className="block text-white mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                {language === 'ar' ? currentItem.subtitle_ar : currentItem.subtitle_en}
              </span>
            )}
          </h1>

          {/* Description */}
          {(currentItem.description_ar || currentItem.description_en) && (
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 md:mb-12 leading-relaxed max-w-4xl mx-auto px-4" data-aos="fade-up" data-aos-delay="200">
              {language === 'ar' ? currentItem.description_ar : currentItem.description_en}
            </p>
          )}

          {/* CTA Buttons */}
          {currentItem.button_text_ar && currentItem.button_link && (
            <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mb-8 md:mb-12 px-4" data-aos="fade-up" data-aos-delay="300">
              <a
                href={currentItem.button_link}
                className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {language === 'ar' ? currentItem.button_text_ar : currentItem.button_text_en}
              </a>
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto px-4" data-aos="fade-up" data-aos-delay="400">
            {/* Location Card */}
            <div className="bg-[#276073]/20 backdrop-blur-sm border border-[#276073]/30 rounded-xl p-4 md:p-6 hover:bg-[#276073]/30 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#87ceeb] rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#87ceeb] font-bold text-base sm:text-lg truncate">
                    {language === 'ar' ? 'الموقع' : 'Location'}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm truncate">
                    {language === 'ar' ? 'حي الروضة، جدة' : 'Al-Rawda, Jeddah'}
                  </p>
                </div>
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="bg-[#276073]/20 backdrop-blur-sm border border-[#276073]/30 rounded-xl p-4 md:p-6 hover:bg-[#276073]/30 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#87ceeb] rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#87ceeb] font-bold text-base sm:text-lg truncate">
                    {language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm truncate">
                    {language === 'ar' ? 'الأحد - الخميس' : 'Sun - Thu'}
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-[#276073]/20 backdrop-blur-sm border border-[#276073]/30 rounded-xl p-4 md:p-6 hover:bg-[#276073]/30 transition-all duration-300 transform hover:scale-105 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#87ceeb] rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#87ceeb] font-bold text-base sm:text-lg truncate">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </h3>
                  <p className="text-white/80 text-xs sm:text-sm truncate">+966 12 123 4567</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce" data-aos="fade-up" data-aos-delay="500">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>

    </div>
  );
};

export default HeroSlider;