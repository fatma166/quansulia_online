import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Sun,
  Sunrise,
  Moon,
  CalendarDays,
  Search,
  Filter,
  Eye,
  Share2,
  Bookmark,
  X,
  UserPlus,
  CheckCircle,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Heart,
  Camera,
  Music,
  Utensils,
  GraduationCap,
  Building
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EventsPage = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filterType, setFilterType] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'today', label: 'اليوم', icon: Sun, color: 'from-yellow-400 to-orange-500', count: events.filter(e => e.tab_group === 'today').length },
    { key: 'tomorrow', label: 'الغد', icon: Sunrise, color: 'from-orange-400 to-pink-500', count: events.filter(e => e.tab_group === 'tomorrow').length },
    { key: 'afterTomorrow', label: 'بعد الغد', icon: Moon, color: 'from-purple-400 to-blue-500', count: events.filter(e => e.tab_group === 'afterTomorrow').length },
    { key: 'nextWeek', label: 'الأسبوع القادم', icon: CalendarDays, color: 'from-green-400 to-teal-500', count: events.filter(e => e.tab_group === 'nextWeek').length }
  ];

  const eventTypes = [
    { key: 'all', label: 'جميع الفعاليات', icon: Calendar },
    { key: 'business', label: 'أعمال', icon: Building },
    { key: 'cultural', label: 'ثقافية', icon: Camera },
    { key: 'educational', label: 'تعليمية', icon: GraduationCap },
    { key: 'social', label: 'اجتماعية', icon: Users }
  ];

  // Categorize events by type based on title keywords
  const categorizeEvent = (event) => {
    const title = (event.title_ar || '').toLowerCase();
    if (title.includes('أعمال') || title.includes('استثمار') || title.includes('تجار')) return 'business';
    if (title.includes('ثقاف') || title.includes('معرض') || title.includes('شعر') || title.includes('حرف')) return 'cultural';
    if (title.includes('تعليم') || title.includes('طلاب') || title.includes('دورة') || title.includes('لغة')) return 'educational';
    if (title.includes('لقاء') || title.includes('جالية') || title.includes('طعام')) return 'social';
    return 'business'; // default
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesTab = activeTab === 'all' || event.tab_group === activeTab;
    const matchesType = filterType === 'all' || categorizeEvent(event) === filterType;
    const eventTitle = language === 'ar' ? event.title_ar : event.title_en;
    const eventDesc = language === 'ar' ? event.description_ar : event.description_en;
    const eventLoc = language === 'ar' ? event.location_ar : event.location_en;
    const matchesSearch = !searchQuery ||
      (eventTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eventDesc || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (eventLoc || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesType && matchesSearch;
  });

  const handleParticipationRequest = (eventId) => {
    navigate(`/events/${eventId}/register`);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleShare = async (event) => {
    const eventTitle = language === 'ar' ? event.title_ar : event.title_en;
    const eventDesc = language === 'ar' ? event.short_description_ar || event.description_ar : event.short_description_en || event.description_en;
    const eventDate = new Date(event.event_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US');
    const shareData = {
      title: eventTitle,
      text: `${eventDesc} - ${eventDate}${event.event_time ? ' في ' + event.event_time : ''}`,
      url: window.location.origin + '/events/' + event.id
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(`${eventTitle} - ${shareData.url}`);
      alert('تم نسخ رابط الفعالية');
    }
  };

  const getEventTypeIcon = (event) => {
    const type = categorizeEvent(event);
    switch (type) {
      case 'business': return Building;
      case 'cultural': return Camera;
      case 'educational': return GraduationCap;
      case 'social': return Users;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (event) => {
    const type = categorizeEvent(event);
    switch (type) {
      case 'business': return 'bg-blue-500';
      case 'cultural': return 'bg-purple-500';
      case 'educational': return 'bg-green-500';
      case 'social': return 'bg-pink-500';
      default: return 'bg-[#276073]';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#276073] via-[#1e4a5a] to-[#276073] text-white py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
            <defs>
              <pattern id="events-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#events-grid)" />
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
                <Calendar className="w-6 h-6 text-[#87ceeb]" />
                <span className="text-lg font-semibold">فعاليات وأنشطة متنوعة</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              الفعاليات والأنشطة
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed"
            >
              شارك في فعالياتنا المتنوعة وكن جزءاً من المجتمع السوداني النشط
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-3xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{events.length}</div>
                <div className="text-sm opacity-80">فعالية قادمة</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{events.filter(e => categorizeEvent(e) === 'cultural').length}</div>
                <div className="text-sm opacity-80">فعالية ثقافية</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{events.filter(e => categorizeEvent(e) === 'business').length}</div>
                <div className="text-sm opacity-80">فعالية أعمال</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-2xl font-bold mb-1">{events.filter(e => categorizeEvent(e) === 'educational').length}</div>
                <div className="text-sm opacity-80">فعالية تعليمية</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            {/* Time Tabs */}
            <div className="flex justify-center">
              <div className="bg-gray-50 p-2 rounded-2xl shadow-lg border border-gray-200 inline-flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse relative ${
                      activeTab === tab.key
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                        : 'text-gray-600 hover:text-white hover:bg-gradient-to-r hover:from-gray-400 hover:to-gray-500 bg-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    <tab.icon className={`w-5 h-5 ${
                      activeTab === tab.key ? 'animate-pulse' : ''
                    }`} />
                    <span>{tab.label}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activeTab === tab.key 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Type Filter */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="relative">
                <Search className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="ابحث في الفعاليات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 w-80"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
              >
                {eventTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              عرض {filteredEvents.length} فعالية
              {searchQuery && ` • البحث عن: "${searchQuery}"`}
              {filterType !== 'all' && ` • النوع: ${eventTypes.find(t => t.key === filterType)?.label}`}
            </p>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {filteredEvents.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event, index) => {
                const EventTypeIcon = getEventTypeIcon(event);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Event Image */}
                    <div className="relative h-48 overflow-hidden">
                      {event.featured_image ? (
                        <img
                          src={event.featured_image}
                          alt={language === 'ar' ? event.title_ar : event.title_en}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#276073] to-[#1e4a5a] flex items-center justify-center">
                          <Calendar className="w-16 h-16 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Event Type Badge */}
                      <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
                        <div className={`${getEventTypeColor(event)} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg flex items-center space-x-1 rtl:space-x-reverse`}>
                          <EventTypeIcon className="w-4 h-4" />
                          <span>{eventTypes.find(t => t.key === categorizeEvent(event))?.label}</span>
                        </div>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 rtl:left-auto rtl:right-4 bg-[#276073] text-white px-3 py-1 rounded-lg text-sm font-semibold">
                        {new Date(event.event_date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-[#276073]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Event Meta */}
                      <div className="flex items-center justify-between mb-4">
                        {event.event_time && (
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073]">
                            <Clock className="w-4 h-4" />
                            <span className="font-semibold text-sm">{event.event_time}</span>
                          </div>
                        )}
                        {event.is_featured && (
                          <div className="flex items-center space-x-1 rtl:space-x-reverse">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">مميزة</span>
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#276073] transition-colors duration-300 line-clamp-2">
                        {language === 'ar' ? event.title_ar : event.title_en}
                      </h3>

                      {(event.location_ar || event.location_en) && (
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-600 mb-4">
                          <MapPin className="w-4 h-4 text-[#276073]" />
                          <span className="text-sm line-clamp-1">{language === 'ar' ? event.location_ar : event.location_en}</span>
                        </div>
                      )}

                      <p className="text-gray-600 mb-6 leading-relaxed text-sm line-clamp-3">
                        {language === 'ar' ? (event.short_description_ar || event.description_ar) : (event.short_description_en || event.description_en)}
                      </p>
                      
                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleParticipationRequest(event.id);
                          }}
                          className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 rtl:space-x-reverse text-sm"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>طلب المشاركة</span>
                        </button>
                        
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(event);
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
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                لا توجد فعاليات
              </h3>
              <p className="text-gray-600 mb-6">
                لم يتم العثور على فعاليات تطابق البحث أو الفترة المختارة
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveTab('today');
                  setFilterType('all');
                }}
                className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                إعادة تعيين البحث
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              الفعاليات المميزة
            </h2>
            <p className="text-xl text-gray-300">
              أبرز الفعاليات والأنشطة القادمة
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {events.filter(e => e.is_featured).slice(0, 2).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/20 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="relative h-64">
                  {event.featured_image ? (
                    <img
                      src={event.featured_image}
                      alt={language === 'ar' ? event.title_ar : event.title_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#276073] to-[#1e4a5a] flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                      <div className={`${getEventTypeColor(event)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                        {eventTypes.find(t => t.key === categorizeEvent(event))?.label}
                      </div>
                      {event.event_time && (
                        <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                          {event.event_time}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {language === 'ar' ? event.title_ar : event.title_en}
                    </h3>
                    <p className="text-white/80 text-sm line-clamp-2">
                      {language === 'ar' ? (event.short_description_ar || event.description_ar) : (event.short_description_en || event.description_en)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              لا تفوت فعالياتنا القادمة
            </h2>
            <p className="text-xl text-white/90 mb-8">
              اشترك في قائمتنا البريدية لتصلك دعوات الفعاليات والأنشطة
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white/50 outline-none text-gray-900"
              />
              <button className="bg-white text-[#276073] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse">
                <Mail className="w-4 h-4" />
                <span>اشترك</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Detail Modal */}
      <AnimatePresence>
        {selectedEvent && !isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative h-64">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title[language]}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse mb-3">
                    <div className={`${getEventTypeColor(selectedEvent)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                      {eventTypes.find(t => t.key === categorizeEvent(selectedEvent))?.label}
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                      {selectedEvent.time}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {selectedEvent.title[language]}
                  </h2>
                  <div className="flex items-center space-x-4 rtl:space-x-reverse text-white/80 text-sm">
                    <span>{selectedEvent.date}</span>
                    <span>•</span>
                    <span>{selectedEvent.place[language]}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="space-y-6">
                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-[#276073]" />
                      <div>
                        <p className="text-sm text-gray-600">التاريخ</p>
                        <p className="font-semibold">{selectedEvent.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg">
                      <Clock className="w-6 h-6 text-[#276073]" />
                      <div>
                        <p className="text-sm text-gray-600">الوقت</p>
                        <p className="font-semibold">{selectedEvent.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-[#276073] mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">المكان</p>
                      <p className="font-semibold">{selectedEvent.place[language]}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">تفاصيل الفعالية</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedEvent.description[language]}
                    </p>
                  </div>

                  {/* Mock additional details */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">معلومات إضافية:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• الدخول مجاني لجميع أفراد الجالية السودانية</li>
                      <li>• يُنصح بالحضور قبل 15 دقيقة من بداية الفعالية</li>
                      <li>• سيتم تقديم ضيافة خفيفة</li>
                      <li>• للاستفسارات: +966 50 123 4567</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                      className="flex-1 bg-[#276073] hover:bg-[#1e4a5a] text-white py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>طلب المشاركة</span>
                    </button>
                    
                    <button
                      onClick={() => handleShare(selectedEvent)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>مشاركة</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default EventsPage;