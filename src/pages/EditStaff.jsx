import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  Lock,
  Briefcase,
  Calendar,
  Shield,
  Save,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Building2,
  FileText,
  Upload,
  X,
  MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EditStaff() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Lookup data
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [services, setServices] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [regions, setRegions] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    employee_number: '',
    username: '',
    full_name_ar: '',
    full_name_en: '',
    email: '',
    password: '',
    phone: '',
    role_id: '',
    department_id: '',
    hire_date: '',
    status: 'active',
    selectedServices: [],
    selectAllServices: false,
    selectedStatuses: [],
    selectAllStatuses: false,
    selectedRegions: [],
    selectAllRegions: false,
    dashboardSections: []
  });

  const [errors, setErrors] = useState({});

  // قائمة أقسام لوحة التحكم المتاحة
  const dashboardSectionsOptions = [
    { id: 'overview', name_ar: 'لوحة التحكم الرئيسية', icon: '📊' },
    { id: 'applications', name_ar: 'إدارة الطلبات', icon: '📝' },
    { id: 'services', name_ar: 'إدارة الخدمات', icon: '⚙️' },
    { id: 'staff', name_ar: 'إدارة الموظفين', icon: '👥' },
    { id: 'content', name_ar: 'إدارة المحتوى', icon: '📰' },
    { id: 'chat', name_ar: 'إدارة المحادثات', icon: '💬' },
    { id: 'chat-staff', name_ar: 'موظفي الدعم', icon: '👨‍💼' },
    { id: 'appointments', name_ar: 'تقويم الحجوزات', icon: '📅' },
    { id: 'shipping', name_ar: 'شركات الشحن', icon: '🚚' },
    { id: 'reports', name_ar: 'التقارير', icon: '📈' }
  ];

  useEffect(() => {
    fetchLookupData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchStaffData();
    }
  }, [id]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);

      const { data: staff, error } = await supabase
        .from('staff')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!staff) throw new Error('الموظف غير موجود');

      // استخراج البيانات من permissions
      const permissions = staff.permissions || {};
      const dashboardSections = permissions.dashboard_sections || [];
      const allowedServices = permissions.allowed_services || [];
      const allowedStatuses = permissions.allowed_statuses || [];
      const allowedRegions = permissions.allowed_regions || [];

      // جلب الخدمات المحددة
      let selectedServiceIds = [];
      if (allowedServices.length > 0) {
        const { data: selectedServices } = await supabase
          .from('services')
          .select('id')
          .in('slug', allowedServices);
        selectedServiceIds = selectedServices?.map(s => s.id) || [];
      }

      setFormData({
        employee_number: staff.employee_number || '',
        username: staff.username || '', // استخدام username الحقيقي
        full_name_ar: staff.full_name_ar || '',
        full_name_en: staff.full_name_en || '',
        email: staff.email || '',
        password: '',
        phone: staff.phone || '',
        role_id: staff.role_id || '',
        department_id: staff.department_id || '',
        hire_date: staff.hire_date ? staff.hire_date.split('T')[0] : '',
        status: staff.is_active ? 'active' : 'inactive',
        selectedServices: selectedServiceIds,
        selectAllServices: staff.can_access_all_services || false,
        selectedStatuses: allowedStatuses,
        selectAllStatuses: allowedStatuses.length === 0 && !staff.can_access_all_services,
        selectedRegions: allowedRegions,
        selectAllRegions: staff.can_access_all_regions || false,
        dashboardSections: dashboardSections
      });

      if (staff.avatar_url) {
        setAvatarPreview(staff.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching staff data:', error);
      alert('حدث خطأ في تحميل بيانات الموظف: ' + error.message);
      navigate('/admin/staff');
    } finally {
      setLoading(false);
    }
  };

  const fetchLookupData = async () => {
    try {
      const [deptResult, roleResult, serviceResult, statusResult, regionResult] = await Promise.all([
        supabase
          .from('departments')
          .select('*')
          .eq('is_active', true)
          .order('name_ar'),

        supabase
          .from('roles')
          .select('*')
          .eq('is_active', true)
          .order('name_ar'),

        supabase
          .from('services')
          .select('id, slug, name_ar, name_en, category')
          .eq('is_active', true)
          .order('name_ar'),

        supabase
          .from('application_statuses')
          .select('status_key, label_ar, label_en, category')
          .eq('is_active', true)
          .order('order_index'),

        supabase
          .from('regions')
          .select('id, code, name_ar, name_en')
          .eq('is_active', true)
          .order('name_ar')
      ]);

      if (deptResult.error) throw deptResult.error;
      if (roleResult.error) throw roleResult.error;
      if (serviceResult.error) throw serviceResult.error;
      if (statusResult.error) throw statusResult.error;
      if (regionResult.error) throw regionResult.error;

      setDepartments(deptResult.data || []);
      setRoles(roleResult.data || []);
      setServices(serviceResult.data || []);
      setStatuses(statusResult.data || []);
      setRegions(regionResult.data || []);
    } catch (error) {
      console.error('Error fetching lookup data:', error);
      alert('حدث خطأ في تحميل البيانات: ' + error.message);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('يجب اختيار صورة');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const uploadAvatar = async (staffId) => {
    if (!avatarFile) return null;

    try {
      setUploadingAvatar(true);
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${staffId}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('staff-avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('staff-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username (required)
    if (!formData.username.trim()) {
      newErrors.username = 'اسم المستخدم مطلوب';
    } else if (formData.username.length < 3) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
    } else if (formData.username.length > 30) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 30 حرف كحد أقصى';
    } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'اسم المستخدم يجب أن يحتوي فقط على حروف إنجليزية صغيرة وأرقام وشرطة سفلية';
    }

    // Employee number is optional
    if (formData.employee_number && formData.employee_number.trim() && !/^[a-zA-Z0-9_-]+$/.test(formData.employee_number)) {
      newErrors.employee_number = 'رقم الموظف يجب أن يحتوي فقط على حروف وأرقام';
    }

    if (!formData.full_name_ar.trim()) {
      newErrors.full_name_ar = 'الاسم بالعربي مطلوب';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    }

    if (!formData.role_id) {
      newErrors.role_id = 'يجب اختيار الدور الوظيفي';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'يجب اختيار القسم';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      alert('يرجى تصحيح الأخطاء في النموذج');
      return;
    }

    setSubmitting(true);

    try {
      // Upload avatar if changed
      let avatarUrl = avatarPreview;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(id);
      }

      // Get slugs for selected services
      let allowedServiceSlugs = [];
      if (formData.selectedServices.length > 0 && !formData.selectAllServices) {
        const { data: selectedServicesData } = await supabase
          .from('services')
          .select('slug')
          .in('id', formData.selectedServices);

        allowedServiceSlugs = selectedServicesData?.map(s => s.slug) || [];
      }

      // Get selected statuses and regions
      const allowedStatuses = formData.selectAllStatuses ? [] : formData.selectedStatuses;
      const allowedRegions = formData.selectAllRegions ? [] : formData.selectedRegions;

      // Update staff record
      const { error: updateError } = await supabase
        .from('staff')
        .update({
          username: formData.username, // إضافة username
          employee_number: formData.employee_number || null, // اختياري
          full_name_ar: formData.full_name_ar,
          full_name_en: formData.full_name_en,
          email: formData.email,
          phone: formData.phone,
          role_id: formData.role_id,
          department_id: formData.department_id,
          hire_date: formData.hire_date,
          is_active: formData.status === 'active',
          permissions: {
            dashboard_sections: formData.dashboardSections,
            allowed_services: allowedServiceSlugs,
            allowed_statuses: allowedStatuses,
            allowed_regions: allowedRegions
          },
          can_access_all_services: formData.selectAllServices,
          can_access_all_regions: formData.selectAllRegions,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update password if provided
      if (formData.password) {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-staff-password`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              },
              body: JSON.stringify({
                staff_id: id,
                new_password: formData.password
              })
            }
          );
        }
      }

      // Update staff_services table
      if (!formData.selectAllServices) {
        // حذف الخدمات القديمة
        await supabase
          .from('staff_services')
          .delete()
          .eq('staff_id', id);

        // إضافة الخدمات الجديدة
        if (formData.selectedServices.length > 0) {
          const serviceLinks = formData.selectedServices.map(serviceId => ({
            staff_id: id,
            service_id: serviceId,
            can_process: true,
            can_approve: false,
            can_view: true
          }));

          await supabase
            .from('staff_services')
            .insert(serviceLinks);
        }
      }

      alert('تم تحديث بيانات الموظف بنجاح!');
      navigate('/admin/staff');
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('حدث خطأ: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    // معالجة خاصة لـ username: تحويل إلى lowercase وإزالة الرموز الغير صالحة
    if (field === 'username') {
      value = value
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '') // إزالة أي رمز ليس حرف أو رقم أو underscore
        .replace(/^_+|_+$/g, ''); // إزالة underscore من البداية والنهاية
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const toggleService = (serviceId) => {
    setFormData(prev => ({
      ...prev,
      selectedServices: prev.selectedServices.includes(serviceId)
        ? prev.selectedServices.filter(id => id !== serviceId)
        : [...prev.selectedServices, serviceId]
    }));
  };

  const toggleDashboardSection = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      dashboardSections: prev.dashboardSections.includes(sectionId)
        ? prev.dashboardSections.filter(id => id !== sectionId)
        : [...prev.dashboardSections, sectionId]
    }));
  };

  const handleSelectAllServices = (checked) => {
    setFormData(prev => ({
      ...prev,
      selectAllServices: checked,
      selectedServices: checked ? services.map(s => s.id) : []
    }));
  };

  const toggleStatus = (statusKey) => {
    setFormData(prev => ({
      ...prev,
      selectedStatuses: prev.selectedStatuses.includes(statusKey)
        ? prev.selectedStatuses.filter(key => key !== statusKey)
        : [...prev.selectedStatuses, statusKey]
    }));
  };

  const handleSelectAllStatuses = (checked) => {
    setFormData(prev => ({
      ...prev,
      selectAllStatuses: checked,
      selectedStatuses: checked ? statuses.map(s => s.status_key) : []
    }));
  };

  const toggleRegion = (regionCode) => {
    setFormData(prev => ({
      ...prev,
      selectedRegions: prev.selectedRegions.includes(regionCode)
        ? prev.selectedRegions.filter(code => code !== regionCode)
        : [...prev.selectedRegions, regionCode]
    }));
  };

  const handleSelectAllRegions = (checked) => {
    setFormData(prev => ({
      ...prev,
      selectAllRegions: checked,
      selectedRegions: checked ? regions.map(r => r.code) : []
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#276073]" />
      </div>
    );
  }

  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/staff')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            العودة إلى قائمة الموظفين
          </button>

          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <User className="w-8 h-8 text-[#276073]" />
            تعديل بيانات الموظف
          </h1>
          <p className="text-gray-600 mt-2">
            قم بتحديث البيانات المطلوبة
          </p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          {/* Avatar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-[#276073]" />
              الصورة الشخصية
            </h2>

            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              <div>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>اختر صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  PNG أو JPG (حد أقصى 5 ميجابايت)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-[#276073]" />
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Number - Read Only */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رقم الموظف
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.employee_number}
                    readOnly
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              {/* Full Name Arabic */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم بالعربي *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.full_name_ar}
                    onChange={(e) => handleInputChange('full_name_ar', e.target.value)}
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all ${
                      errors.full_name_ar ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="أحمد محمد علي"
                  />
                </div>
                {errors.full_name_ar && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name_ar}</p>
                )}
              </div>

              {/* Full Name English */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم بالإنجليزي
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.full_name_en}
                    onChange={(e) => handleInputChange('full_name_en', e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all"
                    placeholder="Ahmed Mohammed Ali"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رقم الجوال *
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="0501234567"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="example@consulate.gov.sd"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#276073]" />
              تغيير كلمة المرور (اختياري)
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pr-10 pl-12 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all ${
                      errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="اتركها فارغة إذا كنت لا تريد تغييرها"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  يجب أن تكون كلمة المرور 6 أحرف على الأقل
                </p>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-[#276073]" />
              معلومات العمل
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الدور الوظيفي *
                </label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.role_id}
                    onChange={(e) => handleInputChange('role_id', e.target.value)}
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all appearance-none ${
                      errors.role_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر الدور الوظيفي</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name_ar} ({role.name})
                      </option>
                    ))}
                  </select>
                </div>
                {errors.role_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.role_id}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  القسم *
                </label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.department_id}
                    onChange={(e) => handleInputChange('department_id', e.target.value)}
                    className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all appearance-none ${
                      errors.department_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر القسم</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.department_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
                )}
              </div>

              {/* Hire Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تاريخ التعيين
                </label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => handleInputChange('hire_date', e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الحالة
                </label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all appearance-none"
                  >
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-[#276073]" />
              الخدمات المخصصة
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              اختر الخدمات التي يمكن للموظف العمل عليها
            </p>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                <input
                  type="checkbox"
                  checked={formData.selectAllServices}
                  onChange={(e) => handleSelectAllServices(e.target.checked)}
                  className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                />
                <span className="text-base font-bold text-gray-900">
                  ✨ تحديد جميع الخدمات (وصول كامل)
                </span>
              </label>
            </div>

            {!formData.selectAllServices && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {services.map(service => (
                  <label
                    key={service.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.selectedServices.includes(service.id)
                        ? 'border-[#276073] bg-[#276073] bg-opacity-5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedServices.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                      className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {service.name_ar}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {formData.selectAllServices && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900">
                  الموظف لديه وصول لجميع الخدمات
                </p>
              </div>
            )}
          </div>

          {/* Statuses */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#276073]" />
              الحالات المسموح بها
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              اختر الحالات التي يمكن للموظف التعامل معها
            </p>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                <input
                  type="checkbox"
                  checked={formData.selectAllStatuses}
                  onChange={(e) => handleSelectAllStatuses(e.target.checked)}
                  className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                />
                <span className="text-base font-bold text-gray-900">
                  ✨ تحديد جميع الحالات (وصول كامل)
                </span>
              </label>
            </div>

            {!formData.selectAllStatuses && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {statuses.map(status => (
                  <label
                    key={status.status_key}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.selectedStatuses.includes(status.status_key)
                        ? 'border-[#276073] bg-[#276073] bg-opacity-5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedStatuses.includes(status.status_key)}
                      onChange={() => toggleStatus(status.status_key)}
                      className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {status.label_ar}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {formData.selectAllStatuses && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900">
                  الموظف لديه وصول لجميع الحالات
                </p>
              </div>
            )}
          </div>

          {/* Regions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#276073]" />
              المناطق المسموح بها
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              اختر المناطق التي يمكن للموظف رؤية طلباتها
            </p>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                <input
                  type="checkbox"
                  checked={formData.selectAllRegions}
                  onChange={(e) => handleSelectAllRegions(e.target.checked)}
                  className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                />
                <span className="text-base font-bold text-gray-900">
                  ✨ تحديد جميع المناطق (وصول كامل)
                </span>
              </label>
            </div>

            {!formData.selectAllRegions && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {regions.map(region => (
                  <label
                    key={region.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.selectedRegions.includes(region.code)
                        ? 'border-[#276073] bg-[#276073] bg-opacity-5'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedRegions.includes(region.code)}
                      onChange={() => toggleRegion(region.code)}
                      className="w-4 h-4 text-[#276073] rounded focus:ring-[#276073]"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {region.name_ar}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {formData.selectAllRegions && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-900">
                  الموظف لديه وصول لجميع المناطق
                </p>
              </div>
            )}
          </div>

          {/* Dashboard Sections */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#276073]" />
              صلاحيات لوحة التحكم
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              اختر الأقسام التي يمكن للموظف الوصول إليها
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dashboardSectionsOptions.map(section => (
                <label
                  key={section.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.dashboardSections.includes(section.id)
                      ? 'border-[#276073] bg-[#276073] bg-opacity-10 shadow-md'
                      : 'border-gray-200 hover:border-gray-400 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.dashboardSections.includes(section.id)}
                    onChange={() => toggleDashboardSection(section.id)}
                    className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                  />
                  <span className="text-2xl">{section.icon}</span>
                  <span className="text-base font-semibold text-gray-900">
                    {section.name_ar}
                  </span>
                </label>
              ))}
            </div>

            {formData.dashboardSections.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 font-medium">
                  ⚠️ لم يتم اختيار أي أقسام. الموظف لن يتمكن من الوصول إلى أي قسم في لوحة التحكم.
                </p>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/staff')}
              className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
              disabled={submitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingAvatar}
              className="flex-1 px-6 py-4 bg-[#276073] hover:bg-[#1e4a5a] disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadingAvatar ? 'جاري رفع الصورة...' : 'جاري الحفظ...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  حفظ التغييرات
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
