import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Calendar
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';

const ServiceDashboard = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { serviceId } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0
  });

  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [serviceId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const { data: serviceData, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .maybeSingle();

      if (serviceError) throw serviceError;
      setService(serviceData);

      const { data: applicationsData, error: appsError } = await supabase
        .from('applications')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      const applications = applicationsData || [];

      setStats({
        total: applications.length,
        new: applications.filter(app => app.status === 'new').length,
        pending: applications.filter(app => app.status === 'pending').length,
        processing: applications.filter(app => app.status === 'processing').length,
        completed: applications.filter(app => app.status === 'completed').length,
        rejected: applications.filter(app => app.status === 'rejected').length
      });

      setRecentApplications(applications.slice(0, 10));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    new: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FileText, label: 'جديد' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'قيد الانتظار' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-700', icon: AlertCircle, label: 'قيد المعالجة' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'مكتمل' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle, label: 'مرفوض' }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#276073]"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الخدمة غير موجودة</h2>
          <button
            onClick={() => navigate('/admin/services')}
            className="text-[#276073] hover:underline"
          >
            العودة إلى قائمة الخدمات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/services')}
            className="flex items-center space-x-2 rtl:space-x-reverse text-[#276073] hover:text-[#1e4a5a] mb-4"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            <span>العودة إلى قائمة الخدمات</span>
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name_ar}</h1>
              <p className="text-gray-600">لوحة التحكم والتحليلات</p>
            </div>

            <button
              onClick={() => navigate(`/admin/services/${serviceId}`)}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a5a]"
            >
              <span>تعديل الخدمة</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-sm font-semibold opacity-90 mb-1">إجمالي الطلبات</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-sm font-semibold opacity-90 mb-1">الطلبات المكتملة</p>
            <p className="text-4xl font-bold">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <TrendingUp className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-sm font-semibold opacity-90 mb-1">قيد المعالجة</p>
            <p className="text-4xl font-bold">{stats.processing + stats.pending}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">توزيع الحالات</h2>

            <div className="space-y-4">
              {Object.entries(statusColors).map(([status, config]) => {
                const Icon = config.icon;
                const count = stats[status];
                const percentage = stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0;

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{config.label}</p>
                          <p className="text-sm text-gray-600">{count} طلب</p>
                        </div>
                      </div>
                      <span className={`text-lg font-bold ${config.text}`}>{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${config.bg.replace('100', '500')}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">أحدث الطلبات</h2>

            {recentApplications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">لا توجد طلبات حتى الآن</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications.map((app) => {
                  const config = statusColors[app.status] || statusColors.new;
                  const Icon = config.icon;

                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                      onClick={() => navigate(`/admin/applications/${app.id}`)}
                    >
                      <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
                        <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${config.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {app.applicant_name || 'غير محدد'}
                          </p>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(app.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 ${config.bg} ${config.text} text-xs font-semibold rounded-full whitespace-nowrap`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">ملخص الأداء</h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusColors).map(([status, config]) => {
              const Icon = config.icon;
              const count = stats[status];

              return (
                <div key={status} className={`${config.bg} rounded-lg p-4`}>
                  <Icon className={`w-8 h-8 ${config.text} mb-2`} />
                  <p className={`text-2xl font-bold ${config.text} mb-1`}>{count}</p>
                  <p className="text-sm font-semibold text-gray-700">{config.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
