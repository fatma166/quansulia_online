import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Users, GraduationCap, Award, FileCheck, Heart, Plane, Scale, Grid, ArrowLeft, Briefcase, FileHeart, Loader2 } from 'lucide-react';
import { serviceCategories } from '../services';
import { useServices } from '../hooks/useServiceData';
import ServiceCard from './ServiceCard';

const iconMap = {
  FileText, Users, GraduationCap, Award, FileCheck, Heart, Plane, Scale, Grid, Briefcase, FileHeart,
  FileSignature: FileText
};

const ServicesGrid = ({
  onServiceSelect,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}) => {
  const { services, loading, error } = useServices();
  const [hoveredService, setHoveredService] = useState(null);
  const [selectedServiceWithSubs, setSelectedServiceWithSubs] = useState(null);
  const [showSubcategories, setShowSubcategories] = useState(false);

  const filteredServices = useMemo(() => {
    if (!services.length) return [];

    let filtered = [...services];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [services, searchQuery, selectedCategory]);

  const handleSubcategorySelect = (service) => {
    setSelectedServiceWithSubs(service);
    setShowSubcategories(true);
  };

  const handleSubcategoryChoice = (subcategory) => {
    console.log('[ServicesGrid] Clicked subcategory:', {
      title: subcategory.title,
      id: subcategory.id,
      isServiceType: subcategory.isServiceType,
      slug: subcategory.slug,
      parentSlug: selectedServiceWithSubs.slug
    });

    // Pass both service and subcategory to parent
    if (subcategory && subcategory.route) {
      // If subcategory has a route, navigate to it
      console.log('[ServicesGrid] Navigating to route:', subcategory.route);
      window.location.href = subcategory.route;
    } else if (subcategory && subcategory.isServiceType) {
      // إذا كانت من service_types، استخدم الرابط مع type parameter
      const url = `/services/${selectedServiceWithSubs.slug}?type=${subcategory.id}`;
      console.log('[ServicesGrid] Navigating to service_type:', url);
      window.location.href = url;
    } else if (subcategory && subcategory.slug) {
      // إذا كانت الخدمة الفرعية لها slug (من جدول services)، انتقل إليها مباشرة
      const url = `/services/${subcategory.slug}`;
      console.log('[ServicesGrid] Navigating to subcategory:', url);
      window.location.href = url;
    } else {
      // Otherwise, use the normal service selection
      console.log('[ServicesGrid] Using normal service selection');
      onServiceSelect(selectedServiceWithSubs, subcategory);
    }
    setShowSubcategories(false);
    setSelectedServiceWithSubs(null);
  };

  const handleBackToServices = () => {
    setShowSubcategories(false);
    setSelectedServiceWithSubs(null);
  };

  return (
    <div id="services-grid" className="space-y-8">
      {/* Search and Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث عن الخدمة..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:w-80">
            <div className="relative">
              <Filter className="absolute top-1/2 right-4 rtl:right-auto rtl:left-4 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white"
              >
                {Object.entries(serviceCategories).map(([key, category]) => (
                  <option key={key} value={key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              جاري تحميل الخدمات...
            </span>
          ) : error ? (
            <span className="text-red-600">حدث خطأ في تحميل الخدمات</span>
          ) : filteredServices.length === 0 ? (
            <span className="text-red-600">لا توجد خدمات تطابق البحث</span>
          ) : (
            <span>
              عرض {filteredServices.length} من أصل {services.length} خدمة
            </span>
          )}
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-16"
        >
          <Loader2 className="w-12 h-12 animate-spin text-[#276073]" />
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">حدث خطأ</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            إعادة المحاولة
          </button>
        </motion.div>
      )}

      {/* Services Grid */}
      {!loading && !error && !showSubcategories && filteredServices.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              onSelect={() => onServiceSelect(service)}
              onSubcategorySelect={handleSubcategorySelect}
              isHovered={hoveredService === service.id}
              onHover={setHoveredService}
              iconMap={iconMap}
            />
          ))}
        </motion.div>
      ) : showSubcategories && selectedServiceWithSubs ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Back Button */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button
              onClick={handleBackToServices}
              className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200 font-semibold"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span>العودة للخدمات</span>
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900">{selectedServiceWithSubs.title}</h2>
          </div>

          {/* Subcategories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedServiceWithSubs.subcategories.map((subcategory, index) => (
              <motion.div
                key={subcategory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border border-gray-100 hover:border-[#276073]/20 group"
                onClick={() => handleSubcategoryChoice(subcategory)}
              >
                {/* Icon */}
                <div className={`w-16 h-16 ${subcategory.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-3xl">{subcategory.icon}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#276073] transition-colors duration-300">
                  {subcategory.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                  {subcategory.description}
                </p>

                {/* Action Button */}
                <button 
                  onClick={() => {
                    if (subcategory.route) {
                      window.location.href = subcategory.route;
                    } else {
                      handleSubcategoryChoice(subcategory);
                    }
                  }}
                  className={`w-full bg-gradient-to-r ${subcategory.color} hover:opacity-90 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 rtl:space-x-reverse shadow-lg`}
                >
                  <span>تقديم طلب</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
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
            لا توجد نتائج
          </h3>
          <p className="text-gray-600 mb-6">
            جرب تغيير كلمات البحث أو الفئة المختارة
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('all');
            }}
            className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            إعادة تعيين البحث
          </button>
        </motion.div>
      )}

      {/* Help Section */}
      {!showSubcategories && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white rounded-2xl p-8 text-center"
      >
        <h3 className="text-2xl font-bold mb-4">
          تحتاج مساعدة؟
        </h3>
        <p className="text-white/90 mb-6 max-w-2xl mx-auto">
          فريقنا المتخصص جاهز لمساعدتك في اختيار الخدمة المناسبة وإرشادك خلال عملية التقديم
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="tel:+966501234567"
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
          >
            <span>اتصل بنا</span>
          </a>
          <a
            href="https://wa.me/966501234567"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
          >
            <span>واتساب</span>
          </a>
        </div>
        </motion.div>
      )}
    </div>
  );
};

export default ServicesGrid;