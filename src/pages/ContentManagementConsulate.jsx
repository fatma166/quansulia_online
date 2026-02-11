import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Upload, Building2, Users, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';
import ImageUploader from '../components/ImageUploader';
import RichTextEditor from '../components/RichTextEditor';

export default function ContentManagementConsulate() {
  const [activeTab, setActiveTab] = useState('sections');
  const [sections, setSections] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [editingAmbassador, setEditingAmbassador] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sectionsResult, ambassadorsResult] = await Promise.all([
        supabase.from('about_consulate_sections').select('*').order('order_index'),
        supabase.from('ambassadors').select('*').order('order_index')
      ]);

      if (sectionsResult.data) setSections(sectionsResult.data);
      if (ambassadorsResult.data) setAmbassadors(ambassadorsResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (section) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const sectionData = {
        ...section,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (section.id) {
        const { error } = await supabase
          .from('about_consulate_sections')
          .update(sectionData)
          .eq('id', section.id);
        if (error) throw error;
      } else {
        sectionData.created_by = user?.id;
        const { error } = await supabase
          .from('about_consulate_sections')
          .insert([sectionData]);
        if (error) throw error;
      }

      alert('تم الحفظ بنجاح');
      setEditingSection(null);
      fetchData();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('about_consulate_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('تم الحذف بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const handleSaveAmbassador = async (ambassador) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const ambassadorData = {
        ...ambassador,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (ambassador.id) {
        const { error } = await supabase
          .from('ambassadors')
          .update(ambassadorData)
          .eq('id', ambassador.id);
        if (error) throw error;
      } else {
        ambassadorData.created_by = user?.id;
        const { error } = await supabase
          .from('ambassadors')
          .insert([ambassadorData]);
        if (error) throw error;
      }

      alert('تم الحفظ بنجاح');
      setEditingAmbassador(null);
      fetchData();
    } catch (error) {
      console.error('Error saving ambassador:', error);
      alert('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAmbassador = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('ambassadors')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('تم الحذف بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting ambassador:', error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة محتوى عن القنصلية</h1>
        <p className="text-gray-600">إدارة أقسام صفحة عن القنصلية والسفراء</p>
      </div>

      <div className="mb-6 flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'sections'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <span>الأقسام</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ambassadors')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'ambassadors'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>السفراء</span>
          </div>
        </button>
      </div>

      {activeTab === 'sections' && (
        <SectionsTab
          sections={sections}
          editingSection={editingSection}
          setEditingSection={setEditingSection}
          handleSaveSection={handleSaveSection}
          handleDeleteSection={handleDeleteSection}
          saving={saving}
        />
      )}

      {activeTab === 'ambassadors' && (
        <AmbassadorsTab
          ambassadors={ambassadors}
          editingAmbassador={editingAmbassador}
          setEditingAmbassador={setEditingAmbassador}
          handleSaveAmbassador={handleSaveAmbassador}
          handleDeleteAmbassador={handleDeleteAmbassador}
          saving={saving}
        />
      )}
    </AdminLayout>
  );
}

function SectionsTab({ sections, editingSection, setEditingSection, handleSaveSection, handleDeleteSection, saving }) {
  const [formData, setFormData] = useState({
    section_type: 'consul_word',
    title_ar: '',
    title_en: '',
    content_ar: '',
    content_en: '',
    image_url: '',
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    if (editingSection) {
      setFormData(editingSection);
    }
  }, [editingSection]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveSection(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingSection({});
            setFormData({
              section_type: 'consul_word',
              title_ar: '',
              title_en: '',
              content_ar: '',
              content_en: '',
              image_url: '',
              order_index: sections.length,
              is_active: true
            });
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة قسم جديد
        </button>
      </div>

      {editingSection !== null && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {editingSection.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
            </h3>
            <button
              onClick={() => setEditingSection(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع القسم *
              </label>
              <select
                value={formData.section_type}
                onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="consul_word">كلمة القنصل</option>
                <option value="about_consulate">نبذة عن القنصلية</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
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
                  العنوان (English)
                </label>
                <input
                  type="text"
                  value={formData.title_en || ''}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
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
                الصورة
              </label>
              <ImageUploader
                currentImage={formData.image_url}
                onImageUploaded={(url) => setFormData({ ...formData, image_url: url })}
                bucket="consulate-images"
              />
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">النوع</th>
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
                    <span className="text-sm text-gray-900">
                      {section.section_type === 'consul_word' ? 'كلمة القنصل' : 'نبذة عن القنصلية'}
                    </span>
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
                        onClick={() => handleDeleteSection(section.id)}
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
    </div>
  );
}

function AmbassadorsTab({ ambassadors, editingAmbassador, setEditingAmbassador, handleSaveAmbassador, handleDeleteAmbassador, saving }) {
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    photo_url: '',
    biography_ar: '',
    biography_en: '',
    term_start_date: '',
    term_end_date: '',
    is_current: false,
    order_index: 0,
    is_active: true
  });

  useEffect(() => {
    if (editingAmbassador) {
      setFormData(editingAmbassador);
    }
  }, [editingAmbassador]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSaveAmbassador(formData);
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => {
            setEditingAmbassador({});
            setFormData({
              name_ar: '',
              name_en: '',
              photo_url: '',
              biography_ar: '',
              biography_en: '',
              term_start_date: '',
              term_end_date: '',
              is_current: false,
              order_index: ambassadors.length,
              is_active: true
            });
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة سفير
        </button>
      </div>

      {editingAmbassador !== null && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {editingAmbassador.id ? 'تعديل السفير' : 'إضافة سفير جديد'}
            </h3>
            <button
              onClick={() => setEditingAmbassador(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم (عربي) *
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الاسم (English)
                </label>
                <input
                  type="text"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الصورة الشخصية
              </label>
              <ImageUploader
                currentImage={formData.photo_url}
                onImageUploaded={(url) => setFormData({ ...formData, photo_url: url })}
                bucket="consulate-images"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                السيرة الذاتية (عربي) *
              </label>
              <RichTextEditor
                value={formData.biography_ar}
                onChange={(value) => setFormData({ ...formData, biography_ar: value })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                السيرة الذاتية (English)
              </label>
              <RichTextEditor
                value={formData.biography_en || ''}
                onChange={(value) => setFormData({ ...formData, biography_en: value })}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تاريخ بداية الفترة
                </label>
                <input
                  type="date"
                  value={formData.term_start_date || ''}
                  onChange={(e) => setFormData({ ...formData, term_start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  تاريخ نهاية الفترة
                </label>
                <input
                  type="date"
                  value={formData.term_end_date || ''}
                  onChange={(e) => setFormData({ ...formData, term_end_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
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
                <label className="flex items-center gap-3 cursor-pointer h-full">
                  <input
                    type="checkbox"
                    checked={formData.is_current}
                    onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-700">سفير حالي</span>
                </label>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer h-full">
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
                onClick={() => setEditingAmbassador(null)}
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الاسم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الفترة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالي</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ambassadors.map((ambassador) => (
                <tr key={ambassador.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {ambassador.photo_url && (
                        <img
                          src={ambassador.photo_url}
                          alt={ambassador.name_ar}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm font-medium text-gray-900">{ambassador.name_ar}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ambassador.term_start_date && new Date(ambassador.term_start_date).getFullYear()}
                    {' - '}
                    {ambassador.term_end_date ? new Date(ambassador.term_end_date).getFullYear() : 'الآن'}
                  </td>
                  <td className="px-6 py-4">
                    {ambassador.is_current && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Award className="w-3 h-3 ml-1" />
                        حالي
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      ambassador.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ambassador.is_active ? 'فعال' : 'غير فعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingAmbassador(ambassador)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAmbassador(ambassador.id)}
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
    </div>
  );
}
