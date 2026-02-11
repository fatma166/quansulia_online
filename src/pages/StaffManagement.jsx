import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  UserCheck,
  UserX,
  Shield,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  Key
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function StaffManagement() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [regions, setRegions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterRegion, setFilterRegion] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showResetPassword, setShowResetPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [staffResult, departmentsResult, regionsResult, rolesResult] = await Promise.all([
        supabase
          .from('staff')
          .select(`
            *,
            role:roles(id, name, name_ar, name_en),
            department:departments(id, name_ar, name_en),
            region:regions(id, name_ar, name_en, code)
          `)
          .order('created_at', { ascending: false }),

        supabase
          .from('departments')
          .select('*')
          .eq('is_active', true)
          .order('name_ar'),

        supabase
          .from('regions')
          .select('*')
          .eq('is_active', true)
          .order('name_ar'),

        supabase
          .from('roles')
          .select('*')
          .eq('is_active', true)
          .order('name_ar')
      ]);

      if (staffResult.error) throw staffResult.error;
      if (departmentsResult.error) throw departmentsResult.error;
      if (regionsResult.error) throw regionsResult.error;
      if (rolesResult.error) throw rolesResult.error;

      setStaff(staffResult.data || []);
      setDepartments(departmentsResult.data || []);
      setRegions(regionsResult.data || []);
      setRoles(rolesResult.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('حدث خطأ في تحميل البيانات: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(member => {
    const matchesSearch =
      member.full_name_ar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.full_name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === 'all' || member.department_id === filterDepartment;

    const matchesRegion =
      filterRegion === 'all' || member.region_id === filterRegion;

    const matchesStatus =
      filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesRegion && matchesStatus;
  });

  const toggleStaffStatus = async (staffId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      const { error } = await supabase
        .from('staff')
        .update({ status: newStatus })
        .eq('id', staffId);

      if (error) throw error;

      setStaff(prev => prev.map(member =>
        member.id === staffId ? { ...member, status: newStatus } : member
      ));

      alert(newStatus === 'active' ? 'تم تفعيل الموظف بنجاح' : 'تم تعطيل الموظف بنجاح');
    } catch (error) {
      console.error('Error toggling staff status:', error);
      alert('حدث خطأ: ' + error.message);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('يجب أن تكون كلمة المرور 6 أحرف على الأقل');
      return;
    }

    const member = staff.find(s => s.id === showResetPassword);
    if (!member) return;

    setResettingPassword(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/reset-staff-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          },
          body: JSON.stringify({
            username: member.username, // استخدام username الآن
            new_password: newPassword
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إعادة تعيين كلمة المرور');
      }

      setShowResetPassword(null);
      setNewPassword('');
      alert('تم إعادة تعيين كلمة المرور بنجاح');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('حدث خطأ: ' + error.message);
    } finally {
      setResettingPassword(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'نشط', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { label: 'غير نشط', color: 'bg-red-100 text-red-800', icon: XCircle },
      on_leave: { label: 'في إجازة', color: 'bg-yellow-100 text-yellow-800', icon: Calendar }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-8 h-8 text-[#276073]" />
                  إدارة الموظفين
                </h1>
                <p className="text-gray-600 mt-2">
                  إدارة حسابات الموظفين والصلاحيات والأقسام
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/staff/new')}
                className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة موظف جديد
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">إجمالي الموظفين</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{staff.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">الموظفون النشطون</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {staff.filter(s => s.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">الأقسام</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">{departments.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">المناطق</p>
                    <p className="text-3xl font-bold text-orange-600 mt-2">{regions.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="بحث بالاسم، البريد، أو رقم الموظف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
                />
              </div>

              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              >
                <option value="all">جميع الأقسام</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name_ar}</option>
                ))}
              </select>

              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              >
                <option value="all">جميع المناطق</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name_ar}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#276073] focus:border-transparent outline-none"
              >
                <option value="all">جميع الحالات</option>
                <option value="active">نشط</option>
                <option value="inactive">غير نشط</option>
                <option value="on_leave">في إجازة</option>
              </select>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              عرض {filteredStaff.length} من أصل {staff.length} موظف
            </div>
          </div>

          {/* Staff Table */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-12 h-12 animate-spin text-[#276073]" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد موظفين</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterDepartment !== 'all' || filterRegion !== 'all' || filterStatus !== 'all'
                  ? 'لم يتم العثور على موظفين مطابقين للبحث'
                  : 'ابدأ بإضافة موظفين جدد'}
              </p>
              <button
                onClick={() => navigate('/admin/staff/new')}
                className="bg-[#276073] hover:bg-[#1e4a5a] text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                إضافة موظف جديد
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        الموظف
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        رقم الموظف
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        الدور
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        القسم
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        المنطقة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#276073] text-white rounded-full flex items-center justify-center font-semibold">
                              {member.full_name_ar?.charAt(0) || 'م'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{member.full_name_ar}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {member.email}
                                </span>
                                {member.phone && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {member.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="font-mono text-sm font-semibold text-[#276073]">
                              {member.username}
                            </span>
                            {member.employee_number && (
                              <span className="block text-xs text-gray-500 font-mono mt-0.5">
                                #{member.employee_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                            <Shield className="w-3 h-3" />
                            {member.role?.name_ar || 'غير محدد'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {member.department?.name_ar || 'غير محدد'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">
                            {member.region?.name_ar || 'غير محدد'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(member.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/admin/staff/${member.id}/edit`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="عرض وتعديل"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setShowResetPassword(member.id);
                                setNewPassword('');
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="إعادة تعيين كلمة المرور"
                            >
                              <Key className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => toggleStaffStatus(member.id, member.status)}
                              className={`p-2 rounded-lg transition-colors ${
                                member.status === 'active'
                                  ? 'text-orange-600 hover:bg-orange-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={member.status === 'active' ? 'تعطيل' : 'تفعيل'}
                            >
                              {member.status === 'active' ? (
                                <UserX className="w-5 h-5" />
                              ) : (
                                <UserCheck className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              إعادة تعيين كلمة المرور
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {staff.find(s => s.id === showResetPassword)?.full_name_ar}
              <br />
              <span className="text-sm font-mono text-[#276073] font-semibold">
                {staff.find(s => s.id === showResetPassword)?.username}
              </span>
            </p>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور الجديدة
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                disabled={resettingPassword}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowResetPassword(null);
                  setNewPassword('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors duration-200"
                disabled={resettingPassword}
              >
                إلغاء
              </button>
              <button
                onClick={resetPassword}
                disabled={resettingPassword || !newPassword}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resettingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث كلمة المرور'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
