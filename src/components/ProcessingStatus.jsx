import React from 'react';
import { Clock, CheckCircle, FileText, Users, Stamp } from 'lucide-react';

const ProcessingStatus = ({ application }) => {
  const processingStages = [
    {
      id: 'document_verification',
      title: 'التحقق من المستندات',
      description: 'مراجعة جميع المستندات المرفقة',
      icon: FileText,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: 'approval_process',
      title: 'عملية الموافقة',
      description: 'مراجعة الطلب من الجهات المختصة',
      icon: Users,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      id: 'document_preparation',
      title: 'إعداد الوثيقة',
      description: 'طباعة وإعداد المستند النهائي',
      icon: Stamp,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: 'quality_check',
      title: 'المراجعة النهائية',
      description: 'التأكد من جودة الوثيقة',
      icon: CheckCircle,
      color: 'text-orange-600 bg-orange-100'
    }
  ];

  const getProgressPercentage = () => {
    const daysSinceSubmission = Math.floor(
      (new Date() - new Date(application.submission_date)) / (1000 * 60 * 60 * 24)
    );

    const estimatedDays = 7;
    const progress = Math.min((daysSinceSubmission / estimatedDays) * 100, 90);
    return Math.round(progress);
  };

  const getCurrentStage = () => {
    const progress = getProgressPercentage();
    if (progress < 25) return 0;
    if (progress < 50) return 1;
    if (progress < 75) return 2;
    return 3;
  };

  const currentStageIndex = getCurrentStage();
  const progressPercentage = getProgressPercentage();

  const getEstimatedCompletion = () => {
    const submissionDate = new Date(application.submission_date);
    const estimatedDate = new Date(submissionDate);
    estimatedDate.setDate(estimatedDate.getDate() + 7);

    return estimatedDate.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">حالة المعالجة</h3>
        <p className="text-gray-600">طلبك قيد المعالجة حالياً</p>
      </div>

      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">نسبة الإنجاز</p>
            <p className="text-3xl font-bold text-blue-600">{progressPercentage}%</p>
          </div>
          <div className="relative">
            <Clock className="w-16 h-16 text-blue-400 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="h-full w-full bg-white/30 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">تاريخ التقديم</span>
          <span className="font-semibold text-gray-900">
            {new Date(application.submission_date).toLocaleDateString('ar-SA')}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-4">مراحل المعالجة</h4>
        <div className="space-y-4">
          {processingStages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = index < currentStageIndex;
            const isCurrent = index === currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`flex items-start space-x-4 rtl:space-x-reverse p-4 rounded-lg transition-all ${
                  isCurrent ? 'bg-blue-50 border-2 border-blue-300' : 'bg-gray-50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isCurrent
                      ? stage.color
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : isCurrent ? (
                    <div className="relative">
                      <Icon className="w-6 h-6 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                    </div>
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h5
                      className={`font-semibold ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {stage.title}
                    </h5>
                    {isCurrent && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse">
                        قيد التنفيذ
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        مكتمل
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${isCurrent ? 'text-gray-700' : 'text-gray-500'}`}>
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3 rtl:space-x-reverse">
            <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-800">التاريخ المتوقع للإنجاز</p>
              <p className="text-green-700 mt-1">{getEstimatedCompletion()}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">معلومات هامة:</h4>
          <ul className="text-sm text-blue-700 space-y-1 pr-5 list-disc">
            <li>سيتم إشعاركم فور اكتمال المعالجة عبر الرسائل النصية والبريد الإلكتروني</li>
            <li>يمكنكم متابعة حالة الطلب في أي وقت من خلال رقم المعاملة</li>
            <li>في حالة الحاجة لمعلومات إضافية، سيتم التواصل معكم مباشرة</li>
            <li>المدة المتوقعة قد تختلف حسب حجم الطلبات</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus;
