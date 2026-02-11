import React from 'react';
import { Download, Printer, Shield } from 'lucide-react';

const EducationalCard = ({ card, onPrint, onDownload, showActions = true }) => {
  const generateQRCode = (data) => {
    const qrText = `Card: ${data.card_number}\nName: ${data.student_full_name}\nID: ${data.student_national_id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrText)}`;
  };

  const defaultPhoto = 'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <div className="space-y-4">
      <div id="educational-card-print" className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl shadow-2xl overflow-hidden print:shadow-none">
        <div className="p-8">
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="text-white">
                <h2 className="text-xl font-bold">Consulate General</h2>
                <p className="text-sm opacity-90">Republic of Sudan - Jeddah</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-white font-bold text-2xl">SD</span>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">
              القنصلية العامة
            </h1>
            <h2 className="text-2xl font-bold text-white mb-2">
              جمهورية السودان بجدة
            </h2>
            <h3 className="text-2xl font-bold text-white mb-4">
              بطاقة امتحانات الشهادة
            </h3>
            <h3 className="text-xl font-semibold text-white mb-6">
              Examination Admission Card
            </h3>
            <div className="inline-block bg-teal-700/50 backdrop-blur-sm px-8 py-3 rounded-lg">
              <p className="text-white text-xl font-bold tracking-wider">
                {card.card_number}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="text-base font-bold text-gray-900">{card.student_full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">الاسم الكامل</p>
                    <p className="text-base font-bold text-gray-900">{card.student_full_name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">National No</p>
                    <p className="text-base font-bold text-gray-900">{card.student_national_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">الرقم الوطني</p>
                    <p className="text-base font-bold text-gray-900">{card.student_national_id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">Exam Type</p>
                    <p className="text-base font-bold text-teal-700">{card.exam_type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">نوع الشهادة</p>
                    <p className="text-base font-bold text-teal-700">{card.exam_type_ar}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">Seat Number</p>
                    <p className="text-2xl font-bold text-gray-900">{card.seat_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">رقم الجلوس</p>
                    <p className="text-2xl font-bold text-gray-900">{card.seat_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">Center Name</p>
                    <p className="text-base font-bold text-gray-900">{card.center_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">اسم المركز</p>
                    <p className="text-base font-bold text-gray-900">{card.center_name_ar}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-gray-500 mb-1">Center Number</p>
                    <p className="text-base font-bold text-gray-900">{card.center_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">رقم المركز</p>
                    <p className="text-base font-bold text-gray-900">{card.center_number}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-between gap-4">
                <div className="w-full">
                  <img
                    src={card.student_photo_url || defaultPhoto}
                    alt="Student"
                    className="w-full h-48 object-cover rounded-lg border-4 border-teal-100"
                  />
                </div>
                <div className="text-center">
                  <img
                    src={card.qr_code_url || generateQRCode(card)}
                    alt="QR Code"
                    className="w-32 h-32 mx-auto"
                  />
                  <p className="text-xs text-gray-500 mt-2">رمز التحقق</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showActions && (
        <div className="flex gap-3 justify-end print:hidden">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-semibold"
          >
            <Printer className="w-5 h-5" />
            طباعة البطاقة
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
          >
            <Download className="w-5 h-5" />
            تحميل البطاقة
          </button>
        </div>
      )}
    </div>
  );
};

export default EducationalCard;
