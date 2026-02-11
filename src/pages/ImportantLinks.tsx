import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, Building2, FileText, Users, Landmark, ShieldCheck, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ChatBot from '../components/ChatBot';

interface ImportantLink {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  url: string;
  category: string;
  icon: string | null;
  order_index: number;
  opens_new_tab: boolean;
}

const categoryConfig: Record<string, { icon: any; colorClass: string; bgClass: string }> = {
  government: {
    icon: Building2,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  },
  ministry: {
    icon: Landmark,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  },
  legal: {
    icon: ShieldCheck,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  },
  documentation: {
    icon: FileText,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  },
  education: {
    icon: BookOpen,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  },
  community: {
    icon: Users,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  },
  general: {
    icon: Globe,
    colorClass: 'text-[#276073]',
    bgClass: 'bg-[#87ceeb]/10 border-[#87ceeb]/30'
  }
};

export default function ImportantLinks() {
  const { language } = useLanguage();
  const [links, setLinks] = useState<ImportantLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('important_links')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('order_index');

      if (error) throw error;
      if (data) setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
    } finally {
      setLoading(false);
    }
  };

  const getText = (ar: string, en: string | null) => {
    return language === 'ar' ? ar : (en || ar);
  };

  const categories = [
    { id: 'all', name_ar: 'الكل', name_en: 'All' },
    { id: 'government', name_ar: 'جهات حكومية', name_en: 'Government' },
    { id: 'ministry', name_ar: 'وزارات', name_en: 'Ministries' },
    { id: 'legal', name_ar: 'قانونية', name_en: 'Legal' },
    { id: 'documentation', name_ar: 'وثائق', name_en: 'Documentation' },
    { id: 'education', name_ar: 'تعليم', name_en: 'Education' },
    { id: 'community', name_ar: 'مجتمع', name_en: 'Community' }
  ];

  const filteredLinks = selectedCategory === 'all'
    ? links
    : links.filter(link => link.category === selectedCategory);

  const groupedLinks = filteredLinks.reduce((acc, link) => {
    const category = link.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(link);
    return acc;
  }, {} as Record<string, ImportantLink[]>);

  const getCategoryIcon = (category: string) => {
    const config = categoryConfig[category] || categoryConfig.general;
    const Icon = config.icon;
    return <Icon className="w-5 h-5" />;
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
              <Globe className="w-20 h-20 mx-auto mb-6 text-[#87ceeb]" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {language === 'ar' ? 'مواقع مهمة' : 'Important Links'}
              </h1>
              <p className="text-xl text-[#87ceeb] max-w-3xl mx-auto">
                {language === 'ar'
                  ? 'روابط سريعة للمواقع الرسمية والجهات الحكومية السودانية'
                  : 'Quick links to official Sudanese government websites and institutions'}
              </p>
            </motion.div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-16">
        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-[#276073] text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-[#87ceeb]/20 shadow'
                }`}
              >
                {language === 'ar' ? category.name_ar : category.name_en}
              </button>
            ))}
          </div>
        </motion.div>

        {filteredLinks.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ar'
                ? 'لا توجد روابط متاحة في هذه الفئة'
                : 'No links available in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedLinks).map(([category, categoryLinks], groupIndex) => {
              const config = categoryConfig[category] || categoryConfig.general;
              const Icon = config.icon;

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`${config.bgClass} border rounded-xl p-3`}>
                      <Icon className={`w-6 h-6 ${config.colorClass}`} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {language === 'ar'
                        ? categories.find(c => c.id === category)?.name_ar || 'عام'
                        : categories.find(c => c.id === category)?.name_en || 'General'}
                    </h2>
                    <div className={`${config.colorClass} font-bold`}>
                      ({categoryLinks.length})
                    </div>
                  </div>

                  {/* Links Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryLinks.map((link, index) => (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        target={link.opens_new_tab ? '_blank' : '_self'}
                        rel={link.opens_new_tab ? 'noopener noreferrer' : undefined}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`group ${config.bgClass} border rounded-xl p-6 hover:shadow-xl transition-all hover:scale-105`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`${config.colorClass} bg-white rounded-lg p-3 shadow-sm`}>
                            {getCategoryIcon(category)}
                          </div>
                          <ExternalLink className={`w-5 h-5 ${config.colorClass} group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
                        </div>

                        <h3 className={`text-lg font-bold ${config.colorClass} mb-2 group-hover:underline`}>
                          {getText(link.title_ar, link.title_en)}
                        </h3>

                        {(link.description_ar || link.description_en) && (
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {getText(link.description_ar || '', link.description_en)}
                          </p>
                        )}

                        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Globe className="w-4 h-4" />
                            <span className="truncate" dir="ltr">{link.url.replace(/^https?:\/\//, '').split('/')[0]}</span>
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 bg-[#87ceeb]/10 border border-[#87ceeb]/30 rounded-2xl p-8"
        >
          <div className="flex items-start gap-4">
            <div className="bg-[#276073] rounded-full p-3 flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#276073] mb-2">
                {language === 'ar' ? 'ملاحظة مهمة' : 'Important Note'}
              </h3>
              <p className="text-[#276073] leading-relaxed">
                {language === 'ar'
                  ? 'جميع الروابط المدرجة هنا تقود إلى مواقع رسمية وموثوقة. يرجى التأكد من صحة الموقع قبل إدخال أي معلومات شخصية.'
                  : 'All links listed here lead to official and trusted websites. Please verify the website authenticity before entering any personal information.'}
              </p>
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
