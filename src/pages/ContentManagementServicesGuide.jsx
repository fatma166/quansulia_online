import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';

export default function ContentManagementServicesGuide() {
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_ar: '',
    title_en: '',
    content_ar: '',
    content_en: '',
    step_number: null,
    image_url: '',
    video_url: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    if (editingSection) {
      setFormData(editingSection);
    }
  }, [editingSection]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('services_guide_sections')
        .select('*')
        .order('order_index');

      if (error) throw error;
      if (data) setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const sectionData = {
        ...formData,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (formData.id) {
        const { error } = await supabase
          .from('services_guide_sections')
          .update(sectionData)
          .eq('id', formData.id);
        if (error) throw error;
      } else {
        sectionData.created_by = user?.id;
        const { error } = await supabase
          .from('services_guide_sections')
          .insert([sectionData]);
        if (error) throw error;
      }

      alert('تم الحفظ بنجاح');
      setEditingSection(null);
      setFormData({
        title_ar: '',
        title_en: '',
        content_ar: '',
        content_en: '',
        step_number: null,
        image_url: '',
        video_url: '',
        order_index: 0,
        is_active: true
      });
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('services_guide_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('تم الحذف بنجاح');
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة دليل المعاملات</h1>
        <p className="text-gray-600">إدارة محتوى دليل استخدام الخدمات القنصلية</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => {
            setEditingSection({});
            setFormData({
              title_ar: '',
              title_en: '',
              content_ar: '',
              content_en: '',
              step_number: sections.length + 1,
              image_url: '',
              video_url: '',
              order_index: sections.length,
              is_active: true
            });
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة خطوة جديدة
        </button>
      </div>

      {editingSection !== null && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {editingSection.id ? 'تعديل الخطوة' : 'إضافة خطوة جديدة'}
            </h3>
            <button
              onClick={() => setEditingSection(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  العنوان (عربي) *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رقم الخطوة
                </label>
                <input
                  type="number"
                  value={formData.step_number || ''}
                  onChange={(e) => setFormData({ ...formData, step_number: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                العنوان (English)
              </label>
              <input
                type="text"
                value={formData.title_en || ''}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المحتوى (عربي) *
              </label>
              <RichTextEditor
                value={formData.content_ar}
                onChange={(value) => setFormData({ ...formData, content_ar: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المحتوى (English)
              </label>
              <RichTextEditor
                value={formData.content_en || ''}
                onChange={(value) => setFormData({ ...formData, content_en: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                صورة توضيحية
              </label>
              <ImageUploader
                currentImage={formData.image_url}
                onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                bucket="services-guide"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رابط فيديو توضيحي (YouTube)
              </label>
              <input
                type="url"
                value={formData.video_url || ''}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-gray-500 mt-1">استخدم رابط embed من YouTube</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-700">فعال</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الخطوة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">العنوان</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الترتيب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sections.map((section) => (
                <tr key={section.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {section.step_number && (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                        {section.step_number}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{section.title_ar}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{section.order_index}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {section.is_active ? 'فعال' : 'غير فعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(section.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
