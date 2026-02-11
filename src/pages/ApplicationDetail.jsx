import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Package,
  Printer,
  MessageSquare
} from 'lucide-react';
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

  useEffect(() => {
    if (id) {
      loadApplicationDetail();
    }
  }, [id]);

  const loadApplicationDetail = async () => {
    try {
      setLoading(true);

      // Fetch application with related data
      const { data: appData, error: appError } = await supabase
        .from('applications')
        .select(`
          *,
          services:service_id (
            id,
            name_ar,
            name_en,
            slug
          ),
          application_statuses:status (
            id,
            name_ar,
            name_en,
            description_ar,
            description_en,
            color
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (appError) throw appError;

      if (!appData) {
        navigate('/admin/applications');
        return;
      }

      setApplication(appData);
      setService(appData.services);

      // Load status history
      const { data: historyData, error: historyError } = await supabase
        .from('status_history')
        .select(`
          *,
          application_statuses:status_id (
            name_ar,
            name_en,
            color
          )
        `)
        .eq('application_id', id)
        .order('created_at', { ascending: false });

      if (!historyError && historyData) {
        setStatusHistory(historyData);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/applications')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            العودة إلى قائمة الطلبات
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    طلب رقم: {application.reference_number || application.id?.slice(0, 8)}
                  </h1>
                  <StatusBadge status={application.application_statuses} />
                </div>
                <p className="text-gray-600">
                  الخدمة: {service?.name_ar || 'غير محدد'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  تاريخ التقديم: {formatDate(application.created_at)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
                  title="طباعة"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="p-2 text-emerald-600 hover:text-emerald-700 border border-emerald-300 rounded-lg"
                  title="الفاتورة"
                >
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <User className="w-6 h-6 ml-2 text-emerald-600" />
                بيانات مقدم الطلب
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.form_data && Object.entries(application.form_data).map(([key, value]) => {
                  if (typeof value === 'object' || key.includes('document') || key.includes('file')) {
                    return null;
                  }

                  return (
                    <div key={key} className="border-r-4 border-emerald-500 pr-3">
                      <p className="text-sm text-gray-500 mb-1">{key}</p>
                      <p className="text-gray-900">{value || 'غير محدد'}</p>
                    </div>
                  );
                })}

                {application.applicant_region && (
                  <div className="border-r-4 border-emerald-500 pr-3">
                    <p className="text-sm text-gray-500 mb-1">المنطقة</p>
                    <p className="text-gray-900">{application.applicant_region}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Processing Status */}
            {application.status && (
              <ProcessingStatus status={application.status} />
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
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 ml-2 text-emerald-600" />
                  المستندات المرفقة
                </h2>

                <div className="space-y-2">
                  {Object.entries(application.documents).map(([docName, docUrl]) => (
                    <a
                      key={docName}
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 text-gray-400 ml-2" />
                        <span className="text-gray-900">{docName}</span>
                      </div>
                      <Download className="w-5 h-5 text-gray-400" />
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
                onStatusChange={loadApplicationDetail}
              />
            )}

            {/* Status History */}
            {statusHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 ml-2 text-emerald-600" />
                  سجل الحالات
                </h3>

                <div className="space-y-3">
                  {statusHistory.map((history, index) => (
                    <div key={history.id} className="relative">
                      {index !== statusHistory.length - 1 && (
                        <div className="absolute right-2 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className="w-4 h-4 rounded-full mt-1 relative z-10"
                          style={{ backgroundColor: history.application_statuses?.color || '#6B7280' }}
                        ></div>

                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {history.application_statuses?.name_ar}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(history.created_at)}
                          </p>
                          {history.notes && (
                            <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">إجراءات سريعة</h3>

              <div className="space-y-2">
                <button
                  onClick={() => setShowShippingModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                >
                  <Package className="w-5 h-5" />
                  إضافة شحنة
                </button>

                <button
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100"
                >
                  <FileText className="w-5 h-5" />
                  عرض الفاتورة
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
