import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Calendar,
  Globe,
  Navigation,
  Users,
  Building,
  Car,
  Plane
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../lib/supabase';

const ContactUs = () => {
  const { language, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    serviceType: '',
    urgency: 'normal'
  });
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, loading, success, error
  const [errors, setErrors] = useState({});

  const contactInfo = [
    {
      icon: MapPin,
      title: 'العنوان',
      details: [
        'شارع الأمير سلطان، حي الروضة',
        'جدة 21442، المملكة العربية السعودية'
      ],
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Phone,
      title: 'الهاتف',
      details: [
        '+966 12 123 4567',
        '+966 12 123 4568 (فاكس)'
      ],
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      details: [
        'info@sudanconsulate-jeddah.gov.sd',
        'services@sudanconsulate-jeddah.gov.sd'
      ],
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'ساعات العمل',
      details: [
        'الأحد - الخميس: 8:00 ص - 2:00 م',
        'الجمعة والسبت: مغلق'
      ],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  const serviceTypes = [
    { value: 'passport', label: 'جوازات السفر' },
    { value: 'visa', label: 'التأشيرات' },
    { value: 'attestation', label: 'التصديقات' },
    { value: 'civil', label: 'الأحوال المدنية' },
    { value: 'legal', label: 'الخدمات القانونية' },
    { value: 'investment', label: 'الاستثمار' },
    { value: 'tourism', label: 'السياحة' },
    { value: 'other', label: 'أخرى' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'عادي', color: 'text-green-600' },
    { value: 'normal', label: 'متوسط', color: 'text-yellow-600' },
    { value: 'high', label: 'عاجل', color: 'text-red-600' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(05|5)\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'الموضوع مطلوب';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'الرسالة مطلوبة';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'الرسالة قصيرة جداً (10 أحرف على الأقل)';
    }

    if (!formData.serviceType) {
      newErrors.serviceType = 'نوع الخدمة مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitStatus('loading');

    try {
      // حفظ الرسالة في قاعدة البيانات
      const { data, error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          service_type: formData.serviceType,
          urgency: formData.urgency,
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Contact message saved:', data);
      setSubmitStatus('success');

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          serviceType: '',
          urgency: 'normal'
        });
        setSubmitStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving contact message:', error);
      setSubmitStatus('error');

      // Reset error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
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
              <pattern id="contact-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#contact-grid)" />
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
                <MessageCircle className="w-6 h-6 text-[#87ceeb]" />
                <span className="text-lg font-semibold">نحن هنا لخدمتكم</span>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              تواصل معنا
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-white/90 leading-relaxed"
            >
              فريقنا المتخصص جاهز لمساعدتكم في جميع الخدمات القنصلية
              <br />
              تواصلوا معنا بأي طريقة تناسبكم
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${info.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <info.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {info.title}
                </h3>
                
                <div className="space-y-2">
                  {info.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-gray-600 leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-50 rounded-3xl p-8 shadow-lg border border-gray-100"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  أرسل لنا رسالة
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                </p>
              </div>

              {submitStatus === 'success' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    تم إرسال الرسالة بنجاح!
                  </h3>
                  <p className="text-green-600">
                    شكراً لتواصلكم معنا. سنرد عليكم خلال 24 ساعة.
                  </p>
                </motion.div>
              ) : submitStatus === 'error' ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-12"
                >
                  <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-red-800 mb-4">
                    حدث خطأ في الإرسال
                  </h3>
                  <p className="text-red-600 mb-6">
                    نعتذر، حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.
                  </p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    حاول مرة أخرى
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                          errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="أدخل اسمك الكامل"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="example@email.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone and Service Type */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                          errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="05xxxxxxxx"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الخدمة *
                      </label>
                      <select
                        value={formData.serviceType}
                        onChange={(e) => handleInputChange('serviceType', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                          errors.serviceType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">اختر نوع الخدمة</option>
                        {serviceTypes.map((service) => (
                          <option key={service.value} value={service.value}>
                            {service.label}
                          </option>
                        ))}
                      </select>
                      {errors.serviceType && (
                        <p className="mt-1 text-sm text-red-600">{errors.serviceType}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموضوع *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                        errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="موضوع الرسالة"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Urgency Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      مستوى الأولوية
                    </label>
                    <div className="flex space-x-4 rtl:space-x-reverse">
                      {urgencyLevels.map((level) => (
                        <label key={level.value} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="urgency"
                            value={level.value}
                            checked={formData.urgency === level.value}
                            onChange={(e) => handleInputChange('urgency', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 border-2 rounded-full mr-2 rtl:mr-0 rtl:ml-2 ${
                            formData.urgency === level.value
                              ? 'border-[#276073] bg-[#276073]'
                              : 'border-gray-300'
                          }`}>
                            {formData.urgency === level.value && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${level.color}`}>
                            {level.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرسالة *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 resize-none ${
                        errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="اكتب رسالتك هنا..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {formData.message.length}/500 حرف
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="w-full bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
                  >
                    {submitStatus === 'loading' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>جاري الإرسال...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>إرسال الرسالة</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Map and Additional Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              {/* Map */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  موقعنا على الخريطة
                </h3>
                
                {/* Mock Map */}
                <div className="relative h-80 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-[#276073] mx-auto mb-4" />
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        القنصلية السودانية
                      </h4>
                      <p className="text-gray-600">
                        حي الروضة، جدة
                      </p>
                      <button className="mt-4 bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse mx-auto">
                        <Navigation className="w-4 h-4" />
                        <span>فتح في الخرائط</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  طرق التواصل السريع
                </h3>
                
                <div className="space-y-4">
                  <a
                    href="tel:+966121234567"
                    className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">اتصل بنا</h4>
                      <p className="text-gray-600">+966 12 123 4567</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/966501234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">واتساب</h4>
                      <p className="text-gray-600">تواصل فوري</p>
                    </div>
                  </a>

                  <a
                    href="mailto:info@sudanconsulate-jeddah.gov.sd"
                    className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors duration-200 group"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">البريد الإلكتروني</h4>
                      <p className="text-gray-600">info@sudanconsulate-jeddah.gov.sd</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Visit Information */}
              <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white rounded-3xl p-8">
                <h3 className="text-2xl font-bold mb-6">
                  معلومات الزيارة
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Car className="w-6 h-6 text-[#87ceeb] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">مواقف السيارات</h4>
                      <p className="text-white/80 text-sm">متوفرة مواقف مجانية أمام المبنى</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Users className="w-6 h-6 text-[#87ceeb] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">إمكانية الوصول</h4>
                      <p className="text-white/80 text-sm">المبنى مجهز لذوي الاحتياجات الخاصة</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <Plane className="w-6 h-6 text-[#87ceeb] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">القرب من المطار</h4>
                      <p className="text-white/80 text-sm">15 دقيقة من مطار الملك عبدالعزيز</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactUs;