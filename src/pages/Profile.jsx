import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Lock, Mail, Shield, Save, Eye, EyeOff, AlertCircle, CheckCircle, Camera, Upload } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name_ar: '',
    full_name_en: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate('/admin/login');
        return;
      }

      const { data: staff, error } = await supabase
        .from('staff')
        .select(`
          *,
          role:roles(name, name_ar, name_en)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!staff) {
        setMessage({ type: 'error', text: 'لم يتم العثور على بيانات الموظف' });
        setLoading(false);
        return;
      }

      const formattedStaff = {
        ...staff,
        full_name: staff.full_name_ar || staff.full_name_en || 'غير محدد',
        role: staff.role?.name || 'staff',
        role_name: staff.role?.name_ar || 'موظف'
      };

      setStaffData(formattedStaff);
      setProfileForm({
        full_name_ar: staff.full_name_ar || '',
        full_name_en: staff.full_name_en || ''
      });
      if (staff.avatar_url) {
        setAvatarPreview(staff.avatar_url);
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
      setMessage({ type: 'error', text: 'فشل تحميل البيانات' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setProfileMessage({ type: 'error', text: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' });
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async () => {
    if (!avatarFile || !staffData) return null;

    try {
      setUploadingAvatar(true);
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${staffData.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      if (staffData.avatar_url) {
        const oldPath = staffData.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('staff-avatars').remove([`avatars/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('staff-avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('staff-avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!profileForm.full_name_ar && !profileForm.full_name_en) {
      setProfileMessage({ type: 'error', text: 'يجب إدخال الاسم باللغة العربية أو الإنجليزية على الأقل' });
      return;
    }

    setSavingProfile(true);

    try {
      let avatarUrl = staffData.avatar_url;

      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const { error: updateError } = await supabase
        .from('staff')
        .update({
          full_name_ar: profileForm.full_name_ar,
          full_name_en: profileForm.full_name_en,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', staffData.id);

      if (updateError) throw updateError;

      setProfileMessage({ type: 'success', text: 'تم تحديث المعلومات الشخصية بنجاح' });

      await loadStaffData();
      setAvatarFile(null);

      setTimeout(() => {
        setProfileMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      setProfileMessage({ type: 'error', text: error.message || 'فشل تحديث المعلومات' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقتين' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      return;
    }

    setSaving(true);

    try {
      if (!staffData?.email) {
        setMessage({ type: 'error', text: 'لم يتم العثور على البريد الإلكتروني للموظف' });
        setSaving(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: staffData.email,
        password: passwordForm.currentPassword
      });

      if (signInError) {
        setMessage({ type: 'error', text: 'كلمة المرور الحالية غير صحيحة' });
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) throw updateError;

      setMessage({ type: 'success', text: 'تم تغيير كلمة المرور بنجاح' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: error.message || 'فشل تغيير كلمة المرور' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">الملف الشخصي</h1>
          <p className="text-gray-600">إدارة معلوماتك الشخصية وكلمة المرور</p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-100">
                      {staffData?.full_name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1 mt-4">{staffData?.full_name}</h2>
                <p className="text-sm text-gray-600 mb-4">{staffData?.email}</p>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  staffData?.role === 'super_admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {staffData?.role_name || 'موظف'}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">الاسم الكامل</p>
                    <p className="font-medium">{staffData?.full_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                    <p className="font-medium">{staffData?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">الصلاحية</p>
                    <p className="font-medium">
                      {staffData?.role_name || 'موظف'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">تحديث المعلومات الشخصية</h3>
                  <p className="text-sm text-gray-600">قم بتعديل الاسم والصورة</p>
                </div>
              </div>

              {profileMessage.text && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                  profileMessage.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {profileMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل (عربي)
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name_ar}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name_ar: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل الاسم بالعربية"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل (English)
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name_en}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name_en: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter name in English"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني (غير قابل للتعديل)
                  </label>
                  <input
                    type="email"
                    value={staffData?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile || uploadingAvatar}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {savingProfile || uploadingAvatar ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>حفظ التغييرات</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">تغيير كلمة المرور</h3>
                  <p className="text-sm text-gray-600">قم بتحديث كلمة المرور الخاصة بك</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الحالية
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل كلمة المرور الحالية"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أعد إدخال كلمة المرور الجديدة"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>جاري الحفظ...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>حفظ كلمة المرور الجديدة</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    نصائح لكلمة مرور قوية
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1 mr-6">
                    <li>استخدم على الأقل 6 أحرف</li>
                    <li>اجمع بين الأحرف الكبيرة والصغيرة</li>
                    <li>أضف أرقام ورموز خاصة</li>
                    <li>لا تستخدم كلمات مرور سهلة التخمين</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
