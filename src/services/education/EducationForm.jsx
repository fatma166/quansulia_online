import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Book, ArrowLeft, Clock, DollarSign } from 'lucide-react';

const EducationForm = () => {
  const navigate = useNavigate();

  const educationTypes = [
    {
      id: 'secondary',
      title: 'امتحانات الشهادة الثانوية',
      description: 'التقديم لامتحانات الشهادة الثانوية القسم العلمي والأدبي - المشائق العلمي والمشائق الأدبي',
      icon: Book,
      link: '/services/education/secondary',
      duration: '5-7 أيام عمل',
      fees: '150 ريال سعودي',
      requirements: [
        'الشهادة المتوسطة أو ما يعادلها',
        'صورة شخصية حديثة',
        'صورة من جواز السفر',
        '+5 متطلبات أخرى'
      ]
    },
    {
      id: 'intermediate',
      title: 'امتحانات الشهادة المتوسطة',
      description: 'التقديم لامتحانات الشهادة المتوسطة (الصف الثامن) للطلاب في المرحلة المتوسطة',
      icon: Book,
      link: '/services/education/intermediate',
      duration: '5-7 أيام عمل',
      fees: '150 ريال سعودي',
      requirements: [
        'الشهادة الابتدائية أو ما يعادلها',
        'صورة شخصية حديثة',
        'صورة من جواز السفر',
        '+5 متطلبات أخرى'
      ]
    },
    {
      id: 'primary',
      title: 'امتحانات الشهادة الابتدائية',
      description: 'التقديم لامتحانات الشهادة الابتدائية (الصف السادس) للطلاب في المرحلة الابتدائية',
      icon: BookOpen,
      link: '/services/education/primary',
      duration: '5-7 أيام عمل',
      fees: '150 ريال سعودي',
      requirements: [
        'شهادة أساس الصف الخامس',
        'صورة شخصية حديثة',
        'صورة من جواز السفر',
        '+5 متطلبات أخرى'
      ]
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">الخدمات التعليمية</h2>
        <p className="text-gray-600 text-lg mb-6">
          نقدم خدمات معادلة الشهادات الدراسية للمراحل التعليمية المختلفة
        </p>

        <div className="bg-blue-50 border-r-4 border-blue-500 p-6 rounded-lg mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-3">المتطلبات العامة:</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-500 ml-2">•</span>
              <span>الشهادة الأصلية أو صورة مصدقة منها</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 ml-2">•</span>
              <span>صورة من جواز السفر</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 ml-2">•</span>
              <span>صورة شخصية حديثة</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 ml-2">•</span>
              <span>دفع الرسوم المقررة (150 ريال سعودي)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* تنبيه مهم */}
      <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-6 mb-8">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-8 h-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="mr-4 flex-1">
            <h3 className="text-xl font-bold text-orange-900 mb-3">تنبيه مهم: يجب اختيار المشائق قبل البدء</h3>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <p className="text-orange-800 font-semibold mb-2">
                يرجى اختيار المشائق (الدراسي العلمي أو الأدبي) أو القول قبل البدء بتعبئة البيانات:
              </p>
              <ul className="space-y-2 text-orange-700 text-sm mr-4">
                <li className="flex items-start">
                  <span className="text-orange-500 ml-2">✦</span>
                  <span>القسم العلمي يشمل: الرياضيات المتقدمة، العلوم الفيزيائية والكيميائية والأحياء وغيرها</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 ml-2">✦</span>
                  <span>القسم الأدبي يشمل: تطوير اللغات والعلوم الإنسانية والدراسات الاجتماعية وغيرها</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {educationTypes.map((type, index) => {
          const Icon = type.icon;
          return (
            <div
              key={type.id}
              className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-[#276073]/20 relative overflow-hidden transform hover:-translate-y-2"
              onClick={() => navigate(type.link)}
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
                    <Icon className="w-8 h-8 text-[#276073] group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#276073] transition-colors duration-300">
                  {type.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-2">
                  {type.description}
                </p>

                {/* Service Info */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                    <Clock className="w-4 h-4 text-[#276073]" />
                    <span>{type.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                    <DollarSign className="w-4 h-4 text-[#276073]" />
                    <span>{type.fees}</span>
                  </div>
                </div>

                {/* Requirements Preview */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">المتطلبات الأساسية:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {type.requirements.slice(0, 2).map((req, idx) => (
                      <li key={idx} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="w-1.5 h-1.5 bg-[#276073] rounded-full mt-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">{req}</span>
                      </li>
                    ))}
                    {type.requirements.length > 2 && (
                      <li className="text-[#276073] font-medium">
                        +{type.requirements.length - 2} متطلبات أخرى
                      </li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <button className="w-full bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 rtl:space-x-reverse group-hover:shadow-lg">
                  <span>تقديم طلب</span>
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#276073]/5 to-[#87ceeb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
            </div>
          );
        })}
      </div>

      <div className="mt-8 bg-yellow-50 border-r-4 border-yellow-500 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-yellow-900 mb-2">ملاحظة هامة:</h3>
        <p className="text-yellow-800">
          يرجى التأكد من صحة جميع البيانات المدخلة ومطابقة المستندات المرفقة للشهادات الأصلية.
          أي اختلاف قد يؤدي إلى تأخير أو رفض الطلب.
        </p>
      </div>
    </div>
  );
};

export default EducationForm;
