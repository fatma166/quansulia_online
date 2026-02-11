import React, { useState, useEffect } from 'react';
import { X, Truck, Package, Calendar, ExternalLink, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ShippingModal = ({ isOpen, onClose, onSubmit, applicationId }) => {
  const [shippingCompanies, setShippingCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    shipping_company_id: '',
    tracking_url: '',
    shipped_at: new Date().toISOString().split('T')[0],
    estimated_delivery: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchShippingCompanies();
      // Reset form when modal opens
      setFormData({
        shipping_company_id: '',
        tracking_url: '',
        shipped_at: new Date().toISOString().split('T')[0],
        estimated_delivery: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchShippingCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('shipping_companies')
        .select('id, name, name_en')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setShippingCompanies(data || []);
    } catch (error) {
      console.error('Error fetching shipping companies:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.shipping_company_id) {
      newErrors.shipping_company_id = 'يجب اختيار شركة الشحن';
    }

    if (!formData.shipped_at) {
      newErrors.shipped_at = 'يجب إدخال تاريخ الشحن';
    }

    if (!formData.estimated_delivery) {
      newErrors.estimated_delivery = 'يجب إدخال تاريخ الوصول المتوقع';
    }

    // Validate that estimated delivery is after shipped date
    if (formData.shipped_at && formData.estimated_delivery) {
      const shippedDate = new Date(formData.shipped_at);
      const deliveryDate = new Date(formData.estimated_delivery);
      if (deliveryDate <= shippedDate) {
        newErrors.estimated_delivery = 'تاريخ الوصول يجب أن يكون بعد تاريخ الشحن';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Get application data to extract address and phone
      const { data: applicationData } = await supabase
        .from('applications')
        .select('form_data, applicant_region, applicant_phone')
        .eq('id', applicationId)
        .maybeSingle();

      // Check if shipment already exists
      const { data: existingShipment } = await supabase
        .from('shipments')
        .select('id')
        .eq('application_id', applicationId)
        .maybeSingle();

      const selectedCompany = shippingCompanies.find(c => c.id === formData.shipping_company_id);

      // Extract shipping address from form_data
      const formDataApp = applicationData?.form_data || {};

      // Try different field names that might be used in different services
      const region = formDataApp.region || formDataApp.applicantRegion || applicationData?.applicant_region || '';
      const city = formDataApp.city || formDataApp.applicantCity || '';
      const district = formDataApp.district || formDataApp.applicantDistrict || formDataApp.neighborhood || '';
      const street = formDataApp.address || formDataApp.nearestLandmark || formDataApp.applicantAddress || formDataApp.landmark || '';
      const phone = formDataApp.phoneNumber || formDataApp.phone || formDataApp.applicantPhone || applicationData?.applicant_phone || '';

      console.log('Extracting address from application:', {
        applicationId,
        region,
        city,
        district,
        street,
        phone,
        formDataApp
      });

      const shippingAddress = {
        region,
        city,
        district,
        street,
        phone
      };

      const shipmentData = {
        application_id: applicationId,
        shipping_company_id: formData.shipping_company_id,
        carrier: selectedCompany?.name || 'غير محدد',
        tracking_url: formData.tracking_url || null,
        shipped_at: formData.shipped_at,
        estimated_delivery: formData.estimated_delivery,
        tracking_number: `TRK-${Date.now()}`, // Generate tracking number
        shipping_address: shippingAddress,
        current_status: 'in_transit'
      };

      if (existingShipment) {
        // Update existing shipment
        const { error } = await supabase
          .from('shipments')
          .update(shipmentData)
          .eq('id', existingShipment.id);

        if (error) throw error;
      } else {
        // Create new shipment
        const { error } = await supabase
          .from('shipments')
          .insert([shipmentData]);

        if (error) throw error;
      }

      // Call parent submit handler
      onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving shipment:', error);
      alert('حدث خطأ في حفظ بيانات الشحن: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#276073] to-[#1e4a5a] text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">معلومات الشحن</h3>
                <p className="text-sm text-blue-100 mt-1">أدخل تفاصيل الشحن وتاريخ التسليم المتوقع</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">ملاحظة مهمة</p>
                <p>سيتم إرسال رابط التتبع وتفاصيل الشحن للعميل عبر البريد الإلكتروني والرسائل النصية.</p>
              </div>
            </div>
          </div>

          {/* Shipping Company */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              شركة الشحن <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="shipping_company_id"
                value={formData.shipping_company_id}
                onChange={handleChange}
                className={`w-full pr-11 pl-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none transition-all ${
                  errors.shipping_company_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">اختر شركة الشحن</option>
                {shippingCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.shipping_company_id && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.shipping_company_id}
              </p>
            )}
          </div>

          {/* Tracking URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              رابط التتبع
            </label>
            <div className="relative">
              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                name="tracking_url"
                value={formData.tracking_url}
                onChange={handleChange}
                placeholder="https://example.com/track/123456"
                className="w-full pr-11 pl-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none transition-all"
                dir="ltr"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">اختياري - رابط مباشر لتتبع الشحنة</p>
          </div>

          {/* Shipped Date */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              تاريخ الشحن <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="shipped_at"
                value={formData.shipped_at}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full pr-11 pl-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none transition-all ${
                  errors.shipped_at ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.shipped_at && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.shipped_at}
              </p>
            )}
          </div>

          {/* Estimated Delivery */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              تاريخ الوصول المتوقع <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="estimated_delivery"
                value={formData.estimated_delivery}
                onChange={handleChange}
                min={formData.shipped_at || new Date().toISOString().split('T')[0]}
                className={`w-full pr-11 pl-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-[#276073] outline-none transition-all ${
                  errors.estimated_delivery ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.estimated_delivery && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.estimated_delivery}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">التاريخ المتوقع لوصول الشحنة للعميل</p>
          </div>

          {/* Summary Box */}
          {formData.shipping_company_id && formData.shipped_at && formData.estimated_delivery && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                ملخص بيانات الشحن
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">شركة الشحن:</span>
                  <span className="font-semibold text-gray-900">
                    {shippingCompanies.find(c => c.id === formData.shipping_company_id)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الشحن:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(formData.shipped_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوصول المتوقع:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(formData.estimated_delivery).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                {formData.tracking_url && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">رابط التتبع:</span>
                    <a
                      href={formData.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      عرض الرابط
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#276073] text-white hover:bg-[#1e4a5a] shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  <span>حفظ بيانات الشحن</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingModal;
