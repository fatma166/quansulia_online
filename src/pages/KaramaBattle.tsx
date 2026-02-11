import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Heart, Flag, Users, Award, BookOpen, Image as ImageIcon, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';

interface PageSection {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  image_url: string | null;
  display_order: number;
  section_key: string;
}

interface HeroContent {
  title_ar: string;
  title_en: string | null;
  subtitle_ar: string;
  subtitle_en: string | null;
  background_image_url: string | null;
}

export default function KaramaBattle() {
  const { language } = useLanguage();
  const [sections, setSections] = useState<PageSection[]>([]);
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const { data: pageData, error: pageError } = await supabase
        .from('additional_pages')
        .select('*')
        .eq('slug', 'karama-battle')
        .eq('is_active', true)
        .maybeSingle();

      if (pageError) throw pageError;

      if (pageData) {
        setHeroContent({
          title_ar: pageData.title_ar,
          title_en: pageData.title_en,
          subtitle_ar: pageData.subtitle_ar || '',
          subtitle_en: pageData.subtitle_en || '',
          background_image_url: pageData.hero_image_url
        });
      }

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_name', 'karama-battle')
        .eq('is_active', true)
        .order('display_order');

      if (sectionsError) throw sectionsError;
      if (sectionsData) setSections(sectionsData);
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (ar: string, en: string | null) => {
    return language === 'ar' ? ar : (en || ar);
  };

  const getSectionIcon = (key: string) => {
    const icons: Record<string, any> = {
      intro: Shield,
      history: BookOpen,
      unity: Users,
      courage: Heart,
      achievements: Award,
      future: Flag
    };
    return icons[key] || Shield;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#276073] mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
        <Footer />
        <ChatBot />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-[#276073] via-[#1e4a5a] to-[#276073] text-white py-24 overflow-hidden">
        {heroContent?.background_image_url && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroContent.background_image_url})` }}
          ></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse bg-[#87ceeb]/30 rounded-full blur-2xl"></div>
                <Shield className="w-24 h-24 relative text-[#87ceeb]" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {heroContent ? getText(heroContent.title_ar, heroContent.title_en) : (language === 'ar' ? 'معركة الكرامة' : 'Battle of Dignity')}
            </h1>

            <p className="text-xl md:text-2xl text-[#87ceeb] leading-relaxed">
              {heroContent ? getText(heroContent.subtitle_ar, heroContent.subtitle_en) : (language === 'ar'
                ? 'صمود شعب وكرامة أمة في مواجهة التحديات'
                : 'The resilience of a people and the dignity of a nation facing challenges')}
            </p>

            <div className="mt-8 flex items-center justify-center gap-8 text-[#87ceeb]">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6" />
                <span className="font-semibold">{language === 'ar' ? 'الوحدة' : 'Unity'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" />
                <span className="font-semibold">{language === 'ar' ? 'الكرامة' : 'Dignity'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flag className="w-6 h-6" />
                <span className="font-semibold">{language === 'ar' ? 'الصمود' : 'Resilience'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16">
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ar'
                ? 'سيتم إضافة المحتوى قريباً'
                : 'Content will be added soon'}
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-12">
            {sections.map((section, index) => {
              const Icon = getSectionIcon(section.section_key);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                  {section.image_url ? (
                    <div className={`grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 ${!isEven && language === 'ar' ? 'lg:grid-flow-dense' : ''}`}>
                      {/* Text Content */}
                      <div className={!isEven && language !== 'ar' ? 'lg:col-start-2' : ''}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-gradient-to-br from-[#276073] to-[#1e4a5a] rounded-xl p-3">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h2 className="text-3xl font-bold text-gray-900">
                            {getText(section.title_ar, section.title_en)}
                          </h2>
                        </div>

                        <div className="prose prose-lg max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                            {getText(section.content_ar, section.content_en)}
                          </p>
                        </div>
                      </div>

                      {/* Image */}
                      <div className={!isEven && language !== 'ar' ? 'lg:col-start-1 lg:row-start-1' : ''}>
                        <div className="relative group">
                          <div className="absolute -inset-2 bg-gradient-to-r from-[#276073] to-[#87ceeb] rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
                          <div className="relative">
                            <img
                              src={section.image_url}
                              alt={getText(section.title_ar, section.title_en)}
                              className="relative rounded-xl w-full h-80 object-cover shadow-lg border-2 border-gray-100"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-[#276073] to-[#1e4a5a] rounded-xl p-3">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {getText(section.title_ar, section.title_en)}
                        </h2>
                      </div>

                      <div className="prose prose-lg max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                          {getText(section.content_ar, section.content_en)}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-[#276073] to-[#1e4a5a] rounded-2xl p-10 text-white text-center shadow-2xl"
        >
          <div className="max-w-3xl mx-auto">
            <Flag className="w-16 h-16 mx-auto mb-6 text-[#87ceeb]" />
            <h3 className="text-3xl font-bold mb-4">
              {language === 'ar' ? 'معاً من أجل السودان' : 'Together for Sudan'}
            </h3>
            <p className="text-[#87ceeb] text-lg leading-relaxed mb-8">
              {language === 'ar'
                ? 'نقف معاً في وجه التحديات، متمسكين بوحدتنا وكرامتنا، من أجل مستقبل أفضل لأجيالنا القادمة'
                : 'We stand together in the face of challenges, holding on to our unity and dignity, for a better future for our coming generations'}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-[#87ceeb]" />
                  <div className="text-right rtl:text-left">
                    <div className="text-2xl font-bold">{language === 'ar' ? 'الوحدة' : 'Unity'}</div>
                    <div className="text-sm text-[#87ceeb]">{language === 'ar' ? 'قوتنا' : 'Our Strength'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-[#87ceeb]" />
                  <div className="text-right rtl:text-left">
                    <div className="text-2xl font-bold">{language === 'ar' ? 'الصمود' : 'Resilience'}</div>
                    <div className="text-sm text-[#87ceeb]">{language === 'ar' ? 'عزيمتنا' : 'Our Resolve'}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <Flag className="w-6 h-6 text-[#87ceeb]" />
                  <div className="text-right rtl:text-left">
                    <div className="text-2xl font-bold">{language === 'ar' ? 'المستقبل' : 'Future'}</div>
                    <div className="text-sm text-[#87ceeb]">{language === 'ar' ? 'أملنا' : 'Our Hope'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
      <Footer />
      <ChatBot />
    </>
  );
}
