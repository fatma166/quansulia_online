import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, Users, ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const EventRegistration = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    companions_count: 0,
    notes: '',
    agreed: false
  });

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEvent(data);
      } else {
        navigate('/events');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert([
          {
            event_id: eventId,
            full_name: formData.full_name,
            phone: formData.phone,
            email: formData.email,
            companions_count: parseInt(formData.companions_count),
            notes: formData.notes || null,
            status: 'confirmed'
          }
        ]);

      if (error) throw error;

      setIsSubmitted(true);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات الفعالية...</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] mb-8 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            <span>العودة لتفاصيل الفعالية</span>
          </button>

          {isSubmitted ? (
            // Success Message
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-12 shadow-lg border border-gray-100 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                تم إرسال طلب المشاركة بنجاح!
              </h2>

              <p className="text-lg text-gray-600 mb-8">
                شكراً لتسجيلك في الفعالية. سيتم التواصل معك قريباً لتأكيد المشاركة.
              </p>

              <div className="bg-[#276073]/5 border border-[#276073]/20 rounded-lg p-6 mb-8 text-right">
                <h3 className="font-bold text-gray-900 mb-4">تفاصيل التسجيل:</h3>
                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-semibold">{formData.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">البريد الإلكتروني:</span>
                    <span className="font-semibold">{formData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الجوال:</span>
                    <span className="font-semibold">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد المرافقين:</span>
                    <span className="font-semibold">{formData.companions_count}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/events')}
                  className="px-8 py-3 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200"
                >
                  تصفح المزيد من الفعاليات
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
                >
                  العودة للرئيسية
                </button>
              </div>
            </motion.div>
          ) : (
            // Registration Form
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Event Header */}
              <div className="bg-gradient-to-br from-[#276073] to-[#1e4a5a] text-white p-8">
                <h1 className="text-3xl font-bold mb-6">
                  طلب المشاركة في الفعالية
                </h1>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">
                    {language === 'ar' ? event.title_ar : event.title_en}
                  </h2>

                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Calendar className="w-4 h-4 text-[#87ceeb]" />
                      <span>{new Date(event.event_date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Clock className="w-4 h-4 text-[#87ceeb]" />
                      <span>{event.event_time || 'غير محدد'}</span>
                    </div>
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <MapPin className="w-4 h-4 text-[#87ceeb]" />
                      <span>{language === 'ar' ? event.location_ar : event.location_en}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الاسم الكامل <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                      placeholder="أدخل اسمك الكامل"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      رقم الجوال <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                      placeholder="example@email.com"
                      dir="ltr"
                    />
                  </div>

                  {/* Companions Count */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      عدد المرافقين
                    </label>
                    <select
                      value={formData.companions_count}
                      onChange={(e) => setFormData({ ...formData, companions_count: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      يرجى تحديد عدد الأشخاص الذين سيرافقونك
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ملاحظات إضافية
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 resize-none"
                      placeholder="أي ملاحظات أو متطلبات خاصة..."
                    />
                  </div>

                  {/* Agreement */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-3 rtl:space-x-reverse">
                      <input
                        type="checkbox"
                        id="agreement"
                        required
                        checked={formData.agreed}
                        onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                        className="mt-1 w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073] cursor-pointer"
                      />
                      <label htmlFor="agreement" className="text-sm text-gray-700 cursor-pointer">
                        أوافق على الشروط والأحكام والسياسات المعمول بها في القنصلية العامة لجمهورية السودان بجدة،
                        وأتعهد بالالتزام بمواعيد الفعالية وتعليمات المنظمين <span className="text-red-500">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={!formData.agreed || submitting}
                      className="w-full bg-[#276073] hover:bg-[#1e4a5a] disabled:bg-gray-300 text-white py-4 rounded-lg font-bold text-lg transition-colors duration-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>جاري الإرسال...</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-5 h-5" />
                          <span>إرسال طلب المشاركة</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EventRegistration;
