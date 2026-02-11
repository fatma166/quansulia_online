import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/AdminLayout';

export default function ContentManagementImportantLinks() {
  const [links, setLinks] = useState([]);
  const [editingLink, setEditingLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title_ar: '',
    title_en: '',
    description_ar: '',
    description_en: '',
    url: '',
    category: 'general',
    icon: '',
    order_index: 0,
    opens_new_tab: true,
    is_active: true
  });

  const categories = [
    { id: 'all', name: 'الكل' },
    { id: 'government', name: 'جهات حكومية' },
    { id: 'ministry', name: 'وزارات' },
    { id: 'legal', name: 'قانونية' },
    { id: 'documentation', name: 'وثائق' },
    { id: 'education', name: 'تعليم' },
    { id: 'community', name: 'مجتمع' },
    { id: 'general', name: 'عام' }
  ];

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    if (editingLink) {
      setFormData(editingLink);
    }
  }, [editingLink]);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('important_links')
        .select('*')
        .order('category')
        .order('order_index');

      if (error) throw error;
      if (data) setLinks(data);
    } catch (error) {
      console.error('Error fetching links:', error);
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

      const linkData = {
        ...formData,
        updated_at: new Date().toISOString(),
        updated_by: user?.id
      };

      if (formData.id) {
        const { error } = await supabase
          .from('important_links')
          .update(linkData)
          .eq('id', formData.id);
        if (error) throw error;
      } else {
        linkData.created_by = user?.id;
        const { error } = await supabase
          .from('important_links')
          .insert([linkData]);
        if (error) throw error;
      }

      alert('تم الحفظ بنجاح');
      setEditingLink(null);
      setFormData({
        title_ar: '',
        title_en: '',
        description_ar: '',
        description_en: '',
        url: '',
        category: 'general',
        icon: '',
        order_index: 0,
        opens_new_tab: true,
        is_active: true
      });
      fetchLinks();
    } catch (error) {
      console.error('Error saving link:', error);
      alert('حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from('important_links')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('تم الحذف بنجاح');
      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const filteredLinks = filterCategory === 'all'
    ? links
    : links.filter(link => link.category === filterCategory);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المواقع المهمة</h1>
        <p className="text-gray-600">إدارة روابط المواقع الرسمية والجهات الحكومية</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => {
            setEditingLink({});
            setFormData({
              title_ar: '',
              title_en: '',
              description_ar: '',
              description_en: '',
              url: '',
              category: 'general',
              icon: '',
              order_index: links.length,
              opens_new_tab: true,
              is_active: true
            });
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة رابط جديد
        </button>

        <div className="flex-1 flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {editingLink !== null && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {editingLink.id ? 'تعديل الرابط' : 'إضافة رابط جديد'}
            </h3>
            <button
              onClick={() => setEditingLink(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                رابط الموقع (URL) *
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                  dir="ltr"
                />
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف (عربي)
                </label>
                <textarea
                  value={formData.description_ar || ''}
                  onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف (English)
                </label>
                <textarea
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

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
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.opens_new_tab}
                  onChange={(e) => setFormData({ ...formData, opens_new_tab: e.target.checked })}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-semibold text-gray-700">فتح في نافذة جديدة</span>
              </label>

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
                onClick={() => setEditingLink(null)}
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
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">العنوان</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الرابط</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الفئة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLinks.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{link.title_ar}</div>
                      {link.description_ar && (
                        <div className="text-xs text-gray-500 mt-1">{link.description_ar.slice(0, 60)}...</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      dir="ltr"
                    >
                      <span className="max-w-[200px] truncate">{link.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {categories.find(c => c.id === link.category)?.name || link.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      link.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {link.is_active ? 'فعال' : 'غير فعال'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingLink(link)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
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
