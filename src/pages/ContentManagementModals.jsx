import React from 'react';
import { X, Save } from 'lucide-react';

// Counter Modal
export const CounterModal = ({ newItem, setNewItem, saving, setShowAddModal, saveItem }) => {
  const iconsList = ['Users', 'FileCheck', 'Calendar', 'Award', 'TrendingUp', 'Handshake', 'BarChart3'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {newItem.id ? 'تعديل الإحصائية' : 'إضافة إحصائية جديدة'}
          </h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المفتاح (Key)</label>
            <input
              type="text"
              value={newItem.key || ''}
              onChange={(e) => setNewItem({ ...newItem, key: e.target.value })}
              disabled={!!newItem.id}
              placeholder="citizens, transactions..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none disabled:bg-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التسمية (عربي)</label>
              <input
                type="text"
                value={newItem.label_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, label_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">التسمية (English)</label>
              <input
                type="text"
                value={newItem.label_en || ''}
                onChange={(e) => setNewItem({ ...newItem, label_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">القيمة (الرقم)</label>
              <input
                type="number"
                value={newItem.value || 0}
                onChange={(e) => setNewItem({ ...newItem, value: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="color"
                  value={newItem.color || '#276073'}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={newItem.color || ''}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللاحقة (عربي)</label>
              <input
                type="text"
                value={newItem.suffix_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, suffix_ar: e.target.value })}
                placeholder="+, م, دولار..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللاحقة (English)</label>
              <input
                type="text"
                value={newItem.suffix_en || ''}
                onChange={(e) => setNewItem({ ...newItem, suffix_en: e.target.value })}
                placeholder="+, USD..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الأيقونة</label>
            <select
              value={newItem.icon || ''}
              onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              <option value="">اختر الأيقونة</option>
              {iconsList.map((icon) => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.is_active !== false}
                onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
              />
              <span className="text-sm font-medium text-gray-700">مفعّل</span>
            </label>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => saveItem(newItem, 'counters')}
                disabled={saving}
                className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page Section Modal
export const PageSectionModal = ({ newItem, setNewItem, saving, setShowAddModal, saveItem }) => {
  const pagesList = ['home', 'about', 'services', 'contact', 'about-sudan', 'news', 'events'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {newItem.id ? 'تعديل القسم' : 'إضافة قسم جديد'}
          </h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الصفحة</label>
              <select
                value={newItem.page_name || 'home'}
                onChange={(e) => setNewItem({ ...newItem, page_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              >
                {pagesList.map((page) => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مفتاح القسم</label>
              <input
                type="text"
                value={newItem.section_key || ''}
                onChange={(e) => setNewItem({ ...newItem, section_key: e.target.value })}
                placeholder="hero, features, about..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (عربي)</label>
              <input
                type="text"
                value={newItem.title_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, title_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (English)</label>
              <input
                type="text"
                value={newItem.title_en || ''}
                onChange={(e) => setNewItem({ ...newItem, title_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى (عربي)</label>
              <textarea
                value={newItem.content_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, content_ar: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى (English)</label>
              <textarea
                value={newItem.content_en || ''}
                onChange={(e) => setNewItem({ ...newItem, content_en: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة</label>
            <input
              type="text"
              value={newItem.image_url || ''}
              onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
              placeholder="/path/to/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.is_active !== false}
                onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
              />
              <span className="text-sm font-medium text-gray-700">مفعّل</span>
            </label>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => saveItem(newItem, 'page_sections')}
                disabled={saving}
                className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Content Modal
export const FooterContentModal = ({ newItem, setNewItem, saving, setShowAddModal, saveItem }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {newItem.id ? 'تعديل قسم الفوتر' : 'إضافة قسم جديد للفوتر'}
          </h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">مفتاح القسم</label>
            <input
              type="text"
              value={newItem.section_key || ''}
              onChange={(e) => setNewItem({ ...newItem, section_key: e.target.value })}
              placeholder="about_consulate, quick_links..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (عربي)</label>
              <input
                type="text"
                value={newItem.title_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, title_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (English)</label>
              <input
                type="text"
                value={newItem.title_en || ''}
                onChange={(e) => setNewItem({ ...newItem, title_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى (عربي)</label>
              <textarea
                value={newItem.content_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, content_ar: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المحتوى (English)</label>
              <textarea
                value={newItem.content_en || ''}
                onChange={(e) => setNewItem({ ...newItem, content_en: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نص الرابط (عربي)</label>
              <input
                type="text"
                value={newItem.link_text_ar || ''}
                onChange={(e) => setNewItem({ ...newItem, link_text_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نص الرابط (English)</label>
              <input
                type="text"
                value={newItem.link_text_en || ''}
                onChange={(e) => setNewItem({ ...newItem, link_text_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الرابط (URL)</label>
              <input
                type="text"
                value={newItem.link_url || ''}
                onChange={(e) => setNewItem({ ...newItem, link_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="checkbox"
                checked={newItem.is_active !== false}
                onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
              />
              <span className="text-sm font-medium text-gray-700">مفعّل</span>
            </label>

            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                onClick={() => saveItem(newItem, 'footer_content')}
                disabled={saving}
                className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
