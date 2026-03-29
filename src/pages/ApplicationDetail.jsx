import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, User, Calendar, MapPin, Phone, Mail, Download, CreditCard as Edit, Trash2, CheckCircle, Clock, XCircle, AlertCircle, Package, Printer, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProcessingStatus from '../components/ProcessingStatus';
import StatusBadge from '../components/StatusBadge';
import AdminApplicationStatusManager from '../components/AdminApplicationStatusManager';
import ShippingModal from '../components/ShippingModal';
import RejectionDetails from '../components/RejectionDetails';
import InvoiceModal from '../components/InvoiceModal';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isSuperAdmin, canAccessStatus } = useAuth();

  const [application, setApplication] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    if (id) {
      loadApplicationDetail();
    }
  }, [id]);

  const loadApplicationDetail = async () => {
    try {
      setLoading(true);

      // Fetch application
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (appError) {
        console.error('Error fetching application:', appError);
        throw appError;
      }

      if (!appData) {
        console.log('Application not found with ID:', id);
        navigate('/admin/applications');
        return;
      }

      setApplication(appData);

      // Fetch service data separately if service_id exists
      if (appData.service_id) {
        const { data: serviceData, error: serviceError } = await supabase
          .from('services')
          .select('id, name_ar, name_en, slug')
          .eq('slug', appData.service_id)
          .maybeSingle();

        if (!serviceError && serviceData) {
          setService(serviceData);
        }
      }

      // Load status history
      const { data: historyData, error: historyError } = await supabase
        .from('status_history')
        .select('*')
        .eq('application_id', id)
        .order('created_at', { ascending: false });

      if (!historyError && historyData) {
        // Fetch status details for each history entry
        const historyWithStatuses = await Promise.all(
          historyData.map(async (history) => {
            const { data: statusData } = await supabase
              .from('application_statuses')
              .select('name_ar, name_en, color')
              .eq('id', history.status_id)
              .maybeSingle();

            return {
              ...history,
              application_statuses: statusData
            };
          })
        );
        setStatusHistory(historyWithStatuses);
      }

      // Load appointment if exists
      if (appData.status === 'appointment_required' || appData.status === 'appointment_booked') {
        const { data: appointmentData } = await supabase
          .from('appointments')
          .select('*')
          .eq('application_id', id)
          .maybeSingle();

        if (appointmentData) {
          setAppointment(appointmentData);
        }
      }
    } catch (error) {
      console.error('Error loading application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الطلب غير موجود</h2>
          <button
            onClick={() => navigate('/admin/applications')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            العودة إلى قائمة الطلبات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/applications')}
            className="flex items-center text-sm text-gray-600 hover:text-blue-600"
          >
            <span>الصفحة الرئيسية</span>
            <ArrowLeft className="w-4 h-4 mx-2 rotate-180" />
            <span className="text-blue-600">الطلبات</span>
          </button>
        </div>

        {/* Header with title and actions */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {service?.name_ar || application.service_title || 'جوازات السفر'}
                </h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>رقم المعاملة:</span>
                  <span className="text-blue-600 font-medium">
                    {application.reference_number || `REF-${new Date(application.created_at).getFullYear()}${application.id?.slice(0, 4)}`}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Printer className="w-4 h-4" />
                  <span className="text-sm">طباعة</span>
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm">تحميل السجل</span>
                </button>
              </div>
            </div>

            {/* Info Cards Row */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">تاريخ التقديم</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(application.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">الإصدار الحالي</p>
                <p className="text-sm font-semibold text-gray-900">غير محدد</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">آخر تحديث</p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(application.updated_at || application.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">الرسوم</p>
                <p className="text-sm font-semibold text-gray-900">
                  {application.total_price || '300'} ريال سعودي
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Appointment Info Card */}
            {(appointment || application.status === 'appointment_required' || application.status === 'appointment_booked') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-green-800">معلومات الموعد</span>
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                    موعد
                  </span>
                </div>

                {appointment ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-0.5">الموقع</p>
                        <p className="text-sm font-semibold text-gray-900">
                          القنصلية - منطقة الرياض
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-0.5">الوقت</p>
                        <p className="text-sm font-semibold text-gray-900">{appointment.appointment_time || '09:30 - 09:00'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-0.5">التاريخ الميلادي</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(appointment.appointment_date).toLocaleDateString('ar-SA', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-0.5">التاريخ الهجري</p>
                        <p className="text-sm font-semibold text-gray-900">27 شعبان 1447 هـ</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-600 mb-3">يتطلب طلبك حجز موعد</p>
                    <button
                      onClick={() => navigate(`/admin/appointments/daily`)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      حجز موعد الآن
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* Applicant Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">بيانات المتقدم</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {/* Display all form fields */}
                {application.form_data && Object.entries(application.form_data)
                  .filter(([key, value]) => {
                    // Filter out documents and complex objects
                    if (typeof value === 'object' && value !== null) return false;
                    if (key.toLowerCase().includes('document')) return false;
                    if (key.toLowerCase().includes('file')) return false;
                    return true;
                  })
                  .map(([key, value]) => {
                    // Create label mapping for common fields
                    const labelMap = {
                      'fullName': 'الاسم الكامل',
                      'full_name': 'الاسم الكامل',
                      'name': 'الاسم',
                      'email': 'البريد الإلكتروني',
                      'phone': 'رقم الهاتف',
                      'phoneNumber': 'رقم الهاتف',
                      'phone_number': 'رقم الهاتف',
                      'nationalId': 'رقم الهوية',
                      'national_id': 'رقم الهوية',
                      'passportNumber': 'رقم الجواز',
                      'passport_number': 'رقم الجواز',
                      'birthDate': 'تاريخ الميلاد',
                      'birth_date': 'تاريخ الميلاد',
                      'dateOfBirth': 'تاريخ الميلاد',
                      'date_of_birth': 'تاريخ الميلاد',
                      'address': 'العنوان',
                      'city': 'المدينة',
                      'nationality': 'الجنسية',
                      'gender': 'الجنس',
                      'maritalStatus': 'الحالة الاجتماعية',
                      'marital_status': 'الحالة الاجتماعية',
                    };

                    const label = labelMap[key] || key;

                    return (
                      <div key={key} className="flex items-start gap-3 pb-3 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">{label}</p>
                          <p className="text-sm font-medium text-gray-900">{value || 'غير محدد'}</p>
                        </div>
                      </div>
                    );
                  })}

                {/* Region */}
                {application.applicant_region && (
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">المنطقة</p>
                      <p className="text-sm font-medium text-gray-900">{application.applicant_region}</p>
                    </div>
                  </div>
                )}

                {/* Total Price */}
                {application.total_price && (
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-1">المبلغ الإجمالي</p>
                      <p className="text-sm font-medium text-emerald-600">{application.total_price} ريال سعودي</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Processing Status */}
            {application.status && application.status !== 'appointment_required' && application.status !== 'appointment_booked' && (
              <ProcessingStatus application={application} />
            )}

            {/* Rejection Details */}
            {application.status === 'rejected' && (
              <RejectionDetails applicationId={application.id} />
            )}

            {/* Documents */}
            {application.documents && Object.keys(application.documents).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-700" />
                  <h2 className="text-lg font-bold text-gray-900">المستندات المرفقة</h2>
                </div>

                <div className="space-y-2">
                  {Object.entries(application.documents).map(([docName, docUrl]) => (
                    <a
                      key={docName}
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate">{docName}</span>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            {(isSuperAdmin || canAccessStatus(application.status)) && (
              <AdminApplicationStatusManager
                application={application}
                onUpdate={loadApplicationDetail}
              />
            )}

            {/* Activity Log */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 ml-2 text-gray-700" />
                سجل الأنشطة
              </h3>

              <div className="space-y-4">
                {/* Activity Item - Approved */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">تغيير الحالة إلى / تمت</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">صباح اليوم</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      تم تغيير حالة الطلب بنجاح الى المرحلة التالية
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>الموظف: مدير النظام</span>
                    </div>
                  </div>
                </div>

                {/* Activity Item - Submitted */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900">تم تقديم الطلب</p>
                      <span className="text-xs text-gray-400 whitespace-nowrap">صباح اليوم</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      تم تقديم الطلب بنجاح الى المرحلة التالية من معالجته
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="w-3 h-3" />
                      <span>المستخدم</span>
                    </div>
                  </div>
                </div>

                {statusHistory.length > 0 && statusHistory.slice(0, 3).map((history, index) => (
                  <div key={history.id} className="flex gap-3">
                    <div
                      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: history.application_statuses?.color ? `${history.application_statuses.color}20` : '#F3F4F6' }}
                    >
                      <Clock className="w-4 h-4" style={{ color: history.application_statuses?.color || '#6B7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {history.application_statuses?.name_ar || 'تحديث الحالة'}
                        </p>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(history.created_at).toLocaleDateString('ar-SA', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-xs text-gray-600 mb-1">{history.notes}</p>
                      )}
                      {history.staff_name && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <User className="w-3 h-3" />
                          <span>الموظف: {history.staff_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>

              <div className="space-y-2">
                <button
                  onClick={() => setShowShippingModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium">إضافة شحنة</span>
                </button>

                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium">عرض الفاتورة</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <Printer className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">طباعة التفاصيل</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showShippingModal && (
        <ShippingModal
          application={application}
          onClose={() => setShowShippingModal(false)}
          onSuccess={loadApplicationDetail}
        />
      )}

      {showInvoiceModal && (
        <InvoiceModal
          application={application}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
