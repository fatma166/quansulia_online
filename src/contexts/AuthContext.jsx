import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [sessionVerified, setSessionVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await resolveUserFromSession(session);
        setSessionVerified(true);
      } else {
        setSessionVerified(false);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session) {
          await resolveUserFromSession(session);
          setSessionVerified(true);
        } else {
          setUser(null);
          setSessionVerified(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const resolveUserFromSession = async (session) => {
    const supabaseUser = session.user;
    const meta = supabaseUser.user_metadata || {};

    if (meta.role === 'super_admin' || meta.role === 'admin') {
      setUser({
        id: supabaseUser.id,
        username: meta.username || 'admin',
        fullName: meta.fullName || meta.full_name || 'المدير العام',
        role: 'super_admin',
        permissions: ['all'],
        email: supabaseUser.email,
        isActive: true,
        supabaseUser,
      });
      return;
    }

    const { data: staffData } = await supabase
      .from('staff')
      .select('username, full_name_ar, role_id, employee_number, permissions, can_access_all_services, can_access_all_regions, roles(name)')
      .eq('user_id', supabaseUser.id)
      .eq('is_active', true)
      .maybeSingle();

    if (staffData) {
      let processedPermissions = [];
      let dashboardSections = [];
      let allowedRegions = [];
      let allowedServices = [];
      let allowedStatuses = [];

      if (staffData.permissions) {
        if (Array.isArray(staffData.permissions)) {
          processedPermissions = staffData.permissions;
        } else {
          processedPermissions = staffData.permissions.dashboard_sections || [];
          dashboardSections = staffData.permissions.dashboard_sections || [];
          allowedRegions = staffData.permissions.allowed_regions || [];
          allowedServices = staffData.permissions.allowed_services || [];
          allowedStatuses = staffData.permissions.allowed_statuses || [];
        }
      }

      setUser({
        id: supabaseUser.id,
        username: staffData.username,
        employeeNumber: staffData.employee_number || null,
        fullName: staffData.full_name_ar,
        role: staffData.roles?.name || 'staff',
        permissions: processedPermissions,
        dashboardSections,
        allowedRegions,
        allowedServices,
        allowedStatuses,
        canAccessAllServices: staffData.can_access_all_services || false,
        canAccessAllRegions: staffData.can_access_all_regions || false,
        email: supabaseUser.email,
        isActive: true,
        supabaseUser,
      });
    } else {
      setUser({
        id: supabaseUser.id,
        username: meta.username || supabaseUser.email,
        fullName: meta.fullName || meta.full_name || supabaseUser.email,
        role: meta.role || 'staff',
        permissions: [],
        email: supabaseUser.email,
        isActive: true,
        supabaseUser,
      });
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/staff-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ username: username.trim(), password }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة' };
      }

      if (!result.session) {
        return { success: false, error: 'لم يتم إنشاء جلسة صالحة' };
      }

      await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminUsers');
    await supabase.auth.signOut();
    setUser(null);
    setSessionVerified(false);
  };

  const hasPermission = (permission) => {
    if (!user || !sessionVerified) return false;
    if (user.role === 'super_admin') return true;
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }
    return false;
  };

  const canAccessStatus = (status) => {
    if (!user || !sessionVerified) return false;
    if (user.role === 'super_admin') return true;
    return user.allowedStatuses?.includes(status) || false;
  };

  const canAccessRegion = (region) => {
    if (!user || !sessionVerified) return false;
    if (user.role === 'super_admin') return true;
    return user.allowedRegions?.includes(region) || false;
  };

  const canAccessSection = (section) => {
    if (!user || !sessionVerified) return false;
    if (user.role === 'super_admin') return true;
    if (!user.dashboardSections || !Array.isArray(user.dashboardSections)) return false;
    return user.dashboardSections.includes(section);
  };

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
      isAuthenticated: !!user && sessionVerified,
      isSuperAdmin: !!user && sessionVerified && user.role === 'super_admin',
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
