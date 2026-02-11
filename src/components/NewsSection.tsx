import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ExternalLink, FileText, AlertCircle, Megaphone } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

const NewsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: 'all', label: 'جميع الأخبار', icon: FileText, color: 'from-[#276073] to-[#1e4a5a]' },
    { key: 'official', label: 'بيانات رسمية', icon: AlertCircle, color: 'from-red-500 to-red-600' },
    { key: 'latest', label: 'آخر الأخبار', icon: Megaphone, color: 'from-green-500 to-green-600' }
  ];

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('is_active', true)
        .order('published_date', { ascending: false })
        .limit(12);

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = activeCategory === 'all'
    ? news.slice(0, 6)
    : news.filter(item => item.category === activeCategory).slice(0, 6);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'official': return 'bg-red-500';
      case 'latest': return 'bg-green-500';
      default: return 'bg-[#276073]';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'official': return 'بيان رسمي';
      case 'latest': return 'خبر جديد';
      default: return 'خبر';
    }
  };

  const handleNewsClick = (newsId: string) => {
    navigate(`/news/${newsId}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الأخبار...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 px-4">
            {language === 'ar' ? 'آخر الأخبار' : 'Latest News'}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            {language === 'ar'
              ? 'تابع آخر الأخبار والتطورات من القنصلية السودانية'
              : 'Follow the latest news and developments from the Sudanese Consulate'
            }
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12 px-4" data-aos="fade-up" data-aos-delay="100">
          <div className="bg-gray-50 p-2 rounded-2xl shadow-lg border border-gray-200 flex flex-wrap gap-2 md:inline-flex justify-center max-w-full">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-1 sm:space-x-2 rtl:space-x-reverse text-sm sm:text-base ${
                  activeCategory === category.key
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                    : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 bg-white shadow-md hover:shadow-lg'
                }`}
              >
                <category.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  activeCategory === category.key ? 'animate-pulse' : ''
                }`} />
                <span className="whitespace-nowrap">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="relative overflow-hidden">
          <div className="flex space-x-8 rtl:space-x-reverse animate-scroll-horizontal pause-animation">
            {/* Create groups of 3 news items */}
            {Array.from({ length: Math.ceil(filteredNews.length / 3) * 2 }).map((_, groupIndex) => (
              <div key={groupIndex} className="flex space-x-6 rtl:space-x-reverse flex-shrink-0">
                {filteredNews.slice((groupIndex % Math.ceil(filteredNews.length / 3)) * 3, (groupIndex % Math.ceil(filteredNews.length / 3)) * 3 + 3).map((newsItem, index) => (
                  <div
                    key={`${groupIndex}-${newsItem.id}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100 flex-shrink-0 w-80"
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    onClick={() => handleNewsClick(newsItem.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* News Image */}
                    <div className="relative h-48 overflow-hidden">
                      {newsItem.featured_image ? (
                        <img
                          src={newsItem.featured_image}
                          alt={language === 'ar' ? newsItem.title_ar : newsItem.title_en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#276073] to-[#1e4a5a] flex items-center justify-center">
                          <FileText className="w-20 h-20 text-white opacity-50" />
                        </div>
                      )}

                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                        <span className={`${getCategoryColor(newsItem.category)} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                          {getCategoryLabel(newsItem.category)}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-semibold">
                        {new Date(newsItem.published_date).toLocaleDateString('ar-SA')}
                      </div>
                    </div>

                    {/* News Content */}
                    <div className="p-6">
                      {/* News Meta */}
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-500 mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="w-4 h-4 text-[#276073]" />
                          <span className="text-sm">
                            {new Date(newsItem.published_date).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="w-4 h-4 text-[#276073]" />
                          <span className="text-sm">
                            {language === 'ar' ? (newsItem.author_ar || 'القنصلية') : (newsItem.author_en || 'Consulate')}
                          </span>
                        </div>
                      </div>

                      {/* News Title */}
                      <h3 className="text-xl font-bold mb-3 leading-tight text-gray-900 group-hover:text-[#276073] transition-colors duration-300 line-clamp-2">
                        {language === 'ar' ? newsItem.title_ar : newsItem.title_en}
                      </h3>

                      {/* News Excerpt */}
                      <p className="text-gray-600 mb-6 leading-relaxed text-sm line-clamp-3">
                        {language === 'ar' ? (newsItem.excerpt_ar || newsItem.content_ar) : (newsItem.excerpt_en || newsItem.content_en)}
                      </p>

                      {/* Read More Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNewsClick(newsItem.id);
                        }}
                        className="w-full bg-[#276073] hover:bg-[#1e4a5a] text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 rtl:space-x-reverse"
                      >
                        <span>{t('hero.readMore')}</span>
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* View All News Button */}
        <div className="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
          <button 
            onClick={() => navigate('/news')}
            className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2 rtl:space-x-reverse mx-auto"
          >
            <span>عرض جميع الأخبار</span>
            <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;