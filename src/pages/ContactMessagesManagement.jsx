import React, { useState, useEffect } from 'react';
import {
  Mail,
  Phone,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  MessageSquare,
  Filter,
  Search,
  Eye,
  Trash2,
  UserCheck,
  FileText,
  Calendar,
  TrendingUp,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';

const ContactMessagesManagement = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    in_progress: 0,
    resolved: 0,
    high_urgency: 0
  });

  // Load messages and staff
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load messages with assigned staff info
      const { data: messagesData, error: messagesError } = await supabase
        .from('contact_messages')
        .select(`
          *,
          assigned_staff:staff(id, full_name_ar, email)
        `)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;

      setMessages(messagesData || []);
      setFilteredMessages(messagesData || []);

      // Calculate stats
      const newStats = {
        total: messagesData?.length || 0,
        new: messagesData?.filter(m => m.status === 'new').length || 0,
        in_progress: messagesData?.filter(m => m.status === 'in_progress').length || 0,
        resolved: messagesData?.filter(m => m.status === 'resolved').length || 0,
        high_urgency: messagesData?.filter(m => m.urgency === 'high').length || 0
      };
      setStats(newStats);

      // Load active staff
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id, full_name_ar, email')
        .eq('is_active', true)
        .order('full_name_ar');

      if (staffError) throw staffError;

      setStaff(staffData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter messages
  useEffect(() => {
    let filtered = messages;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.status === filterStatus);
    }

    // Filter by urgency
    if (filterUrgency !== 'all') {
      filtered = filtered.filter(m => m.urgency === filterUrgency);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.subject.toLowerCase().includes(term) ||
        m.message.toLowerCase().includes(term)
      );
    }

    setFilteredMessages(filtered);
  }, [messages, filterStatus, filterUrgency, searchTerm]);

  // Update message status
  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const updateData = { status: newStatus };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_messages')
        .update(updateData)
        .eq('id', messageId);

      if (error) throw error;

      await loadData();

      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, ...updateData });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  // Assign message to staff
  const assignMessage = async (messageId, staffId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          assigned_to: staffId,
          status: 'in_progress'
        })
        .eq('id', messageId);

      if (error) throw error;

      await loadData();

      if (selectedMessage?.id === messageId) {
        setShowDetailsModal(false);
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Error assigning message:', error);
      alert('حدث خطأ أثناء تعيين الرسالة');
    }
  };

  // Update admin notes
  const updateNotes = async (messageId, notes) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ admin_notes: notes })
        .eq('id', messageId);

      if (error) throw error;

      await loadData();
    } catch (error) {
      console.error('Error updating notes:', error);
      alert('حدث خطأ أثناء حفظ الملاحظات');
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      await loadData();
      setShowDetailsModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('حدث خطأ أثناء حذف الرسالة');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-blue-100 text-blue-800 border-blue-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      closed: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      new: 'جديدة',
      in_progress: 'قيد المعالجة',
      resolved: 'تم الحل',
      closed: 'مغلقة'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };

    const labels = {
      low: 'عادي',
      normal: 'متوسط',
      high: 'عاجل'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${styles[urgency]}`}>
        {labels[urgency]}
      </span>
    );
  };

  const getServiceTypeLabel = (type) => {
    const labels = {
      passport: 'جوازات السفر',
      visa: 'التأشيرات',
      attestation: 'التصديقات',
      civil: 'الأحوال المدنية',
      legal: 'خدمات قانونية',
      investment: 'استثمار',
      tourism: 'سياحة',
      other: 'أخرى'
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">رسائل التواصل</h1>
            <p className="text-gray-600 mt-2">إدارة ومتابعة رسائل الزوار</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي الرسائل</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <MessageSquare className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">رسائل جديدة</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.new}</p>
              </div>
              <Mail className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">قيد المعالجة</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.in_progress}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">تم الحل</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">رسائل عاجلة</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.high_urgency}</p>
              </div>
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                بحث
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث في الرسائل..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                الحالة
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الحالات</option>
                <option value="new">جديدة</option>
                <option value="in_progress">قيد المعالجة</option>
                <option value="resolved">تم الحل</option>
                <option value="closed">مغلقة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-2" />
                الأولوية
              </label>
              <select
                value={filterUrgency}
                onChange={(e) => setFilterUrgency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">جميع الأولويات</option>
                <option value="high">عاجل</option>
                <option value="normal">متوسط</option>
                <option value="low">عادي</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterUrgency('all');
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                إعادة تعيين
              </button>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">جاري التحميل...</p>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">لا توجد رسائل</p>
                <p className="text-gray-500 text-sm mt-2">لم يتم استلام أي رسائل بعد</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الاسم</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الموضوع</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">نوع الخدمة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الأولوية</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">مسند إلى</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredMessages.map((message) => (
                    <tr key={message.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{message.name}</div>
                          <div className="text-sm text-gray-500">{message.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{message.subject}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{getServiceTypeLabel(message.service_type)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getUrgencyBadge(message.urgency)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-6 py-4">
                        {message.assigned_staff ? (
                          <div className="text-sm text-gray-700">{message.assigned_staff.full_name_ar}</div>
                        ) : (
                          <span className="text-sm text-gray-400">غير مسندة</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700">
                          {new Date(message.created_at).toLocaleDateString('ar-SA')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowDetailsModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-150"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">تفاصيل الرسالة</h2>
                <p className="text-gray-600 text-sm mt-1">
                  تم الإرسال في {new Date(selectedMessage.created_at).toLocaleString('ar-SA')}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-150"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-8 py-6 space-y-6">
              {/* Sender Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  معلومات المرسل
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">الاسم</p>
                    <p className="text-gray-900 font-medium">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                    <p className="text-gray-900 font-medium">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم الهاتف</p>
                    <p className="text-gray-900 font-medium">{selectedMessage.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">نوع الخدمة</p>
                    <p className="text-gray-900 font-medium">{getServiceTypeLabel(selectedMessage.service_type)}</p>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  محتوى الرسالة
                </h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-sm text-gray-600 mb-2">الموضوع:</p>
                  <p className="text-gray-900 font-semibold mb-4">{selectedMessage.subject}</p>
                  <p className="text-sm text-gray-600 mb-2">الرسالة:</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Status and Assignment */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">حالة الرسالة</h3>
                  <select
                    value={selectedMessage.status}
                    onChange={(e) => updateMessageStatus(selectedMessage.id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="new">جديدة</option>
                    <option value="in_progress">قيد المعالجة</option>
                    <option value="resolved">تم الحل</option>
                    <option value="closed">مغلقة</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">إسناد إلى</h3>
                  <select
                    value={selectedMessage.assigned_to || ''}
                    onChange={(e) => assignMessage(selectedMessage.id, e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">غير مسندة</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Admin Notes */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  ملاحظات الإدارة
                </h3>
                <textarea
                  value={selectedMessage.admin_notes || ''}
                  onChange={(e) => {
                    setSelectedMessage({ ...selectedMessage, admin_notes: e.target.value });
                  }}
                  onBlur={(e) => updateNotes(selectedMessage.id, e.target.value)}
                  rows={4}
                  placeholder="أضف ملاحظات داخلية هنا..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف الرسالة</span>
                </button>

                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedMessage(null);
                  }}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ContactMessagesManagement;
