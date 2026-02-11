import React from 'react';
import {
  Save,
  Edit,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Bell,
  Wrench,
  Eye,
  Calendar
} from 'lucide-react';

// Render Announcements Section
export const renderAnnouncementsSection = ({
  announcements,
  setNewItem,
  setShowAddModal,
  toggleActive,
  deleteItem
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900">إدارة الإشعارات والتنبيهات</h3>
        <p className="text-sm text-gray-600 mt-1">إدارة الإشعارات التي تظهر للمستخدمين في أعلى الموقع</p>
      </div>
      <button
        onClick={() => {
          setNewItem({
            is_enabled: true,
            type: 'info',
            title_ar: '',
            title_en: '',
            message_ar: '',
            message_en: '',
            start_time: null,
            end_time: null,
            is_dismissible: true
          });
          setShowAddModal(true);
        }}
        className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
      >
        <Plus className="w-5 h-5" />
        <span>إضافة إشعار</span>
      </button>
    </div>

    <div className="grid grid-cols-1 gap-4">
      {announcements.map((item) => {
        const typeColors = {
          info: 'bg-blue-100 text-blue-700 border-blue-200',
          warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          error: 'bg-red-100 text-red-700 border-red-200'
        };

        return (
          <div key={item.id} className={`border-2 rounded-lg p-6 ${typeColors[item.type]} hover:shadow-md transition-shadow`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded ${item.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.is_enabled ? 'مفعّل' : 'معطّل'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                    {item.type === 'info' ? 'معلوماتي' : item.type === 'warning' ? 'تحذير' : 'خطأ'}
                  </span>
                  {item.is_dismissible && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      قابل للإغلاق
                    </span>
                  )}
                </div>

                {item.title_ar && (
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title_ar}</h4>
                )}
                <p className="text-sm text-gray-700 mb-2">{item.message_ar}</p>

                {(item.start_time || item.end_time) && (
                  <div className="flex items-center gap-3 text-xs text-gray-600 mt-2">
                    {item.start_time && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        من: {new Date(item.start_time).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                    {item.end_time && (
                      <span>
                        إلى: {new Date(item.end_time).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mr-4">
                <button
                  onClick={() => toggleActive(item.id, 'system_announcements', item.is_enabled)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title={item.is_enabled ? 'تعطيل' : 'تفعيل'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'system_announcements')}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>

    {announcements.length === 0 && (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">لا توجد إشعارات بعد</p>
        <p className="text-sm text-gray-500 mt-2">ابدأ بإضافة إشعار جديد</p>
      </div>
    )}
  </div>
);

// Render Maintenance Section
export const renderMaintenanceSection = ({
  maintenanceSettings,
  setMaintenanceSettings,
  saveMaintenanceSettings,
  saving
}) => {
  if (!maintenanceSettings) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-[#276073] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">وضع الصيانة</h3>
            <p className="text-sm text-gray-600 mt-1">
              عند تفعيل وضع الصيانة، سيتم إظهار صفحة الصيانة لجميع الزوار ولن يتمكنوا من الوصول إلى الموقع
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Enable/Disable Toggle */}
          <div className={`p-4 rounded-lg border-2 ${maintenanceSettings.is_enabled ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-gray-900">حالة وضع الصيانة</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {maintenanceSettings.is_enabled ? 'الموقع حالياً في وضع الصيانة' : 'الموقع يعمل بشكل طبيعي'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceSettings.is_enabled}
                  onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, is_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>

          {/* Maintenance Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                بداية الصيانة
              </label>
              <input
                type="datetime-local"
                value={maintenanceSettings.start_time ? new Date(maintenanceSettings.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, start_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نهاية الصيانة المتوقعة
              </label>
              <input
                type="datetime-local"
                value={maintenanceSettings.end_time ? new Date(maintenanceSettings.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, end_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Arabic Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة الصيانة (عربي)
            </label>
            <textarea
              value={maintenanceSettings.message_ar || ''}
              onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, message_ar: e.target.value })}
              rows={4}
              placeholder="أدخل رسالة الصيانة بالعربية..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* English Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رسالة الصيانة (English)
            </label>
            <textarea
              value={maintenanceSettings.message_en || ''}
              onChange={(e) => setMaintenanceSettings({ ...maintenanceSettings, message_en: e.target.value })}
              rows={4}
              placeholder="Enter maintenance message in English..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
            />
          </div>

          {/* Warning */}
          {maintenanceSettings.is_enabled && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium">تحذير هام!</p>
                <p className="text-sm text-red-700 mt-1">
                  وضع الصيانة مفعّل حالياً. جميع الزوار سيشاهدون صفحة الصيانة ولن يتمكنوا من الوصول إلى الموقع.
                  تأكد من إيقاف وضع الصيانة عندما تنتهي من التحديثات.
                </p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={saveMaintenanceSettings}
              disabled={saving}
              className="px-6 py-3 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Announcement Modal Component
export const AnnouncementModal = ({ newItem, setNewItem, showAddModal, setShowAddModal, saveItem, saving }) => {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {newItem.id ? 'تعديل إشعار' : 'إضافة إشعار جديد'}
          </h3>
          <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع الإشعار *</label>
            <select
              value={newItem.type || 'info'}
              onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            >
              <option value="info">معلوماتي (أزرق)</option>
              <option value="warning">تحذيري (أصفر)</option>
              <option value="error">خطأ (أحمر)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (عربي)</label>
            <input
              type="text"
              value={newItem.title_ar || ''}
              onChange={(e) => setNewItem({ ...newItem, title_ar: e.target.value })}
              placeholder="عنوان اختياري للإشعار"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">العنوان (English)</label>
            <input
              type="text"
              value={newItem.title_en || ''}
              onChange={(e) => setNewItem({ ...newItem, title_en: e.target.value })}
              placeholder="Optional title for the announcement"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة (عربي) *</label>
            <textarea
              value={newItem.message_ar || ''}
              onChange={(e) => setNewItem({ ...newItem, message_ar: e.target.value })}
              placeholder="أدخل نص الإشعار بالعربية"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">الرسالة (English) *</label>
            <textarea
              value={newItem.message_en || ''}
              onChange={(e) => setNewItem({ ...newItem, message_en: e.target.value })}
              placeholder="Enter announcement text in English"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية</label>
              <input
                type="datetime-local"
                value={newItem.start_time ? new Date(newItem.start_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setNewItem({ ...newItem, start_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ النهاية</label>
              <input
                type="datetime-local"
                value={newItem.end_time ? new Date(newItem.end_time).toISOString().slice(0, 16) : ''}
                onChange={(e) => setNewItem({ ...newItem, end_time: e.target.value ? new Date(e.target.value).toISOString() : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_dismissible"
              type="checkbox"
              checked={newItem.is_dismissible !== false}
              onChange={(e) => setNewItem({ ...newItem, is_dismissible: e.target.checked })}
              className="w-4 h-4 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
            />
            <label htmlFor="is_dismissible" className="text-sm font-medium text-gray-700">
              السماح للمستخدمين بإغلاق الإشعار
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="is_enabled"
              type="checkbox"
              checked={newItem.is_enabled !== false}
              onChange={(e) => setNewItem({ ...newItem, is_enabled: e.target.checked })}
              className="w-4 h-4 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
            />
            <label htmlFor="is_enabled" className="text-sm font-medium text-gray-700">
              تفعيل الإشعار
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors duration-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => saveItem(newItem, 'system_announcements')}
              disabled={saving || !newItem.message_ar || !newItem.message_en}
              className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
