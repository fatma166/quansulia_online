import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, Search, Filter, Tag,
  MessageSquare, TrendingUp, Save, X, AlertCircle,
  Check, Eye, EyeOff, BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ChatbotManagement() {
  const [activeTab, setActiveTab] = useState('questions');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    category_id: '',
    question_ar: '',
    answer_ar: '',
    keywords: '',
    priority: 5,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchQuestions(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('chatbot_categories')
      .select('*')
      .order('display_order');

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from('chatbot_questions_answers')
      .select(`
        *,
        category:chatbot_categories(name_ar, icon)
      `)
      .order('priority', { ascending: false });

    if (!error && data) {
      setQuestions(data);
    }
  };

  const fetchStats = async () => {
    const { data: qData } = await supabase
      .from('chatbot_questions_answers')
      .select('usage_count, helpful_count, not_helpful_count, is_active');

    if (qData) {
      const totalQuestions = qData.length;
      const activeQuestions = qData.filter(q => q.is_active).length;
      const totalUsage = qData.reduce((sum, q) => sum + (q.usage_count || 0), 0);
      const totalHelpful = qData.reduce((sum, q) => sum + (q.helpful_count || 0), 0);
      const totalNotHelpful = qData.reduce((sum, q) => sum + (q.not_helpful_count || 0), 0);

      setStats({
        totalQuestions,
        activeQuestions,
        totalUsage,
        satisfactionRate: totalHelpful + totalNotHelpful > 0
          ? Math.round((totalHelpful / (totalHelpful + totalNotHelpful)) * 100)
          : 0
      });
    }
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    const keywordsArray = formData.keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k);

    const questionData = {
      ...formData,
      keywords: keywordsArray
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('chatbot_questions_answers')
          .update(questionData)
          .eq('id', editingItem.id);

        if (error) throw error;
        alert('تم تحديث السؤال بنجاح');
      } else {
        const { error } = await supabase
          .from('chatbot_questions_answers')
          .insert([questionData]);

        if (error) throw error;
        alert('تم إضافة السؤال بنجاح');
      }

      closeModal();
      fetchData();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('حدث خطأ: ' + error.message);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;

    try {
      const { error } = await supabase
        .from('chatbot_questions_answers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('تم حذف السؤال بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('حدث خطأ: ' + error.message);
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('chatbot_questions_answers')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('حدث خطأ: ' + error.message);
    }
  };

  const openEditModal = (question) => {
    setEditingItem(question);
    setFormData({
      category_id: question.category_id || '',
      question_ar: question.question_ar,
      answer_ar: question.answer_ar,
      keywords: question.keywords?.join(', ') || '',
      priority: question.priority,
      is_active: question.is_active
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      category_id: '',
      question_ar: '',
      answer_ar: '',
      keywords: '',
      priority: 5,
      is_active: true
    });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.question_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.answer_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         q.keywords?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === 'all' || q.category_id === filterCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#276073] mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#276073]" />
            إدارة الشات بوت
          </h1>
          <p className="text-gray-600 mt-2">
            إدارة الأسئلة والإجابات التلقائية للشات بوت
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الأسئلة</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الأسئلة النشطة</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeQuestions}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مرات الاستخدام</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalUsage}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">نسبة الرضا</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{stats.satisfactionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ابحث في الأسئلة والإجابات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                >
                  <option value="all">جميع التصنيفات</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name_ar}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors"
              >
                <Plus className="w-5 h-5" />
                إضافة سؤال جديد
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">لا توجد أسئلة</p>
                <p className="text-gray-400 text-sm mt-2">ابدأ بإضافة أسئلة وإجابات للشات بوت</p>
              </div>
            ) : (
              filteredQuestions.map(question => (
                <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {question.category && (
                          <span className="text-sm px-3 py-1 bg-gray-100 rounded-full flex items-center gap-2">
                            <span>{question.category.icon}</span>
                            <span className="text-gray-700">{question.category.name_ar}</span>
                          </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          question.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {question.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                        <span className="text-xs text-gray-500">
                          الأولوية: {question.priority}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {question.question_ar}
                      </h3>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {question.answer_ar}
                      </p>

                      {question.keywords && question.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {question.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-md flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <span>استخدم {question.usage_count || 0} مرة</span>
                        <span className="text-green-600">
                          👍 {question.helpful_count || 0}
                        </span>
                        <span className="text-red-600">
                          👎 {question.not_helpful_count || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(question.id, question.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          question.is_active
                            ? 'hover:bg-gray-200 text-gray-600'
                            : 'hover:bg-green-100 text-green-600'
                        }`}
                        title={question.is_active ? 'تعطيل' : 'تفعيل'}
                      >
                        {question.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => openEditModal(question)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="تعديل"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="حذف"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    التصنيف
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                  >
                    <option value="">بدون تصنيف</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name_ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    السؤال *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.question_ar}
                    onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    placeholder="مثال: كيف أقدم طلب جواز سفر؟"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الإجابة *
                  </label>
                  <textarea
                    required
                    value={formData.answer_ar}
                    onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    placeholder="اكتب إجابة مفصلة وواضحة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الكلمات المفتاحية
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    placeholder="جواز، سفر، إصدار (افصل بفاصلة)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    أدخل الكلمات المفتاحية مفصولة بفاصلة للمساعدة في البحث
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الأولوية (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      الأسئلة ذات الأولوية الأعلى تظهر أولاً
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      الحالة
                    </label>
                    <label className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 text-[#276073] rounded focus:ring-[#276073]"
                      />
                      <span className="text-gray-700">السؤال نشط</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#276073] text-white rounded-lg hover:bg-[#1e4a5a] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingItem ? 'حفظ التعديلات' : 'إضافة السؤال'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
