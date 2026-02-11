import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Settings,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Activity,
  FileText,
  CheckCircle,
  AlertCircle,
  Layers,
  List
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../hooks/useLanguage';

const ServicesManagement = () => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteItemSource, setDeleteItemSource] = useState('service');
  const [expandedService, setExpandedService] = useState(null);
  const [subcategories, setSubcategories] = useState({});
  const [loadingSubcategories, setLoadingSubcategories] = useState({});

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);

      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session);

      const { data, error } = await supabase
        .from('services')
        .select('*')
        .is('parent_id', null)
        .order('order_index', { ascending: true });

      console.log('Services fetch result:', { data, error, count: data?.length });

      if (error) {
        console.error('Error fetching services:', error);
        throw error;
      }

      const servicesWithCounts = await Promise.all((data || []).map(async (service) => {
        const [fieldsCount, docsCount, reqsCount, subsCount, typesCount] = await Promise.all([
          supabase.from('service_fields').select('id', { count: 'exact', head: true }).eq('service_id', service.id),
          supabase.from('service_documents').select('id', { count: 'exact', head: true }).eq('service_id', service.id),
          supabase.from('service_requirements').select('id', { count: 'exact', head: true }).eq('service_id', service.id),
          supabase.from('services').select('id', { count: 'exact', head: true }).eq('parent_id', service.id),
          supabase.from('service_types').select('id', { count: 'exact', head: true }).eq('service_id', service.id)
        ]);

        return {
          ...service,
          fields_count: fieldsCount.count || 0,
          docs_count: docsCount.count || 0,
          reqs_count: reqsCount.count || 0,
          subs_count: (subsCount.count || 0) + (typesCount.count || 0)
        };
      }));

      console.log('Services with counts:', servicesWithCounts.length);
      setServices(servicesWithCounts);
    } catch (error) {
      console.error('Error fetching services:', error);
      alert('حدث خطأ في جلب الخدمات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    try {
      const table = deleteItemSource === 'service_type' ? 'service_types' : 'services';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchServices();
      setShowDeleteConfirm(null);
      setDeleteItemSource('service');

      // إعادة تحميل الخدمات الفرعية للخدمة المفتوحة
      if (expandedService) {
        fetchSubcategories(expandedService);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('حدث خطأ في حذف الخدمة');
    }
  };

  const toggleServiceStatus = async (id, currentStatus, source = 'service') => {
    try {
      const table = source === 'service_type' ? 'service_types' : 'services';
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchServices();

      // إعادة تحميل الخدمات الفرعية للخدمة المفتوحة
      if (expandedService) {
        fetchSubcategories(expandedService);
      }
    } catch (error) {
      console.error('Error updating service:', error);
    }
  };

  const fetchSubcategories = async (serviceId) => {
    try {
      setLoadingSubcategories(prev => ({ ...prev, [serviceId]: true }));

      // جلب الخدمات الفرعية من جدول services
      const { data: childServices, error: childError } = await supabase
        .from('services')
        .select('*')
        .eq('parent_id', serviceId)
        .order('order_index', { ascending: true });

      if (childError) throw childError;

      // جلب service_types المرتبطة بهذه الخدمة
      const { data: serviceTypes, error: typesError } = await supabase
        .from('service_types')
        .select('*')
        .eq('service_id', serviceId)
        .order('created_at', { ascending: true });

      if (typesError) throw typesError;

      // دمج النوعين مع إضافة علامة للتفريق
      const allSubcategories = [
        ...(childServices || []).map(s => ({ ...s, source: 'service' })),
        ...(serviceTypes || []).map(t => ({ ...t, source: 'service_type' }))
      ];

      setSubcategories(prev => ({ ...prev, [serviceId]: allSubcategories }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoadingSubcategories(prev => ({ ...prev, [serviceId]: false }));
    }
  };

  const toggleExpand = async (serviceId) => {
    if (expandedService === serviceId) {
      setExpandedService(null);
    } else {
      setExpandedService(serviceId);
      if (!subcategories[serviceId]) {
        await fetchSubcategories(serviceId);
      }
    }
  };

  const categories = [
    { value: 'all', label: 'جميع التصنيفات' },
    { value: 'passports', label: 'جوازات السفر' },
    { value: 'power-of-attorney', label: 'التوكيلات' },
    { value: 'attestations', label: 'التصديقات' },
    { value: 'civil-registry', label: 'الأحوال المدنية' },
    { value: 'education', label: 'التعليم' },
    { value: 'visas', label: 'التأشيرات' },
    { value: 'other', label: 'أخرى' }
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.name_en && service.name_en.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الخدمات</h1>
                <p className="text-gray-600">إدارة جميع الخدمات القنصلية والفرعية</p>
              </div>
              <button
                onClick={() => navigate('/admin/services/new')}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a5a] transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
                <span>إضافة خدمة جديدة</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="البحث عن خدمة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#276073]"></div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد خدمات</h3>
                <p className="text-gray-600 mb-6">ابدأ بإضافة خدمة جديدة</p>
                <button
                  onClick={() => navigate('/admin/services/new')}
                  className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] text-white px-6 py-3 rounded-lg hover:bg-[#1e4a5a] transition-colors duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>إضافة خدمة جديدة</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{service.name_ar}</h3>
                            {service.is_active ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                نشط
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                غير نشط
                              </span>
                            )}
                          </div>
                          {service.name_en && (
                            <p className="text-sm text-gray-500 mb-2">{service.name_en}</p>
                          )}
                          {service.description_ar && (
                            <p className="text-gray-600 text-sm line-clamp-2">{service.description_ar}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-blue-600 mb-1">
                            <Layers className="w-4 h-4" />
                            <span className="text-xs font-semibold">الخدمات الفرعية</span>
                          </div>
                          <p className="text-lg font-bold text-blue-900">
                            {service.subs_count || 0}
                          </p>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-purple-600 mb-1">
                            <Settings className="w-4 h-4" />
                            <span className="text-xs font-semibold">الحقول</span>
                          </div>
                          <p className="text-lg font-bold text-purple-900">
                            {service.fields_count || 0}
                          </p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-orange-600 mb-1">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs font-semibold">المتطلبات</span>
                          </div>
                          <p className="text-lg font-bold text-orange-900">
                            {service.reqs_count || 0}
                          </p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse text-green-600 mb-1">
                            <FileText className="w-4 h-4" />
                            <span className="text-xs font-semibold">المستندات</span>
                          </div>
                          <p className="text-lg font-bold text-green-900">
                            {service.docs_count || 0}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => toggleExpand(service.id)}
                            className="flex items-center space-x-1 rtl:space-x-reverse text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                            title="عرض الخدمات الفرعية"
                          >
                            {expandedService === service.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <span className="text-sm">الخدمات الفرعية</span>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/services/${service.id}/dashboard`)}
                            className="flex items-center space-x-1 rtl:space-x-reverse text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                            title="عرض Dashboard"
                          >
                            <Activity className="w-4 h-4" />
                            <span className="text-sm">التحليلات</span>
                          </button>

                          <button
                            onClick={() => navigate(`/admin/services/${service.id}`)}
                            className="flex items-center space-x-1 rtl:space-x-reverse text-green-600 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-green-50 transition-colors duration-200"
                            title="تعديل"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="text-sm">تعديل</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          <button
                            onClick={() => toggleServiceStatus(service.id, service.is_active)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${
                              service.is_active
                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {service.is_active ? 'إيقاف' : 'تفعيل'}
                          </button>

                          <button
                            onClick={() => setShowDeleteConfirm(service.id)}
                            className="flex items-center space-x-1 rtl:space-x-reverse text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {expandedService === service.id && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Layers className="w-5 h-5 text-purple-600" />
                            <h4 className="text-lg font-bold text-gray-900">الخدمات الفرعية</h4>
                          </div>
                          <button
                            onClick={() => navigate(`/admin/services/new?parent=${service.id}`)}
                            className="flex items-center space-x-2 rtl:space-x-reverse bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>إضافة خدمة فرعية</span>
                          </button>
                        </div>

                        {loadingSubcategories[service.id] ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          </div>
                        ) : subcategories[service.id]?.length === 0 ? (
                          <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
                            <List className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 mb-4">لا توجد خدمات فرعية لهذه الخدمة</p>
                            <button
                              onClick={() => navigate(`/admin/services/new?parent=${service.id}`)}
                              className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              <span>إضافة خدمة فرعية</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {subcategories[service.id]?.map((subcat) => (
                              <div
                                key={subcat.id}
                                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-purple-300 transition-colors duration-200"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse mb-1">
                                      <h5 className="text-base font-semibold text-gray-900">{subcat.name_ar}</h5>
                                      {subcat.source === 'service_type' && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                          نوع خدمة
                                        </span>
                                      )}
                                      {subcat.is_active ? (
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                          نشط
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                                          غير نشط
                                        </span>
                                      )}
                                    </div>
                                    {subcat.name_en && (
                                      <p className="text-xs text-gray-500 mb-2">{subcat.name_en}</p>
                                    )}
                                    {subcat.description_ar && (
                                      <p className="text-sm text-gray-600 line-clamp-1">{subcat.description_ar}</p>
                                    )}
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse mt-2">
                                      <span className="text-xs text-gray-500">
                                        <span className="font-semibold text-gray-700">{subcat.service_types?.[0]?.count || 0}</span> أنواع
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        <span className="font-semibold text-gray-700">{subcat.service_fields?.[0]?.count || 0}</span> حقول
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                    {subcat.source === 'service' ? (
                                      <button
                                        onClick={() => navigate(`/admin/services/${subcat.id}`)}
                                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                        title="تعديل"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => navigate(`/admin/services/${service.id}?tab=service-types&type=${subcat.id}`)}
                                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                        title="عرض التفاصيل"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => toggleServiceStatus(subcat.id, subcat.is_active, subcat.source)}
                                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors duration-200 ${
                                        subcat.is_active
                                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                                      }`}
                                    >
                                      {subcat.is_active ? 'إيقاف' : 'تفعيل'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowDeleteConfirm(subcat.id);
                                        setDeleteItemSource(subcat.source);
                                      }}
                                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                      title="حذف"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
        </div>

        {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">تأكيد الحذف</h3>
            </div>

            <p className="text-gray-600 mb-6">
              هل أنت متأكد من حذف هذه الخدمة؟ سيتم حذف جميع البيانات المرتبطة بها (الأنواع، الحقول، المتطلبات، المستندات).
            </p>

            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => deleteService(showDeleteConfirm)}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-semibold transition-colors duration-200"
              >
                حذف
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesManagement;
