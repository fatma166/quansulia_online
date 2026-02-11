import React from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Calendar,
  User,
  Users,
  Tag,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

// Render News Section
export const renderNewsSection = ({
  news,
  setNewItem,
  setShowAddModal,
  toggleActive,
  toggleFeatured,
  deleteItem
}) => {
  const getCategoryBadge = (category) => {
    const styles = {
      official: 'bg-red-100 text-red-700',
      latest: 'bg-green-100 text-green-700',
      general: 'bg-blue-100 text-blue-700'
    };
    const labels = {
      official: 'بيان رسمي',
      latest: 'خبر جديد',
      general: 'عام'
    };
    return { style: styles[category] || styles.general, label: labels[category] || category };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">إدارة الأخبار</h3>
          <p className="text-sm text-gray-600 mt-1">إدارة الأخبار والبيانات الرسمية</p>
        </div>
        <button
          onClick={() => {
            setNewItem({
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
              published_date: new Date().toISOString()
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خبر جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {news.map((item) => {
          const categoryBadge = getCategoryBadge(item.category);
          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {item.featured_image && (
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.featured_image}
                      alt={item.title_ar}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${categoryBadge.style}`}>
                          {categoryBadge.label}
                        </span>
                        {item.is_featured && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            مميز
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.is_active ? 'مفعّل' : 'معطّل'}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title_ar}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.title_en}</p>
                      {item.excerpt_ar && (
                        <p className="text-sm text-gray-500 line-clamp-2">{item.excerpt_ar}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        {item.author_ar && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.author_ar}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.published_date).toLocaleDateString('ar-EG')}
                        </span>
                        {item.views_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.views_count} مشاهدة
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFeatured(item.id, 'news', item.is_featured)}
                        className={`p-2 rounded hover:bg-gray-100 ${item.is_featured ? 'text-yellow-500' : 'text-gray-400'}`}
                        title={item.is_featured ? 'إزالة من المميز' : 'إضافة للمميز'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(item.id, 'news', item.is_active)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title={item.is_active ? 'تعطيل' : 'تفعيل'}
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
                        onClick={() => deleteItem(item.id, 'news')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {news.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد أخبار بعد</p>
          <p className="text-sm text-gray-500 mt-2">ابدأ بإضافة خبر جديد</p>
        </div>
      )}
    </div>
  );
};

// Render Events Section
export const renderEventsSection = ({
  events,
  setNewItem,
  setShowAddModal,
  toggleActive,
  toggleFeatured,
  deleteItem,
  navigate
}) => {
  const getTabGroupBadge = (tabGroup) => {
    const styles = {
      today: 'bg-yellow-100 text-yellow-700',
      tomorrow: 'bg-orange-100 text-orange-700',
      afterTomorrow: 'bg-purple-100 text-purple-700',
      nextWeek: 'bg-green-100 text-green-700',
      upcoming: 'bg-blue-100 text-blue-700'
    };
    const labels = {
      today: 'اليوم',
      tomorrow: 'غداً',
      afterTomorrow: 'بعد غد',
      nextWeek: 'الأسبوع القادم',
      upcoming: 'قادم'
    };
    return { style: styles[tabGroup] || styles.upcoming, label: labels[tabGroup] || tabGroup };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">إدارة الفعاليات</h3>
          <p className="text-sm text-gray-600 mt-1">إدارة الفعاليات والأنشطة</p>
        </div>
        <button
          onClick={() => {
            setNewItem({
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
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة فعالية جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {events.map((item) => {
          const tabBadge = getTabGroupBadge(item.tab_group);
          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                {item.featured_image && (
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.featured_image}
                      alt={item.title_ar}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded ${tabBadge.style}`}>
                          {tabBadge.label}
                        </span>
                        {item.is_featured && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            مميز
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item.is_active ? 'مفعّل' : 'معطّل'}
                        </span>
                        {item.registration_required && (
                          <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                            يتطلب تسجيل
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-gray-900 text-lg mb-1">{item.title_ar}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.title_en}</p>
                      {item.short_description_ar && (
                        <p className="text-sm text-gray-500 line-clamp-2">{item.short_description_ar}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.event_date).toLocaleDateString('ar-EG')}
                          {item.event_time && ` - ${item.event_time}`}
                        </span>
                        {item.location_ar && (
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {item.location_ar}
                          </span>
                        )}
                        {item.capacity && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.registered_count || 0} / {item.capacity}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate && navigate(`/admin/event-registrations?eventId=${item.id}`)}
                        className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                        title="عرض المسجلين"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFeatured(item.id, 'events', item.is_featured)}
                        className={`p-2 rounded hover:bg-gray-100 ${item.is_featured ? 'text-yellow-500' : 'text-gray-400'}`}
                        title={item.is_featured ? 'إزالة من المميز' : 'إضافة للمميز'}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(item.id, 'events', item.is_active)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title={item.is_active ? 'تعطيل' : 'تفعيل'}
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
                        onClick={() => deleteItem(item.id, 'events')}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد فعاليات بعد</p>
          <p className="text-sm text-gray-500 mt-2">ابدأ بإضافة فعالية جديدة</p>
        </div>
      )}
    </div>
  );
};
