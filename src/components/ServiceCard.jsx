import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, DollarSign, Grid, ExternalLink } from 'lucide-react';

const ServiceCard = ({ service, index, onSelect, isHovered, onHover, iconMap, onSubcategorySelect }) => {
  const IconComponent = iconMap[service.icon] || iconMap.FileText;

  // Handle service click - check if it's external or has subcategories
  const handleServiceClick = () => {
    // إذا كانت خدمة خارجية، افتح الرابط في تاب جديد
    if (service.is_external && service.external_url) {
      window.open(service.external_url, '_blank', 'noopener,noreferrer');
      return;
    }

    // إذا كان فيها خدمات فرعية
    if (service.hasSubcategories && service.subcategories && onSubcategorySelect) {
      onSubcategorySelect(service);
    } else {
      onSelect();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => onHover(service.id)}
      onHoverEnd={() => onHover(null)}
      className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#276073]/20 relative overflow-hidden"
      onClick={handleServiceClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#276073] rounded-full transform translate-x-16 -translate-y-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#87ceeb] rounded-full transform -translate-x-12 translate-y-12" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-[#276073]/10 group-hover:bg-[#276073] rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
            <IconComponent className="w-8 h-8 text-[#276073] group-hover:text-white transition-colors duration-300" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#276073] transition-colors duration-300">
          {service.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-2">
          {service.description}
        </p>

        {/* Service Info */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
            <Clock className="w-4 h-4 text-[#276073]" />
            <span>{typeof service.duration === 'object' ? service.duration.new || Object.values(service.duration)[0] : service.duration}</span>
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
            <DollarSign className="w-4 h-4 text-[#276073]" />
            <span>
              {(() => {
                if (typeof service.fees === 'string') {
                  return service.fees;
                } else if (typeof service.fees === 'object' && service.fees !== null) {
                  if (service.fees.new && service.fees.new.base) {
                    return `${service.fees.new.base} ${service.fees.new.currency}`;
                  } else if (service.fees.base) {
                    return `${service.fees.base} ${service.fees.currency}`;
                  } else {
                    return 'تختلف الرسوم حسب نوع الخدمة';
                  }
                } else {
                  return 'غير محدد';
                }
              })()
              }
            </span>
          </div>
        </div>

        {/* Requirements Preview */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">المتطلبات الأساسية:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {(() => {
              const requirements = Array.isArray(service.requirements) 
                ? service.requirements 
                : service.requirements?.new || Object.values(service.requirements)[0] || [];
              return requirements.slice(0, 2).map((req, idx) => (
              <li key={idx} className="flex items-start space-x-2 rtl:space-x-reverse">
                <span className="w-1.5 h-1.5 bg-[#276073] rounded-full mt-1.5 flex-shrink-0" />
                <span className="line-clamp-1">{req}</span>
              </li>
              ));
            })()}
            {(() => {
              const requirements = Array.isArray(service.requirements) 
                ? service.requirements 
                : service.requirements?.new || Object.values(service.requirements)[0] || [];
              return requirements.length > 2 && (
              <li className="text-[#276073] font-medium">
                +{requirements.length - 2} متطلبات أخرى
              </li>
              );
            })()}
          </ul>
        </div>

        {/* Action Button */}
        <button className="w-full bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse group-hover:shadow-lg">
          {service.is_external ? (
            <>
              <span>زيارة الموقع</span>
              <ExternalLink className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
            </>
          ) : service.hasSubcategories ? (
            <>
              <span>عرض الأنواع</span>
              <Grid className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" />
            </>
          ) : (
            <>
              <span>تقديم طلب</span>
          <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" />
            </>
          )}
        </button>
      </div>

      {/* Hover Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#276073]/5 to-[#87ceeb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        initial={false}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
    </motion.div>
  );
};

export default ServiceCard;