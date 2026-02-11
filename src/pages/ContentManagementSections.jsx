import React from 'react';
import {
  Save,
  Edit,
  Eye,
  Plus,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Handshake,
  FileCheck,
  FileText,
  BarChart3
} from 'lucide-react';

// Render Counters Section
export const renderCountersSection = ({
  counters,
  loading,
  saving,
  setNewItem,
  setShowAddModal,
  moveItem,
  toggleActive,
  deleteItem
}) => {
  const getIconComponent = (iconName) => {
    const icons = {
      Users,
      FileCheck,
      Calendar,
      Award,
      TrendingUp,
      Handshake,
      BarChart3
    };
    return icons[iconName] || BarChart3;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">إنجازاتنا بالأرقام</h3>
        <button
          onClick={() => {
            setNewItem({
              key: '',
              label_ar: '',
              label_en: '',
              value: 0,
              icon: 'BarChart3',
              color: '#276073',
              suffix_ar: '',
              suffix_en: '',
              display_order: counters.length,
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إحصائية جديدة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {counters.map((item, index) => {
          const IconComponent = getIconComponent(item.icon);
          return (
            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => moveItem(index, 'up', counters, 'counters')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down', counters, 'counters')}
                    disabled={index === counters.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {item.value.toLocaleString()}
                  {item.suffix_ar && <span className="text-xl text-gray-600"> {item.suffix_ar}</span>}
                </div>
                <h4 className="font-semibold text-gray-700 mb-1">{item.label_ar}</h4>
                <p className="text-sm text-gray-500">{item.label_en}</p>
                <span className={`inline-block mt-3 text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {item.is_active ? 'مفعّل' : 'معطّل'}
                </span>
              </div>

              <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(item.id, 'counters', item.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title={item.is_active ? 'تعطيل' : 'تفعيل'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'counters')}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Render Page Sections
export const renderPageSectionsManager = ({
  pageSections,
  loading,
  saving,
  setNewItem,
  setShowAddModal,
  deleteItem,
  toggleActive
}) => {
  const pagesList = ['home', 'about', 'services', 'contact', 'about-sudan'];
  const groupedSections = {};

  pageSections.forEach(section => {
    if (!groupedSections[section.page_name]) {
      groupedSections[section.page_name] = [];
    }
    groupedSections[section.page_name].push(section);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">إدارة الصفحات الداخلية</h3>
        <button
          onClick={() => {
            setNewItem({
              page_name: 'home',
              section_key: '',
              title_ar: '',
              title_en: '',
              content_ar: '',
              content_en: '',
              image_url: '',
              metadata: {},
              display_order: 0,
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      {Object.keys(groupedSections).length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا توجد أقسام محفوظة بعد</p>
          <p className="text-sm text-gray-500 mt-2">ابدأ بإضافة قسم جديد</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSections).map(([pageName, sections]) => (
            <div key={pageName} className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                صفحة: {pageName}
              </h4>
              <div className="space-y-3">
                {sections.map((section) => (
                  <div key={section.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                          <h5 className="font-bold text-gray-900">{section.section_key}</h5>
                          <span className={`text-xs px-2 py-1 rounded ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                            {section.is_active ? 'مفعّل' : 'معطّل'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700 mb-1">{section.title_ar}</p>
                        <p className="text-sm text-gray-500">{section.title_en}</p>
                        {section.content_ar && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{section.content_ar}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => toggleActive(section.id, 'page_sections', section.is_active)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setNewItem(section);
                            setShowAddModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-green-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteItem(section.id, 'page_sections')}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Render Footer Content Section
export const renderFooterContentSection = ({
  footerContent,
  loading,
  saving,
  setNewItem,
  setShowAddModal,
  moveItem,
  toggleActive,
  deleteItem
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">إدارة محتوى الفوتر</h3>
        <button
          onClick={() => {
            setNewItem({
              section_key: '',
              title_ar: '',
              title_en: '',
              content_ar: '',
              content_en: '',
              link_text_ar: '',
              link_text_en: '',
              link_url: '',
              display_order: footerContent.length,
              is_active: true
            });
            setShowAddModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center space-x-2 rtl:space-x-reverse"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم جديد</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {footerContent.map((item, index) => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 rtl:space-x-reverse mb-3">
                  <h4 className="font-bold text-gray-900 text-lg">{item.section_key}</h4>
                  <span className={`text-xs px-2 py-1 rounded ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {item.is_active ? 'مفعّل' : 'معطّل'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">العنوان (عربي)</p>
                    <p className="text-sm font-medium text-gray-900">{item.title_ar}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">العنوان (English)</p>
                    <p className="text-sm font-medium text-gray-900">{item.title_en}</p>
                  </div>
                </div>

                {item.content_ar && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">المحتوى</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.content_ar}</p>
                  </div>
                )}

                {item.link_url && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">الرابط</p>
                    <a href={item.link_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#276073] hover:underline">
                      {item.link_text_ar || item.link_url}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => moveItem(index, 'up', footerContent, 'footer_content')}
                  disabled={index === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveItem(index, 'down', footerContent, 'footer_content')}
                  disabled={index === footerContent.length - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleActive(item.id, 'footer_content', item.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewItem(item);
                    setShowAddModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(item.id, 'footer_content')}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {footerContent.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">لا يوجد محتوى في الفوتر بعد</p>
          <p className="text-sm text-gray-500 mt-2">ابدأ بإضافة قسم جديد</p>
        </div>
      )}
    </div>
  );
};
