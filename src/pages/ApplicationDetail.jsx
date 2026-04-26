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

      // Load all available statuses first
      const { data: statusesData } = await supabase
        .from('application_statuses')
        .select('*')
        .eq('is_active', true)
        .order('order_index');

      if (statusesData) {
        setAvailableStatuses(statusesData);

        // Fetch current status details (support both status and status_id)
        let currentStatusData = null;

        if (appData.status_id) {
          // If using status_id (UUID)
          currentStatusData = statusesData.find(s => s.id === appData.status_id);
        } else if (appData.status) {
          // If using status (text key)
          currentStatusData = statusesData.find(s => s.status_key === appData.status);
        }

        if (currentStatusData) {
          setCurrentStatus(currentStatusData);
        }
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

  const getArabicFieldLabel = (rawKey) => {
    if (!rawKey) return 'بيان';

    const key = String(rawKey)
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase();

    const fieldLabelMap = {
      full_name: 'الاسم الكامل',
      first_name: 'الاسم الأول',
      last_name: 'اسم العائلة',
      phone: 'رقم الهاتف',
      phone_number: 'رقم الهاتف',
      email: 'البريد الإلكتروني',
      national_id: 'رقم الهوية/الجواز',
      id_number: 'رقم الهوية/الجواز',
      passport_number: 'رقم الجواز',
      passport_type: 'نوع الجواز',
      old_passport_number: 'رقم الجواز القديم',
      new_passport_number: 'رقم الجواز الجديد',
      birth_date: 'تاريخ الميلاد',
      dob: 'تاريخ الميلاد',
      date_of_birth: 'تاريخ الميلاد',
      is_adult: 'الفئة العمرية',
      isadult: 'الفئة العمرية',
      gender: 'النوع',
      address: 'العنوان',
      city: 'المدينة',
      district: 'الحي',
      region: 'المنطقة',
      nationality: 'الجنسية',
      occupation: 'المهنة',
      marital_status: 'الحالة الاجتماعية',
      notes: 'ملاحظات'
    };

    if (fieldLabelMap[key]) return fieldLabelMap[key];

    const wordMap = {
      full: 'كامل',
      first: 'الأول',
      last: 'الأخير',
      name: 'اسم',
      phone: 'هاتف',
      mobile: 'جوال',
      email: 'بريد',
      national: 'وطني',
      id: 'رقم',
      passport: 'جواز',
      birth: 'ميلاد',
      date: 'تاريخ',
      gender: 'نوع',
      address: 'عنوان',
      city: 'مدينة',
      region: 'منطقة',
      country: 'دولة',
      occupation: 'مهنة',
      status: 'حالة',
      number: 'رقم',
      document: 'مستند',
      file: 'ملف',
      attachment: 'مرفق',
      image: 'صورة'
    };

    return key
      .split(/[_\-\s]+/)
      .filter(Boolean)
      .map((word) => wordMap[word] || word)
      .join(' ');
  };

  const calculateAgeFromBirthDate = (birthDateValue) => {
    if (!birthDateValue || Number.isNaN(Date.parse(birthDateValue))) return null;
    const birth = new Date(birthDateValue);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age -= 1;
    return age >= 0 ? age : null;
  };

  const getArabicFieldValue = (rawValue, rawKey = '', formData = null) => {
    if (rawValue === null || rawValue === undefined || rawValue === '') return 'غير محدد';

    const key = String(rawKey).toLowerCase();

    if (key.includes('is_adult') || key === 'isadult') {
      const asText = String(rawValue).toLowerCase();
      const isAdult = rawValue === true || asText === 'true' || asText === 'yes' || asText === 'adult' || asText === 'بالغ';
      const birthDate = formData?.birth_date || formData?.dob || formData?.date_of_birth;
      const age = calculateAgeFromBirthDate(birthDate);
      const ageText = age !== null ? ` (العمر: ${age} سنة)` : '';
      return `${isAdult ? 'بالغ' : 'طفل'}${ageText}`;
    }

    if (typeof rawValue === 'boolean') return rawValue ? 'نعم' : 'لا';

    if (typeof rawValue === 'string') {
      const value = rawValue.trim();
      const lowerValue = value.toLowerCase();

      const valueMap = {
        male: 'ذكر',
        female: 'أنثى',
        single: 'أعزب/عزباء',
        married: 'متزوج/متزوجة',
        divorced: 'مطلق/مطلقة',
        widowed: 'أرمل/أرملة',
        yes: 'نعم',
        no: 'لا',
        true: 'نعم',
        false: 'لا',
        pending: 'قيد الانتظار',
        approved: 'مقبول',
        rejected: 'مرفوض'
      };

      if (valueMap[lowerValue]) return valueMap[lowerValue];

      if (key.includes('date') && !Number.isNaN(Date.parse(value))) {
        return formatDate(value);
      }

      return value;
    }

    return String(rawValue);
  };

  const getArabicActivityNote = (note) => {
    if (!note || typeof note !== 'string') return 'نشاط جديد';

    return note
      .replace(/status[_\s-]?change/gi, 'تغيير الحالة')
      .replace(/rejected?/gi, 'مرفوض')
      .replace(/pending/gi, 'قيد الانتظار')
      .replace(/approved/gi, 'مقبول')
      .replace(/appointment/gi, 'موعد')
      .replace(/note/gi, 'ملاحظة')
      .replace(/call/gi, 'مكالمة')
      .replace(/email/gi, 'بريد إلكتروني');
  };

  const getOrderedApplicantEntries = (formData) => {
    if (!formData || typeof formData !== 'object') return [];

    const hiddenWords = ['document', 'file', 'attachment'];
    const employerKeys = [
      'workplace', 'work_place', 'workplace_name', 'employer', 'employer_name',
      'companyname', 'company_name', 'organizationname', 'organization_name',
      'representativecompany', 'representative_company', 'workdestination', 'work_destination'
    ];

    const entries = Object.entries(formData).filter(([key, value]) => {
      if (typeof value === 'object') return false;
      const lowerKey = String(key).toLowerCase();
      if (hiddenWords.some((w) => lowerKey.includes(w))) return false;
      if (employerKeys.some((k) => lowerKey.includes(k))) return false;
      return true;
    });

    const keyPriority = [
      'full_name', 'name', 'first_name', 'last_name',
      'national_id', 'id_number', 'passport_number',
      'birth_date', 'gender', 'nationality',
      'phone', 'phone_number', 'mobile', 'email',
      'occupation', 'marital_status', 'address', 'city', 'region'
    ];

    const score = (key) => {
      const normalized = String(key).toLowerCase();
      const idx = keyPriority.findIndex((k) => normalized.includes(k));
      return idx === -1 ? 999 : idx;
    };

    return entries.sort((a, b) => score(a[0]) - score(b[0]));
  };

  const getEmployerNameFromData = (applicationData) => {
    const formData = applicationData?.form_data || {};

    const directCandidateKeys = [
      'workplace', 'work_place', 'workplace_name',
      'employerName', 'employer_name',
      'companyName', 'company_name',
      'organizationName', 'organization_name',
      'representativeCompany', 'representative_company',
      'workDestination', 'work_destination',
      'job_place', 'jobplace',
      'جهة_العمل', 'جهة العمل', 'مكان_العمل', 'مكان العمل', 'اسم_جهة_العمل', 'اسم جهة العمل'
    ];

    for (const key of directCandidateKeys) {
      const value = formData?.[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    // Flexible fallback: detect any key that semantically looks like employer/workplace
    for (const [rawKey, rawValue] of Object.entries(formData || {})) {
      if (typeof rawValue !== 'string' || !rawValue.trim()) continue;
      const key = String(rawKey).toLowerCase().replace(/[\s_\-]/g, '');

      const likelyEmployerKey =
        key.includes('workplace') ||
        key.includes('employer') ||
        key.includes('company') ||
        key.includes('organization') ||
        key.includes('workdestination') ||
        key.includes('jobplace') ||
        key.includes('جهةالعمل') ||
        key.includes('مكانالعمل') ||
        key.includes('اسمجهةالعمل');

      if (likelyEmployerKey) return rawValue.trim();
    }

    return null;
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
        .select('id, full_name_ar')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      // Find the new status to get the label
      const newStatus = availableStatuses.find(s =>
        s.id === newStatusValue || s.status_key === newStatusValue
      );

      const oldStatusKey = application.status || application.status_id;

      // Update application status (support both status and status_id fields)
      const updateData = { updated_at: new Date().toISOString() };
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
        old_status: oldStatusKey,
        new_status: newStatus?.status_key || newStatusValue,
        changed_by: staffData?.id,
        staff_name: staffData?.full_name_ar || staffData?.full_name || 'موظف',
        notes: `تم تغيير الحالة إلى: ${newStatus?.name_ar || newStatus?.label_ar || 'حالة جديدة'}`
      };

      // Add status_id reference if available
      if (newStatus?.id) {
        historyData.status_id = newStatus.id;
      }

      const { error: historyError } = await supabase
        .from('status_history')
        .insert([historyData]);

      if (historyError) {
        console.error('Error logging status history:', historyError);
      }

      // Check if the new status requires an appointment
      const appointmentStatuses = ['appointment_required', 'appointment_booked', 'appointment_confirmed'];
      if (appointmentStatuses.includes(newStatus?.status_key)) {
        // Check if appointment already exists
        const { data: existingAppointment } = await supabase
          .from('appointments')
          .select('id')
          .eq('application_id', id)
          .maybeSingle();

        if (!existingAppointment && newStatus?.status_key === 'appointment_required') {
          // Create a placeholder appointment
          await supabase
            .from('appointments')
            .insert([{
              application_id: id,
              appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
              appointment_time: '09:00:00',
              status: 'pending',
              notes: 'في انتظار تحديد الموعد من قبل المستخدم',
              created_by: staffData?.id
            }]);
        }
      }

      // Reload data
      await loadApplicationDetail();
      setShowStatusDropdown(false);

      let successMessage = 'تم تغيير حالة الطلب بنجاح';
      if (newStatus?.status_key === 'appointment_required') {
        successMessage += '\n\nتم إرسال إشعار للمستخدم لتحديد موعد';
      }
      alert(successMessage);
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

  const employerName = getEmployerNameFromData(application);

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
                <div className="relative">
                  {!showStatusDropdown ? (
                    // Initial View: Status + Info Icon
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedStatus(currentStatus);
                          setShowStatusDropdown(true);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                        title="تعديل الحالة"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg">
                        <span className="font-semibold text-gray-900">
                          {currentStatus?.name_ar || currentStatus?.label_ar || application.status || 'تم التقديم'}
                        </span>
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: currentStatus?.color || '#3B82F6' }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    // Expanded View: Dropdown + Save + Close (RTL Order)
                    <div className="flex items-center gap-0">
                      {/* Status dropdown select - أول عنصر من اليمين */}
                      <select
                        value={selectedStatus?.id || selectedStatus?.status_key || currentStatus?.id || currentStatus?.status_key || ''}
                        onChange={(e) => {
                          const newStatusValue = e.target.value;
                          const newStatus = availableStatuses.find(s =>
                            s.id === newStatusValue || s.status_key === newStatusValue
                          );
                          if (newStatus) {
                            setSelectedStatus(newStatus);
                          }
                        }}
                        className="px-4 py-2.5 bg-white border border-gray-300 rounded-r-lg font-semibold text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none cursor-pointer min-w-[200px]"
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

                      {/* Dropdown arrow button */}
                      <button
                        className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-50 text-gray-600 border-t border-b border-l border-gray-300 transition-colors"
                        title="القائمة المنسدلة"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>

                      {/* Save button - وسط */}
                      <button
                        onClick={async () => {
                          if (selectedStatus?.id || selectedStatus?.status_key) {
                            await handleStatusChange(selectedStatus.id || selectedStatus.status_key);
                            setShowStatusDropdown(false);
                          }
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white transition-colors border-t border-b border-green-600"
                        title="حفظ التغييرات"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                      </button>

                      {/* Close button - آخر عنصر من اليسار */}
                      <button
                        onClick={() => {
                          setShowStatusDropdown(false);
                          setSelectedStatus(null);
                        }}
                        className="flex items-center justify-center w-10 h-10 bg-white hover:bg-gray-100 text-gray-600 rounded-l-lg transition-colors border border-gray-300"
                        title="إلغاء"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {showStatusDropdown && false && (
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
                  onClick={handlePrint}
                  className="flex items-center justify-center w-10 h-10 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Printer className="w-5 h-5" />
                </button>

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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {getOrderedApplicantEntries(application.form_data).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">{getArabicFieldLabel(key)}</p>
                              <p className="text-base font-bold text-gray-900 break-words">{getArabicFieldValue(value, key, application.form_data)}</p>
                      </div>
                    ))}

                    {employerName && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-1">جهة العمل</p>
                        <p className="text-base font-bold text-gray-900 break-words">{employerName}</p>
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
                              <span className="text-gray-600">{getArabicFieldLabel(key)}:</span>
                              <span className="font-medium text-gray-900 text-right max-w-md">
                                {getArabicFieldValue(value, key, application.form_data)}
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
                                <p className="font-medium text-gray-900">{getArabicFieldLabel(doc.name)}</p>
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
                                {getArabicActivityNote(history.notes || (statusInfo?.name_ar ? `تم ${statusInfo.name_ar}` : 'نشاط جديد'))}
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
