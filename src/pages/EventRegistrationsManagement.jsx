import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Users, Search, Download, Eye, CheckCircle, XCircle, Clock, Mail, Phone, MessageSquare, Filter, ArrowLeft, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';

const EventRegistrationsManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventIdFromUrl = searchParams.get('eventId');

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (eventIdFromUrl && events.length > 0) {
      const event = events.find(e => e.id === eventIdFromUrl);
      if (event) {
        setSelectedEvent(event);
      }
    }
  }, [eventIdFromUrl, events]);

  useEffect(() => {
    if (selectedEvent) {
      loadRegistrations(selectedEvent.id);
    }
  }, [selectedEvent, statusFilter]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async (eventId) => {
    try {
      setLoading(true);
      let query = supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (registrationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: newStatus })
        .eq('id', registrationId);

      if (error) throw error;

      // Reload registrations
      if (selectedEvent) {
        loadRegistrations(selectedEvent.id);
      }

      alert('تم تحديث حالة التسجيل بنجاح');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  const exportToCSV = () => {
    if (!registrations.length) return;

    const headers = ['الاسم', 'البريد الإلكتروني', 'رقم الجوال', 'عدد المرافقين', 'الحالة', 'تاريخ التسجيل', 'الملاحظات'];
    const rows = registrations.map(reg => [
      reg.full_name,
      reg.email,
      reg.phone,
      reg.companions_count,
      reg.status === 'confirmed' ? 'مؤكد' : reg.status === 'pending' ? 'معلق' : 'ملغي',
      new Date(reg.created_at).toLocaleDateString('ar-SA'),
      reg.notes || '-'
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registrations_${selectedEvent?.title_ar}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = !searchQuery ||
      reg.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.phone.includes(searchQuery);
    return matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 ml-1" />
            مؤكد
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 ml-1" />
            معلق
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 ml-1" />
            ملغي
          </span>
        );
      default:
        return null;
    }
  };

  const getTotalCompanions = () => {
    return filteredRegistrations.reduce((sum, reg) => sum + (reg.companions_count || 0), 0);
  };

  const getTotalAttendees = () => {
    const confirmedRegistrations = filteredRegistrations.filter(reg => reg.status === 'confirmed');
    return confirmedRegistrations.length + confirmedRegistrations.reduce((sum, reg) => sum + (reg.companions_count || 0), 0);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
        {!selectedEvent ? (
          // Events List
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                إدارة تسجيلات الفعاليات
              </h1>
              <p className="text-gray-600">
                اختر فعالية لعرض المسجلين فيها
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-[#276073] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد فعاليات حالياً</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map(event => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden"
                  >
                    {event.featured_image && (
                      <img
                        src={event.featured_image}
                        alt={event.title_ar}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {event.title_ar}
                      </h3>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 ml-2" />
                          <span>{new Date(event.event_date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        {event.event_time && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{event.event_time}</span>
                          </div>
                        )}
                      </div>
                      <button className="w-full bg-[#276073] hover:bg-[#1e4a5a] text-white py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center">
                        <Users className="w-5 h-5 ml-2" />
                        <span>عرض المسجلين</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Registrations List
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex items-center text-[#276073] hover:text-[#1e4a5a] mb-4 font-semibold"
              >
                <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                العودة للفعاليات
              </button>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedEvent.title_ar}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 ml-2" />
                    <span>{new Date(selectedEvent.event_date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {selectedEvent.event_time && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 ml-2" />
                      <span>{selectedEvent.event_time}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 mb-1">إجمالي التسجيلات</p>
                      <p className="text-2xl font-bold text-blue-900">{filteredRegistrations.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 mb-1">مؤكد</p>
                      <p className="text-2xl font-bold text-green-900">
                        {filteredRegistrations.filter(r => r.status === 'confirmed').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 mb-1">معلق</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {filteredRegistrations.filter(r => r.status === 'pending').length}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 mb-1">إجمالي الحضور المتوقع</p>
                      <p className="text-2xl font-bold text-purple-900">{getTotalAttendees()}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="البحث بالاسم، البريد أو الجوال..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="confirmed">مؤكد</option>
                    <option value="pending">معلق</option>
                    <option value="cancelled">ملغي</option>
                  </select>

                  <button
                    onClick={exportToCSV}
                    className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
                  >
                    <Download className="w-5 h-5 ml-2" />
                    تصدير Excel
                  </button>
                </div>
              </div>
            </div>

            {/* Registrations Table */}
            {loading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="inline-block w-8 h-8 border-4 border-[#276073] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد تسجيلات لهذه الفعالية</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          الاسم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          معلومات التواصل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          المرافقين
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          تاريخ التسجيل
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentRegistrations.map(registration => (
                        <tr key={registration.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {registration.full_name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Mail className="w-4 h-4 ml-2" />
                                <span>{registration.email}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Phone className="w-4 h-4 ml-2" />
                                <span dir="ltr" className="text-right">{registration.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900 font-semibold">
                              {registration.companions_count || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(registration.status)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(registration.created_at).toLocaleDateString('ar-SA')}
                            <br />
                            <span className="text-xs text-gray-400">
                              {new Date(registration.created_at).toLocaleTimeString('ar-SA')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {registration.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => updateRegistrationStatus(registration.id, 'confirmed')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                    title="تأكيد"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => updateRegistrationStatus(registration.id, 'cancelled')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                    title="إلغاء"
                                  >
                                    <XCircle className="w-5 h-5" />
                                  </button>
                                </>
                              )}
                              {registration.notes && (
                                <button
                                  onClick={() => alert(`الملاحظات:\n${registration.notes}`)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                  title="عرض الملاحظات"
                                >
                                  <MessageSquare className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {/* Items per page selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">عرض</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-600">من أصل {filteredRegistrations.length}</span>
                      </div>

                      {/* Pagination info and buttons */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          الصفحة {currentPage} من {totalPages}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#276073] hover:bg-[#276073] hover:text-white border border-gray-300'
                            }`}
                          >
                            الأولى
                          </button>

                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              currentPage === 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#276073] hover:bg-[#276073] hover:text-white border border-gray-300'
                            }`}
                          >
                            السابقة
                          </button>

                          {/* Page numbers */}
                          <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, index) => {
                              const pageNumber = index + 1;
                              // Show first page, last page, current page, and pages around current
                              if (
                                pageNumber === 1 ||
                                pageNumber === totalPages ||
                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={pageNumber}
                                    onClick={() => setCurrentPage(pageNumber)}
                                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                                      currentPage === pageNumber
                                        ? 'bg-[#276073] text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                    }`}
                                  >
                                    {pageNumber}
                                  </button>
                                );
                              } else if (
                                pageNumber === currentPage - 2 ||
                                pageNumber === currentPage + 2
                              ) {
                                return (
                                  <span key={pageNumber} className="text-gray-400 px-1">
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#276073] hover:bg-[#276073] hover:text-white border border-gray-300'
                            }`}
                          >
                            التالية
                          </button>

                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              currentPage === totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-[#276073] hover:bg-[#276073] hover:text-white border border-gray-300'
                            }`}
                          >
                            الأخيرة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default EventRegistrationsManagement;
