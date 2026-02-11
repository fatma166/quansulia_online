import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, Award, Calendar, MapPin, Phone, Mail, Clock, Shield, Globe, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';

interface ConsulateSection {
  id: string;
  section_type: string;
  title_ar: string;
  title_en: string | null;
  content_ar: string;
  content_en: string | null;
  image_url: string | null;
  order_index: number;
}

interface Ambassador {
  id: string;
  name_ar: string;
  name_en: string | null;
  photo_url: string | null;
  biography_ar: string;
  biography_en: string | null;
  term_start_date: string | null;
  term_end_date: string | null;
  is_current: boolean;
}

export default function AboutConsulate() {
  const { language } = useLanguage();
  const [sections, setSections] = useState<ConsulateSection[]>([]);
  const [ambassadors, setAmbassadors] = useState<Ambassador[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsResult, ambassadorsResult] = await Promise.all([
        supabase
          .from('about_consulate_sections')
          .select('*')
          .eq('is_active', true)
          .order('order_index'),
        supabase
          .from('ambassadors')
          .select('*')
          .eq('is_active', true)
          .order('order_index')
      ]);

      if (sectionsResult.data) setSections(sectionsResult.data);
      if (ambassadorsResult.data) setAmbassadors(ambassadorsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (ar: string, en: string | null) => {
    return language === 'ar' ? ar : (en || ar);
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#276073] mx-auto"></div>
              <Building2 className="w-8 h-8 text-[#276073] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-gray-700 font-semibold tracking-wide">
              {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const consulWord = sections.find(s => s.section_type === 'consul_word');
  const aboutSection = sections.find(s => s.section_type === 'about_consulate');
  const currentAmbassador = ambassadors.find(a => a.is_current);
  const pastAmbassadors = ambassadors.filter(a => !a.is_current);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Hero Section */}
        <div className="relative h-[450px] md:h-[500px] overflow-hidden bg-gradient-to-br from-[#276073] via-[#1e4a5a] to-[#276073]">
          <div className="absolute inset-0">
            <img
              src="https://images.pexels.com/photos/7413915/pexels-photo-7413915.jpeg?auto=compress&cs=tinysrgb&w=1920"
              alt="Government Building"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#276073]/95 via-[#1e4a5a]/90 to-[#276073]/95"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>

          <div className="container mx-auto px-4 h-full flex items-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#87ceeb] rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-[#87ceeb] to-[#276073] p-4 rounded-2xl shadow-2xl">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                </div>
                <div className="h-14 w-1 bg-gradient-to-b from-[#87ceeb] via-[#276073] to-transparent"></div>
                <div>
                  <p className="text-[#87ceeb] font-bold text-sm tracking-widest uppercase mb-1">
                    {language === 'ar' ? 'القنصلية العامة' : 'General Consulate'}
                  </p>
                  <p className="text-white text-base font-medium">
                    {language === 'ar' ? 'جمهورية السودان • جدة' : 'Republic of Sudan • Jeddah'}
                  </p>
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                {language === 'ar' ? 'عن القنصلية' : 'About the Consulate'}
              </h1>

              <p className="text-lg md:text-xl text-gray-100 leading-relaxed max-w-3xl font-light">
                {language === 'ar'
                  ? 'مؤسسة دبلوماسية تمثل جمهورية السودان في المملكة العربية السعودية، نعمل على خدمة المواطنين وتعزيز العلاقات الثنائية'
                  : 'A diplomatic institution representing the Republic of Sudan in the Kingdom of Saudi Arabia, serving citizens and strengthening bilateral relations'}
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-[#87ceeb] group-hover:scale-110 transition-transform" />
                    <span className="text-white font-semibold text-sm">
                      {language === 'ar' ? 'خدمات متميزة' : 'Distinguished Services'}
                    </span>
                  </div>
                </div>
                <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3 hover:bg-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-[#87ceeb] group-hover:scale-110 transition-transform" />
                    <span className="text-white font-semibold text-sm">
                      {language === 'ar' ? 'تواصل فعّال' : 'Effective Communication'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 -mt-16 relative z-20 pb-16">
          {/* Consul's Word Section */}
          {consulWord && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="relative overflow-hidden bg-gradient-to-r from-[#276073] to-[#1e4a5a]">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}></div>
                  <div className="relative px-6 py-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="h-10 w-1 bg-gradient-to-b from-[#87ceeb] to-transparent"></div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">
                          {getText(consulWord.title_ar, consulWord.title_en)}
                        </h2>
                        <p className="text-gray-200 mt-1 text-sm">
                          {language === 'ar' ? 'رسالة القنصل العام' : 'Message from the Consul General'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-1">
                      <div className="relative group max-w-sm mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#276073] via-[#87ceeb] to-[#276073] rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
                        <div className="relative">
                          <img
                            src={consulWord.image_url || "https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=600"}
                            alt={getText(consulWord.title_ar, consulWord.title_en)}
                            className="relative rounded-xl w-full aspect-[3/4] object-cover shadow-lg border-2 border-gray-100"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                      </div>
                      <div className="mt-5 text-center">
                        <div className="inline-flex items-center gap-2 bg-[#276073] text-white px-6 py-3 rounded-xl shadow-lg">
                          <Award className="w-4 h-4 text-[#87ceeb]" />
                          <p className="font-bold">{language === 'ar' ? 'القنصل العام' : 'Consul General'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <div className="relative">
                        <div className="absolute -top-4 -left-4 rtl:-right-4 rtl:left-auto text-[100px] text-gray-200 font-serif leading-none select-none">"</div>
                        <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 shadow-sm">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                            {getText(consulWord.content_ar, consulWord.content_en)}
                          </p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 rtl:-left-4 rtl:right-auto text-[100px] text-gray-200 font-serif leading-none rotate-180 select-none">"</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* About Consulate Section */}
          {aboutSection && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-700">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}></div>
                  <div className="relative px-6 py-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      <div className="h-10 w-1 bg-gradient-to-b from-[#87ceeb] to-transparent"></div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">
                          {getText(aboutSection.title_ar, aboutSection.title_en)}
                        </h2>
                        <p className="text-gray-200 mt-1 text-sm">
                          {language === 'ar' ? 'التعريف والرسالة' : 'Introduction and Mission'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="grid lg:grid-cols-2 gap-10 items-start">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#276073] to-gray-600 rounded-2xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
                      <div className="relative">
                        <img
                          src={aboutSection.image_url || "https://images.pexels.com/photos/8293642/pexels-photo-8293642.jpeg?auto=compress&cs=tinysrgb&w=800"}
                          alt={getText(aboutSection.title_ar, aboutSection.title_en)}
                          className="relative rounded-xl w-full h-[400px] object-cover shadow-lg border-2 border-gray-100"
                        />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    </div>

                    <div>
                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 shadow-sm">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                          {getText(aboutSection.content_ar, aboutSection.content_en)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Current Ambassador Section */}
          {currentAmbassador && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="relative overflow-hidden bg-gradient-to-r from-[#87ceeb] to-[#276073]">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}></div>
                  <div className="relative px-6 py-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Award className="w-7 h-7 text-white" />
                      </div>
                      <div className="h-10 w-1 bg-gradient-to-b from-white/50 to-transparent"></div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">
                          {language === 'ar' ? 'القنصل الحالي' : 'Current Consul'}
                        </h2>
                        <p className="text-white/90 mt-1 text-sm">
                          {language === 'ar' ? 'القائم بأعمال القنصلية' : 'Current Consul in Charge'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                    <div className="lg:col-span-1">
                      <div className="relative group max-w-sm mx-auto">
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#87ceeb] to-[#276073] rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                        <div className="relative">
                          <img
                            src={currentAmbassador.photo_url || "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400"}
                            alt={getText(currentAmbassador.name_ar, currentAmbassador.name_en)}
                            className="relative rounded-xl w-full aspect-[3/4] object-cover shadow-lg border-2 border-gray-100"
                          />
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                      </div>
                      {currentAmbassador.term_start_date && (
                        <div className="mt-5 bg-[#276073] text-white px-5 py-3 rounded-xl text-center shadow-lg">
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="font-bold text-sm">
                              {formatDate(currentAmbassador.term_start_date)} - {language === 'ar' ? 'حتى الآن' : 'Present'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <div className="mb-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-1 w-12 bg-gradient-to-r from-[#87ceeb] to-[#276073] rounded-full"></div>
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                            {getText(currentAmbassador.name_ar, currentAmbassador.name_en)}
                          </h3>
                        </div>
                        <p className="text-[#276073] font-bold text-lg inline-flex items-center gap-2 bg-[#87ceeb]/10 px-5 py-2 rounded-lg">
                          <Award className="w-5 h-5" />
                          {language === 'ar' ? 'القنصل العام' : 'Consul General'}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200 shadow-sm">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
                          {getText(currentAmbassador.biography_ar, currentAmbassador.biography_en)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Past Ambassadors Section */}
          {pastAmbassadors.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-8"
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 to-gray-600">
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                  }}></div>
                  <div className="relative px-6 py-8">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div className="h-10 w-1 bg-gradient-to-b from-white/50 to-transparent"></div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">
                          {language === 'ar' ? 'القناصل السابقون' : 'Past Consuls'}
                        </h2>
                        <p className="text-gray-200 mt-1 text-sm">
                          {language === 'ar' ? 'من خدموا القنصلية بتميز' : 'Who Served the Consulate with Distinction'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 md:p-10">
                  <div className="space-y-6">
                    {pastAmbassadors.map((ambassador, index) => (
                      <motion.div
                        key={ambassador.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                        className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                          <div className="lg:col-span-1">
                            <div className="relative max-w-xs mx-auto">
                              <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-500 rounded-xl blur-md opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
                              <div className="relative">
                                <img
                                  src={ambassador.photo_url || "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"}
                                  alt={getText(ambassador.name_ar, ambassador.name_en)}
                                  className="relative rounded-lg w-full aspect-[3/4] object-cover shadow-md border-2 border-white"
                                />
                                <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/5 to-transparent"></div>
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-2">
                            <div className="mb-5">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="h-1 w-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                  {getText(ambassador.name_ar, ambassador.name_en)}
                                </h3>
                              </div>
                              {(ambassador.term_start_date || ambassador.term_end_date) && (
                                <div className="inline-flex items-center gap-2 bg-gray-600 text-white px-5 py-2 rounded-lg shadow-md text-sm">
                                  <Calendar className="w-4 h-4" />
                                  <span className="font-bold">
                                    {formatDate(ambassador.term_start_date)} - {formatDate(ambassador.term_end_date)}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                                {getText(ambassador.biography_ar, ambassador.biography_en)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Contact Information Cards Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="group relative overflow-hidden bg-gradient-to-br from-[#276073] to-[#1e4a5a] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5"></div>
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-3 text-base uppercase tracking-wide">
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </h4>
                  <p className="text-gray-100 text-sm leading-relaxed">
                    {language === 'ar'
                      ? 'جدة، المملكة العربية السعودية'
                      : 'Jeddah, Saudi Arabia'}
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5"></div>
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-3 text-base uppercase tracking-wide">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </h4>
                  <p className="text-gray-100 text-sm" dir="ltr">
                    +966 XX XXX XXXX
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-[#87ceeb] to-[#276073] rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5"></div>
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-3 text-base uppercase tracking-wide">
                    {language === 'ar' ? 'البريد' : 'Email'}
                  </h4>
                  <p className="text-gray-100 text-sm break-all">
                    info@sudanconsulate.sa
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/5"></div>
                <div className="relative">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg inline-block mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-white mb-3 text-base uppercase tracking-wide">
                    {language === 'ar' ? 'العمل' : 'Hours'}
                  </h4>
                  <p className="text-gray-100 text-sm leading-relaxed">
                    {language === 'ar'
                      ? 'الأحد - الخميس: 8:00 - 16:00'
                      : 'Sun - Thu: 8:00 - 16:00'}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      <Footer />
      <ChatBot />
    </>
  );
}
