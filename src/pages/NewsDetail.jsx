import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Share2, Bookmark, Eye, Clock, Tag, MessageCircle, ThumbsUp, Download, Printer as Print, ExternalLink, ChevronRight, Star, Heart, Flag } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const NewsDetail = () => {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [news, setNews] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [views, setViews] = useState(0);

  useEffect(() => {
    loadNewsDetail();
  }, [newsId, navigate]);

  const loadNewsDetail = async () => {
    try {
      // Fetch the news item
      const { data: newsItem, error: newsError } = await supabase
        .from('news')
        .select('*')
        .eq('id', newsId)
        .maybeSingle();

      if (newsError) throw newsError;

      if (newsItem) {
        setNews(newsItem);
        // Simulate views count
        setViews(Math.floor(Math.random() * 1000) + 500);
        setLikes(Math.floor(Math.random() * 50) + 10);

        // Find related news (same category, excluding current)
        const { data: relatedData, error: relatedError } = await supabase
          .from('news')
          .select('*')
          .eq('category', newsItem.category)
          .eq('is_active', true)
          .neq('id', newsId)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedNews(relatedData || []);
      } else {
        navigate('/news');
      }
    } catch (error) {
      console.error('Error loading news:', error);
      navigate('/news');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'official': return 'bg-red-500';
      case 'latest': return 'bg-green-500';
      default: return 'bg-[#276073]';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'official': return 'بيان رسمي';
      case 'latest': return 'خبر جديد';
      default: return 'خبر';
    }
  };

  const handleShare = async () => {
    if (!news) return;

    const shareData = {
      title: language === 'ar' ? news.title_ar : news.title_en,
      text: language === 'ar' ? news.excerpt_ar : news.excerpt_en,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ رابط الخبر');
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In real app, save to user's bookmarks
  };

  const handlePrint = () => {
    window.print();
  };

  if (!news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الخبر...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={news.featured_image || '/placeholder-news.jpg'}
          alt={language === 'ar' ? news.title_ar : news.title_en}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Breadcrumbs */}
        <div className="absolute top-6 left-6 right-6 z-10">
          <nav className="flex items-center space-x-2 rtl:space-x-reverse text-white/80 text-sm">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors duration-200">
              الرئيسية
            </button>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <button onClick={() => navigate('/news')} className="hover:text-white transition-colors duration-200">
              الأخبار
            </button>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <span className="text-[#87ceeb] font-semibold">تفاصيل الخبر</span>
          </nav>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              {/* Category Badge */}
              <div className="mb-4">
                <span className={`${getCategoryColor(news.category)} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg inline-flex items-center space-x-2 rtl:space-x-reverse`}>
                  <Flag className="w-4 h-4" />
                  <span>{getCategoryLabel(news.category)}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {language === 'ar' ? news.title_ar : news.title_en}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-5 h-5 text-[#87ceeb]" />
                  <span>{new Date(news.published_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <User className="w-5 h-5 text-[#87ceeb]" />
                  <span>{(language === 'ar' ? news.author_ar : news.author_en) || 'القنصلية السودانية'}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Eye className="w-5 h-5 text-[#87ceeb]" />
                  <span>{views.toLocaleString('ar-SA')} مشاهدة</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Clock className="w-5 h-5 text-[#87ceeb]" />
                  <span>5 دقائق قراءة</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Article Content */}
              <div className="lg:col-span-3">
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  {/* Article Lead */}
                  {((language === 'ar' && news.excerpt_ar) || (language === 'en' && news.excerpt_en)) && (
                    <div className="mb-8 p-6 bg-[#276073]/5 border-r-4 rtl:border-r-0 rtl:border-l-4 border-[#276073] rounded-lg">
                      <p className="text-lg text-gray-700 leading-relaxed font-medium">
                        {language === 'ar' ? news.excerpt_ar : news.excerpt_en}
                      </p>
                    </div>
                  )}

                  {/* Article Body */}
                  <div className="prose prose-lg max-w-none" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div
                      className="space-y-6 text-gray-700 leading-relaxed ql-editor"
                      dangerouslySetInnerHTML={{
                        __html: language === 'ar' ? news.content_ar : news.content_en
                      }}
                    />
                  </div>

                  {/* Tags */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-4">
                      <Tag className="w-5 h-5 text-[#276073]" />
                      <span className="font-semibold text-gray-900">الكلمات المفتاحية:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['القنصلية السودانية', 'الخدمات القنصلية', 'جدة', 'الجالية السودانية', 'تطوير الخدمات'].map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#276073]/10 text-[#276073] rounded-full text-sm font-medium hover:bg-[#276073]/20 transition-colors duration-200 cursor-pointer"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        <button
                          onClick={handleLike}
                          className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            hasLiked 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
                          <span>{likes}</span>
                        </button>

                        <button
                          onClick={handleBookmark}
                          className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            isBookmarked 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600'
                          }`}
                        >
                          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                          <span>حفظ</span>
                        </button>

                        <button
                          onClick={handleShare}
                          className="flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 bg-gray-100 hover:bg-green-50 text-gray-600 hover:text-green-600 rounded-lg font-medium transition-all duration-200"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>مشاركة</span>
                        </button>
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={handlePrint}
                          className="p-2 text-gray-400 hover:text-[#276073] transition-colors duration-200"
                          title="طباعة"
                        >
                          <Print className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>

                {/* Comments Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mt-8"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                    <MessageCircle className="w-6 h-6 text-[#276073]" />
                    <span>التعليقات والآراء</span>
                  </h3>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">
                      شاركنا رأيك
                    </h4>
                    <p className="text-blue-600 mb-4">
                      نرحب بتعليقاتكم وآرائكم حول هذا الخبر
                    </p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
                      إضافة تعليق
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-8 sticky top-8">
                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      إجراءات سريعة
                    </h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate('/news')}
                        className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg transition-colors duration-200"
                      >
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                        <span>العودة للأخبار</span>
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>مشاركة الخبر</span>
                      </button>
                      
                      <button
                        onClick={handlePrint}
                        className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Download className="w-5 h-5" />
                        <span>تحميل PDF</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* News Stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      إحصائيات الخبر
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">المشاهدات</span>
                        <span className="font-bold text-[#276073]">{views.toLocaleString('ar-SA')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">الإعجابات</span>
                        <span className="font-bold text-red-500">{likes}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">المشاركات</span>
                        <span className="font-bold text-green-500">{Math.floor(likes / 3)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">تاريخ النشر</span>
                        <span className="font-bold text-gray-900">{new Date(news.date).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Related News */}
                  {relatedNews.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        أخبار ذات صلة
                      </h3>
                      <div className="space-y-4">
                        {relatedNews.map((relatedItem) => (
                          <div
                            key={relatedItem.id}
                            onClick={() => navigate(`/news/${relatedItem.id}`)}
                            className="flex space-x-3 rtl:space-x-reverse cursor-pointer group"
                          >
                            <img
                              src={relatedItem.image}
                              alt={relatedItem.title[language]}
                              className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-[#276073] transition-colors duration-200 line-clamp-2 text-sm">
                                {relatedItem.title[language]}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(relatedItem.date).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default NewsDetail;