import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function AddStaff() {
  const navigate = useNavigate();
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
    phone: '+966501234567',
    role_id: '',
    department_id: '',
    hire_date: new Date().toISOString().split('T')[0],
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
    generateEmployeeNumber();
  }, []);

  // إزالة الـ effect القديم - username الآن مستقل تماماً

  const fetchLookupData = async () => {
    try {
      setLoading(true);

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
    } finally {
      setLoading(false);
    }
  };

  const generateEmployeeNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, employee_number: `EMP${timestamp}${random}` }));
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
    } else if (formData.username.length > 50) {
      newErrors.username = 'اسم المستخدم يجب أن يكون 50 حرف كحد أقصى';
    }

    // Employee number is now optional
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

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(05|5)\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05)';
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
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // Get role name for user_metadata
      const selectedRole = roles.find(r => r.id === formData.role_id);

      // Call Edge Function to create user and staff record
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username, // الحقل الأساسي الجديد
            employee_number: formData.employee_number || null, // اختياري
            full_name_ar: formData.full_name_ar,
            full_name_en: formData.full_name_en,
            phone: formData.phone,
            role_id: formData.role_id,
            role_name: selectedRole?.name || 'staff',
            department_id: formData.department_id,
            hire_date: formData.hire_date
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إنشاء الموظف');
      }

      const staffId = result.staff?.id;

      if (!staffId) {
        throw new Error('فشل في الحصول على معرف الموظف');
      }

      // Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(staffId);
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

      // Update staff with permissions, access settings, and avatar
      const { error: updateError } = await supabase
        .from('staff')
        .update({
          permissions: {
            dashboard_sections: formData.dashboardSections,
            allowed_services: allowedServiceSlugs,
            allowed_statuses: allowedStatuses,
            allowed_regions: allowedRegions
          },
          can_access_all_services: formData.selectAllServices,
          can_access_all_regions: formData.selectAllRegions,
          avatar_url: avatarUrl
        })
        .eq('id', staffId);

      if (updateError) {
        console.error('Error updating permissions:', updateError);
      }

      // If services are selected (and not all services), also link them in staff_services table for backwards compatibility
      if (formData.selectedServices.length > 0 && !formData.selectAllServices) {
        const serviceLinks = formData.selectedServices.map(serviceId => ({
          staff_id: staffId,
          service_id: serviceId,
          can_process: true,
          can_approve: false,
          can_view: true
        }));

        const { error: servicesError } = await supabase
          .from('staff_services')
          .insert(serviceLinks);

        if (servicesError) {
          console.error('Error linking services:', servicesError);
        }
      }

      alert('تم إضافة الموظف بنجاح!');
      navigate('/admin/staff');
    } catch (error) {
      console.error('Error creating staff:', error);
      alert('حدث خطأ: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
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
              إضافة موظف جديد
            </h1>
            <p className="text-gray-600 mt-2">
              قم بملء البيانات التالية لإضافة موظف جديد إلى النظام
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl">
            {/* Basic Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-[#276073]" />
                البيانات الأساسية
              </h2>

              {/* Avatar Upload */}
              <div className="mb-6 flex justify-center">
                <div className="text-center">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    صورة الموظف
                  </label>
                  <div className="relative inline-block">
                    {avatarPreview ? (
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="w-32 h-32 rounded-full object-cover border-4 border-[#276073]"
                        />
                        <button
                          type="button"
                          onClick={removeAvatar}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-32 h-32 rounded-full border-4 border-dashed border-gray-300 hover:border-[#276073] flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">اختر صورة</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    الحد الأقصى: 5 ميجابايت
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username - الحقل الأساسي */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم المستخدم *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all ${
                        errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="أي اسم مستخدم"
                    />
                  </div>
                  {errors.username ? (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">
                      يمكن استخدام أي حروف أو أرقام أو رموز
                    </p>
                  )}
                </div>

                {/* Employee Number - اختياري */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    رقم الموظف (اختياري)
                  </label>
                  <div className="relative">
                    <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.employee_number}
                      onChange={(e) => handleInputChange('employee_number', e.target.value)}
                      className={`w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none transition-all ${
                        errors.employee_number ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="EMP12345 (اختياري)"
                    />
                  </div>
                  {errors.employee_number && (
                    <p className="mt-1 text-sm text-red-600">{errors.employee_number}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    للاستخدام الإداري فقط
                  </p>
                </div>

                {/* Full Name Arabic */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الاسم الكامل (بالعربي) *
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
                    الاسم الكامل (بالإنجليزي)
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
                    رقم الهاتف *
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
                      placeholder="05xxxxxxxx"
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
                بيانات تسجيل الدخول
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    اسم المستخدم *
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.username}
                      readOnly
                      className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed outline-none"
                      placeholder="سيتم نسخه من رقم الموظف"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    يتم نسخه تلقائياً من رقم الموظف
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    كلمة المرور *
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
                      placeholder="••••••••"
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الحالة
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-4 h-4 text-[#276073] focus:ring-[#276073]"
                      />
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3" />
                        نشط
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="inactive"
                        checked={formData.status === 'inactive'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-4 h-4 text-[#276073] focus:ring-[#276073]"
                      />
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                        غير نشط
                      </span>
                    </label>
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

              {/* Select All Services */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.selectAllServices}
                    onChange={(e) => handleSelectAllServices(e.target.checked)}
                    className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                  />
                  <span className="text-base font-bold text-gray-900">
                    ✨ تحديد جميع الخدمات (وصول كامل لجميع الخدمات)
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
                  <p className="text-sm text-gray-600 mt-1">
                    يمكنه العمل على جميع الخدمات المتاحة في النظام
                  </p>
                </div>
              )}

              {services.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  لا توجد خدمات متاحة
                </p>
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

              {/* Select All Statuses */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.selectAllStatuses}
                    onChange={(e) => handleSelectAllStatuses(e.target.checked)}
                    className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                  />
                  <span className="text-base font-bold text-gray-900">
                    ✨ تحديد جميع الحالات (وصول كامل لجميع الحالات)
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
                  <p className="text-sm text-gray-600 mt-1">
                    يمكنه العمل على الطلبات في جميع الحالات
                  </p>
                </div>
              )}

              {statuses.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  لا توجد حالات متاحة
                </p>
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

              {/* Select All Regions */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.selectAllRegions}
                    onChange={(e) => handleSelectAllRegions(e.target.checked)}
                    className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                  />
                  <span className="text-base font-bold text-gray-900">
                    ✨ تحديد جميع المناطق (وصول كامل لجميع المناطق)
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
                  <p className="text-sm text-gray-600 mt-1">
                    يمكنه رؤية الطلبات من جميع المناطق
                  </p>
                </div>
              )}

              {regions.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  لا توجد مناطق متاحة
                </p>
              )}
            </div>

            {/* Dashboard Sections */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#276073]" />
                صلاحيات لوحة التحكم
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                اختر الأقسام التي يمكن للموظف الوصول إليها في لوحة التحكم (ستظهر في القائمة الجانبية)
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
                    حفظ الموظف
                  </>
                )}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
