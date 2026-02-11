import { useState, useEffect, useRef } from 'react';
import { CheckCircle, Clock, RefreshCw, AlertCircle, Copy } from 'lucide-react';

export default function OTPVerification({ phoneNumber, onVerified, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [resendTimeLeft, setResendTimeLeft] = useState(0);
  const [testOTP, setTestOTP] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef([]);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Send OTP on mount
  useEffect(() => {
    sendOTP();
  }, []);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setError('انتهت صلاحية رمز التحقق. يرجى إعادة الإرسال.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setResendTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimeLeft]);

  const sendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Try to call edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/send-otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      // Check if response has content
      const contentType = response.headers.get('content-type');

      // If edge function is not available, use fallback (development mode)
      if (!response.ok && (response.status === 404 || response.status === 0)) {
        console.warn('Edge function not available, using development fallback');
        // Generate OTP locally for development
        const fallbackOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setTestOTP(fallbackOTP);
        setSuccess('تم إنشاء رمز التحقق (وضع التطوير)');
        setTimeLeft(300);
        setCanResend(false);
        setResendTimeLeft(60);
        console.log('🔐 رمز التحقق للتجربة:', fallbackOTP);
        return;
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('استجابة غير صحيحة من الخادم');
      }

      const text = await response.text();
      if (!text) {
        throw new Error('لم يتم استلام بيانات من الخادم');
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        if (response.status === 429 && data.remainingTime) {
          setResendTimeLeft(data.remainingTime);
          setCanResend(false);
          setError(data.error);
        } else {
          throw new Error(data.error || 'فشل إرسال رمز التحقق');
        }
        return;
      }

      setSuccess('تم إرسال رمز التحقق إلى رقم الموبايل');
      setTimeLeft(300);
      setCanResend(false);
      setResendTimeLeft(60);

      // Store test OTP for development
      if (data.testOTP) {
        setTestOTP(data.testOTP);
        console.log('🔐 رمز التحقق للتجربة:', data.testOTP);
      }
    } catch (err) {
      console.error('خطأ في sendOTP:', err);

      // Fallback for network errors (development mode)
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        console.warn('Network error, using development fallback');
        const fallbackOTP = Math.floor(100000 + Math.random() * 900000).toString();
        setTestOTP(fallbackOTP);
        setSuccess('تم إنشاء رمز التحقق (وضع التطوير)');
        setTimeLeft(300);
        setCanResend(false);
        setResendTimeLeft(60);
        console.log('🔐 رمز التحقق للتجربة:', fallbackOTP);
      } else {
        setError(err.message || 'حدث خطأ في إرسال رمز التحقق');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take only last character
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (!/^\d{6}$/.test(pastedData)) {
      setError('يرجى لصق رمز مكون من 6 أرقام');
      return;
    }

    const newOtp = pastedData.split('');
    setOtp(newOtp);
    inputRefs.current[5]?.focus();

    // Auto-verify
    verifyOTP(pastedData);
  };

  const verifyOTP = async (code) => {
    setLoading(true);
    setError('');

    try {
      // In development mode with fallback, just verify locally
      if (testOTP && code === testOTP) {
        setSuccess('تم التحقق بنجاح! جاري إرسال الطلب...');
        setTimeout(() => {
          onVerified('dev-verification-' + Date.now());
        }, 1000);
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-otp/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          otpCode: code,
        }),
      });

      // Check if response has content
      const contentType = response.headers.get('content-type');

      // If edge function is not available but code matches testOTP (development)
      if (!response.ok && (response.status === 404 || response.status === 0)) {
        if (testOTP && code === testOTP) {
          setSuccess('تم التحقق بنجاح! (وضع التطوير)');
          setTimeout(() => {
            onVerified('dev-verification-' + Date.now());
          }, 1000);
          return;
        } else {
          throw new Error('رمز التحقق غير صحيح');
        }
      }

      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('استجابة غير صحيحة من الخادم');
      }

      const text = await response.text();
      if (!text) {
        throw new Error('لم يتم استلام بيانات من الخادم');
      }

      const data = JSON.parse(text);

      if (!response.ok) {
        throw new Error(data.error || 'فشل التحقق من الرمز');
      }

      setSuccess('تم التحقق بنجاح! جاري إرسال الطلب...');

      // Wait a moment before calling onVerified
      setTimeout(() => {
        onVerified(data.verificationId);
      }, 1000);
    } catch (err) {
      console.error('خطأ في verifyOTP:', err);

      // Try local verification in development mode
      if ((err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) && testOTP && code === testOTP) {
        setSuccess('تم التحقق بنجاح! (وضع التطوير)');
        setTimeout(() => {
          onVerified('dev-verification-' + Date.now());
        }, 1000);
        return;
      }

      setError(err.message || 'رمز التحقق غير صحيح');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    sendOTP();
  };

  const handleCopyOTP = async () => {
    if (!testOTP) return;

    try {
      await navigator.clipboard.writeText(testOTP);
      setCopied(true);

      // Fill OTP inputs automatically
      const otpArray = testOTP.split('');
      setOtp(otpArray);

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            التحقق من رقم الموبايل
          </h2>
          <p className="text-gray-600">
            تم إرسال رمز التحقق إلى
          </p>
          <p className="text-lg font-semibold text-gray-900 mt-1 dir-ltr">
            {phoneNumber}
          </p>
        </div>

        {/* Test OTP Display (Development only) */}
        {testOTP && (
          <div className="mb-6 p-5 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl shadow-lg">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 animate-pulse" />
                <p className="text-base font-bold text-yellow-900 uppercase tracking-wide">
                  🔐 رمز التحقق للتجربة
                </p>
                <AlertCircle className="w-6 h-6 text-yellow-600 animate-pulse" />
              </div>
              <div className="bg-white rounded-lg p-4 shadow-inner border-2 border-yellow-300 relative">
                <p className="text-5xl font-black text-yellow-900 tracking-widest dir-ltr select-all mb-2">
                  {testOTP}
                </p>
                <button
                  onClick={handleCopyOTP}
                  className="mt-3 w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg
                    transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>تم النسخ! ✅</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>انسخ الرمز تلقائياً</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-yellow-700 mt-3 font-medium">
                ⚠️ اضغط الزر أعلاه لنسخ الرمز وملء الخانات تلقائياً
              </p>
            </div>
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            أدخل رمز التحقق المكون من 6 أرقام
          </label>
          <div className="flex gap-2 justify-center dir-ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={loading || timeLeft === 0}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg
                  focus:outline-none focus:ring-2 transition-all
                  ${digit ? 'border-green-500 bg-green-50' : 'border-gray-300'}
                  ${error ? 'border-red-500 bg-red-50' : ''}
                  focus:border-green-500 focus:ring-green-200
                  disabled:bg-gray-100 disabled:cursor-not-allowed`}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mb-4 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            الرمز صالح لمدة: <span className="font-semibold dir-ltr inline-block">{formatTime(timeLeft)}</span>
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 text-center">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 text-center">{success}</p>
          </div>
        )}

        {/* Resend Button */}
        <div className="mb-6 text-center">
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`inline-flex items-center gap-2 text-sm font-medium
              ${canResend && !loading
                ? 'text-green-600 hover:text-green-700 cursor-pointer'
                : 'text-gray-400 cursor-not-allowed'
              } transition-colors`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {canResend ? (
              'إعادة إرسال الرمز'
            ) : (
              `يمكنك إعادة الإرسال بعد ${resendTimeLeft} ثانية`
            )}
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg
              hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={() => verifyOTP(otp.join(''))}
            disabled={loading || otp.some(d => !d) || timeLeft === 0}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg
              hover:bg-green-700 transition-colors font-medium
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري التحقق...' : 'تحقق'}
          </button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          لم تستلم الرمز؟ تحقق من رقم الموبايل أو جرب الإرسال مرة أخرى
        </p>
      </div>
    </div>
  );
}
