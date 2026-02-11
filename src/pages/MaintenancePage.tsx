import React from 'react';
import { Settings, Clock, Calendar } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

interface MaintenancePageProps {
  message_ar?: string;
  message_en?: string;
  start_time?: string;
  end_time?: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({
  message_ar,
  message_en,
  start_time,
  end_time,
}) => {
  const { language } = useLanguage();

  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    const date = new Date(dateTimeStr);
    return language === 'ar'
      ? date.toLocaleString('ar-SA', { dateStyle: 'full', timeStyle: 'short' })
      : date.toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' });
  };

  const defaultMessage = language === 'ar'
    ? 'الموقع تحت الصيانة حالياً. سنعود قريباً إن شاء الله.'
    : 'The site is currently under maintenance. We will be back soon.';

  const message = language === 'ar' ? (message_ar || defaultMessage) : (message_en || defaultMessage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Settings className="w-12 h-12 text-white animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
                <Clock className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {language === 'ar' ? 'الموقع تحت الصيانة' : 'Under Maintenance'}
          </h1>

          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>

          {(start_time || end_time) && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mb-4">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-800">
                  {language === 'ar' ? 'مواعيد الصيانة' : 'Maintenance Schedule'}
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                {start_time && (
                  <div>
                    <span className="font-semibold text-gray-700">
                      {language === 'ar' ? 'بدأت في:' : 'Started at:'}
                    </span>
                    <p className="text-gray-600 mt-1">{formatDateTime(start_time)}</p>
                  </div>
                )}

                {end_time && (
                  <div className="pt-3 border-t border-gray-200">
                    <span className="font-semibold text-green-600">
                      {language === 'ar' ? 'العودة المتوقعة:' : 'Expected Return:'}
                    </span>
                    <p className="text-gray-800 font-bold mt-1">{formatDateTime(end_time)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="text-center text-gray-500 text-sm">
            <p>
              {language === 'ar'
                ? 'نعتذر عن الإزعاج. نقوم بتحسين خدماتنا لتقديم تجربة أفضل لكم.'
                : 'We apologize for the inconvenience. We are improving our services to provide you with a better experience.'}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 rtl:space-x-reverse text-gray-400">
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
