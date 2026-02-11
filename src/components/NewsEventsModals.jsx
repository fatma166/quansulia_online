import React from 'react';
import { X, Save } from 'lucide-react';
import ImageUploader from './ImageUploader';
import RichTextEditor from './RichTextEditor';

export const NewsModal = ({ isOpen, onClose, newsItem, onSave, saving }) => {
  const [formData, setFormData] = React.useState(
    newsItem || {
      title_ar: '',
      title_en: '',
      excerpt_ar: '',
      excerpt_en: '',
      content_ar: '',
      content_en: '',
      category: 'general',
      featured_image: '',
      author_ar: '',
      author_en: '',
      is_featured: false,
      is_active: true,
      published_date: new Date().toISOString().split('T')[0]
    }
  );

  React.useEffect(() => {
    if (newsItem) {
      setFormData({
        ...newsItem,
        published_date: newsItem.published_date ? new Date(newsItem.published_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [newsItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {newsItem?.id ? 'تعديل الخبر' : 'إضافة خبر جديد'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ImageUploader
            bucket="news-images"
            currentImage={formData.featured_image}
            onImageUploaded={(url) => setFormData({ ...formData, featured_image: url })}
            label="صورة الخبر"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                العنوان (عربي) *
              </label>
              <input
                type="text"
                required
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="أدخل عنوان الخبر بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="Enter news title in English"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المقتطف (عربي)
              </label>
              <textarea
                value={formData.excerpt_ar}
                onChange={(e) => setFormData({ ...formData, excerpt_ar: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="مقتطف قصير عن الخبر"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Excerpt (English)
              </label>
              <textarea
                value={formData.excerpt_en}
                onChange={(e) => setFormData({ ...formData, excerpt_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="Brief excerpt about the news"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                المحتوى (عربي) *
              </label>
              <RichTextEditor
                value={formData.content_ar}
                onChange={(value) => setFormData({ ...formData, content_ar: value })}
                placeholder="محتوى الخبر الكامل بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Content (English) *
              </label>
              <RichTextEditor
                value={formData.content_en}
                onChange={(value) => setFormData({ ...formData, content_en: value })}
                placeholder="Full news content in English"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الفئة *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              >
                <option value="general">عام</option>
                <option value="official">بيان رسمي</option>
                <option value="latest">خبر جديد</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تاريخ النشر *
              </label>
              <input
                type="date"
                required
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              />
            </div>

            <div className="flex items-end space-x-4 rtl:space-x-reverse">
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                />
                <span className="text-sm font-semibold text-gray-700">خبر مميز</span>
              </label>

              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                />
                <span className="text-sm font-semibold text-gray-700">مفعّل</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الكاتب (عربي)
              </label>
              <input
                type="text"
                value={formData.author_ar}
                onChange={(e) => setFormData({ ...formData, author_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="اسم الكاتب بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Author (English)
              </label>
              <input
                type="text"
                value={formData.author_en}
                onChange={(e) => setFormData({ ...formData, author_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="Author name in English"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EventModal = ({ isOpen, onClose, eventItem, onSave, saving }) => {
  const [formData, setFormData] = React.useState(
    eventItem || {
      title_ar: '',
      title_en: '',
      description_ar: '',
      description_en: '',
      short_description_ar: '',
      short_description_en: '',
      event_date: new Date().toISOString().split('T')[0],
      event_time: '',
      location_ar: '',
      location_en: '',
      tab_group: 'upcoming',
      featured_image: '',
      organizer_ar: '',
      organizer_en: '',
      capacity: null,
      registration_required: false,
      is_featured: false,
      is_active: true
    }
  );

  React.useEffect(() => {
    if (eventItem) {
      setFormData({
        ...eventItem,
        event_date: eventItem.event_date ? new Date(eventItem.event_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    }
  }, [eventItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">
            {eventItem?.id ? 'تعديل الفعالية' : 'إضافة فعالية جديدة'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ImageUploader
            bucket="events-images"
            currentImage={formData.featured_image}
            onImageUploaded={(url) => setFormData({ ...formData, featured_image: url })}
            label="صورة الفعالية"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                العنوان (عربي) *
              </label>
              <input
                type="text"
                required
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="أدخل عنوان الفعالية بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Title (English) *
              </label>
              <input
                type="text"
                required
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="Enter event title in English"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوصف القصير (عربي)
              </label>
              <textarea
                value={formData.short_description_ar}
                onChange={(e) => setFormData({ ...formData, short_description_ar: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="وصف قصير للفعالية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description (English)
              </label>
              <textarea
                value={formData.short_description_en}
                onChange={(e) => setFormData({ ...formData, short_description_en: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="Brief description of the event"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الوصف الكامل (عربي) *
              </label>
              <RichTextEditor
                value={formData.description_ar}
                onChange={(value) => setFormData({ ...formData, description_ar: value })}
                placeholder="وصف كامل للفعالية بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Description (English) *
              </label>
              <RichTextEditor
                value={formData.description_en}
                onChange={(value) => setFormData({ ...formData, description_en: value })}
                placeholder="Full event description in English"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                تاريخ الفعالية *
              </label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                وقت الفعالية
              </label>
              <input
                type="time"
                value={formData.event_time}
                onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                التصنيف *
              </label>
              <select
                required
                value={formData.tab_group}
                onChange={(e) => setFormData({ ...formData, tab_group: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
              >
                <option value="today">اليوم</option>
                <option value="tomorrow">غداً</option>
                <option value="afterTomorrow">بعد غد</option>
                <option value="nextWeek">الأسبوع القادم</option>
                <option value="upcoming">قادم</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الموقع (عربي)
              </label>
              <input
                type="text"
                value={formData.location_ar}
                onChange={(e) => setFormData({ ...formData, location_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="موقع الفعالية بالعربية"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location (English)
              </label>
              <input
                type="text"
                value={formData.location_en}
                onChange={(e) => setFormData({ ...formData, location_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="Event location in English"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                السعة (عدد المقاعد)
              </label>
              <input
                type="number"
                min="0"
                value={formData.capacity || ''}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value ? parseInt(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                placeholder="عدد المقاعد المتاحة"
              />
            </div>

            <div className="flex items-end space-x-4 rtl:space-x-reverse">
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.registration_required}
                  onChange={(e) => setFormData({ ...formData, registration_required: e.target.checked })}
                  className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                />
                <span className="text-sm font-semibold text-gray-700">يتطلب تسجيل</span>
              </label>
            </div>

            <div className="flex items-end space-x-4 rtl:space-x-reverse">
              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                />
                <span className="text-sm font-semibold text-gray-700">فعالية مميزة</span>
              </label>

              <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
                />
                <span className="text-sm font-semibold text-gray-700">مفعّل</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
