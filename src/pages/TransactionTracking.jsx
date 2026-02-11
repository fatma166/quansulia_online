import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, User, Phone, Mail, FileText, AlertCircle, Download, Printer as Print, Calendar, MapPin, XCircle, DollarSign } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';
import AppointmentBooking from '../components/AppointmentBooking';
import ShippingTracker from '../components/ShippingTracker';
import PaymentProcessor from '../components/PaymentProcessor';
import ProcessingStatus from '../components/ProcessingStatus';
import RejectionDetails from '../components/RejectionDetails';
import ReviewStatus from '../components/ReviewStatus';
import Header from '../components/Header';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import EducationalCard from '../components/EducationalCard';
import InvoicePDF from '../components/InvoicePDF';
import { useStatuses } from '../hooks/useStatuses';

const TransactionTracking = () => {
  const { referenceNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(referenceNumber || searchParams.get('ref') || '');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [educationalCard, setEducationalCard] = useState(null);
  const [pricingSummary, setPricingSummary] = useState(null);
  const [pricingItems, setPricingItems] = useState([]);
  const [invoice, setInvoice] = useState(null);
  const [showInvoicePDF, setShowInvoicePDF] = useState(false);

  const { getStatusLabel, getStatusColor, getStatusIcon, getStatusByKey } = useStatuses();

  const handleDownloadCard = async () => {
    const cardElement = document.getElementById('educational-card-print');
    if (!cardElement) return;

    try {
      // Capture the card as an image with higher quality
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions for PDF (A4 landscape)
      const imgWidth = 297; // A4 landscape width in mm
      const imgHeight = 210; // A4 landscape height in mm

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download the PDF
      const fileName = `educational-card-${educationalCard?.card_number || 'unknown'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء تحميل البطاقة. الرجاء المحاولة مرة أخرى.');
    }
  };

  useEffect(() => {
    const shouldAutoSearch = searchQuery && (referenceNumber || searchParams.get('ref'));
    console.log('Component mounted. Auto-search:', shouldAutoSearch, 'Query:', searchQuery);

    if (shouldAutoSearch) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setApplication(null);
    setStatusHistory([]);

    try {
      console.log('Searching for reference:', searchQuery.trim());

      const { data, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('reference_number', searchQuery.trim())
        .maybeSingle();

      console.log('Search result:', { data, error: fetchError });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      if (!data) {
        console.log('No application found');
        setError('لم يتم العثور على الطلب');
        setLoading(false);
        return;
      }

      console.log('Application found:', data);
      setApplication(data);
      await loadStatusHistory(data.id);
      await loadEducationalCard(data.id);
      await loadPricingData(data.id);
      await loadInvoice(data.id);
    } catch (err) {
      console.error('Error fetching application:', err);
      setError('حدث خطأ في البحث عن الطلب');
    } finally {
      setLoading(false);
    }
  };

  const loadStatusHistory = async (applicationId) => {
    try {
      console.log('Loading status history for application:', applicationId);

      const { data, error } = await supabase
        .from('status_history')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      console.log('Status history result:', { data, error });

      if (error) {
        console.error('Status history error:', error);
        throw error;
      }

      setStatusHistory(data || []);
      console.log('Status history loaded successfully:', data?.length || 0, 'records');
    } catch (err) {
      console.error('Error loading status history:', err);
      // Don't fail the whole search if status history fails
      setStatusHistory([]);
    }
  };

  const loadEducationalCard = async (applicationId) => {
    try {
      const { data, error } = await supabase
        .from('educational_cards')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (!error && data) {
        setEducationalCard(data);
      }
    } catch (err) {
      console.error('Error loading educational card:', err);
      setEducationalCard(null);
    }
  };

  const loadPricingData = async (applicationId) => {
    try {
      const { data: summary, error: summaryError } = await supabase
        .from('application_pricing_summary')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (!summaryError && summary) {
        setPricingSummary(summary);

        const { data: items, error: itemsError } = await supabase
          .from('application_pricing_items')
          .select('*')
          .eq('application_id', applicationId)
          .order('order_index');

        if (!itemsError && items) {
          setPricingItems(items);
        }
      }
    } catch (err) {
      console.error('Error loading pricing data:', err);
      setPricingSummary(null);
      setPricingItems([]);
    }
  };

  const loadInvoice = async (applicationId) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('application_id', applicationId)
        .maybeSingle();

      if (!error && data) {
        setInvoice(data);
      }
    } catch (err) {
      console.error('Error loading invoice:', err);
      setInvoice(null);
    }
  };

  const getTimelineSteps = () => {
    const steps = [];

    steps.push({
      key: 'submitted',
      label: 'تم التقديم',
      completed: true,
      date: application?.submission_date,
      icon: FileText
    });

    const statusOrder = [
      'submitted', 'in_review', 'approved', 'payment_pending', 'payment_completed',
      'appointment_required', 'appointment_booked', 'processing', 'ready',
      'shipping', 'shipped', 'delivered', 'completed'
    ];

    const currentStatusIndex = statusOrder.indexOf(application?.status);
    const rejectedOrCancelled = ['rejected', 'cancelled'].includes(application?.status);

    if (rejectedOrCancelled) {
      steps.push({
        key: 'in_review',
        label: 'قيد المراجعة',
        completed: true,
        date: statusHistory.find(h => h.new_status === 'in_review')?.created_at,
        icon: Search
      });

      steps.push({
        key: application?.status,
        label: getStatusLabel(application?.status),
        completed: true,
        date: statusHistory.find(h => h.new_status === application?.status)?.created_at,
        icon: XCircle
      });

      return steps;
    }

    if (currentStatusIndex >= 1) {
      steps.push({
        key: 'in_review',
        label: 'قيد المراجعة',
        completed: currentStatusIndex >= 1,
        date: statusHistory.find(h => h.new_status === 'in_review')?.created_at,
        icon: Search
      });
    }

    if (currentStatusIndex >= 2 || statusHistory.some(h => h.new_status === 'approved')) {
      steps.push({
        key: 'approved',
        label: 'تمت الموافقة',
        completed: currentStatusIndex >= 2,
        date: statusHistory.find(h => h.new_status === 'approved')?.created_at,
        icon: CheckCircle
      });
    }

    const hasPayment = ['payment_pending', 'payment_completed'].includes(application?.status) ||
                       statusHistory.some(h => ['payment_pending', 'payment_completed'].includes(h.new_status));

    if (hasPayment) {
      steps.push({
        key: 'payment',
        label: currentStatusIndex >= statusOrder.indexOf('payment_completed') ? 'تم الدفع' : 'في انتظار الدفع',
        completed: currentStatusIndex >= statusOrder.indexOf('payment_completed'),
        date: statusHistory.find(h => h.new_status === 'payment_completed')?.created_at ||
              statusHistory.find(h => h.new_status === 'payment_pending')?.created_at,
        icon: CheckCircle
      });
    }

    const hasAppointment = ['appointment_required', 'appointment_booked'].includes(application?.status) ||
                          statusHistory.some(h => ['appointment_required', 'appointment_booked'].includes(h.new_status));

    if (hasAppointment) {
      steps.push({
        key: 'appointment',
        label: currentStatusIndex >= statusOrder.indexOf('appointment_booked') ? 'تم حجز الموعد' : 'حجز الموعد',
        completed: currentStatusIndex >= statusOrder.indexOf('appointment_booked'),
        date: statusHistory.find(h => h.new_status === 'appointment_booked')?.created_at ||
              statusHistory.find(h => h.new_status === 'appointment_required')?.created_at,
        icon: Calendar
      });
    }

    if (currentStatusIndex >= statusOrder.indexOf('processing') ||
        statusHistory.some(h => h.new_status === 'processing')) {
      steps.push({
        key: 'processing',
        label: 'قيد المعالجة',
        completed: currentStatusIndex >= statusOrder.indexOf('processing'),
        date: statusHistory.find(h => h.new_status === 'processing')?.created_at,
        icon: Clock
      });
    }

    const hasShipping = ['shipping', 'shipped', 'delivered'].includes(application?.status) ||
                       statusHistory.some(h => ['shipping', 'shipped', 'delivered'].includes(h.new_status));

    if (hasShipping) {
      if (currentStatusIndex >= statusOrder.indexOf('ready') || statusHistory.some(h => h.new_status === 'ready')) {
        steps.push({
          key: 'ready',
          label: 'جاهز للشحن',
          completed: currentStatusIndex >= statusOrder.indexOf('ready'),
          date: statusHistory.find(h => h.new_status === 'ready')?.created_at,
          icon: CheckCircle
        });
      }

      steps.push({
        key: 'shipping',
        label: currentStatusIndex >= statusOrder.indexOf('delivered') ? 'تم التوصيل' :
               currentStatusIndex >= statusOrder.indexOf('shipped') ? 'تم الشحن' : 'جاري الشحن',
        completed: currentStatusIndex >= statusOrder.indexOf('shipped'),
        date: statusHistory.find(h => h.new_status === 'delivered')?.created_at ||
              statusHistory.find(h => h.new_status === 'shipped')?.created_at ||
              statusHistory.find(h => h.new_status === 'shipping')?.created_at,
        icon: MapPin
      });
    } else if (currentStatusIndex >= statusOrder.indexOf('ready') || statusHistory.some(h => h.new_status === 'ready')) {
      steps.push({
        key: 'ready',
        label: 'جاهز للاستلام',
        completed: currentStatusIndex >= statusOrder.indexOf('ready'),
        date: statusHistory.find(h => h.new_status === 'ready')?.created_at,
        icon: CheckCircle
      });
    }

    if (application?.status === 'completed' || statusHistory.some(h => h.new_status === 'completed')) {
      steps.push({
        key: 'completed',
        label: 'مكتمل',
        completed: application?.status === 'completed',
        date: statusHistory.find(h => h.new_status === 'completed')?.created_at,
        icon: CheckCircle
      });
    }

    return steps;
  };

  const renderStatusSpecificContent = () => {
    switch (application?.status) {
      case 'in_review':
        return <ReviewStatus application={application} />;

      case 'payment_pending':
        return <PaymentProcessor application={application} onPaymentComplete={handleSearch} />;

      case 'appointment_required':
      case 'appointment_confirmed':
        return <AppointmentBooking application={application} onBookingComplete={handleSearch} />;

      case 'processing':
        return <ProcessingStatus application={application} />;

      case 'shipping':
      case 'shipped':
      case 'delivered':
        return <ShippingTracker application={application} />;

      case 'rejected':
        return <RejectionDetails application={application} />;

      case 'cancelled':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-gray-400">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <XCircle className="w-10 h-10 text-gray-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تم إلغاء الطلب</h3>
                <p className="text-gray-600">تم إلغاء هذا الطلب بناءً على طلبك أو لأسباب إدارية.</p>
                <p className="text-sm text-gray-500 mt-4">للمزيد من المعلومات، يرجى التواصل مع خدمة العملاء.</p>
              </div>
            </div>
          </div>
        );

      case 'completed':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-green-500">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">تم إكمال الطلب بنجاح</h3>
                <p className="text-gray-600 mb-4">تم معالجة طلبك بنجاح واكتمل التنفيذ.</p>
                <p className="text-green-600 font-semibold">شكراً لاستخدامك خدمات القنصلية السودانية</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
        <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            تتبع الطلب
          </h1>

          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أدخل رقم الطلب (مثال: SUD-2025-1234)"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute top-3.5 right-4 w-5 h-5 text-gray-400" />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
            >
              {loading ? 'جاري البحث...' : 'بحث'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">جاري البحث...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{error}</h3>
            <p className="text-gray-600 mb-4">
              رقم الطلب "{searchQuery}" غير موجود في النظام
            </p>
            <p className="text-sm text-gray-500">
              تأكد من صحة رقم الطلب أو تواصل مع خدمة العملاء
            </p>
          </div>
        )}

        {application && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {application.service_title}
                  </h2>
                  <p className="text-gray-600">
                    رقم الطلب: {application.reference_number}
                  </p>
                </div>
                <StatusBadge statusKey={application.status} showIcon={true} size="lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">تاريخ التقديم:</span>
                  <span className="font-semibold mr-2">
                    {new Date(application.submission_date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">آخر تحديث:</span>
                  <span className="font-semibold mr-2">
                    {new Date(application.updated_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                {application.estimated_completion && (
                  <div>
                    <span className="text-gray-600">التاريخ المتوقع:</span>
                    <span className="font-semibold mr-2">
                      {new Date(application.estimated_completion).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Details Section */}
            {pricingSummary && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">تفاصيل الرسوم</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {!pricingSummary.is_editable && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        تم الدفع
                      </span>
                    )}
                    {invoice ? (
                      <button
                        onClick={() => setShowInvoicePDF(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>عرض الفاتورة</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>طباعة</span>
                      </button>
                    )}
                  </div>
                </div>

                {pricingItems.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {pricingItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.description}</p>
                          <p className="text-sm text-gray-600">
                            الكمية: {item.quantity} × {parseFloat(item.unit_price).toFixed(2)} ريال
                          </p>
                        </div>
                        <div className="font-bold text-blue-600">
                          {parseFloat(item.total_price).toFixed(2)} ريال
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">المجموع الفرعي:</span>
                    <span className="font-semibold">{parseFloat(pricingSummary.subtotal).toFixed(2)} ريال</span>
                  </div>
                  {parseFloat(pricingSummary.discount) > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>الخصم:</span>
                      <span>- {parseFloat(pricingSummary.discount).toFixed(2)} ريال</span>
                    </div>
                  )}
                  {parseFloat(pricingSummary.tax) > 0 && (
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>الضريبة:</span>
                      <span>+ {parseFloat(pricingSummary.tax).toFixed(2)} ريال</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-blue-600 pt-3 border-t border-blue-200">
                    <span>المبلغ الإجمالي:</span>
                    <span>{parseFloat(pricingSummary.total_amount).toFixed(2)} ريال</span>
                  </div>
                  {pricingSummary.notes && (
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">ملاحظات:</p>
                      <p className="text-sm text-gray-800">{pricingSummary.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6">مراحل الطلب</h3>

              <div className="space-y-4">
                {getTimelineSteps().map((step, index) => {
                  const Icon = step.icon || Clock;
                  return (
                    <div key={step.key} className="flex items-center space-x-4 rtl:space-x-reverse">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">
                            {new Date(step.date).toLocaleDateString('ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {application.form_data && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">بيانات المتقدم</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {application.form_data.fullName && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <User className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">الاسم الكامل</p>
                        <p className="font-semibold">{application.form_data.fullName}</p>
                      </div>
                    </div>
                  )}

                  {application.form_data.nationalId && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <FileText className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">الرقم الوطني</p>
                        <p className="font-semibold">{application.form_data.nationalId}</p>
                      </div>
                    </div>
                  )}

                  {(application.applicant_phone || application.form_data.phoneNumber) && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Phone className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">رقم الهاتف</p>
                        <p className="font-semibold">
                          {application.applicant_phone || application.form_data.phoneNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {(application.applicant_email || application.form_data.email) && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                        <p className="font-semibold">
                          {application.applicant_email || application.form_data.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.form_data.dob && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">تاريخ الميلاد</p>
                        <p className="font-semibold">
                          {new Date(application.form_data.dob).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.applicant_region && (
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">المنطقة</p>
                        <p className="font-semibold">{application.applicant_region}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {renderStatusSpecificContent()}

            {/* Educational Card Display */}
            {educationalCard && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  البطاقة التعليمية
                </h3>
                <EducationalCard
                  card={educationalCard}
                  onPrint={() => window.print()}
                  onDownload={handleDownloadCard}
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Print className="w-5 h-5" />
                <span>طباعة</span>
              </button>

              <button
                onClick={() => {
                  const data = `رقم الطلب: ${application.reference_number}\nالخدمة: ${application.service_title}\nالحالة: ${getStatusLabel(application.status)}`;
                  navigator.clipboard.writeText(data);
                  alert('تم نسخ البيانات');
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse"
              >
                <Download className="w-5 h-5" />
                <span>نسخ البيانات</span>
              </button>
            </div>
          </motion.div>
        )}
        </div>
      </div>
      <Footer />

      {/* Invoice PDF Viewer */}
      {showInvoicePDF && invoice && (
        <InvoicePDF
          invoice={invoice}
          onClose={() => setShowInvoicePDF(false)}
        />
      )}
    </>
  );
};

export default TransactionTracking;
