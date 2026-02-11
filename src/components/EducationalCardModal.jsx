import React, { useState, useEffect } from 'react';
import { X, Upload, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EducationalCardModal = ({ isOpen, onClose, application, existingCard, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    student_full_name: '',
    student_national_id: '',
    exam_type: 'Primary Certificate',
    exam_type_ar: 'الشهادة الابتدائية',
    seat_number: '',
    center_name: '',
    center_name_ar: '',
    center_number: '',
    student_photo_url: ''
  });

  useEffect(() => {
    if (existingCard) {
      setFormData({
        student_full_name: existingCard.student_full_name || '',
        student_national_id: existingCard.student_national_id || '',
        exam_type: existingCard.exam_type || 'Primary Certificate',
        exam_type_ar: existingCard.exam_type_ar || 'الشهادة الابتدائية',
        seat_number: existingCard.seat_number || '',
        center_name: existingCard.center_name || '',
        center_name_ar: existingCard.center_name_ar || '',
        center_number: existingCard.center_number || '',
        student_photo_url: existingCard.student_photo_url || ''
      });
    } else if (application?.form_data) {
      const data = application.form_data;
      setFormData(prev => ({
        ...prev,
        student_full_name: data.student_name || data.full_name || '',
        student_national_id: data.national_id || data.student_national_id || ''
      }));
    }
  }, [existingCard, application]);

  const examTypes = [
    { value: 'Primary Certificate', label: 'Primary Certificate', label_ar: 'الشهادة الابتدائية' },
    { value: 'Intermediate Certificate', label: 'Intermediate Certificate', label_ar: 'الشهادة الإعدادية' },
    { value: 'Secondary Certificate', label: 'Secondary Certificate', label_ar: 'الشهادة الثانوية' }
  ];

  const handleExamTypeChange = (value) => {
    const selectedType = examTypes.find(t => t.value === value);
    setFormData(prev => ({
      ...prev,
      exam_type: selectedType.value,
      exam_type_ar: selectedType.label_ar
    }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 2MB');
      return;
    }

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${application.id}_${Date.now()}.${fileExt}`;
      const filePath = `educational-cards/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, student_photo_url: publicUrl }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('حدث خطأ في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.student_full_name || !formData.student_national_id ||
        !formData.seat_number || !formData.center_name || !formData.center_name_ar ||
        !formData.center_number) {
      alert('يرجى تعبئة جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();

      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (!staffData) {
        throw new Error('يجب أن تكون موظفاً لإنشاء بطاقة تعليمية');
      }

      let cardNumber = existingCard?.card_number;

      if (!existingCard) {
        const { data: numberData } = await supabase
          .rpc('generate_educational_card_number');
        cardNumber = numberData;
      }

      const cardData = {
        application_id: application.actualId || application.id,
        card_number: cardNumber,
        ...formData,
        created_by: staffData?.id,
        updated_by: staffData?.id
      };

      if (existingCard) {
        const { error } = await supabase
          .from('educational_cards')
          .update(cardData)
          .eq('id', existingCard.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('educational_cards')
          .insert([cardData]);

        if (error) throw error;

        await supabase
          .from('applications')
          .update({ status: 'card_created' })
          .eq('id', application.actualId || application.id);
      }

      alert(existingCard ? 'تم تحديث البطاقة بنجاح' : 'تم إنشاء البطاقة بنجاح');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving card:', error);
      alert('حدث خطأ في حفظ البطاقة');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {existingCard ? 'تعديل البطاقة التعليمية' : 'إنشاء بطاقة تعليمية'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم الطالب الكامل <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.student_full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, student_full_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="أدخل الاسم الكامل"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الرقم الوطني <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.student_national_id}
                onChange={(e) => setFormData(prev => ({ ...prev, student_national_id: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="أدخل الرقم الوطني"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع الشهادة <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.exam_type}
                onChange={(e) => handleExamTypeChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {examTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label_ar} - {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رقم الجلوس <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.seat_number}
                onChange={(e) => setFormData(prev => ({ ...prev, seat_number: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="أدخل رقم الجلوس"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم المركز (بالعربية) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.center_name_ar}
                onChange={(e) => setFormData(prev => ({ ...prev, center_name_ar: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="مثال: مركز جدة الرئيسي"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                اسم المركز (بالإنجليزية) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.center_name}
                onChange={(e) => setFormData(prev => ({ ...prev, center_name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Example: Jeddah Main Center"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رقم المركز <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.center_number}
                onChange={(e) => setFormData(prev => ({ ...prev, center_number: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="مثال: C-001"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                صورة الطالب
              </label>
              <div className="space-y-3">
                {formData.student_photo_url && (
                  <div className="relative w-32 h-32">
                    <img
                      src={formData.student_photo_url}
                      alt="Student"
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                  {uploading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      {formData.student_photo_url ? 'تغيير الصورة' : 'رفع صورة'}
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500">
                  حجم الصورة الأقصى: 2MB
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                existingCard ? 'تحديث البطاقة' : 'إنشاء البطاقة'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EducationalCardModal;
