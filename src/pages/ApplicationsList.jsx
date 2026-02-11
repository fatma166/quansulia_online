import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  Eye,
  Calendar,
  MapPin,
  ChevronDown,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  Sliders
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { useStatuses } from '../hooks/useStatuses';
import ExportModal from '../components/ExportModal';
import CustomFiltersModal from '../components/CustomFiltersModal';

export default function ApplicationsList() {
  const { user, isSuperAdmin, canAccessStatus, canAccessRegion } = useAuth();
  const navigate = useNavigate();
  const { statuses, getStatusColor } = useStatuses();

  // State for applications and pagination
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  // Service filters
  const [mainServices, setMainServices] = useState([]);
  const [subServices, setSubServices] = useState([]);
  const [selectedMainService, setSelectedMainService] = useState('all');
  const [selectedSubService, setSelectedSubService] = useState('all');

  // Date filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Regions list
  const [regions, setRegions] = useState([]);

  // Export modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Custom filters
  const [showCustomFiltersModal, setShowCustomFiltersModal] = useState(false);
  const [customFilters, setCustomFilters] = useState([]);

  // Load initial data
  useEffect(() => {
    loadMainServices();
    loadRegions();
  }, []);

  // Fetch applications when filters change
  useEffect(() => {
    fetchApplications();
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, regionFilter,
      selectedMainService, selectedSubService, dateFrom, dateTo, customFilters]);

  // Load all main services (parent_id = null)
  const loadMainServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name_ar, slug')
        .is('parent_id', null)
        .eq('is_active', true)
        .order('name_ar');

      if (error) throw error;
      setMainServices(data || []);
    } catch (error) {
      console.error('Error loading main services:', error);
    }
  };

  // Load sub-services when main service changes
  const loadSubServices = async (mainServiceId) => {
    try {
      setSubServices([]);
      setSelectedSubService('all');

      if (mainServiceId === 'all') return;

      const { data, error } = await supabase
        .from('services')
        .select('id, name_ar, slug')
        .eq('parent_id', mainServiceId)
        .eq('is_active', true)
        .order('name_ar');

      if (error) throw error;
      setSubServices(data || []);
    } catch (error) {
      console.error('Error loading sub-services:', error);
    }
  };

  // Load regions from static data
  const loadRegions = async () => {
    try {
      const { getRegionsList } = await import('../data/saudiRegions.js');
      const regionsList = getRegionsList();
      setRegions(regionsList);
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  // Fetch applications with pagination and filters
  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Calculate offset
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Build query
      let query = supabase
        .from('applications')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `reference_number.ilike.%${searchQuery}%,` +
          `service_title.ilike.%${searchQuery}%,` +
          `form_data->>fullName.ilike.%${searchQuery}%`
        );
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply region filter
      if (regionFilter !== 'all') {
        query = query.eq('applicant_region', regionFilter);
      }

      // Apply service filters
      if (selectedSubService !== 'all') {
        // فلترة على خدمة فرعية محددة
        const service = subServices.find(s => s.id === selectedSubService);
        if (service) {
          query = query.eq('service_id', service.slug);
        }
      } else if (selectedMainService !== 'all') {
        // فلترة على خدمة أساسية + كل فروعها
        const mainService = mainServices.find(s => s.id === selectedMainService);
        if (mainService) {
          // جلب كل الخدمات الفرعية التابعة للخدمة الأساسية
          const { data: childServices } = await supabase
            .from('services')
            .select('slug')
            .eq('parent_id', selectedMainService)
            .eq('is_active', true);

          // إنشاء مصفوفة بكل الـ slugs (الخدمة الأساسية + الفرعية)
          const allSlugs = [mainService.slug];
          if (childServices && childServices.length > 0) {
            allSlugs.push(...childServices.map(s => s.slug));
          }

          query = query.in('service_id', allSlugs);
        }
      }

      // Apply date filters
      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }
      if (dateTo) {
        // Add one day to include the entire end date
        const endDate = new Date(dateTo);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt('created_at', endDate.toISOString().split('T')[0]);
      }

      // Apply staff permissions
      if (!isSuperAdmin) {
        // فلترة حسب الحالات المسموح بها
        if (user.allowedStatuses && user.allowedStatuses.length > 0) {
          query = query.in('status', user.allowedStatuses);
        }

        // فلترة حسب المناطق المسموح بها
        if (user.allowedRegions && user.allowedRegions.length > 0 && !user.canAccessAllRegions) {
          query = query.in('applicant_region', user.allowedRegions);
        }

        // فلترة حسب الخدمات المسموح بها
        if (!user.canAccessAllServices && user.allowedServices && user.allowedServices.length > 0) {
          query = query.in('service_id', user.allowedServices);
        }
      }

      // Apply custom filters on form_data
      if (customFilters && customFilters.length > 0) {
        console.log('Applying custom filters:', customFilters);
        customFilters.forEach(filter => {
          // استخدام ->> للحصول على text value من JSON field
          const fieldPath = `form_data->>${filter.field}`;
          console.log(`Filtering: ${fieldPath} ${filter.operator} ${filter.value}`);

          switch (filter.operator) {
            case 'equals':
              query = query.filter(fieldPath, 'eq', filter.value);
              break;
            case 'notEquals':
              query = query.filter(fieldPath, 'neq', filter.value);
              break;
            case 'contains':
              query = query.filter(fieldPath, 'ilike', `%${filter.value}%`);
              break;
            case 'startsWith':
              query = query.filter(fieldPath, 'ilike', `${filter.value}%`);
              break;
            case 'endsWith':
              query = query.filter(fieldPath, 'ilike', `%${filter.value}`);
              break;
            case 'greaterThan':
              query = query.filter(fieldPath, 'gt', filter.value);
              break;
            case 'lessThan':
              query = query.filter(fieldPath, 'lt', filter.value);
              break;
            case 'greaterThanOrEqual':
              query = query.filter(fieldPath, 'gte', filter.value);
              break;
            case 'lessThanOrEqual':
              query = query.filter(fieldPath, 'lte', filter.value);
              break;
            case 'before':
              query = query.filter(fieldPath, 'lt', filter.value);
              break;
            case 'after':
              query = query.filter(fieldPath, 'gt', filter.value);
              break;
          }
        });
      }

      // Apply pagination and ordering
      query = query
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setApplications(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle main service change
  const handleMainServiceChange = (serviceId) => {
    setSelectedMainService(serviceId);
    if (serviceId !== 'all') {
      loadSubServices(serviceId);
    } else {
      setSubServices([]);
      setSelectedSubService('all');
    }
  };

  // Handle status change
  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Refresh current page
      fetchApplications();
      alert('تم تحديث حالة الطلب بنجاح');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
  };

  // Handle custom filters
  const handleApplyCustomFilters = (filters) => {
    setCustomFilters(filters);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setRegionFilter('all');
    setSelectedMainService('all');
    setSelectedSubService('all');
    setSubServices([]);
    setDateFrom('');
    setDateTo('');
    setCustomFilters([]);
    setCurrentPage(1);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  // Page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Check if any filter is active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || regionFilter !== 'all' ||
    selectedMainService !== 'all' || selectedSubService !== 'all' || dateFrom || dateTo ||
    customFilters.length > 0;

  return (
    <AdminLayout>
      <div className="p-6" dir="rtl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              الطلبات المستلمة
            </h1>
            <p className="text-gray-600">
              إجمالي الطلبات: <span className="font-semibold">{totalCount}</span>
              {hasActiveFilters && (
                <span className="text-sm text-blue-600 mr-2">
                  (تم تطبيق فلاتر)
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowExportModal(true)}
              disabled={loading || applications.length === 0}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>تصدير</span>
            </button>
            <button
              onClick={() => fetchApplications()}
              disabled={loading}
              className="flex items-center space-x-2 rtl:space-x-reverse bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ابحث برقم المرجع، اسم الخدمة، أو اسم المتقدم..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 rtl:space-x-reverse px-4 py-2 rounded-lg transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#276073] text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>فلتر</span>
              {hasActiveFilters && (
                <span className="bg-white text-[#276073] text-xs font-bold px-2 py-0.5 rounded-full">
                  !
                </span>
              )}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center space-x-2 rtl:space-x-reverse bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>مسح الفلاتر</span>
              </button>
            )}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    >
                      <option value="all">جميع الحالات</option>
                      {statuses.map((status) => (
                        <option key={status.status_key} value={status.status_key}>
                          {status.label_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المنطقة
                    </label>
                    <select
                      value={regionFilter}
                      onChange={(e) => {
                        setRegionFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    >
                      <option value="all">جميع المناطق</option>
                      {regions.map(region => (
                        <option key={region.value} value={region.value}>{region.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Main Service Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الخدمة
                    </label>
                    <select
                      value={selectedMainService}
                      onChange={(e) => {
                        handleMainServiceChange(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    >
                      <option value="all">جميع الخدمات</option>
                      {mainServices.map(service => (
                        <option key={service.id} value={service.id}>
                          {service.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sub Service Filter */}
                  {subServices.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الخدمة
                      </label>
                      <select
                        value={selectedSubService}
                        onChange={(e) => {
                          setSelectedSubService(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                      >
                        <option value="all">جميع الأنواع</option>
                        {subServices.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name_ar}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date From */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      من تاريخ
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    />
                  </div>

                  {/* Date To */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      إلى تاريخ
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Custom Filters Button */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowCustomFiltersModal(true)}
                    className={`w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                      customFilters.length > 0
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        : 'bg-gradient-to-r from-[#276073] to-[#1e4a5a] hover:from-[#1e4a5a] hover:to-[#276073] text-white'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                    <span className="font-medium">تخصيص</span>
                    {customFilters.length > 0 && (
                      <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {customFilters.length}
                      </span>
                    )}
                  </button>
                  {customFilters.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-semibold text-gray-700">الفلاتر المخصصة النشطة:</p>
                      <div className="flex flex-wrap gap-2">
                        {customFilters.map((filter, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm"
                          >
                            <span className="font-medium">{filter.field}</span>
                            <span className="text-blue-600">•</span>
                            <span>{filter.value}</span>
                            <button
                              onClick={() => {
                                const newFilters = customFilters.filter((_, i) => i !== index);
                                setCustomFilters(newFilters);
                              }}
                              className="text-blue-600 hover:text-blue-800 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination Controls - Top */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">عرض</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <label className="text-sm text-gray-700">طلب</label>
          </div>

          <div className="text-sm text-gray-600">
            عرض {startItem} - {endItem} من أصل {totalCount}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#276073]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الرقم المرجعي
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الخدمة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المتقدم
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      المنطقة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      الحالة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p>لا توجد طلبات</p>
                        {hasActiveFilters && (
                          <button
                            onClick={clearAllFilters}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            مسح الفلاتر
                          </button>
                        )}
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono font-medium text-[#276073]">
                            {application.reference_number}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {application.service_title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {application.form_data?.fullName || '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {application.applicant_phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 ml-1" />
                            {application.applicant_region || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(application.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={application.status}
                            onChange={(e) => handleStatusChange(application.id, e.target.value)}
                            className={`text-xs px-3 py-1 rounded-full font-semibold cursor-pointer ${getStatusColor(application.status)}`}
                          >
                            {statuses.map((status) => (
                              <option key={status.status_key} value={status.status_key}>
                                {status.label_ar}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => navigate(`/admin/applications/${application.id}`)}
                            className="text-[#276073] hover:text-[#1e4a5a] flex items-center space-x-1 rtl:space-x-reverse"
                          >
                            <Eye className="w-4 h-4" />
                            <span>عرض</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Controls - Bottom */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                صفحة {currentPage} من {totalPages}
              </div>

              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                    </>
                  )}

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        pageNum === currentPage
                          ? 'bg-[#276073] text-white font-semibold'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="text-sm text-gray-600">
                إجمالي {totalCount} طلب
              </div>
            </div>
          </div>
        )}

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          applications={applications}
          statuses={statuses}
          selectedMainService={selectedMainService}
          selectedSubService={selectedSubService}
          mainServices={mainServices}
          subServices={subServices}
        />

        {/* Custom Filters Modal */}
        <CustomFiltersModal
          isOpen={showCustomFiltersModal}
          onClose={() => setShowCustomFiltersModal(false)}
          onApply={handleApplyCustomFilters}
          serviceId={selectedSubService !== 'all' ? selectedSubService : selectedMainService}
          initialFilters={customFilters}
        />
      </div>
    </AdminLayout>
  );
}
