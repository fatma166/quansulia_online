import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Calendar, Package, Truck, FileText, MapPin, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminApplicationStatusManager = ({ application, onUpdate }) => {
  const [selectedStatusId, setSelectedStatusId] = useState(application.status_id);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [availableStatuses, setAvailableStatuses] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusesLoading, setStatusesLoading] = useState(true);

  useEffect(() => {
    loadStatuses();
  }, [application.status_id]);

  const loadStatuses = async () => {
    try {
      setStatusesLoading(true);

      // Load current status
      if (application.status_id) {
        const { data: statusData } = await supabase
          .from('application_statuses')
          .select('*')
          .eq('id', application.status_id)
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
    } catch (error) {
      console.error('Error loading statuses:', error);
    } finally {
      setStatusesLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedStatusId || selectedStatusId === application.status_id) {
      alert('لم يتم تغيير الحالة');
      return;
    }

    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const { data: staffData } = await supabase
        .from('staff')
        .select('id, full_name')
        .eq('user_id', userData.user.id)
        .maybeSingle();

      // Update application status
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status_id: selectedStatusId })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Get new status name
      const newStatus = availableStatuses.find(s => s.id === selectedStatusId);
      const statusLabel = newStatus ? newStatus.name_ar : 'حالة جديدة';

      // Log status change in history
      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          application_id: application.id,
          status_id: selectedStatusId,
          changed_by: staffData?.id,
          staff_name: staffData?.full_name,
          notes: notes || `تم تحديث الحالة إلى: ${statusLabel}`
        });

      if (historyError) throw historyError;

      alert('تم تحديث حالة الطلب بنجاح');
      if (onUpdate) {
        onUpdate();
      }
      setNotes('');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('حدث خطأ في تحديث الحالة');
    } finally {
      setLoading(false);
    }
  };

  // عرض شاشة التحميل أثناء تحميل الحالات
  if (statusesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">إدارة حالة الطلب</h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-[#276073] rounded-full animate-spin"></div>
          <span className="mr-3 text-gray-600">جاري التحميل...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">إدارة حالة الطلب</h3>

      <div className="space-y-4">
        {currentStatus ? (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة الحالية</label>
            <div
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{
                backgroundColor: currentStatus.color + '15',
                borderColor: currentStatus.color
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentStatus.color }}
              ></div>
              <span className="font-semibold text-gray-900">{currentStatus.name_ar}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">لا يمكن تحميل بيانات الحالة. يرجى تحديث الصفحة.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">تغيير الحالة إلى</label>
          <select
            value={selectedStatusId || ''}
            onChange={(e) => setSelectedStatusId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            {availableStatuses.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name_ar}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">ملاحظات التحديث (اختياري)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
            placeholder="أضف ملاحظات حول التحديث..."
          />
        </div>

        <button
          onClick={handleStatusUpdate}
          disabled={loading || selectedStatusId === application.status_id}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>جاري التحديث...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>تحديث الحالة</span>
            </>
          )}
        </button>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">نصائح التحديث:</h4>
          <ul className="text-sm text-blue-700 space-y-1 pr-5 list-disc">
            <li>تأكد من اختيار الحالة الصحيحة قبل التحديث</li>
            <li>أضف ملاحظات واضحة لتوثيق التغيير</li>
            <li>سيتم إرسال إشعار للمتقدم تلقائياً</li>
            <li>لا يمكن التراجع عن التحديث</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationStatusManager;
