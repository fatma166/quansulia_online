import React from 'react';
import { Search, FileCheck, Clock, AlertCircle } from 'lucide-react';

const ReviewStatus = ({ application }) => {
  const getDaysSinceSubmission = () => {
    const days = Math.floor(
      (new Date() - new Date(application.submission_date)) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const days = getDaysSinceSubmission();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-yellow-500">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className="relative">
            <Search className="w-10 h-10 text-yellow-500" />
            <div className="absolute -top-1 -right-1 w-4 h-4">
              <span className="flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">الطلب قيد المراجعة</h3>
            <p className="text-sm text-gray-600 mt-1">جاري مراجعة طلبك والتحقق من المستندات</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">مدة المراجعة</span>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{days} يوم</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2 overflow-hidden">
            <div className="h-2 bg-yellow-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-yellow-700 mt-2">المدة المتوقعة: 2-3 أيام عمل</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-gray-900">ما يتم مراجعته:</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 pr-5 list-disc">
              <li>صحة البيانات المدخلة</li>
              <li>اكتمال المستندات المطلوبة</li>
              <li>وضوح الصور المرفقة</li>
              <li>التطابق مع الشروط</li>
            </ul>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              <AlertCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">بعد المراجعة:</h4>
            </div>
            <ul className="text-sm text-gray-700 space-y-1 pr-5 list-disc">
              <li>الموافقة على الطلب</li>
              <li>أو طلب مستندات إضافية</li>
              <li>إشعاركم بالنتيجة فوراً</li>
              <li>إرسال رسالة نصية وبريد</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">نصائح هامة:</h4>
        <ul className="text-sm text-blue-700 space-y-1 pr-5 list-disc">
          <li>تأكد من تفعيل الإشعارات على هاتفك</li>
          <li>راجع بريدك الإلكتروني بانتظام</li>
          <li>احتفظ برقم المعاملة للمتابعة</li>
          <li>في حالة التأخير، تواصل معنا</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewStatus;
