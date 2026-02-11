import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2, Bookmark, Eye, UserPlus, Phone, Mail, MessageCircle, Star, Heart, Download, Printer as Print, ChevronRight, Building, Camera, GraduationCap, CheckCircle, AlertCircle, Info, Gift, Car, Utensils, Music, Mic, Award } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [attendees, setAttendees] = useState(0);
  const [hasRegistered, setHasRegistered] = useState(false);

  // Categorize events by type based on title keywords
  const categorizeEvent = (event) => {
    const title = (event.title_ar || '').toLowerCase();
    if (title.includes('أعمال') || title.includes('استثمار') || title.includes('تجار')) return 'business';
    if (title.includes('ثقاف') || title.includes('معرض') || title.includes('شعر') || title.includes('حرف')) return 'cultural';
    if (title.includes('تعليم') || title.includes('طلاب') || title.includes('دورة') || title.includes('لغة')) return 'educational';
    if (title.includes('لقاء') || title.includes('جالية') || title.includes('طعام')) return 'social';
    return 'business';
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

  const getEventTypeLabel = (event) => {
    const type = categorizeEvent(event);
    switch (type) {
      case 'business': return 'أعمال';
      case 'cultural': return 'ثقافية';
      case 'educational': return 'تعليمية';
      case 'social': return 'اجتماعية';
      default: return 'عامة';
    }
  };

  useEffect(() => {
    loadEventDetail();
  }, [eventId, navigate]);

  const loadEventDetail = async () => {
    try {
      // Fetch the event
      const { data: eventItem, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (eventError) throw eventError;

      if (eventItem) {
        setEvent(eventItem);
        // Simulate attendees count
        setAttendees(Math.floor(Math.random() * 100) + 20);

        // Find related events (same type, excluding current)
        const eventType = categorizeEvent(eventItem);
        const { data: relatedData, error: relatedError } = await supabase
          .from('events')
          .select('*')
          .eq('is_active', true)
          .neq('id', eventId)
          .limit(3);

        if (relatedError) throw relatedError;
        setRelatedEvents(relatedData || []);
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      navigate('/events');
    }
  };

  const handleShare = async () => {
    if (!event) return;

    const shareData = {
      title: language === 'ar' ? event.title_ar : event.title_en,
      text: `${language === 'ar' ? event.description_ar : event.description_en} - ${event.event_date} في ${event.event_time}`,
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
      alert('تم نسخ رابط الفعالية');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleRegistration = () => {
    navigate(`/events/${eventId}/register`);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الفعالية...</p>
        </div>
      </div>
    );
  }

  const EventTypeIcon = getEventTypeIcon(event);

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={event.featured_image || '/placeholder-event.jpg'}
          alt={language === 'ar' ? event.title_ar : event.title_en}
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
            <button onClick={() => navigate('/events')} className="hover:text-white transition-colors duration-200">
              الفعاليات
            </button>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
            <span className="text-[#87ceeb] font-semibold">تفاصيل الفعالية</span>
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
              {/* Event Type Badge */}
              <div className="mb-4">
                <span className={`${getEventTypeColor(event)} text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg inline-flex items-center space-x-2 rtl:space-x-reverse`}>
                  <EventTypeIcon className="w-4 h-4" />
                  <span>{getEventTypeLabel(event)}</span>
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {language === 'ar' ? event.title_ar : event.title_en}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-white/80">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Calendar className="w-5 h-5 text-[#87ceeb]" />
                  <span className="font-semibold">{new Date(event.event_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Clock className="w-5 h-5 text-[#87ceeb]" />
                  <span className="font-semibold">{event.event_time || 'غير محدد'}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <MapPin className="w-5 h-5 text-[#87ceeb]" />
                  <span className="font-semibold">{language === 'ar' ? event.location_ar : event.location_en}</span>
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Users className="w-5 h-5 text-[#87ceeb]" />
                  <span className="font-semibold">{attendees} مشارك</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Event Details */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
                >
                  {/* Event Description */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      تفاصيل الفعالية
                    </h2>
                    <div
                      className="text-lg text-gray-700 leading-relaxed ql-editor"
                      dir={isRTL ? 'rtl' : 'ltr'}
                      dangerouslySetInnerHTML={{
                        __html: language === 'ar' ? event.description_ar : event.description_en
                      }}
                    />
                  </div>

                  {/* Extended Description */}
                  <div className="prose prose-lg max-w-none" dir="rtl">
                    <div className="space-y-6 text-gray-700">
                      <p>
                        تنظم القنصلية العامة لجمهورية السودان بجدة هذه الفعالية المميزة في إطار برنامجها الثقافي 
                        والاجتماعي الهادف إلى تعزيز التواصل مع الجالية السودانية وتقديم خدمات متنوعة تلبي احتياجاتهم.
                      </p>
                      
                      <div className="bg-[#276073]/5 border-r-4 rtl:border-r-0 rtl:border-l-4 border-[#276073] p-6 rounded-lg">
                        <h3 className="text-lg font-bold text-[#276073] mb-3">أهداف الفعالية:</h3>
                        <ul className="space-y-2 text-gray-700">
                          <li className="flex items-start space-x-2 rtl:space-x-reverse">
                            <Star className="w-4 h-4 text-[#276073] mt-1 flex-shrink-0" />
                            <span>تعزيز التواصل بين أفراد الجالية السودانية</span>
                          </li>
                          <li className="flex items-start space-x-2 rtl:space-x-reverse">
                            <Star className="w-4 h-4 text-[#276073] mt-1 flex-shrink-0" />
                            <span>تقديم معلومات مفيدة وخدمات متخصصة</span>
                          </li>
                          <li className="flex items-start space-x-2 rtl:space-x-reverse">
                            <Star className="w-4 h-4 text-[#276073] mt-1 flex-shrink-0" />
                            <span>تعزيز الهوية الثقافية السودانية</span>
                          </li>
                        </ul>
                      </div>

                      <p>
                        ندعو جميع أفراد الجالية السودانية للمشاركة في هذه الفعالية المهمة والاستفادة من 
                        البرامج والأنشطة المتنوعة التي ستقدم خلالها.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Event Program */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="w-6 h-6 text-[#276073]" />
                    <span>برنامج الفعالية</span>
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Mock program schedule */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg border-r-4 rtl:border-r-0 rtl:border-l-4 border-[#276073]">
                      <div className="w-16 h-16 bg-[#276073] text-white rounded-lg flex items-center justify-center font-bold">
                        9:00
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">الاستقبال والتسجيل</h3>
                        <p className="text-gray-600 text-sm">ترحيب بالضيوف وتسجيل الحضور</p>
                      </div>
                      <Users className="w-6 h-6 text-[#276073]" />
                    </div>

                    <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg border-r-4 rtl:border-r-0 rtl:border-l-4 border-green-500">
                      <div className="w-16 h-16 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold">
                        9:30
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">كلمة افتتاحية</h3>
                        <p className="text-gray-600 text-sm">كلمة ترحيبية من القنصل العام</p>
                      </div>
                      <Mic className="w-6 h-6 text-green-500" />
                    </div>

                    <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg border-r-4 rtl:border-r-0 rtl:border-l-4 border-blue-500">
                      <div className="w-16 h-16 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
                        10:00
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">الفعالية الرئيسية</h3>
                        <p className="text-gray-600 text-sm">المحتوى الأساسي للفعالية</p>
                      </div>
                      <Award className="w-6 h-6 text-blue-500" />
                    </div>

                    <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg border-r-4 rtl:border-r-0 rtl:border-l-4 border-orange-500">
                      <div className="w-16 h-16 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold">
                        11:30
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">استراحة وضيافة</h3>
                        <p className="text-gray-600 text-sm">قهوة وحلويات سودانية تقليدية</p>
                      </div>
                      <Utensils className="w-6 h-6 text-orange-500" />
                    </div>

                    <div className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gray-50 rounded-lg border-r-4 rtl:border-r-0 rtl:border-l-4 border-purple-500">
                      <div className="w-16 h-16 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold">
                        12:00
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">جلسة أسئلة وأجوبة</h3>
                        <p className="text-gray-600 text-sm">فرصة للتفاعل والاستفسارات</p>
                      </div>
                      <MessageCircle className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                </motion.div>

                {/* Event Requirements */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2 rtl:space-x-reverse">
                    <Info className="w-6 h-6 text-[#276073]" />
                    <span>معلومات مهمة</span>
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Requirements */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        متطلبات الحضور:
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2 rtl:space-x-reverse">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">التسجيل المسبق مطلوب</span>
                        </li>
                        <li className="flex items-start space-x-2 rtl:space-x-reverse">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">إحضار هوية شخصية</span>
                        </li>
                        <li className="flex items-start space-x-2 rtl:space-x-reverse">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">الحضور قبل 15 دقيقة</span>
                        </li>
                      </ul>
                    </div>

                    {/* What's Included */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        ما يشمله الحضور:
                      </h3>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2 rtl:space-x-reverse">
                          <Gift className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">ضيافة مجانية</span>
                        </li>
                        <li className="flex items-start space-x-2 rtl:space-x-reverse">
                          <Gift className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">مواد تعليمية</span>
                        </li>
                        <li className="flex items-start space-x-2 rtl:space-x-reverse">
                          <Gift className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                          <span className="text-gray-700">شهادة حضور</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <AlertCircle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-2">ملاحظات مهمة:</h4>
                        <ul className="text-amber-700 text-sm space-y-1">
                          <li>• الدخول مجاني لجميع أفراد الجالية السودانية</li>
                          <li>• يُنصح بالحضور مبكراً لضمان الحصول على مقعد</li>
                          <li>• سيتم توفير ترجمة فورية عند الحاجة</li>
                          <li>• للاستفسارات: +966 50 123 4567</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-8 sticky top-8">
                  {/* Registration Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-br from-[#276073] to-[#1e4a5a] text-white rounded-2xl p-6 shadow-lg"
                  >
                    <h3 className="text-xl font-bold mb-4">
                      سجل الآن
                    </h3>
                    <p className="text-white/90 mb-6 text-sm">
                      لا تفوت هذه الفرصة المميزة. سجل الآن لضمان مقعدك
                    </p>
                    
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between text-sm">
                        <span>المقاعد المتاحة:</span>
                        <span className="font-bold">85 مقعد</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>المسجلين حالياً:</span>
                        <span className="font-bold">{attendees} شخص</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(attendees / 150) * 100}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleRegistration}
                      className="w-full bg-white text-[#276073] py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>طلب المشاركة</span>
                    </button>
                  </motion.div>

                  {/* Event Details Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      تفاصيل سريعة
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Calendar className="w-5 h-5 text-[#276073]" />
                        <div>
                          <p className="text-sm text-gray-600">التاريخ</p>
                          <p className="font-semibold">{new Date(event.event_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Clock className="w-5 h-5 text-[#276073]" />
                        <div>
                          <p className="text-sm text-gray-600">الوقت</p>
                          <p className="font-semibold">{event.event_time || 'غير محدد'}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 rtl:space-x-reverse">
                        <MapPin className="w-5 h-5 text-[#276073] mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">المكان</p>
                          <p className="font-semibold">{language === 'ar' ? event.location_ar : event.location_en}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <Users className="w-5 h-5 text-[#276073]" />
                        <div>
                          <p className="text-sm text-gray-600">المشاركون</p>
                          <p className="font-semibold">{attendees} مسجل</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Actions */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      إجراءات سريعة
                    </h3>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate('/events')}
                        className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg transition-colors duration-200"
                      >
                        <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                        <span>العودة للفعاليات</span>
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>مشاركة الفعالية</span>
                      </button>
                      
                      <button
                        onClick={handleBookmark}
                        className={`w-full flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg transition-colors duration-200 ${
                          isBookmarked
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                        }`}
                      >
                        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                        <span>{isBookmarked ? 'محفوظة' : 'حفظ'}</span>
                      </button>
                      
                      <button
                        onClick={handlePrint}
                        className="w-full flex items-center space-x-3 rtl:space-x-reverse p-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <Print className="w-5 h-5" />
                        <span>طباعة</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Contact Support */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      تحتاج مساعدة؟
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      فريق الدعم متاح لمساعدتك في أي استفسار
                    </p>
                    <div className="space-y-3">
                      <a
                        href="tel:+966501234567"
                        className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">+966 50 123 4567</span>
                      </a>
                      <a
                        href="mailto:events@consulate.gov.sd"
                        className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">events@consulate.gov.sd</span>
                      </a>
                      <a
                        href="https://wa.me/966501234567"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 rtl:space-x-reverse text-green-600 hover:text-green-700 transition-colors duration-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">واتساب</span>
                      </a>
                    </div>
                  </motion.div>

                  {/* Related Events */}
                  {relatedEvents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        فعاليات مشابهة
                      </h3>
                      <div className="space-y-4">
                        {relatedEvents.map((relatedEvent) => (
                          <div
                            key={relatedEvent.id}
                            onClick={() => navigate(`/events/${relatedEvent.id}`)}
                            className="flex space-x-3 rtl:space-x-reverse cursor-pointer group"
                          >
                            <img
                              src={relatedEvent.image}
                              alt={relatedEvent.title[language]}
                              className="w-16 h-16 object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-[#276073] transition-colors duration-200 line-clamp-2 text-sm">
                                {relatedEvent.title[language]}
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                {relatedEvent.date} - {relatedEvent.time}
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

export default EventDetail;