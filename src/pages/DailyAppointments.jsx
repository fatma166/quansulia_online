import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Eye,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
  Check,
  X,
  Edit
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const DailyAppointments = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات', color: 'gray' },
    { value: 'confirmed', label: 'مؤكد', color: 'green' },
    { value: 'completed', label: 'مكتمل', color: 'blue' },
    { value: 'cancelled', label: 'ملغي', color: 'red' },
    { value: 'no_show', label: 'لم يحضر', color: 'orange' }
  ];

  const regions = [
    'الرياض',
    'جدة',
    'مكة المكرمة',
    'المدينة المنورة',
    'الدمام',
    'الخبر',
    'الطائف',
    'تبوك',
    'أبها',
    'جازان',
    'نجران',
    'الأحساء',
    'القصيم',
    'حائل',
    'الباحة',
    'عسير',
    'الجوف'
  ];

  useEffect(() => {
    loadAppointments();
  }, [date]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, searchTerm, filterStatus, filterRegion]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', date)
        .order('appointment_time', { ascending: true });

      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (searchTerm) {
      filtered = filtered.filter(apt =>
        apt.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.applicant_phone.includes(searchTerm) ||
        (apt.notes && apt.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }

    if (filterRegion !== 'all') {
      filtered = filtered.filter(apt => apt.region === filterRegion);
    }

    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)
        .select();

      if (error) {
        console.error('Error updating appointment:', error);
        alert('حدث خطأ في تحديث الموعد: ' + error.message);
        return;
      }

      // إعادة تحميل البيانات من قاعدة البيانات
      await loadAppointments();

      alert('تم تحديث حالة الموعد بنجاح');
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('حدث خطأ في تحديث الموعد: ' + error.message);
    }
  };


  const exportToCSV = () => {
    const csvContent = [
      ['الوقت', 'الاسم', 'الهاتف', 'المنطقة', 'الخدمة', 'الحالة', 'ملاحظات'].join(','),
      ...filteredAppointments.map(apt => [
        apt.appointment_time,
        apt.applicant_name,
        apt.applicant_phone,
        apt.region,
        apt.service_name || '',
        getStatusLabel(apt.status),
        apt.notes || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `appointments_${date}.csv`;
    link.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800 border-green-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
      no_show: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusLabel = (status) => {
    const labels = {
      confirmed: 'مؤكد',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      no_show: 'لم يحضر'
    };
    return labels[status] || status;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stats = {
    total: filteredAppointments.length,
    confirmed: filteredAppointments.filter(a => a.status === 'confirmed').length,
    pending: filteredAppointments.filter(a => a.status === 'pending').length,
    cancelled: filteredAppointments.filter(a => a.status === 'cancelled').length,
    completed: filteredAppointments.filter(a => a.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#276073] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/appointments')}
            className="flex items-center gap-2 text-[#276073] hover:text-[#1e4a5a] font-semibold mb-4 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى التقويم
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-[#276073]" />
                  حجوزات يوم {formatDate(date)}
                </h1>
                <p className="text-gray-600 mt-1">إجمالي {filteredAppointments.length} حجز</p>
              </div>

              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                تصدير
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-medium">إجمالي الحجوزات</p>
                    <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-medium">مؤكدة</p>
                    <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-medium">مكتملة</p>
                    <p className="text-2xl font-bold text-purple-900">{stats.completed}</p>
                  </div>
                  <Check className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-medium">ملغية</p>
                    <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف، أو الملاحظات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Region Filter */}
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              <option value="all">جميع المناطق</option>
              {regions.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            قائمة الحجوزات ({filteredAppointments.length})
          </h2>

          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد حجوزات لهذا اليوم</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#276073] transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-3">
                        <div className="bg-[#276073] p-2 rounded-lg">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">الوقت</p>
                          <p className="font-semibold text-gray-900">{appointment.appointment_time}</p>
                        </div>
                      </div>

                      {/* Name */}
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">الاسم</p>
                          <p className="font-semibold text-gray-900">{appointment.applicant_name}</p>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Phone className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">الهاتف</p>
                          <p className="font-semibold text-gray-900" dir="ltr">{appointment.applicant_phone}</p>
                        </div>
                      </div>

                      {/* Region */}
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                          <MapPin className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">المنطقة</p>
                          <p className="font-semibold text-gray-900">{appointment.region}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold border-2 ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mr-4">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowDetails(true);
                        }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="عرض التفاصيل"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Service and Notes */}
                  {(appointment.service_name || appointment.notes) && (
                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {appointment.service_name && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">الخدمة</p>
                          <p className="text-sm text-gray-700">{appointment.service_name}</p>
                        </div>
                      )}
                      {appointment.notes && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
                          <p className="text-sm text-gray-700">{appointment.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">تفاصيل الموعد</h3>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedAppointment(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">التاريخ</label>
                  <p className="font-semibold text-gray-900">{formatDate(selectedAppointment.appointment_date)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">الوقت</label>
                  <p className="font-semibold text-gray-900">{selectedAppointment.appointment_time}</p>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">الاسم الكامل</label>
                <p className="font-semibold text-gray-900">{selectedAppointment.applicant_name}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">رقم الهاتف</label>
                <p className="font-semibold text-gray-900" dir="ltr">{selectedAppointment.applicant_phone}</p>
              </div>

              <div>
                <label className="text-sm text-gray-500">المنطقة</label>
                <p className="font-semibold text-gray-900">{selectedAppointment.region}</p>
              </div>

              {selectedAppointment.service_name && (
                <div>
                  <label className="text-sm text-gray-500">الخدمة</label>
                  <p className="font-semibold text-gray-900">{selectedAppointment.service_name}</p>
                </div>
              )}

              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm text-gray-500">ملاحظات</label>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500 block mb-2">الحالة</label>
                <div className="flex gap-2">
                  {statusOptions.filter(s => s.value !== 'all').map(status => (
                    <button
                      key={status.value}
                      onClick={() => updateAppointmentStatus(selectedAppointment.id, status.value)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        selectedAppointment.status === status.value
                          ? getStatusColor(status.value)
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedAppointment(null);
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default DailyAppointments;
