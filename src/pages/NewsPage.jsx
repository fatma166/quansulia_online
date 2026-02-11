import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  ExternalLink, 
  FileText, 
  AlertCircle, 
  Megaphone,
  Search,
  Filter,
  Eye,
  Share2,
  Bookmark,
  ArrowLeft,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import newsData from '../data/news.json';

const NewsPage = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const newsPerPage = 6;

  const categories = [
    { key: 'all', label: 'جميع الأخبار', icon: FileText, color: 'from-[#276073] to-[#1e4a5a]', count: newsData.length },
    { key: 'official', label: 'بيانات رسمية', icon: AlertCircle, color: 'from-red-500 to-red-600', count: newsData.filter(n => n.category === 'official').length },
    { key: 'latest', label: 'آخر الأخبار', icon: Megaphone, color: 'from-green-500 to-green-600', count: newsData.filter(n => n.category === 'latest').length }
  ];

  // Filter news based on search and category
  const filteredNews = newsData.filter(news => {
    const matchesCategory = activeCategory === 'all' || news.category === activeCategory;
    const matchesSearch = !searchQuery || 
      news.title[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.excerpt[language].toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const paginatedNews = filteredNews.slice(startIndex, startIndex + newsPerPage);

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

  const handleNewsClick = (news) => {
    navigate(`/news/${news.id}`);
  };

  const handleShare = async (news) => {
    const shareData = {
      title: news.title[language],
      text: news.excerpt[language],
      url: window.location.origin + '/news/' + news.id
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${news.title[language]} - ${shareData.url}`);
      alert('تم نسخ رابط الخبر');
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#276073] via-[#1e4a5a] to-[#276073] text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <defs>
              <pattern id="news-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#news-grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center space-x-3 rtl:space-x-reverse bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                <FileText className="w-6 h-6 text-[#87ceeb]" />
                <span className="text-lg font-semibold">آخر الأخبار والتطورات</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              مركز الأخبار
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed"
            >
              تابع آخر الأخبار والبيانات الرسمية والتطورات من القنصلية السودانية
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{newsData.length}</div>
                <div className="text-sm opacity-80">إجمالي الأخبار</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{newsData.filter(n => n.category === 'official').length}</div>
                <div className="text-sm opacity-80">بيانات رسمية</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{newsData.filter(n => n.category === 'latest').length}</div>
                <div className="text-sm opacity-80">أخبار جديدة</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            {/* Category Filters */}
            <div className="flex justify-center">
              <div className="bg-gray-50 p-2 rounded-2xl shadow-lg border border-gray-200 inline-flex">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse relative ${
                      activeCategory === category.key
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                        : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <category.icon className={`w-5 h-5 ${
                      activeCategory === category.key ? 'animate-pulse' : ''
                    }`} />
                    <span>{category.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeCategory === category.key 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and View Mode */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="relative">
                <Search className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث في الأخبار..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 w-80"
                />
              </div>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              عرض {paginatedNews.length} من أصل {filteredNews.length} خبر
              {searchQuery && ` • البحث عن: "${searchQuery}"`}
            </p>
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {paginatedNews.length > 0 ? (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
              >
                {paginatedNews.map((news, index) => (
                  <motion.div
                    key={news.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100 cursor-pointer"
                    onClick={() => handleNewsClick(news)}
                  >
                    {/* News Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={news.image}
                        alt={news.title[language]}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                        <span className={`${getCategoryColor(news.category)} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                          {getCategoryLabel(news.category)}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-4 left-4 rtl:left-auto rtl:right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-semibold">
                        {new Date(news.date).toLocaleDateString('ar-SA')}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#276073]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* News Content */}
                    <div className="p-6">
                      {/* News Meta */}
                      <div className="flex items-center space-x-4 rtl:space-x-reverse text-gray-500 mb-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Calendar className="w-4 h-4 text-[#276073]" />
                          <span className="text-sm">
                            {new Date(news.date).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <User className="w-4 h-4 text-[#276073]" />
                          <span className="text-sm">القنصلية</span>
                        </div>
                      </div>

                      {/* News Title */}
                      <h3 className="text-xl font-bold mb-3 leading-tight text-gray-900 group-hover:text-[#276073] transition-colors duration-300 line-clamp-2">
                        {news.title[language]}
                      </h3>
                      
                      {/* News Excerpt */}
                      <p className="text-gray-600 mb-6 leading-relaxed text-sm line-clamp-3">
                        {news.excerpt[language]}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNewsClick(news);
                          }}
                          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse text-sm"
                        >
                          <span>اقرأ المزيد</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(news);
                            }}
                            className="p-2 text-gray-400 hover:text-[#276073] transition-colors duration-200"
                            title="مشاركة"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-[#276073] transition-colors duration-200"
                            title="حفظ"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-[#276073] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                        currentPage === page
                          ? 'bg-[#276073] text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-[#276073] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronRight className="w-5 h-5 rotate-180 rtl:rotate-0" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد أخبار
              </h3>
              <p className="text-gray-600 mb-6">
                لم يتم العثور على أخبار تطابق البحث أو الفئة المختارة
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                إعادة تعيين البحث
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured News Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              الأخبار المميزة
            </h2>
            <p className="text-xl text-gray-300">
              أهم الأخبار والتطورات من القنصلية
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {newsData.slice(0, 2).map((news, index) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                onClick={() => handleNewsClick(news)}
              >
                <div className="relative h-64">
                  <img
                    src={news.image}
                    alt={news.title[language]}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <span className={`${getCategoryColor(news.category)} text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block`}>
                      {getCategoryLabel(news.category)}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {news.title[language]}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {news.excerpt[language]}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default NewsPage;