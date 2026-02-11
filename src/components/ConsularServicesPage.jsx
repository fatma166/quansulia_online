import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Search, Filter, Phone, MessageCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import ServicesGrid from './ServicesGrid';
import DynamicForm from './DynamicForm';
import { servicesConfig, getServiceComponent } from '../services';
import { loadDraft, clearDraft } from '../lib/storage';

const ConsularServicesPage = () => {
  const { language, isRTL } = useLanguage();
  const [selectedService, setSelectedService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  useEffect(() => {
    // Check for saved draft on component mount
    const draft = loadDraft();
    if (draft) {
      setShowDraftDialog(true);
    }
  }, []);

  const handleServiceSelect = (service) => {
    // Check if it's a service object (from database) or just an ID (from servicesConfig)
    if (typeof service === 'object' && service.id) {
      // It's a service from the database with a slug
      console.log('Selected database service:', service);

      // إذا كانت خدمة خارجية، افتح الرابط في تاب جديد
      if (service.is_external && service.external_url) {
        window.open(service.external_url, '_blank', 'noopener,noreferrer');
        return;
      }

      // Navigate to the dynamic service page using slug instead of id
      window.location.href = `/services/${service.slug}`;
      return;
    }

    // Handle legacy services from servicesConfig
    const legacyService = servicesConfig[service];
    if (legacyService) {
      console.log('Selected legacy service:', legacyService);
      setSelectedService(legacyService);
      setShowForm(true);

      // Smooth scroll to form
      setTimeout(() => {
        const formElement = document.getElementById('dynamic-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleServiceSelectWithSubcategory = (service, subcategory) => {
    // Check if it's a service object from database or an ID from servicesConfig
    if (typeof service === 'object' && service.id) {
      // It's a database service
      console.log('Selected database service with subcategory:', service, subcategory);

      // إذا كانت خدمة خارجية، افتح الرابط في تاب جديد
      if (service.is_external && service.external_url) {
        window.open(service.external_url, '_blank', 'noopener,noreferrer');
        return;
      }

      if (subcategory && subcategory.id) {
        // Navigate to dynamic service page with subcategory using slug instead of id
        window.location.href = `/services/${service.slug}?type=${subcategory.id}`;
      } else {
        // Navigate to dynamic service page without subcategory using slug instead of id
        window.location.href = `/services/${service.slug}`;
      }
      return;
    }

    // Handle legacy services from servicesConfig
    const serviceId = typeof service === 'string' ? service : service.id;
    const legacyService = servicesConfig[serviceId];
    const ServiceComponent = getServiceComponent(serviceId);

    if (legacyService && subcategory) {
      console.log('Selected legacy service with subcategory:', legacyService, subcategory);

      // Use the service component directly
      if (ServiceComponent) {
        // Navigate to the service component
        window.location.href = `/services/${serviceId}`;
        return;
      }

      setSelectedService(legacyService);
      setShowForm(true);

      // Smooth scroll to form
      setTimeout(() => {
        const formElement = document.getElementById('dynamic-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else if (legacyService && !subcategory) {
      // Handle direct service selection without subcategory
      console.log('Direct legacy service selection:', legacyService);

      if (ServiceComponent) {
        window.location.href = `/services/${serviceId}`;
        return;
      }

      setSelectedService(legacyService);
      setShowForm(true);

      // Smooth scroll to form
      setTimeout(() => {
        const formElement = document.getElementById('dynamic-form');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleBackToServices = () => {
    setShowForm(false);
    setSelectedService(null);
    
    // Smooth scroll back to services
    setTimeout(() => {
      const servicesElement = document.getElementById('services-grid');
      if (servicesElement) {
        servicesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      const service = servicesConfig[draft.serviceId];
      if (service) {
        setSelectedService(service);
        setShowForm(true);
        setShowDraftDialog(false);
      }
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  const breadcrumbs = [
    { label: 'الرئيسية', href: '/' },
    { label: 'المعاملات القنصلية', href: '/services' },
    ...(selectedService ? [{ label: selectedService.title, href: '#' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white py-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && (
                    <ArrowLeft className="w-4 h-4 mx-2 rtl:rotate-180 text-white/60" />
                  )}
                  <a
                    href={crumb.href}
                    className={`hover:text-[#87ceeb] transition-colors duration-200 ${
                      index === breadcrumbs.length - 1 ? 'text-[#87ceeb] font-semibold' : 'text-white/80'
                    }`}
                  >
                    {crumb.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Page Title */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {selectedService ? selectedService.title : 'المعاملات القنصلية'}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/90 max-w-3xl mx-auto"
            >
              {selectedService 
                ? selectedService.description
                : 'نقدم مجموعة شاملة من الخدمات القنصلية المتخصصة لخدمة المواطنين والمقيمين'
              }
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="services-grid"
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 50 : -50 }}
              transition={{ duration: 0.3 }}
            >
              <ServicesGrid
                onServiceSelect={handleServiceSelectWithSubcategory}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dynamic-form"
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? -50 : 50 }}
              transition={{ duration: 0.3 }}
              id="dynamic-form"
            >
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={handleBackToServices}
                  className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200 font-semibold"
                >
                  <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                  <span>العودة إلى الخدمات</span>
                </button>
              </div>

              <DynamicForm
                service={selectedService}
                onBack={handleBackToServices}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WhatsApp Help Button */}
      <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50">
        <a
          href="https://wa.me/966501234567?text=مرحباً، أحتاج مساعدة في الخدمات القنصلية"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="hidden md:inline font-semibold">مساعدة واتساب</span>
        </a>
      </div>

      {/* Draft Dialog */}
      <AnimatePresence>
        {showDraftDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                مسودة محفوظة
              </h3>
              <p className="text-gray-600 mb-6">
                لديك مسودة محفوظة من طلب سابق. هل تريد متابعة العمل عليها؟
              </p>
              <div className="flex space-x-4 rtl:space-x-reverse">
                <button
                  onClick={handleLoadDraft}
                  className="flex-1 bg-[#276073] hover:bg-[#1e4a5a] text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  متابعة المسودة
                </button>
                <button
                  onClick={handleDiscardDraft}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  بدء جديد
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsularServicesPage;