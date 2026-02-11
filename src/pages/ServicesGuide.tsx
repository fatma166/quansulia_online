import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight, PlayCircle, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';

interface GuideSection {
  id: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  step_number: number | null;
  image_url: string | null;
  video_url: string | null;
  order_index: number;
}

export default function ServicesGuide() {
  const { language } = useLanguage();
  const [sections, setSections] = useState<GuideSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('services_guide_sections')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (error) throw error;
      if (data) setSections(data);
    } catch (error) {
      console.error('Error fetching guide sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (ar: string, en: string | null) => {
    return language === 'ar' ? ar : (en || ar);
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
        <div className="relative bg-gradient-to-r from-[#276073] via-[#1e4a5a] to-[#276073] text-white py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-[#87ceeb]" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {language === 'ar' ? 'دليل المعاملات' : 'Services Guide'}
              </h1>
              <p className="text-xl text-[#87ceeb] max-w-3xl mx-auto">
                {language === 'ar'
                  ? 'دليل شامل لطريقة التقديم على الخدمات القنصلية'
                  : 'Comprehensive guide on how to apply for consular services'}
              </p>
            </motion.div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-16">
        {sections.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ar'
                ? 'سيتم إضافة محتوى الدليل قريباً'
                : 'Guide content will be added soon'}
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Introduction Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#87ceeb]/10 to-[#276073]/10 rounded-2xl p-8 mb-12 shadow-md border border-[#87ceeb]/30"
            >
              <div className="flex items-start gap-4">
                <div className="bg-[#276073] rounded-full p-3 flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {language === 'ar' ? 'كيفية استخدام هذا الدليل' : 'How to Use This Guide'}
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {language === 'ar'
                      ? 'يحتوي هذا الدليل على خطوات مفصلة لتقديم طلبات الخدمات القنصلية. يرجى قراءة كل خطوة بعناية قبل البدء في تقديم الطلب.'
                      : 'This guide contains detailed steps for submitting consular service applications. Please read each step carefully before starting your application.'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Guide Steps */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  {/* Step Header */}
                  <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] px-8 py-6">
                    <div className="flex items-center gap-4">
                      {section.step_number && (
                        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                          <span className="text-2xl font-bold text-white">{section.step_number}</span>
                        </div>
                      )}
                      <h3 className="text-2xl font-bold text-white">
                        {getText(section.title_ar, section.title_en)}
                      </h3>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="p-8">
                    <div className="space-y-6">
                      {/* Content with Image/Video Side by Side */}
                      {(section.image_url || section.video_url) ? (
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                          {/* Text Content */}
                          <div className="prose prose-lg max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                              {getText(section.content_ar, section.content_en)}
                            </p>
                          </div>

                          {/* Media Content */}
                          <div className="space-y-4">
                            {section.image_url && (
                              <div className="group relative">
                                <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto bg-[#276073] text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 z-10">
                                  <ImageIcon className="w-4 h-4" />
                                  {language === 'ar' ? 'صورة توضيحية' : 'Illustration'}
                                </div>
                                <img
                                  src={section.image_url}
                                  alt={getText(section.title_ar, section.title_en)}
                                  className="rounded-xl shadow-md w-full h-72 object-cover transition-transform group-hover:scale-[1.02]"
                                />
                              </div>
                            )}

                            {section.video_url && (
                              <div className="group relative">
                                <div className="absolute top-4 left-4 rtl:right-4 rtl:left-auto bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-2 z-10">
                                  <PlayCircle className="w-4 h-4" />
                                  {language === 'ar' ? 'فيديو تعليمي' : 'Tutorial Video'}
                                </div>
                                <div className="relative rounded-xl overflow-hidden shadow-md h-72">
                                  <iframe
                                    src={section.video_url}
                                    title={getText(section.title_ar, section.title_en)}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-lg max-w-none">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                            {getText(section.content_ar, section.content_en)}
                          </p>
                        </div>
                      )}

                      {/* Next Step Indicator */}
                      {index < sections.length - 1 && (
                        <div className="flex justify-center pt-4">
                          <div className="flex items-center gap-2 text-[#276073]">
                            <span className="text-sm font-medium">
                              {language === 'ar' ? 'الخطوة التالية' : 'Next Step'}
                            </span>
                            <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 bg-gradient-to-r from-[#276073] to-[#1e4a5a] rounded-2xl p-8 text-white text-center shadow-lg"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-[#87ceeb]" />
              <h3 className="text-2xl font-bold mb-4">
                {language === 'ar' ? 'هل أنت مستعد للبدء؟' : 'Ready to Get Started?'}
              </h3>
              <p className="text-[#87ceeb] mb-6 text-lg">
                {language === 'ar'
                  ? 'يمكنك الآن البدء في تقديم طلب الخدمة القنصلية عبر نظامنا الإلكتروني'
                  : 'You can now start applying for consular services through our online system'}
              </p>
              <a
                href="/services"
                className="inline-flex items-center gap-2 bg-white text-[#276073] px-8 py-3 rounded-xl font-semibold hover:bg-[#87ceeb]/20 transition-colors shadow-lg"
              >
                {language === 'ar' ? 'تصفح الخدمات' : 'Browse Services'}
                <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </a>
            </motion.div>
          </div>
        )}
      </div>
      </div>
      <Footer />
      <ChatBot />
    </>
  );
}
