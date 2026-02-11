import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Scale, Gavel, FileText, Send } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import DynamicForm from '../../../components/DynamicForm';
import { courtsConfig } from './config';

const CourtsForm = () => {
  const { language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const breadcrumbs = [
    { label: 'الرئيسية', href: '/' },
    { label: 'الخدمات', href: '/services' },
    { label: 'التوكيلات', href: '/services' },
    { label: 'محاكم وقضايا ودعاوي', href: '/services/poa/courts' }
  ];

  const handleBack = () => {
    navigate('/services');
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    
    setTimeout(() => {
      const referenceNumber = `CRT-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      console.log('Courts POA Application:', { ...formData, referenceNumber });
      setIsSubmitting(false);
      
      navigate('/success', { 
        state: { 
          referenceNumber, 
          serviceTitle: courtsConfig.title 
        } 
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <Header />

      {/* Service Title Banner */}
      <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white py-6 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* زر العودة - يسار */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200 text-sm"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span>العودة</span>
            </button>

            {/* اسم الخدمة - منتصف */}
            <div className="flex-1 text-center px-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{courtsConfig.title}</h1>
            </div>

            {/* مساحة فارغة للتوازن - يمين */}
            <div className="w-24 sm:w-32"></div>
          </div>

          {/* النص التوضيحي */}
          <div className="text-center mt-3">
            <p className="text-blue-100 text-sm">
              يرجى ملء جميع الحقول المطلوبة لإكمال طلب الخدمة
            </p>
          </div>
        </div>
      </div>

      <div className="py-8">
        <DynamicForm
          service={courtsConfig}
          onBack={handleBack}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      <Footer />
    </div>
  );
};

export default CourtsForm;