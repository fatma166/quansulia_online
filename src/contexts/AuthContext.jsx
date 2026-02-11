import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

// بيانات الإدارة الافتراضية
const defaultAdmins = {
  'admin': {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    fullName: 'المدير العام',
    role: 'super_admin',
    permissions: ['all'],
    email: 'admin@consulate.gov.sd',
    phone: '+966501234567',
    createdAt: '2025-01-01',
    lastLogin: null,
    isActive: true
  },
  'staff1': {
    id: 'staff1',
    username: 'staff1',
    password: 'staff123',
    fullName: 'أحمد محمد علي',
    role: 'staff',
    permissions: ['applications_review', 'applications_approve'],
    email: 'ahmed@consulate.gov.sd',
    phone: '+966502345678',
    department: 'جوازات السفر',
    allowedStatuses: ['pending', 'review', 'approved'],
    allowedRegions: ['riyadh', 'makkah'],
    createdAt: '2025-01-05',
    lastLogin: '2025-01-15',
    isActive: true
  },
  'staff2': {
    id: 'staff2',
    username: 'staff2',
    password: 'staff123',
    fullName: 'فاطمة عبدالله',
    role: 'staff',
    permissions: ['applications_process', 'applications_ship'],
    email: 'fatima@consulate.gov.sd',
    phone: '+966503456789',
    department: 'التصديقات',
    allowedStatuses: ['paid', 'processing', 'shipping'],
    allowedRegions: ['eastern', 'asir'],
    createdAt: '2025-01-05',
    lastLogin: '2025-01-14',
    isActive: true
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحقق من جلسة Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userRole = session.user.user_metadata?.role || 'super_admin';
        const adminUser = {
          id: session.user.id,
          username: 'admin',
          fullName: session.user.user_metadata?.fullName || 'المدير العام',
          role: userRole,
          permissions: ['all'],
          email: session.user.email,
          isActive: true,
          supabaseUser: session.user
        };
        setUser(adminUser);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
      } else {
        // تحقق من localStorage للموظفين
        const savedUser = localStorage.getItem('adminUser');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('adminUser');
          }
        }
      }
      setIsLoading(false);
    });

    // استمع لتغييرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session) {
          const userRole = session.user.user_metadata?.role || 'super_admin';
          const adminUser = {
            id: session.user.id,
            username: 'admin',
            fullName: session.user.user_metadata?.fullName || 'المدير العام',
            role: userRole,
            permissions: ['all'],
            email: session.user.email,
            isActive: true,
            supabaseUser: session.user
          };
          setUser(adminUser);
          localStorage.setItem('adminUser', JSON.stringify(adminUser));
        } else {
          setUser(null);
          localStorage.removeItem('adminUser');
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username, password) => {
    try {
      // إذا كان admin، استخدم البريد الإلكتروني الافتراضي
      if (username === 'admin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@consulate.gov.sd',
          password: password
        });

        if (error) throw error;

        const userRole = data.user.user_metadata?.role || 'super_admin';
        const adminUser = {
          id: data.user.id,
          username: 'admin',
          fullName: data.user.user_metadata?.fullName || 'المدير العام',
          role: userRole,
          permissions: ['all'],
          email: data.user.email,
          lastLogin: new Date().toISOString(),
          isActive: true,
          supabaseUser: data.user
        };

        setUser(adminUser);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        return { success: true };
      }

      // للموظفين الحقيقيين (أي username غير admin والموظفين التجريبيين)، استخدم staff-login Edge Function
      if (username !== 'admin' && username !== 'staff1' && username !== 'staff2') {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
              },
              body: JSON.stringify({
                username: username,
                password: password
              })
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            return {
              success: false,
              error: result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة'
            };
          }

          // تعيين الجلسة في Supabase client
          if (result.session) {
            await supabase.auth.setSession({
              access_token: result.session.access_token,
              refresh_token: result.session.refresh_token
            });
          }

          setUser(result.user);
          localStorage.setItem('adminUser', JSON.stringify(result.user));
          return { success: true };
        } catch (error) {
          console.error('Staff login error:', error);
          return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
        }
      }

      // للموظفين التجريبيين، استخدم localStorage
      const admins = JSON.parse(localStorage.getItem('adminUsers') || JSON.stringify(defaultAdmins));
      const admin = Object.values(admins).find(a => a.username === username && a.password === password && a.isActive);

      if (admin) {
        admin.lastLogin = new Date().toISOString();
        admins[admin.id] = admin;
        localStorage.setItem('adminUsers', JSON.stringify(admins));

        setUser(admin);
        localStorage.setItem('adminUser', JSON.stringify(admin));
        return { success: true };
      }

      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
    }
  };

  const logout = async () => {
    // تسجيل الخروج من Supabase إذا كان المستخدم مسجل عبره
    if (user?.supabaseUser) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('adminUser');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    // تحقق إذا كان permissions array أو object
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    // إذا كان object، نفترض أنه فارغ يعني ما عنده صلاحيات
    return false;
  };

  const canAccessStatus = (status) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.allowedStatuses?.includes(status) || false;
  };

  const canAccessRegion = (region) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.allowedRegions?.includes(region) || false;
  };

  const canAccessSection = (section) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;

    // تأكد من أن dashboardSections موجودة وهي array
    if (!user.dashboardSections || !Array.isArray(user.dashboardSections)) {
      console.warn('User dashboardSections is missing or invalid:', user);
      return false;
    }

    return user.dashboardSections.includes(section);
  };

  // حماية من تعديل localStorage أثناء الجلسة
  useEffect(() => {
    if (!user) return;

    const handleStorageChange = (e) => {
      if (e.key === 'adminUser' && e.newValue) {
        try {
          const newUser = JSON.parse(e.newValue);
          // تحديث الـ state فقط إذا تغير الـ ID (أي تسجيل دخول جديد)
          if (newUser.id !== user.id) {
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user?.id]);

  // تهيئة بيانات الإدارة الافتراضية
  useEffect(() => {
    const existingAdmins = localStorage.getItem('adminUsers');
    if (!existingAdmins) {
      localStorage.setItem('adminUsers', JSON.stringify(defaultAdmins));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      hasPermission,
      canAccessStatus,
      canAccessRegion,
      canAccessSection,
      isAuthenticated: !!user,
      isSuperAdmin: user?.role === 'super_admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};