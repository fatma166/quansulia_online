import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ChatStaffManagement() {
  const [staff, setStaff] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    service_categories: [],
  });

  const serviceCategories = [
    { value: 'education', label: 'التعليم' },
    { value: 'poa', label: 'التوكيلات' },
    { value: 'passports', label: 'جوازات السفر' },
    { value: 'documents', label: 'الوثائق' },
    { value: 'legal', label: 'الخدمات القانونية' },
    { value: 'family', label: 'الشؤون الأسرية' },
  ];

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    const { data, error } = await supabase
      .from('chat_staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setStaff(data || []);
    }
  };

  const addStaff = async (e) => {
    e.preventDefault();

    if (!newStaff.name || !newStaff.email) {
      alert('الرجاء إدخال الاسم والبريد الإلكتروني');
      return;
    }

    const { error } = await supabase.from('chat_staff').insert({
      name: newStaff.name,
      email: newStaff.email,
      service_categories: newStaff.service_categories,
      is_online: false,
    });

    if (error) {
      alert('حدث خطأ في إضافة الموظف');
    } else {
      setNewStaff({ name: '', email: '', service_categories: [] });
      setShowAddForm(false);
      loadStaff();
    }
  };

  const deleteStaff = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    const { error } = await supabase.from('chat_staff').delete().eq('id', id);

    if (!error) {
      loadStaff();
    }
  };

  const toggleOnlineStatus = async (id, currentStatus) => {
    const { error } = await supabase
      .from('chat_staff')
      .update({
        is_online: !currentStatus,
        last_seen: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      loadStaff();
    }
  };

  const toggleCategory = (category) => {
    setNewStaff((prev) => {
      const categories = prev.service_categories.includes(category)
        ? prev.service_categories.filter((c) => c !== category)
        : [...prev.service_categories, category];
      return { ...prev, service_categories: categories };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold text-gray-800">إدارة موظفي الدعم</h1>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            إضافة موظف
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">إضافة موظف جديد</h2>
            <form onSubmit={addStaff} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الموظف
                </label>
                <input
                  type="text"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فئات الخدمات المسؤول عنها
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {serviceCategories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => toggleCategory(category.value)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        newStaff.service_categories.includes(category.value)
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-semibold'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    الاسم
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    فئات الخدمات
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>لا يوجد موظفين</p>
                    </td>
                  </tr>
                ) : (
                  staff.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{member.name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-600">{member.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {member.service_categories?.map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs"
                            >
                              {serviceCategories.find((c) => c.value === cat)?.label || cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleOnlineStatus(member.id, member.is_online)}
                          className="flex items-center gap-2"
                        >
                          {member.is_online ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="text-green-700 font-medium">متصل</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-500">غير متصل</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteStaff(member.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
