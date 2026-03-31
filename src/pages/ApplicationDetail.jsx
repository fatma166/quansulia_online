import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, User, Calendar, MapPin, Phone, Mail, Download, CreditCard as Edit, Trash2, CheckCircle, Clock, XCircle, AlertCircle, Package, Printer, MessageSquare, DollarSign, Info, Paperclip, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ProcessingStatus from '../components/ProcessingStatus';
import StatusBadge from '../components/StatusBadge';
import ShippingModal from '../components/ShippingModal';
import RejectionDetails from '../components/RejectionDetails';
import InvoiceModal from '../components/InvoiceModal';
import PriceEditor from '../components/PriceEditor';

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
  const [activeTab, setActiveTab] = useState('applicant');
  const [showPriceEditor, setShowPriceEditor] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [activityNote, setActivityNote] = useState('');
  const [activityType, setActivityType] = useState('');

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

      // Fetch current status details
      if (appData.status_id) {
        const { data: statusData } = await supabase
          .from('application_statuses')
          .select('*')
          .eq('id', appData.status_id)
          .maybeSingle();

        if (statusData) {
          setCurrentStatus(statusData);
        }
      }

      // Load all available statuses
      const { data: statusesData } = await supabase
        .from('application_statuses')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (statusesData) {
        setAvailableStatuses(statusesData);
      }

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
      const { data: appointmentData } = await supabase
        .from('appointments')
        .select('*')
        .eq('application_id', id)
        .maybeSingle();

      if (appointmentData) {
        setAppointment(appointmentData);
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

  const handleStatusChange = async (newStatusValue) => {
    if (!newStatusValue) {
      setShowStatusDropdown(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      // Find the new status to get the label
      const newStatus = availableStatuses.find(s =>
        s.id === newStatusValue || s.status_key === newStatusValue
      );

      // Update application status (support both status and status_id fields)
      const updateData = {};
      if (application.status !== undefined) {
        updateData.status = newStatus?.status_key || newStatusValue;
      }
      if (application.status_id !== undefined) {
        updateData.status_id = newStatusValue;
      }

      const { error: updateError } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Log status change in history
      const historyData = {
        application_id: id,
        changed_by: staffData?.id,
        staff_name: staffData?.full_name,
        notes: `تم تغيير الحالة إلى: ${newStatus?.name_ar || newStatus?.label_ar || 'حالة جديدة'}`
      };

      // Add status_id if the table supports it
      if (newStatusValue) {
        historyData.status_id = newStatusValue;
      }

      const { error: historyError } = await supabase
        .from('status_history')
        .insert([historyData]);

      if (historyError) {
        console.error('Error logging status history:', historyError);
        // Don't fail the whole operation if history logging fails
      }

      // Reload data
      await loadApplicationDetail();
      setShowStatusDropdown(false);
      alert('تم تغيير حالة الطلب بنجاح');
    } catch (error) {
      console.error('Error changing status:', error);
      alert('حدث خطأ أثناء تغيير الحالة: ' + (error.message || 'خطأ غير معروف'));
    }
  };

  const handleAddActivity = async () => {
    if (!activityNote.trim()) {
      alert('الرجاء إدخال وصف النشاط');
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      // Build the note with activity type
      let noteText = activityNote;
      if (activityType && activityType !== '') {
        const typeLabels = {
          'status_change': 'تغيير الحالة',
          'rejected': 'رفض مستند',
          'note': 'ملاحظة',
          'call': 'مكالمة هاتفية',
          'email': 'بريد إلكتروني',
          'appointment': 'موعد'
        };
        const typeLabel = typeLabels[activityType] || activityType;
        noteText = `${typeLabel}: ${activityNote}`;
      }

      // Add activity to status history
      // We need to ensure status_id is valid
      if (!currentStatus?.id) {
        alert('لا يمكن إضافة النشاط: الحالة الحالية غير محددة');
        return;
      }

      const { error } = await supabase
        .from('status_history')
        .insert([{
          application_id: id,
          status_id: currentStatus.id,
          changed_by: staffData?.id,
          staff_name: staffData?.full_name,
          notes: noteText
        }]);

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      alert('تم إضافة النشاط بنجاح');
      setActivityNote('');
      setActivityType('');
      setShowAddActivityModal(false);
      await loadApplicationDetail();
    } catch (error) {
      console.error('Error adding activity:', error);
      alert('حدث خطأ أثناء إضافة النشاط');
    }
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
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/applications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="font-medium">العودة</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          {/* Title and Actions Section */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {service?.name_ar || application.service_title || 'جوازات السفر'}
                </h1>
                <p className="text-gray-500 text-lg">
                  رقم المعاملة: <span className="font-bold text-gray-900">{application.reference_number || application.id?.slice(0, 8)}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center w-10 h-10 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                </button>

                <div className="relative flex items-center gap-2">
                  {currentStatus && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 rounded-lg">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentStatus.color || '#6B7280' }}
                      ></div>
                      <span className="font-semibold text-gray-900">{currentStatus.name_ar || currentStatus.label_ar || 'حالة الطلب'}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedStatus(currentStatus);
                      setShowStatusDropdown(!showStatusDropdown);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                    title="تغيير الحالة"
                  >
                    <Edit className="w-4 h-4" />
                    <span>إمكانية التغيير</span>
                  </button>

                  {showStatusDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                          setShowStatusDropdown(false);
                          setSelectedStatus(null);
                        }}
                      ></div>
                      <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-20">
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-lg font-bold text-gray-900 mb-3">تغيير حالة الطلب</h3>

                          <select
                            value={selectedStatus?.id || selectedStatus?.status_key || ''}
                            onChange={(e) => {
                              const newStatusValue = e.target.value;
                              const newStatus = availableStatuses.find(s =>
                                s.id === newStatusValue || s.status_key === newStatusValue
                              );
                              if (newStatus) {
                                setSelectedStatus(newStatus);
                              }
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium text-right"
                          >
                            <option value="">اختر حالة جديدة</option>
                            {availableStatuses.map((status) => (
                              <option
                                key={status.id || status.status_key}
                                value={status.id || status.status_key}
                              >
                                {status.name_ar || status.label_ar}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                          <button
                            onClick={() => {
                              setShowStatusDropdown(false);
                              setSelectedStatus(null);
                            }}
                            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={() => {
                              if (selectedStatus?.id || selectedStatus?.status_key) {
                                handleStatusChange(selectedStatus.id || selectedStatus.status_key);
                              }
                            }}
                            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>حفظ التغييرات</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setShowPriceEditor(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  <DollarSign className="w-5 h-5" />
                  تعديل السعر
                </button>
              </div>
            </div>
          </div>

          {/* Info Grid Section */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">تاريخ التقديم</p>
                <p className="text-base font-bold text-gray-900">
                  {formatDate(application.created_at)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">آخر تحديث</p>
                <p className="text-base font-bold text-gray-900">
                  {formatDate(application.updated_at)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">الإنجاز المتوقع</p>
                <p className="text-base font-bold text-gray-900">
                  {application.expected_completion_date ? formatDate(application.expected_completion_date) : 'غير محدد'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2 font-medium">الرسوم</p>
                <p className="text-base font-bold text-gray-900">
                  {application.total_amount ? `${application.total_amount} ريال سعودي` : '300 ريال سعودي'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Section */}
        {appointment && (
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-50 rounded-xl border-2 border-green-200 shadow-sm mb-6">
            <div className="px-8 py-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 flex-1">معلومات الموعد</h3>
                <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                  مؤكد
                </span>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                    <Calendar className="w-5 h-5" />
                    <p className="text-sm font-semibold">التاريخ الميلادي</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 mb-2">
                    {new Date(appointment.appointment_date).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }).replace('،', '')}
                  </p>
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <p className="text-xs text-gray-600 mb-1">التاريخ الهجري</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {new Date(appointment.appointment_date).toLocaleDateString('ar-SA-u-ca-islamic', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                    <Clock className="w-5 h-5" />
                    <p className="text-sm font-semibold">الوقت</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {appointment.appointment_time || '09:00 - 09:30'}
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-5 h-5" />
                    <p className="text-sm font-semibold">الموقع</p>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    القنصلية - منطقة الرياض
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content with Tabs */}
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('applicant')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-colors relative ${
                    activeTab === 'applicant'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <User className="w-5 h-5" />
                    بيانات المتقدم
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-colors relative ${
                    activeTab === 'details'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-5 h-5" />
                    تفاصيل الطلب
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`flex-1 py-4 px-6 text-center font-semibold transition-colors relative ${
                    activeTab === 'documents'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Paperclip className="w-5 h-5" />
                    المستندات
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-lg shadow-sm p-6">
              {/* Applicant Tab */}
              {activeTab === 'applicant' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    بيانات المتقدم
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {application.form_data && Object.entries(application.form_data)
                      .filter(([key, value]) => {
                        return typeof value !== 'object' &&
                               !key.includes('document') &&
                               !key.includes('file') &&
                               !key.includes('attachment');
                      })
                      .map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-500">{key}</p>
                              <p className="text-gray-900 font-medium">{value || 'غير محدد'}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                    {application.applicant_region && (
                      <div className="space-y-1">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">المنطقة</p>
                            <p className="text-gray-900 font-medium">{application.applicant_region}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Details Tab */}
              {activeTab === 'details' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    تفاصيل الطلب
                  </h3>

                  <div className="space-y-6">
                    {/* Service Information */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">معلومات الخدمة</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">نوع الخدمة:</span>
                          <span className="font-medium text-gray-900">
                            {service?.name_ar || application.service_title || 'غير محدد'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">رقم المرجع:</span>
                          <span className="font-medium text-gray-900">
                            {application.reference_number || application.id?.slice(0, 8)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* All Form Data */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">جميع البيانات المقدمة</h4>
                      <div className="space-y-3">
                        {application.form_data && Object.entries(application.form_data)
                          .filter(([key, value]) => typeof value !== 'object')
                          .map(([key, value]) => (
                            <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-medium text-gray-900 text-right max-w-md">
                                {value || 'غير محدد'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Paperclip className="w-5 h-5 text-blue-600" />
                    المستندات المرفقة
                  </h3>

                  {(() => {
                    // Collect all documents from both documents and form_data
                    const allDocuments = [];

                    // Add documents from documents field
                    if (application.documents && typeof application.documents === 'object') {
                      Object.entries(application.documents).forEach(([docName, docUrl]) => {
                        if (docUrl && typeof docUrl === 'string' && docUrl.startsWith('http')) {
                          allDocuments.push({ name: docName, url: docUrl });
                        }
                      });
                    }

                    // Add documents from form_data
                    if (application.form_data && typeof application.form_data === 'object') {
                      Object.entries(application.form_data).forEach(([key, value]) => {
                        if (typeof value === 'string' && value.startsWith('http') &&
                            (key.includes('document') || key.includes('file') || key.includes('attachment') ||
                             key.includes('صورة') || key.includes('مستند'))) {
                          allDocuments.push({ name: key, url: value });
                        }
                      });
                    }

                    return allDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {allDocuments.map((doc, index) => (
                          <a
                            key={index}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-sm text-gray-500">انقر للعرض أو التحميل</p>
                              </div>
                            </div>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">لا توجد مستندات مرفقة</p>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status History */}
            <div className="bg-white rounded-lg shadow-sm p-6 relative">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  سجل الأنشطة
                </h3>
                <button
                  onClick={() => setShowAddActivityModal(!showAddActivityModal)}
                  className="px-4 py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 font-semibold transition-colors"
                >
                  إضافة نشاط
                </button>
              </div>

              {/* Add Activity Dropdown */}
              {showAddActivityModal && (
                <div className="mb-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5 shadow-lg">
                  <div className="space-y-3">
                    <select
                      value={activityType}
                      onChange={(e) => setActivityType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 font-medium text-right"
                    >
                      <option value="">اختر نوع النشاط</option>
                      <option value="status_change">تغيير الحالة</option>
                      <option value="rejected">رفض مستند</option>
                      <option value="note">ملاحظة</option>
                      <option value="call">مكالمة هاتفية</option>
                      <option value="email">بريد إلكتروني</option>
                      <option value="appointment">موعد</option>
                    </select>

                    <textarea
                      value={activityNote}
                      onChange={(e) => setActivityNote(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                      placeholder="وصف النشاط..."
                    />

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setShowAddActivityModal(false);
                          setActivityNote('');
                          setActivityType('');
                        }}
                        className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-bold transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleAddActivity}
                        disabled={!activityNote.trim()}
                        className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                      >
                        حفظ
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {statusHistory.map((history, index) => {
                    const statusInfo = history.application_statuses;
                    const isStatusChange = statusInfo?.name_ar;

                    // Determine activity type and styling
                    let activityLabel = 'نشاط';
                    let activityColor = 'yellow';
                    let bgColor = 'bg-yellow-50';
                    let borderColor = 'border-yellow-200';
                    let icon = <FileText className="w-5 h-5" />;

                    if (isStatusChange) {
                      if (statusInfo.name_ar.includes('موعد') || statusInfo.name_ar.includes('حجز')) {
                        activityLabel = 'موعد';
                        activityColor = 'yellow';
                        bgColor = 'bg-yellow-50';
                        borderColor = 'border-yellow-200';
                        icon = <Calendar className="w-5 h-5" />;
                      } else if (statusInfo.name_ar.includes('تغيير') || statusInfo.name_ar.includes('تحديث')) {
                        activityLabel = 'تغيير الحالة';
                        activityColor = 'green';
                        bgColor = 'bg-green-50';
                        borderColor = 'border-green-200';
                        icon = <CheckCircle className="w-5 h-5" />;
                      } else if (statusInfo.name_ar.includes('مرفوض') || statusInfo.name_ar.includes('رفض')) {
                        activityLabel = 'رفض مستند';
                        activityColor = 'red';
                        bgColor = 'bg-red-50';
                        borderColor = 'border-red-200';
                        icon = <XCircle className="w-5 h-5" />;
                      } else if (statusInfo.name_ar.includes('تقديم') || statusInfo.name_ar.includes('جديد')) {
                        activityLabel = 'تقديم الطلب';
                        activityColor = 'blue';
                        bgColor = 'bg-blue-50';
                        borderColor = 'border-blue-200';
                        icon = <FileText className="w-5 h-5" />;
                      } else {
                        activityLabel = statusInfo.name_ar;
                        bgColor = 'bg-gray-50';
                        borderColor = 'border-gray-200';
                      }
                    }

                    return (
                      <div key={history.id} className={`${bgColor} ${borderColor} border rounded-xl p-4`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center text-${activityColor}-600 border ${borderColor}`}>
                              {icon}
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900">{activityLabel}</h4>
                              <p className="text-sm text-gray-600">
                                {history.notes || (statusInfo?.name_ar ? `تم ${statusInfo.name_ar}` : 'نشاط جديد')}
                              </p>
                            </div>
                          </div>
                          {statusInfo && (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: statusInfo.color || '#10B981' }}
                              ></div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-3">
                            {history.staff_name && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{history.staff_name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDate(history.created_at)}</span>
                            </div>
                          </div>
                          <span className="text-gray-400">النظام</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">لا توجد أنشطة بعد</p>
                </div>
              )}
            </div>
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

      {showPriceEditor && (
        <PriceEditor
          application={application}
          onClose={() => setShowPriceEditor(false)}
          onUpdate={loadApplicationDetail}
        />
      )}
    </div>
  );
}
