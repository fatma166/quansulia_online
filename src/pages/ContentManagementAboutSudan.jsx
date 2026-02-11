import React, { useState, useEffect } from 'react';
import {
  Save,
  Edit,
  Eye,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Image as ImageIcon,
  Video,
  BarChart3,
  FileText,
  Globe,
  Wheat,
  Crown,
  Camera,
  Palette,
  Gem,
  MapPin,
  Users,
  Calendar,
  TrendingUp,
  Mountain,
  Heart,
  Building,
  Award,
  Shield,
  Star
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ContentManagementAboutSudan = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [pageInfo, setPageInfo] = useState(null);
  const [statistics, setStatistics] = useState([]);
  const [sections, setSections] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [modalType, setModalType] = useState(''); // 'stat' or 'section'

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load page info
      const { data: pageData } = await supabase
        .from('about_sudan_page')
        .select('*')
        .single();
      setPageInfo(pageData);

      // Load statistics
      const { data: statsData } = await supabase
        .from('about_sudan_statistics')
        .select('*')
        .order('display_order');
      setStatistics(statsData || []);

      // Load sections with their stats
      const { data: sectionsData } = await supabase
        .from('about_sudan_sections')
        .select('*, about_sudan_section_stats(*)')
        .order('display_order');
      setSections(sectionsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      MapPin, Users, Calendar, Globe, Wheat, Gem, Camera, Mountain,
      Crown, Palette, Heart, Building, Award, Shield, Star, TrendingUp, BarChart3
    };
    return icons[iconName] || BarChart3;
  };

  // Save page info
  const savePageInfo = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('about_sudan_page')
        .update({
          ...pageInfo,
          updated_at: new Date().toISOString(),
          updated_by: user?.id
        })
        .eq('id', pageInfo.id);

      if (error) throw error;
      showMessage('success', 'تم حفظ البيانات بنجاح');
    } catch (error) {
      console.error('Error saving page info:', error);
      showMessage('error', 'حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Toggle active status
  const toggleActive = async (id, table, currentStatus) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      showMessage('success', 'تم التحديث بنجاح');
      await loadData();
    } catch (error) {
      console.error('Error toggling active:', error);
      showMessage('error', 'حدث خطأ في التحديث');
    }
  };

  // Move item up/down
  const moveItem = async (index, direction, items, table) => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === items.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

    try {
      const updates = newItems.map((item, idx) => ({
        id: item.id,
        display_order: idx
      }));

      for (const update of updates) {
        await supabase
          .from(table)
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      await loadData();
      showMessage('success', 'تم تحديث الترتيب بنجاح');
    } catch (error) {
      console.error('Error moving item:', error);
      showMessage('error', 'حدث خطأ في تحديث الترتيب');
    }
  };

  // Delete item
  const deleteItem = async (id, table) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('success', 'تم الحذف بنجاح');
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      showMessage('error', 'حدث خطأ في الحذف');
    }
  };

  // Save statistic or section
  const saveItem = async () => {
    setSaving(true);
    try {
      if (modalType === 'stat') {
        if (currentItem.id) {
          const { error } = await supabase
            .from('about_sudan_statistics')
            .update({
              ...currentItem,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('about_sudan_statistics')
            .insert([currentItem]);
          if (error) throw error;
        }
      } else if (modalType === 'section') {
        if (currentItem.id) {
          const { error } = await supabase
            .from('about_sudan_sections')
            .update({
              section_key: currentItem.section_key,
              title_ar: currentItem.title_ar,
              title_en: currentItem.title_en,
              content_ar: currentItem.content_ar,
              content_en: currentItem.content_en,
              image_url: currentItem.image_url,
              icon: currentItem.icon,
              display_order: currentItem.display_order,
              is_active: currentItem.is_active,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('about_sudan_sections')
            .insert([currentItem]);
          if (error) throw error;
        }
      }

      showMessage('success', 'تم الحفظ بنجاح');
      setShowModal(false);
      setCurrentItem(null);
      await loadData();
    } catch (error) {
      console.error('Error saving item:', error);
      showMessage('error', 'حدث خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  // Render page info section
  const renderPageInfo = () => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات الصفحة</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الصفحة (عربي)
            </label>
            <input
              type="text"
              value={pageInfo?.title_ar || ''}
              onChange={(e) => setPageInfo({ ...pageInfo, title_ar: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              عنوان الصفحة (English)
            </label>
            <input
              type="text"
              value={pageInfo?.title_en || ''}
              onChange={(e) => setPageInfo({ ...pageInfo, title_en: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رابط الفيديو
          </label>
          <input
            type="text"
            value={pageInfo?.video_url || ''}
            onChange={(e) => setPageInfo({ ...pageInfo, video_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
            placeholder="https://example.com/video.mp4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            صورة البوستر للفيديو
          </label>
          <input
            type="text"
            value={pageInfo?.video_poster || ''}
            onChange={(e) => setPageInfo({ ...pageInfo, video_poster: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073]"
            placeholder="https://example.com/poster.jpg"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="page-active"
            checked={pageInfo?.is_active || false}
            onChange={(e) => setPageInfo({ ...pageInfo, is_active: e.target.checked })}
            className="w-4 h-4 text-[#276073] border-gray-300 rounded focus:ring-[#276073]"
          />
          <label htmlFor="page-active" className="text-sm font-medium text-gray-700">
            تفعيل الصفحة
          </label>
        </div>

        <button
          onClick={savePageInfo}
          disabled={saving}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}</span>
        </button>
      </div>
    </div>
  );

  // Render statistics section
  const renderStatistics = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">الإحصائيات</h3>
        <button
          onClick={() => {
            setCurrentItem({
              stat_key: '',
              label_ar: '',
              label_en: '',
              value: 0,
              display_value_ar: '',
              display_value_en: '',
              icon: 'BarChart3',
              display_order: statistics.length,
              is_active: true
            });
            setModalType('stat');
            setShowModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة إحصائية</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statistics.map((stat, index) => {
          const IconComponent = getIconComponent(stat.icon);
          return (
            <div key={stat.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#276073] flex items-center justify-center text-white">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveItem(index, 'up', statistics, 'about_sudan_statistics')}
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down', statistics, 'about_sudan_statistics')}
                    disabled={index === statistics.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.display_value_ar}</div>
                <div className="text-sm font-medium text-gray-700">{stat.label_ar}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label_en}</div>
                <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${stat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {stat.is_active ? 'مفعّل' : 'معطّل'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleActive(stat.id, 'about_sudan_statistics', stat.is_active)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title={stat.is_active ? 'تعطيل' : 'تفعيل'}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCurrentItem(stat);
                    setModalType('stat');
                    setShowModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600"
                  title="تعديل"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteItem(stat.id, 'about_sudan_statistics')}
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

  // Render sections
  const renderSections = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">أقسام الصفحة</h3>
        <button
          onClick={() => {
            setCurrentItem({
              section_key: '',
              title_ar: '',
              title_en: '',
              content_ar: '',
              content_en: '',
              image_url: '',
              icon: 'Globe',
              display_order: sections.length,
              is_active: true
            });
            setModalType('section');
            setShowModal(true);
          }}
          className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم</span>
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => {
          const IconComponent = getIconComponent(section.icon);
          return (
            <div key={section.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-[#276073] flex items-center justify-center text-white flex-shrink-0">
                  <IconComponent className="w-8 h-8" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-gray-900">{section.title_ar}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                      {section.section_key}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${section.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {section.is_active ? 'مفعّل' : 'معطّل'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{section.title_en}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{section.content_ar}</p>

                  {section.image_url && (
                    <div className="mt-3">
                      <img src={section.image_url} alt={section.title_ar} className="w-32 h-20 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => moveItem(index, 'up', sections, 'about_sudan_sections')}
                    disabled={index === 0}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down', sections, 'about_sudan_sections')}
                    disabled={index === sections.length - 1}
                    className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleActive(section.id, 'about_sudan_sections', section.is_active)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentItem(section);
                      setModalType('section');
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-400 hover:text-green-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteItem(section.id, 'about_sudan_sections')}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render modal
  const renderModal = () => {
    if (!showModal || !currentItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {currentItem.id ? 'تعديل' : 'إضافة'} {modalType === 'stat' ? 'إحصائية' : 'قسم'}
            </h3>
            <button
              onClick={() => {
                setShowModal(false);
                setCurrentItem(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {modalType === 'stat' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مفتاح الإحصائية (بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={currentItem.stat_key || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, stat_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأيقونة
                    </label>
                    <select
                      value={currentItem.icon || 'BarChart3'}
                      onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="MapPin">MapPin</option>
                      <option value="Users">Users</option>
                      <option value="Calendar">Calendar</option>
                      <option value="Globe">Globe</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Gem">Gem</option>
                      <option value="Camera">Camera</option>
                      <option value="Mountain">Mountain</option>
                      <option value="BarChart3">BarChart3</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التسمية (عربي)
                    </label>
                    <input
                      type="text"
                      value={currentItem.label_ar || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, label_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التسمية (English)
                    </label>
                    <input
                      type="text"
                      value={currentItem.label_en || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, label_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القيمة الرقمية
                  </label>
                  <input
                    type="number"
                    value={currentItem.value || 0}
                    onChange={(e) => setCurrentItem({ ...currentItem, value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القيمة المعروضة (عربي)
                    </label>
                    <input
                      type="text"
                      value={currentItem.display_value_ar || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, display_value_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="1.86 مليون كم²"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      القيمة المعروضة (English)
                    </label>
                    <input
                      type="text"
                      value={currentItem.display_value_en || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, display_value_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="1.86M km²"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مفتاح القسم (بالإنجليزية)
                    </label>
                    <input
                      type="text"
                      value={currentItem.section_key || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, section_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="strategic-location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الأيقونة
                    </label>
                    <select
                      value={currentItem.icon || 'Globe'}
                      onChange={(e) => setCurrentItem({ ...currentItem, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Globe">Globe</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Crown">Crown</option>
                      <option value="Camera">Camera</option>
                      <option value="Palette">Palette</option>
                      <option value="Gem">Gem</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان (عربي)
                    </label>
                    <input
                      type="text"
                      value={currentItem.title_ar || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, title_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العنوان (English)
                    </label>
                    <input
                      type="text"
                      value={currentItem.title_en || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, title_en: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المحتوى (عربي)
                    </label>
                    <textarea
                      value={currentItem.content_ar || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, content_ar: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المحتوى (English)
                    </label>
                    <textarea
                      value={currentItem.content_en || ''}
                      onChange={(e) => setCurrentItem({ ...currentItem, content_en: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الصورة
                  </label>
                  <input
                    type="text"
                    value={currentItem.image_url || ''}
                    onChange={(e) => setCurrentItem({ ...currentItem, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://images.pexels.com/..."
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="item-active"
                checked={currentItem.is_active || false}
                onChange={(e) => setCurrentItem({ ...currentItem, is_active: e.target.checked })}
                className="w-4 h-4 text-[#276073] border-gray-300 rounded"
              />
              <label htmlFor="item-active" className="text-sm font-medium text-gray-700">
                مفعّل
              </label>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setShowModal(false);
                setCurrentItem(null);
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
            >
              إلغاء
            </button>
            <button
              onClick={saveItem}
              disabled={saving}
              className="px-6 py-2 bg-[#276073] hover:bg-[#1e4a5a] text-white rounded-lg font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#276073]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">إدارة صفحة عن السودان</h2>
        <p className="text-sm text-gray-600">إدارة محتوى صفحة "عن السودان" بالكامل من مكان واحد</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('page')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'page'
                ? 'text-[#276073] border-b-2 border-[#276073]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            معلومات الصفحة
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'stats'
                ? 'text-[#276073] border-b-2 border-[#276073]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الإحصائيات
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`flex-1 px-6 py-3 font-semibold transition-colors ${
              activeTab === 'sections'
                ? 'text-[#276073] border-b-2 border-[#276073]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            أقسام المحتوى
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'page' && renderPageInfo()}
          {activeTab === 'stats' && renderStatistics()}
          {activeTab === 'sections' && renderSections()}
        </div>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default ContentManagementAboutSudan;
