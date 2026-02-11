import React, { useState, useEffect } from 'react';
import { CreditCard, Wallet, Building, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PaymentProcessor = ({ application, onPaymentComplete }) => {
  const [loading, setLoading] = useState(false);
  const [existingPayment, setExistingPayment] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('credit_card');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const paymentMethods = [
    { id: 'credit_card', name: 'بطاقة ائتمان', icon: CreditCard, color: 'bg-blue-500' },
    { id: 'mada', name: 'مدى', icon: CreditCard, color: 'bg-green-500' },
    { id: 'apple_pay', name: 'Apple Pay', icon: Wallet, color: 'bg-gray-800' },
    { id: 'stc_pay', name: 'STC Pay', icon: Wallet, color: 'bg-purple-500' },
    { id: 'bank_transfer', name: 'تحويل بنكي', icon: Building, color: 'bg-orange-500' }
  ];

  useEffect(() => {
    checkExistingPayment();
  }, [application.id]);

  const checkExistingPayment = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('application_id', application.id)
        .eq('payment_status', 'completed')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setExistingPayment(data);
      }
    } catch (err) {
      console.error('Error checking payment:', err);
    }
  };

  const calculateAmount = () => {
    let baseAmount = application.service_fee || 0;

    if (application.form_data?.applicantAge) {
      const age = parseInt(application.form_data.applicantAge);
      if (age < 16 && application.child_fee) {
        baseAmount = application.child_fee;
      }
    }

    const additionalFees = application.form_data?.additionalServices || 0;
    return baseAmount + additionalFees;
  };

  const amount = calculateAmount();

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          application_id: application.id,
          amount: amount,
          currency: 'SAR',
          payment_method: selectedMethod,
          payment_status: 'completed',
          transaction_id: transactionId,
          payment_gateway: getGatewayName(selectedMethod),
          payment_date: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: 'payment_completed' })
        .eq('id', application.id);

      if (updateError) throw updateError;

      setExistingPayment(paymentData);
      setShowSuccess(true);

      setTimeout(() => {
        if (onPaymentComplete) {
          onPaymentComplete(paymentData);
        }
      }, 2000);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('حدث خطأ في معالجة الدفع. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getGatewayName = (method) => {
    const gateways = {
      credit_card: 'Visa/MasterCard',
      mada: 'Mada',
      apple_pay: 'Apple Pay',
      stc_pay: 'STC Pay',
      bank_transfer: 'Bank Transfer'
    };
    return gateways[method] || 'Unknown';
  };

  if (existingPayment && !showSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="text-xl font-bold text-gray-900">تم الدفع بنجاح</h3>
              <p className="text-sm text-gray-600 mt-1">تم استلام دفعتك وتأكيدها</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">رقم العملية</span>
            <span className="font-mono font-semibold text-gray-900">{existingPayment.transaction_id}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">المبلغ المدفوع</span>
            <span className="font-semibold text-green-600 text-lg">{existingPayment.amount} ريال</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">طريقة الدفع</span>
            <span className="font-semibold text-gray-900">{getGatewayName(existingPayment.payment_method)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">تاريخ الدفع</span>
            <span className="font-semibold text-gray-900">
              {new Date(existingPayment.payment_date).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>الخطوة التالية:</strong> سيتم معالجة طلبك. ستتلقى إشعاراً عند اكتمال المعالجة.
          </p>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-bounce" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">تمت عملية الدفع بنجاح!</h3>
        <p className="text-gray-600 mb-4">تم استلام دفعتك وسيتم معالجة طلبك الآن</p>
        <div className="inline-block animate-spin">
          <Loader className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-sm text-gray-500 mt-2">جاري تحديث الصفحة...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">إتمام عملية الدفع</h3>
        <p className="text-gray-600">اختر طريقة الدفع المناسبة لك</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 rtl:space-x-reverse">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">المبلغ الإجمالي</p>
            <p className="text-3xl font-bold text-green-600">{amount} ريال</p>
          </div>
          <CreditCard className="w-12 h-12 text-green-600 opacity-50" />
        </div>
        <div className="mt-4 pt-4 border-t border-green-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">رسوم الخدمة</span>
            <span className="font-semibold">{application.service_fee || 0} ريال</span>
          </div>
          {application.form_data?.additionalServices > 0 && (
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">خدمات إضافية</span>
              <span className="font-semibold">{application.form_data.additionalServices} ريال</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">اختر طريقة الدفع</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMethod === method.id
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className={`w-10 h-10 rounded-lg ${method.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="font-semibold text-gray-900">{method.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">ملاحظات هامة:</h4>
        <ul className="text-sm text-yellow-700 space-y-1 pr-5 list-disc">
          <li>تأكد من صحة المبلغ قبل إتمام الدفع</li>
          <li>سيتم إرسال إيصال الدفع عبر البريد الإلكتروني</li>
          <li>المبالغ المدفوعة غير قابلة للاسترداد إلا في حالات خاصة</li>
          <li>احتفظ برقم العملية للرجوع إليه عند الحاجة</li>
        </ul>
      </div>

      <button
        onClick={handlePayment}
        disabled={loading || !selectedMethod}
        className="w-full px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold text-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            <span>جاري المعالجة...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            <span>إتمام الدفع - {amount} ريال</span>
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500 mt-4">
        بالضغط على "إتمام الدفع" فإنك توافق على الشروط والأحكام
      </p>
    </div>
  );
};

export default PaymentProcessor;
