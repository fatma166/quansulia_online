import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Calendar, Package, Truck, FileText, MapPin, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStatuses } from '../hooks/useStatuses';

const AdminApplicationStatusManager = ({ application, onUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState(application.status);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionData, setRejectionData] = useState({
    reason: '',
    required_documents: '',
    can_resubmit: true
  });

  const { statuses, getStatusByKey } = useStatuses();

  const iconMap = {
    FileText, Search, CheckCircle, DollarSign, Calendar,
    Clock, MapPin, XCircle, AlertTriangle, Package, Truck
  };

  const colorMap = {
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  const getCurrentStatusOption = () => {
    const status = getStatusByKey(selectedStatus);
    if (!status) return null;

    const colorClass = status.color.split(' ')[0].replace('bg-', '').replace('-100', '');
    return {
      value: status.status_key,
      label: status.label_ar,
      icon: iconMap[status.icon] || FileText,
      color: colorClass
    };
  };

  const handleStatusUpdate = async () => {
    if (selectedStatus === application.status && !notes) {
      alert('لم يتم تغيير الحالة');
      return;
    }

    if (selectedStatus === 'rejected' && !showRejectionForm) {
      setShowRejectionForm(true);
      return;
    }

    if (selectedStatus === 'rejected' && !rejectionData.reason) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('applications')
        .update({ status: selectedStatus })
        .eq('id', application.id);

      if (updateError) throw updateError;

      const { error: historyError } = await supabase
        .from('status_history')
        .insert({
          application_id: application.id,
          old_status: application.status,
          new_status: selectedStatus,
          notes: notes || `تم تحديث الحالة إلى: ${getCurrentStatusOption().label}`
        });

      if (historyError) throw historyError;

      if (selectedStatus === 'rejected') {
        const requiredDocs = rejectionData.required_documents
          .split('\n')
          .filter(doc => doc.trim() !== '');

        const { error: rejectionError } = await supabase
          .from('rejection_details')
          .insert({
            application_id: application.id,
            reason: rejectionData.reason,
            required_documents: requiredDocs,
            can_resubmit: rejectionData.can_resubmit
          });

        if (rejectionError) throw rejectionError;
      }

      alert('تم تحديث حالة الطلب بنجاح');
      if (onUpdate) {
        onUpdate();
      }
      setNotes('');
      setShowRejectionForm(false);
      setRejectionData({ reason: '', required_documents: '', can_resubmit: true });
    } catch (err) {
      console.error('Error updating status:', err);
      alert('حدث خطأ في تحديث الحالة');
    } finally {
      setLoading(false);
    }
  };

  const currentOption = getCurrentStatusOption();
  const StatusIcon = currentOption.icon;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">إدارة حالة الطلب</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">الحالة الحالية</label>
          <div className={`flex items-center space-x-3 rtl:space-x-reverse p-3 rounded-lg bg-${currentOption.color}-50 border border-${currentOption.color}-200`}>
            <StatusIcon className={`w-5 h-5 text-${currentOption.color}-600`} />
            <span className={`font-semibold text-${currentOption.color}-800`}>{currentOption.label}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">تغيير الحالة إلى</label>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setShowRejectionForm(e.target.value === 'rejected');
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
          >
            {statuses.map((status) => (
              <option key={status.status_key} value={status.status_key}>
                {status.label_ar}
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

        {showRejectionForm && selectedStatus === 'rejected' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
            <h4 className="font-semibold text-red-800 flex items-center space-x-2 rtl:space-x-reverse">
              <AlertTriangle className="w-5 h-5" />
              <span>تفاصيل الرفض</span>
            </h4>

            <div>
              <label className="block text-sm font-semibold text-red-700 mb-2">سبب الرفض *</label>
              <textarea
                value={rejectionData.reason}
                onChange={(e) => setRejectionData({ ...rejectionData, reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="اشرح سبب رفض الطلب بالتفصيل..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-red-700 mb-2">المستندات المطلوبة (كل مستند في سطر)</label>
              <textarea
                value={rejectionData.required_documents}
                onChange={(e) => setRejectionData({ ...rejectionData, required_documents: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                placeholder="نسخة من الهوية الوطنية&#10;صورة شخصية حديثة&#10;شهادة الميلاد"
              />
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <input
                type="checkbox"
                id="can_resubmit"
                checked={rejectionData.can_resubmit}
                onChange={(e) => setRejectionData({ ...rejectionData, can_resubmit: e.target.checked })}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-600"
              />
              <label htmlFor="can_resubmit" className="text-sm text-red-700">
                السماح بإعادة تقديم الطلب
              </label>
            </div>
          </div>
        )}

        <button
          onClick={handleStatusUpdate}
          disabled={loading || selectedStatus === application.status}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse"
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
