import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle, Facebook, Twitter, Instagram, ChevronRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { supabase } from '../lib/supabase';

const Footer: React.FC = () => {
  const { t, language } = useLanguage();
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [socialLinks, setSocialLinks] = useState<any[]>([]);
  const [contactInfo, setContactInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dynamic content from database
  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      // Load social links
      const { data: social } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (social) setSocialLinks(social);

      // Load contact info
      const { data: contact } = await supabase
        .from('contact_info')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (contact) setContactInfo(contact);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save message to database
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: contactForm.name,
          phone: contactForm.phone,
          email: '', // Empty email as it's not collected in this form
          subject: 'رسالة من الموقع', // Default subject
          message: contactForm.message,
          service_type: 'other', // General service type
          urgency: 'normal', // Normal urgency
          status: 'new' // New status
        });

      if (error) {
        console.error('Error saving message:', error);
        setSubmitStatus('error');
      } else {
        setSubmitStatus('success');
        setContactForm({ name: '', phone: '', message: '' });
      }

      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  const quickLinks = [
    { key: 'services', href: '/services' },
    { key: 'news', href: '/news' },
    { key: 'events', href: '/events' },
    { key: 'about_sudan', href: '/about-sudan' },
    { key: 'contact', href: '/contact' }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Facebook,
      Twitter,
      Instagram,
      MessageCircle,
      Phone,
      Mail,
      MapPin,
      Clock
    };
    return icons[iconName] || MessageCircle;
  };

  const getIconColor = (platform: string) => {
    const colors: Record<string, string> = {
      facebook: 'hover:text-blue-600',
      twitter: 'hover:text-sky-500',
      instagram: 'hover:text-pink-600',
      telegram: 'hover:text-blue-400',
      whatsapp: 'hover:text-green-500',
      youtube: 'hover:text-red-600'
    };
    return colors[platform] || 'hover:text-gray-400';
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* About Consulate */}
          <div className="lg:col-span-1" data-aos="fade-up">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="w-10 h-10 bg-[#276073] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-base">SD</span>
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {language === 'ar' ? 'القنصلية السودانية' : 'Sudanese Consulate'}
                </h3>
                <p className="text-gray-400 text-xs">
                  {language === 'ar' ? 'جدة' : 'Jeddah'}
                </p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4 text-sm">
              {language === 'ar' 
                ? 'نسعد بخدمة الجالية السودانية وتقديم كافة الخدمات القنصلية والاستثمارية والتعليمية بأعلى معايير الجودة والكفاءة.'
                : 'We are pleased to serve the Sudanese community and provide all consular, investment, and educational services with the highest standards of quality and efficiency.'
              }
            </p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              {loading ? (
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-800 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                socialLinks.map((social, index) => {
                  const IconComponent = getIconComponent(social.icon);
                  return (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 ${getIconColor(social.platform)} transition-colors duration-300 p-2 rounded-lg hover:bg-gray-800`}
                      title={language === 'ar' ? social.label_ar : social.label_en}
                    >
                      <IconComponent className="w-5 h-5" />
                    </a>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="100">
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-[#87ceeb] transition-colors duration-300 flex items-center space-x-2 rtl:space-x-reverse group text-sm"
                  >
                    <span>{t(`nav.${link.key}`)}</span>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-all duration-300 rtl:rotate-180" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="200">
            <h3 className="text-lg font-bold mb-4">{t('footer.contact')}</h3>
            <div className="space-y-3">
              {loading ? (
                <>
                  <div className="h-12 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
                </>
              ) : contactInfo.length > 0 ? (
                contactInfo.map((info, index) => {
                  const IconComponent = getIconComponent(info.icon);
                  return (
                    <div key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                      <IconComponent className="w-4 h-4 text-[#276073] mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-300 text-sm whitespace-pre-line">{info.value}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <MapPin className="w-4 h-4 text-[#276073] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">شارع الأمير سلطان، حي الروضة</p>
                      <p className="text-gray-300 text-sm">جدة 21442، المملكة العربية السعودية</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Phone className="w-4 h-4 text-[#276073] flex-shrink-0" />
                    <p className="text-gray-300 text-sm">+966 12 123 4567</p>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Mail className="w-4 h-4 text-[#276073] flex-shrink-0" />
                    <p className="text-gray-300 text-sm">info@sudanconsulate-jeddah.gov.sd</p>
                  </div>
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <Clock className="w-4 h-4 text-[#276073] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-300 text-sm">الأحد - الخميس</p>
                      <p className="text-gray-300 text-sm">8:00 ص - 2:00 م</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-1" data-aos="fade-up" data-aos-delay="300">
            <h3 className="text-lg font-bold mb-4">إرسال رسالة</h3>
            
            {submitStatus === 'success' ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-400 font-semibold text-sm">تم إرسال الرسالة بنجاح</p>
                <p className="text-gray-300 text-xs mt-1">سيتم الرد عليكم في أقرب وقت</p>
              </div>
            ) : submitStatus === 'error' ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-400 font-semibold text-sm">حدث خطأ في الإرسال</p>
                <p className="text-gray-300 text-xs mt-1">يرجى المحاولة مرة أخرى</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 text-white placeholder-gray-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="رقم الهاتف"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 text-white placeholder-gray-400 text-sm"
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="نص الرسالة"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 text-white placeholder-gray-400 resize-none text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#276073] hover:bg-[#1e4a5a] text-white py-2 rounded-lg font-semibold transition-colors duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>إرسال الرسالة</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="text-center space-y-2">
            <p className="text-gray-400 text-sm">
              © 2025 {t('footer.rights')}
            </p>
            <p className="text-gray-500 text-xs">
              تم التصميم والبرمجة بواسطة{' '}
              <a
                href="https://scientific-thought.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#87ceeb] hover:text-[#276073] transition-colors duration-300 font-semibold"
              >
                شركة الفكر العلمي
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;