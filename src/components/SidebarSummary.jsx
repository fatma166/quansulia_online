import React, { useMemo } from 'react';
import { Clock, DollarSign, FileText, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { findMatchingPricingRule } from '../utils/conditionEvaluator';
import { getVisibleItems } from '../hooks/useServiceData';

const SidebarSummary = ({ service, formData = {}, pricingRules = [], requirements = [] }) => {
  // حساب العمر من تاريخ الميلاد
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    // محاولة تحليل التاريخ بصيغ مختلفة
    let year, month, day;

    // إذا كان التاريخ بصيغة ISO (YYYY-MM-DD)
    if (typeof birthDate === 'string' && birthDate.includes('-')) {
      [year, month, day] = birthDate.split('-').map(Number);
    }
    // إذا كان التاريخ من حقول منفصلة
    else if (typeof birthDate === 'object') {
      year = birthDate.year || birthDate.سنة || birthDate.Year;
      month = birthDate.month || birthDate.شهر || birthDate.Month;
      day = birthDate.day || birthDate.يوم || birthDate.Day;
    } else {
      return null;
    }

    if (!year || !month || !day) return null;

    const today = new Date();
    const birth = new Date(year, month - 1, day);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // حساب السعر الإجمالي بناءً على أفراد العائلة
  const calculateTotalPrice = useMemo(() => {
    if (!service) return null;

    console.log('[SidebarSummary] ========= بداية حساب السعر =========');
    console.log('[SidebarSummary] بيانات التسعير:', {
      serviceName: service.name_ar,
      serviceSlug: service.slug,
      pricingRulesCount: pricingRules?.length || 0,
      pricingRules: pricingRules,
      formData: formData,
      passportType: formData.passportType,
      isAdult: formData.isAdult
    });

    // البحث عن قاعدة تسعير مشروطة متحققة
    const matchingRule = findMatchingPricingRule(pricingRules, formData);

    console.log('[التسعير المشروط] ✓✓✓ القاعدة المتحققة:', matchingRule);
    console.log('[SidebarSummary] ========= نهاية حساب السعر =========');

    // تحديد مصدر الأسعار: من القاعدة المشروطة أو من الخدمة الافتراضية
    const priceSource = matchingRule || service;
    const hasAgePricing = matchingRule ?
      (matchingRule.price_under_18 !== null && matchingRule.price_18_and_above !== null) :
      service.has_age_based_pricing;

    console.log('[التسعير المشروط] مصدر الأسعار:', {
      source: matchingRule ? 'قاعدة مشروطة' : 'افتراضي',
      hasAgePricing,
      priceSource
    });

    // إذا لم يكن هناك تسعير حسب العمر، نستخدم السعر الموحد
    if (!hasAgePricing) {
      return {
        total: priceSource.price || priceSource.fees || 'حسب العمر',
        breakdown: null,
        isAgeBased: false,
        appliedRule: matchingRule ? matchingRule.rule_name : null
      };
    }

    // جمع كل أفراد العائلة من جميع حقول dynamic-list
    const familyMembers = [];

    // البحث عن حقول أفراد العائلة في formData
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (Array.isArray(value) && value.length > 0) {
        // التحقق من أن العنصر يحتوي على تاريخ ميلاد
        value.forEach((member, index) => {
          // محاولة العثور على تاريخ الميلاد بطرق مختلفة
          const birthDate = member.birthDate || member.dob || member.تاريخ_الميلاد;

          // البحث عن حقول التاريخ بجميع الأسماء الممكنة
          let year = member.year || member.سنة || member.Year || member['سنة'];
          let month = member.month || member.شهر || member.Month || member['شهر'];
          let day = member.day || member.يوم || member.Day || member['يوم'];

          // إذا لم نجد، نبحث في جميع مفاتيح الكائن
          if (!year || !month || !day) {
            Object.keys(member).forEach(memberKey => {
              const lowerKey = memberKey.toLowerCase();
              if (lowerKey.includes('year') || lowerKey.includes('سنة')) {
                year = member[memberKey];
              }
              if (lowerKey.includes('month') || lowerKey.includes('شهر')) {
                month = member[memberKey];
              }
              if (lowerKey.includes('day') || lowerKey.includes('يوم')) {
                day = member[memberKey];
              }
            });
          }

          const hasDateFields = year && month && day;

          if (birthDate || hasDateFields) {
            // استخراج الاسم من أي حقل متاح
            let memberName = member.name || member.الاسم || member.fullName || member['الاسم'];

            // إذا لم نجد اسم، نبحث في جميع الحقول النصية
            if (!memberName) {
              Object.keys(member).forEach(memberKey => {
                const lowerKey = memberKey.toLowerCase();
                if ((lowerKey.includes('name') || lowerKey.includes('اسم')) &&
                    typeof member[memberKey] === 'string' &&
                    member[memberKey].length > 0) {
                  memberName = member[memberKey];
                }
              });
            }

            familyMembers.push({
              name: memberName || `فرد ${index + 1}`,
              birthDate: birthDate || {
                year: parseInt(year),
                month: parseInt(month),
                day: parseInt(day)
              }
            });
          }
        });
      }
    });

    // إضافة المتقدم نفسه إذا كان لديه تاريخ ميلاد
    if (formData.dob || (formData.year && formData.month && formData.day)) {
      familyMembers.unshift({
        name: formData.fullName || 'المتقدم',
        birthDate: formData.dob || {
          year: formData.year,
          month: formData.month,
          day: formData.day
        }
      });
    }

    // حساب السعر لكل فرد
    if (familyMembers.length === 0) {
      // إذا كان هناك قاعدة تسعير مطبقة، استخدم حقل isAdult مباشرة
      if (matchingRule && formData.isAdult) {
        const isAdultUser = formData.isAdult === 'yes';
        const price = isAdultUser ?
          parseFloat(matchingRule.price_18_and_above) :
          parseFloat(matchingRule.price_under_18);

        return {
          total: price,
          breakdown: [{
            name: formData.fullName || 'المتقدم',
            age: isAdultUser ? '18+' : '<18',
            price: price
          }],
          isAgeBased: true,
          count: 1,
          appliedRule: matchingRule.rule_name
        };
      }

      // إذا لم يكن هناك قاعدة مطبقة، استخدم السعر الافتراضي
      return {
        total: priceSource.price_18_and_above || priceSource.fees || 'غير محدد',
        breakdown: null,
        isAgeBased: true,
        note: 'السعر المعروض هو للبالغين (18 سنة فأكثر)',
        appliedRule: matchingRule ? matchingRule.rule_name : null
      };
    }

    const breakdown = familyMembers.map(member => {
      const age = calculateAge(member.birthDate);
      let price = 0;

      if (age !== null) {
        price = age < 18 ?
          (parseFloat(priceSource.price_under_18) || 0) :
          (parseFloat(priceSource.price_18_and_above) || 0);
      }

      console.log('[السعر الديناميكي] الفرد:', {
        name: member.name,
        birthDate: member.birthDate,
        age,
        price,
        priceUnder18: priceSource.price_under_18,
        price18AndAbove: priceSource.price_18_and_above,
        appliedRule: matchingRule ? matchingRule.rule_name : 'افتراضي'
      });

      return {
        name: member.name,
        age,
        price
      };
    });

    const total = breakdown.reduce((sum, item) => sum + item.price, 0);

    console.log('[السعر الديناميكي] الإجمالي:', {
      totalMembers: familyMembers.length,
      breakdown,
      total
    });

    return {
      total,
      breakdown,
      isAgeBased: true,
      count: familyMembers.length,
      appliedRule: matchingRule ? matchingRule.rule_name : null
    };
  }, [service, formData, pricingRules]);

  // Get service info directly without type selection
  const getServiceInfo = () => {
    // Handle madhoonia service fees and duration based on serviceType
    if (service.id === 'madhoonia' && formData.serviceType) {
      const fees = service.fees && typeof service.fees === 'object'
        ? `${service.fees[formData.serviceType] || service.fees.marriage || 'غير محدد'} ${service.fees.currency || ''}`
        : service.fees || 'غير محدد';

      const duration = service.duration || 'غير محدد';

      const requirements = service.requirements && typeof service.requirements === 'object'
        ? service.requirements[formData.serviceType] || service.requirements.marriage || []
        : [];

      return {
        requirements,
        fees,
        duration
      };
    }

    if (service.requirements && typeof service.requirements === 'object') {
      // Check if service.requirements is already an array
      if (Array.isArray(service.requirements)) {
        // Handle fees - check if it's an object with nested types
        let extractedFees = service.fees;
        if (typeof service.fees === 'object' && service.fees !== null && !Array.isArray(service.fees)) {
          if (service.fees.base) {
            extractedFees = service.fees.base;
          } else {
            // If it's a complex object with nested fee types, get the first available fee
            const feeValues = Object.values(service.fees);
            extractedFees = feeValues.length > 0 ? feeValues[0] : 'غير محدد';
          }
        }
        
        // Handle duration - check if it's an object with nested types
        let extractedDuration = service.duration;
        if (typeof service.duration === 'object' && service.duration !== null && !Array.isArray(service.duration)) {
          const durationValues = Object.values(service.duration);
          extractedDuration = durationValues.length > 0 ? durationValues[0] : 'غير محدد';
        }
        
        return {
          requirements: service.requirements,
          fees: typeof extractedFees === 'string' ? extractedFees : (extractedFees || 'غير محدد'),
          duration: typeof extractedDuration === 'string' ? extractedDuration : (extractedDuration || 'غير محدد')
        };
      } else {
        // Handle object-based requirements (like passport services)
        const extractedRequirements = service.requirements.new || Object.values(service.requirements)[0] || [];
        
        // Handle fees for object-based requirements
        let extractedFees = service.fees;
        if (typeof service.fees === 'object' && service.fees !== null && !Array.isArray(service.fees)) {
          if (service.fees.base) {
            extractedFees = service.fees.base;
          } else {
            const feeValues = Object.values(service.fees);
            extractedFees = feeValues.length > 0 ? feeValues[0] : 'غير محدد';
          }
        }
        
        // Handle duration for object-based requirements
        let extractedDuration = service.duration;
        if (typeof service.duration === 'object' && service.duration !== null && !Array.isArray(service.duration)) {
          const durationValues = Object.values(service.duration);
          extractedDuration = durationValues.length > 0 ? durationValues[0] : 'غير محدد';
        }
        
        return {
          requirements: Array.isArray(extractedRequirements) ? extractedRequirements : [extractedRequirements],
          fees: typeof extractedFees === 'string' ? extractedFees : (extractedFees || 'غير محدد'),
          duration: typeof extractedDuration === 'string' ? extractedDuration : (extractedDuration || 'غير محدد')
        };
      }
    }
    
    // Handle fees for simple requirements structure
    let extractedFees = service.fees;
    if (typeof service.fees === 'object' && service.fees !== null && !Array.isArray(service.fees)) {
      if (service.fees.base) {
        extractedFees = service.fees.base;
      } else {
        const feeValues = Object.values(service.fees);
        extractedFees = feeValues.length > 0 ? feeValues[0] : 'غير محدد';
      }
    }
    
    // Handle duration for simple requirements structure
    let extractedDuration = service.duration;
    if (typeof service.duration === 'object' && service.duration !== null && !Array.isArray(service.duration)) {
      const durationValues = Object.values(service.duration);
      extractedDuration = durationValues.length > 0 ? durationValues[0] : 'غير محدد';
    }
    
    return {
      requirements: Array.isArray(service.requirements) ? service.requirements : (service.requirements ? [service.requirements] : []),
      fees: typeof extractedFees === 'string' ? extractedFees : (extractedFees || 'غير محدد'),
      duration: typeof extractedDuration === 'string' ? extractedDuration : (extractedDuration || 'غير محدد')
    };
  };

  // Get dynamic requirements based on form data
  const getDynamicRequirements = () => {
    // استخدم فقط البيانات من قاعدة البيانات مع تطبيق الشروط
    if (requirements && Array.isArray(requirements) && requirements.length > 0) {
      // تطبيق الشروط على المتطلبات - فقط المتطلبات المرئية حسب الشروط
      const visibleRequirements = getVisibleItems(requirements, formData);

      // استخراج النص العربي من كل متطلب
      return visibleRequirements.map(req => req.requirement_ar);
    }

    // إذا لم يكن هناك بيانات من قاعدة البيانات، أرجع مصفوفة فارغة
    return [];
  };
  const serviceInfo = getServiceInfo();
  const dynamicRequirements = getDynamicRequirements();

  return (
    <div className="hidden lg:block space-y-6">
      {/* Requirements */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 rtl:gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>المتطلبات</span>
        </h3>

        {dynamicRequirements.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            لا توجد متطلبات إضافية حسب اختياراتك
          </p>
        ) : (
          <ul className="space-y-2">
            {dynamicRequirements.map((requirement, index) => {
            // Check if requirement is an object with title and items
            if (typeof requirement === 'object' && requirement.title && requirement.items) {
              return (
                <li key={index} className="mb-4">
                  <div className="font-semibold text-gray-900 mb-2 text-sm">{requirement.title}</div>
                  <ul className="space-y-2 mr-4 rtl:ml-4">
                    {requirement.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            // Otherwise, display as a simple list item
            return (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{requirement}</span>
              </li>
            );
            })}
          </ul>
        )}
      </div>

      {/* Service Info */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الخدمة</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <Clock className="w-5 h-5 text-[#276073]" />
            <div>
              <p className="text-sm font-medium text-gray-900">مدة الإنجاز</p>
              <p className="text-sm text-gray-600">{serviceInfo.duration}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <DollarSign className="w-5 h-5 text-[#276073] mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-2">الرسوم</p>

                {calculateTotalPrice && calculateTotalPrice.isAgeBased ? (
                  <>
                    {/* عرض تفاصيل السعر لكل فرد */}
                    {calculateTotalPrice.breakdown && calculateTotalPrice.breakdown.length > 0 ? (
                      <div className="space-y-2">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                          {calculateTotalPrice.breakdown.map((person, index) => (
                            <div key={index} className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-blue-600" />
                                <span className="text-gray-700">{person.name}</span>
                                {person.age !== null && (
                                  <span className="text-gray-500">({person.age} سنة)</span>
                                )}
                              </div>
                              <span className="font-semibold text-blue-700">
                                {person.price} ريال
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                          <span className="text-sm font-bold text-gray-900">الإجمالي</span>
                          <span className="text-lg font-bold text-[#276073]">
                            {calculateTotalPrice.total} ريال
                          </span>
                        </div>

                        <p className="text-xs text-gray-500">
                          السعر محسوب لـ {calculateTotalPrice.count} {calculateTotalPrice.count === 1 ? 'فرد' : 'أفراد'}
                        </p>

                        {calculateTotalPrice.appliedRule && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                            ✓ تم تطبيق: {calculateTotalPrice.appliedRule}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600">
                          {calculateTotalPrice.total} ريال
                        </p>
                        {calculateTotalPrice.note && (
                          <p className="text-xs text-gray-500 mt-1">{calculateTotalPrice.note}</p>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      {typeof serviceInfo.fees === 'string' ? serviceInfo.fees : `${serviceInfo.fees} ${service.fees?.currency || ''}`}
                    </p>
                    {service.fees?.additional && (
                      <p className="text-xs text-gray-500">{service.fees.additional}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Steps */}
      {service.process && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 rtl:space-x-reverse">
            <FileText className="w-5 h-5 text-[#276073]" />
            <span>إجراءات المعاملة</span>
          </h3>
          
          <ol className="space-y-3">
            {service.process.map((step, index) => (
              <li key={index} className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-6 h-6 bg-[#276073] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Contact Support */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">تحتاج مساعدة؟</h3>
        <p className="text-sm text-gray-600 mb-4">
          فريق الدعم متاح لمساعدتك في أي استفسار
        </p>
        <div className="space-y-2">
          <a
            href="tel:+966501234567"
            className="block text-sm text-gray-700 hover:text-[#276073] transition-colors duration-200"
          >
            📞 +966 50 123 4567
          </a>
          <a
            href="mailto:support@consulate.gov.sd"
            className="block text-sm text-gray-700 hover:text-[#276073] transition-colors duration-200"
          >
            ✉️ support@consulate.gov.sd
          </a>
        </div>
      </div>
    </div>
  );
};

export default SidebarSummary;