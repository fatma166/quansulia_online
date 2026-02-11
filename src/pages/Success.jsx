import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Share2, ArrowLeft, Phone, MessageCircle, GraduationCap, QrCode, Info, Copy, Check } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { referenceNumber, serviceTitle } = location.state || {};
  const [copied, setCopied] = useState(false);

  const consulateName = 'القنصلية العامة لجمهورية السودان - جدة';
  const trackingUrl = `${window.location.origin}/track?ref=${referenceNumber}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    // If no reference number, redirect to services
    if (!referenceNumber) {
      navigate('/services');
    }
  }, [referenceNumber, navigate]);

  const handleShare = async () => {
    const shareData = {
      title: 'رقم مرجعي للطلب',
      text: `رقم مرجعي للطلب: ${referenceNumber}`,
      url: window.location.origin + '/track/' + referenceNumber
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`رقم مرجعي للطلب: ${referenceNumber}`);
      alert('تم نسخ الرقم المرجعي');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!referenceNumber) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-gray-900 mb-4"
            >
              تم استلام طلبكم بنجاح
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-gray-600"
            >
              شكراً لكم على تقديم الطلب. سيتم مراجعته والرد عليكم قريباً
            </motion.p>
          </motion.div>

          {/* Official Receipt Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden mb-8 print:shadow-none print:border-2"
            id="receipt-card"
          >
            {/* Header with Consulate Name */}
            <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-2">{consulateName}</h2>
              <p className="text-white/90 text-lg">إيصال استلام الطلب الرسمي</p>
            </div>

            {/* Reference Number and QR Code Section */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="max-w-2xl mx-auto">
                {/* Reference Number - Prominent Display */}
                <div className="mb-8 text-center">
                  <p className="text-gray-600 text-sm mb-3">الرقم المرجعي للطلب</p>
                  <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <p className="text-3xl lg:text-4xl font-bold text-white font-mono tracking-wider">
                        {referenceNumber}
                      </p>
                      <button
                        onClick={copyToClipboard}
                        className="print:hidden bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all duration-200 group backdrop-blur-sm"
                        title="نسخ الرقم المرجعي"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Copy className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    </div>
                    {copied && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-white/90 text-sm mt-3 print:hidden"
                      >
                        ✓ تم النسخ بنجاح
                      </motion.p>
                    )}
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white p-6 rounded-2xl shadow-lg border-4 border-[#276073]/20">
                    <QRCodeSVG
                      value={trackingUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4 text-[#276073]">
                    <QrCode className="w-5 h-5" />
                    <span className="text-sm font-semibold">امسح الرمز للتتبع السريع</span>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-right">
                      <p className="text-amber-900 font-bold text-sm mb-1">
                        مهم: احتفظ بهذا الرقم
                      </p>
                      <p className="text-amber-800 text-xs leading-relaxed">
                        استخدم الرقم المرجعي أو امسح رمز QR لتتبع حالة طلبك في أي وقت
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="px-8 pb-8">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#276073] rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  تفاصيل الطلب
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">نوع الخدمة</p>
                    <p className="font-bold text-gray-900">{serviceTitle}</p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">تاريخ التقديم</p>
                    <p className="font-bold text-gray-900">
                      {new Date().toLocaleDateString('ar-SA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">وقت الاستلام</p>
                    <p className="font-bold text-gray-900">
                      {new Date().toLocaleTimeString('ar-SA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-600 text-sm mb-1">الحالة الحالية</p>
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                      قيد المراجعة
                    </span>
                  </div>
                </div>

                {/* Show exam card link for education services */}
                {referenceNumber && referenceNumber.startsWith('EDU-') && (
                  <div className="mt-4 bg-green-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">بطاقة الامتحان متاحة</p>
                          <p className="text-sm text-gray-600">يمكنك طباعة بطاقة الامتحان الآن</p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/exam-card/${referenceNumber}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        عرض البطاقة
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">الخطوات التالية</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-6 h-6 bg-[#276073] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  1
                </div>
                <p className="text-gray-700">سيتم مراجعة طلبكم من قبل الفريق المختص</p>
              </div>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-6 h-6 bg-[#276073] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  2
                </div>
                <p className="text-gray-700">سيتم التواصل معكم في حالة الحاجة لمعلومات إضافية</p>
              </div>
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <div className="w-6 h-6 bg-[#276073] text-white rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  3
                </div>
                <p className="text-gray-700">ستتلقون إشعاراً عند اكتمال معالجة الطلب</p>
              </div>
            </div>
          </motion.div>

          {/* Tracking Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 mb-8 print:hidden"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">كيفية تتبع طلبك</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">١.</span>
                    <span>استخدم الرقم المرجعي <strong className="text-[#276073]">{referenceNumber}</strong> للاستعلام عن حالة طلبك</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">٢.</span>
                    <span>أو امسح رمز QR بكاميرا هاتفك للوصول المباشر لصفحة التتبع</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">٣.</span>
                    <span>يمكنك طباعة هذا الإيصال للرجوع إليه لاحقاً</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 print:hidden"
          >
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-3 bg-[#276073] hover:bg-[#1e4a5a] text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              <span>طباعة الإيصال</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Share2 className="w-5 h-5" />
              <span>مشاركة الرقم المرجعي</span>
            </button>
          </motion.div>

          {/* Contact Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white rounded-2xl p-6 text-center mb-8 print:hidden"
          >
            <h3 className="text-lg font-bold mb-4">تحتاج مساعدة؟</h3>
            <p className="text-white/90 mb-4">
              فريق الدعم متاح لمساعدتكم في أي استفسار حول طلبكم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+966501234567"
                className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                <Phone className="w-4 h-4" />
                <span>اتصل بنا</span>
              </a>
              <a
                href="https://wa.me/966501234567"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
            </div>
          </motion.div>

          {/* Back to Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center print:hidden"
          >
            <button
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-2 text-[#276073] hover:text-[#1e4a5a] font-semibold transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              <span>العودة إلى الخدمات</span>
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />

      {/* Print Styles */}
      <style>{`
        @media print {
          /* Reset everything */
          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Hide header and footer during print */
          header,
          footer,
          nav {
            display: none !important;
            visibility: hidden !important;
          }

          /* Hide everything except receipt */
          body * {
            visibility: hidden;
          }

          #receipt-card,
          #receipt-card * {
            visibility: visible;
          }

          /* Position receipt for printing */
          #receipt-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
          }

          /* Hide interactive elements */
          .print\\:hidden,
          button {
            display: none !important;
            visibility: hidden !important;
          }

          /* Ensure QR code prints correctly */
          svg {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* Ensure reference number stays on one line */
          .font-mono {
            white-space: nowrap !important;
            word-break: keep-all !important;
            overflow: visible !important;
            font-size: 2rem !important;
          }

          /* Page settings */
          @page {
            margin: 1.5cm;
            size: A4 portrait;
          }

          /* Ensure colors print */
          body {
            background: white !important;
          }

          /* Ensure gradient background prints */
          .bg-gradient-to-r {
            background: #276073 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Success;