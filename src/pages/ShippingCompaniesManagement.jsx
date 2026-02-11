import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Save, X, Search,
  Package, Globe, Phone, Mail, User, MapPin,
  Building2, Briefcase, FileText, Eye, EyeOff, Link
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';

const ShippingCompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    website: '',
    tracking_url: '',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    contact_person_position: '',
    address: '',
    city: 'الرياض',
    country: 'المملكة العربية السعودية',
    logo_url: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shipping_companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCompanies(data || []);
    } catch (err) {
      console.error('Error loading companies:', err);
      setError('حدث خطأ في تحميل شركات الشحن');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_en: '',
      website: '',
      tracking_url: '',
      contact_person_name: '',
      contact_person_phone: '',
      contact_person_email: '',
      contact_person_position: '',
      address: '',
      city: 'الرياض',
      country: 'المملكة العربية السعودية',
      logo_url: '',
      is_active: true,
      notes: ''
    });
    setEditingCompany(null);
    setShowModal(false);
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData(company);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (editingCompany) {
        const { error } = await supabase
          .from('shipping_companies')
          .update(formData)
          .eq('id', editingCompany.id);

        if (error) throw error;
        setSuccess('تم تحديث الشركة بنجاح');
      } else {
        const { error } = await supabase
          .from('shipping_companies')
          .insert([formData]);

        if (error) throw error;
        setSuccess('تمت إضافة الشركة بنجاح');
      }

      await loadCompanies();
      resetForm();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error saving company:', err);
      setError(err.message || 'حدث خطأ في حفظ البيانات');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشركة؟')) return;

    try {
      const { error } = await supabase
        .from('shipping_companies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('تم حذف الشركة بنجاح');
      await loadCompanies();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting company:', err);
      setError('حدث خطأ في حذف الشركة');
    }
  };

  const toggleActive = async (company) => {
    try {
      const { error } = await supabase
        .from('shipping_companies')
        .update({ is_active: !company.is_active })
        .eq('id', company.id);

      if (error) throw error;

      setSuccess(`تم ${company.is_active ? 'إلغاء تفعيل' : 'تفعيل'} الشركة بنجاح`);
      await loadCompanies();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error toggling active status:', err);
      setError('حدث خطأ في تغيير حالة الشركة');
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (company.name_en && company.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (company.contact_person_name && company.contact_person_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إدارة شركات الشحن</h1>
            <p className="text-gray-600 mt-2">إدارة وتنظيم شركات الشحن المتعاقد معها</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة شركة جديدة</span>
          </button>
        </div>

        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              error ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
            }`}
          >
            {error || success}
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث عن شركة..."
              className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCompanies.map((company) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                  company.is_active ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <div className={`p-3 rounded-lg ${company.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Package className={`w-6 h-6 ${company.is_active ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{company.name}</h3>
                      {company.name_en && (
                        <p className="text-sm text-gray-500">{company.name_en}</p>
                      )}
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          company.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {company.is_active ? 'نشطة' : 'غير نشطة'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      onClick={() => toggleActive(company)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title={company.is_active ? 'إلغاء التفعيل' : 'تفعيل'}
                    >
                      {company.is_active ? (
                        <Eye className="w-5 h-5 text-green-600" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(company)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(company.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {company.website && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-green-600 hover:underline"
                      >
                        {company.website}
                      </a>
                    </div>
                  )}

                  {company.contact_person_name && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{company.contact_person_name}</span>
                      {company.contact_person_position && (
                        <span className="text-gray-500">({company.contact_person_position})</span>
                      )}
                    </div>
                  )}

                  {company.contact_person_phone && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${company.contact_person_phone}`} className="hover:text-green-600">
                        {company.contact_person_phone}
                      </a>
                    </div>
                  )}

                  {company.contact_person_email && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${company.contact_person_email}`} className="hover:text-green-600">
                        {company.contact_person_email}
                      </a>
                    </div>
                  )}

                  {company.city && (
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{company.city}{company.country && `, ${company.country}`}</span>
                    </div>
                  )}

                  {company.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">{company.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">لا توجد شركات شحن</p>
          </div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={resetForm}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCompany ? 'تعديل شركة الشحن' : 'إضافة شركة شحن جديدة'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Building2 className="w-4 h-4" />
                          <span>اسم الشركة (عربي) *</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="مثال: شركة سمسا للشحن"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Building2 className="w-4 h-4" />
                          <span>اسم الشركة (إنجليزي)</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name_en"
                        value={formData.name_en}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="Example: SMSA Express"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Globe className="w-4 h-4" />
                          <span>الموقع الإلكتروني</span>
                        </span>
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="flex items-center space-x-2 rtl:space-x-reverse">
                          <Link className="w-4 h-4" />
                          <span>رابط التتبع</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        name="tracking_url"
                        value={formData.tracking_url}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                        placeholder="https://tracking.example.com?id={tracking_number}"
                      />
                      <p className="text-xs text-gray-500 mt-1">استخدم {'{tracking_number}'} للرقم التتبع</p>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">بيانات المسؤول</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <User className="w-4 h-4" />
                            <span>اسم المسؤول</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          value={formData.contact_person_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="أحمد محمد"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Briefcase className="w-4 h-4" />
                            <span>منصب المسؤول</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          name="contact_person_position"
                          value={formData.contact_person_position}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="مدير العمليات"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Phone className="w-4 h-4" />
                            <span>رقم الهاتف</span>
                          </span>
                        </label>
                        <input
                          type="tel"
                          name="contact_person_phone"
                          value={formData.contact_person_phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="+966501234567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Mail className="w-4 h-4" />
                            <span>البريد الإلكتروني</span>
                          </span>
                        </label>
                        <input
                          type="email"
                          name="contact_person_email"
                          value={formData.contact_person_email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">العنوان</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <MapPin className="w-4 h-4" />
                            <span>المدينة</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="الرياض"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <MapPin className="w-4 h-4" />
                            <span>الدولة</span>
                          </span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="المملكة العربية السعودية"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="flex items-center space-x-2 rtl:space-x-reverse">
                            <MapPin className="w-4 h-4" />
                            <span>العنوان الكامل</span>
                          </span>
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="2"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                          placeholder="العنوان الكامل للشركة"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <span className="flex items-center space-x-2 rtl:space-x-reverse">
                        <FileText className="w-4 h-4" />
                        <span>ملاحظات</span>
                      </span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                      placeholder="أي ملاحظات إضافية..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-600"
                    />
                    <label htmlFor="is_active" className="mr-2 text-sm font-medium text-gray-700">
                      الشركة نشطة
                    </label>
                  </div>

                  <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse pt-6 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center space-x-2 rtl:space-x-reverse transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>{editingCompany ? 'حفظ التعديلات' : 'إضافة الشركة'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default ShippingCompaniesManagement;
