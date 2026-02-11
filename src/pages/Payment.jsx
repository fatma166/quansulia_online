import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, Shield, CheckCircle, AlertCircle, ArrowLeft, Calendar, User, Building } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardholderName: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Get payment details from URL params
  const referenceNumber = searchParams.get('ref') || 'SUD-2025-1197';
  const amount = searchParams.get('amount') || '300';
  const currency = searchParams.get('currency') || 'ريال سعودي';
  const serviceType = searchParams.get('service') || 'جواز سفر جديد';

  const fillTestData = () => {
    setFormData({
      cardNumber: '4111 1111 1111 1111',
      expiryMonth: '12',
      expiryYear: '2028',
      cvv: '123',
      cardholderName: 'أحمد محمد علي',
      email: 'test@example.com',
      phone: '0501234567'
    });
  };

  const handleInputChange = (field, value) => {
    // Format card number with spaces
    if (field === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Max 16 digits + 3 spaces
    }
    
    // Format CVV (max 4 digits)
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 4) return;
    }

    // Format expiry month/year
    if (field === 'expiryMonth' || field === 'expiryYear') {
      value = value.replace(/\D/g, '');
      if (field === 'expiryMonth' && value.length > 2) return;
      if (field === 'expiryYear' && value.length > 4) return;
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Card number validation
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'رقم البطاقة مطلوب';
    } else if (cardNumber.length < 16) {
      newErrors.cardNumber = 'رقم البطاقة يجب أن يكون 16 رقماً';
    }

    // Expiry validation
    if (!formData.expiryMonth) {
      newErrors.expiryMonth = 'الشهر مطلوب';
    } else if (parseInt(formData.expiryMonth) < 1 || parseInt(formData.expiryMonth) > 12) {
      newErrors.expiryMonth = 'شهر غير صحيح';
    }

    if (!formData.expiryYear) {
      newErrors.expiryYear = 'السنة مطلوبة';
    } else if (formData.expiryYear.length !== 4) {
      newErrors.expiryYear = 'السنة يجب أن تكون 4 أرقام';
    }

    // CVV validation
    if (!formData.cvv) {
      newErrors.cvv = 'رمز الأمان مطلوب';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'رمز الأمان يجب أن يكون 3-4 أرقام';
    }

    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'اسم حامل البطاقة مطلوب';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(05|5)\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (paymentMethod === 'card' && !validateForm()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Update transaction status in localStorage (simulate API update)
      const mockData = JSON.parse(localStorage.getItem('mockTransactionData') || '{}');
      if (mockData[referenceNumber]) {
        mockData[referenceNumber].status = 'appointment_booking';
        mockData[referenceNumber].timeline = mockData[referenceNumber].timeline.map(step => {
          if (step.step === 'payment') {
            return { ...step, completed: true, date: new Date().toISOString().split('T')[0] };
          }
          return step;
        });
        localStorage.setItem('mockTransactionData', JSON.stringify(mockData));
      }
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate(`/track/${referenceNumber}?payment=success`);
      }, 3000);
    }, paymentMethod === 'card' ? 3000 : 2000);
  };

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    return 'unknown';
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0')
  }));

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => ({
    value: String(currentYear + i),
    label: String(currentYear + i)
  }));

  const calculateInstallments = (amount, method) => {
    const numAmount = parseFloat(amount);
    if (method === 'tabby') {
      return (numAmount / 4).toFixed(2);
    } else if (method === 'tamara') {
      return (numAmount / 3).toFixed(2);
    }
    return amount;
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12" dir="rtl">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full mx-4 text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            تم الدفع بنجاح!
          </h2>
          <p className="text-gray-600 mb-6">
            {paymentMethod === 'card' 
              ? 'تم استلام دفعتكم بنجاح. سيتم تحديث حالة المعاملة قريباً.'
              : paymentMethod === 'tabby'
              ? 'تم تأكيد طلب التقسيط مع تابي. ستتلقى رسالة تأكيد قريباً.'
              : 'تم تأكيد طلب التقسيط مع تمارا. ستتلقى رسالة تأكيد قريباً.'
            }
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold">
              رقم المعاملة: {referenceNumber}
            </p>
            <p className="text-green-700">
              {paymentMethod === 'card' 
                ? `المبلغ المدفوع: ${amount} ${currency}`
                : paymentMethod === 'tabby'
                ? `القسط الأول: ${calculateInstallments(amount, 'tabby')} ${currency} (من 4 أقساط)`
                : `القسط الأول: ${calculateInstallments(amount, 'tamara')} ${currency} (من 3 أقساط)`
              }
            </p>
          </div>
          <p className="text-sm text-gray-500">
            سيتم توجيهكم لصفحة التتبع خلال ثوانٍ...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            <span>العودة</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              الدفع الآمن
            </h1>
            <p className="text-gray-600">
              ادفع بأمان باستخدام الفيزا أو ماستر كارد
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Security Header */}
              <div className="bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-6">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Shield className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold">دفع آمن ومشفر</h3>
                    <p className="text-white/90 text-sm">محمي بتشفير SSL 256-bit</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    اختر طريقة الدفع *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Credit Card */}
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'card' 
                        ? 'border-[#276073] bg-[#276073]/5' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <CreditCard className={`w-8 h-8 mb-2 ${
                        paymentMethod === 'card' ? 'text-[#276073]' : 'text-gray-400'
                      }`} />
                      <span className="font-semibold text-gray-900">بطاقة ائتمانية</span>
                      <span className="text-sm text-gray-600 text-center mt-1">
                        فيزا • ماستر كارد • مدى
                      </span>
                    </label>

                    {/* Tabby */}
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'tabby' 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="tabby"
                        checked={paymentMethod === 'tabby'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 mb-2 rounded-full flex items-center justify-center font-bold text-white ${
                        paymentMethod === 'tabby' ? 'bg-orange-500' : 'bg-gray-400'
                      }`}>
                        T
                      </div>
                      <span className="font-semibold text-gray-900">تابي</span>
                      <span className="text-sm text-gray-600 text-center mt-1">
                        4 دفعات بدون فوائد
                      </span>
                      <span className="text-xs text-orange-600 font-semibold mt-1">
                        {calculateInstallments(amount, 'tabby')} {currency} × 4
                      </span>
                    </label>

                    {/* Tamara */}
                    <label className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'tamara' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="tamara"
                        checked={paymentMethod === 'tamara'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`w-8 h-8 mb-2 rounded-full flex items-center justify-center font-bold text-white ${
                        paymentMethod === 'tamara' ? 'bg-green-500' : 'bg-gray-400'
                      }`}>
                        T
                      </div>
                      <span className="font-semibold text-gray-900">تمارا</span>
                      <span className="text-sm text-gray-600 text-center mt-1">
                        3 دفعات بدون فوائد
                      </span>
                      <span className="text-xs text-green-600 font-semibold mt-1">
                        {calculateInstallments(amount, 'tamara')} {currency} × 3
                      </span>
                    </label>
                  </div>
                </div>

                {/* Installment Details */}
                {paymentMethod !== 'card' && (
                  <div className={`p-4 rounded-lg border ${
                    paymentMethod === 'tabby' 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`font-semibold mb-3 ${
                      paymentMethod === 'tabby' ? 'text-orange-800' : 'text-green-800'
                    }`}>
                      تفاصيل التقسيط
                    </h4>
                    <div className="space-y-2 text-sm">
                      {paymentMethod === 'tabby' ? (
                        <>
                          <div className="flex justify-between">
                            <span>الدفعة الأولى (اليوم):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tabby')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الدفعة الثانية (بعد أسبوع):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tabby')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الدفعة الثالثة (بعد أسبوعين):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tabby')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الدفعة الرابعة (بعد 3 أسابيع):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tabby')} {currency}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span>الدفعة الأولى (اليوم):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tamara')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الدفعة الثانية (بعد شهر):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tamara')} {currency}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>الدفعة الثالثة (بعد شهرين):</span>
                            <span className="font-semibold">{calculateInstallments(amount, 'tamara')} {currency}</span>
                          </div>
                        </>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>المجموع:</span>
                          <span>{amount} {currency}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Credit Card Form - Only show when card is selected */}
                {paymentMethod === 'card' && (
                  <div className="space-y-6">
                    {/* Test Data Button */}
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={fillTestData}
                        className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200"
                      >
                        ملء البيانات التجريبية
                      </button>
                    </div>

                    {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم البطاقة *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                        errors.cardNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute top-3 right-4">
                      {getCardType(formData.cardNumber) === 'visa' && (
                        <div className="w-8 h-5 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
                          VISA
                        </div>
                      )}
                      {getCardType(formData.cardNumber) === 'mastercard' && (
                        <div className="w-8 h-5 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded">
                          MC
                        </div>
                      )}
                      {getCardType(formData.cardNumber) === 'unknown' && (
                        <CreditCard className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>
                  )}
                </div>

                    {/* Expiry and CVV */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الشهر *
                    </label>
                    <select
                      value={formData.expiryMonth}
                      onChange={(e) => handleInputChange('expiryMonth', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                        errors.expiryMonth ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">شهر</option>
                      {months.map(month => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    {errors.expiryMonth && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryMonth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      السنة *
                    </label>
                    <select
                      value={formData.expiryYear}
                      onChange={(e) => handleInputChange('expiryYear', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                        errors.expiryYear ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">سنة</option>
                      {years.map(year => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                    {errors.expiryYear && (
                      <p className="mt-1 text-sm text-red-600">{errors.expiryYear}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV *
                    </label>
                    <input
                      type="text"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      placeholder="123"
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                        errors.cvv ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                    {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم حامل البطاقة *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="الاسم كما هو مكتوب على البطاقة"
                      className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                        errors.cardholderName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    <User className="absolute top-3.5 right-4 w-5 h-5 text-gray-400" />
                  </div>
                  {errors.cardholderName && (
                    <p className="mt-1 text-sm text-red-600">{errors.cardholderName}</p>
                  )}
                </div>

                    {/* Contact Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    معلومات الاتصال
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="example@email.com"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                          errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رقم الهاتف *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="05xxxxxxxx"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all duration-200 ${
                          errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                  </div>
                )}

                {/* Submit Button */}
                <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>
                        {paymentMethod === 'card' 
                          ? `ادفع ${amount} ${currency}`
                          : paymentMethod === 'tabby'
                          ? `ادفع ${calculateInstallments(amount, 'tabby')} ${currency} الآن`
                          : `ادفع ${calculateInstallments(amount, 'tamara')} ${currency} الآن`
                        }
                      </span>
                    </>
                  )}
                </button>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                ملخص الطلب
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم المعاملة:</span>
                  <span className="font-semibold">{referenceNumber}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع الخدمة:</span>
                  <span className="font-semibold">{serviceType}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع:</span>
                    <span className="text-[#276073]">{amount} {currency}</span>
                  </div>
                </div>
              </div>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">الأمان والحماية</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>تشفير SSL 256-bit</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Lock className="w-4 h-4 text-green-500" />
                    <span>دفع آمن ومحمي</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>معتمد من البنوك السعودية</span>
                  </div>
                </div>
              </div>

              {/* Accepted Cards */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4">البطاقات المقبولة</h4>
                <div className="flex flex-wrap gap-2">
                  <div className="w-12 h-8 bg-blue-600 text-white text-xs font-bold flex items-center justify-center rounded">
                    VISA
                  </div>
                  <div className="w-12 h-8 bg-red-500 text-white text-xs font-bold flex items-center justify-center rounded">
                    MC
                  </div>
                  <div className="w-12 h-8 bg-gray-600 text-white text-xs font-bold flex items-center justify-center rounded">
                    MADA
                  </div>
                  <div className="w-12 h-8 bg-orange-500 text-white text-xs font-bold flex items-center justify-center rounded">
                    تابي
                  </div>
                  <div className="w-12 h-8 bg-green-500 text-white text-xs font-bold flex items-center justify-center rounded">
                    تمارا
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;