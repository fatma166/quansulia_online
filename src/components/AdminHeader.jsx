import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ChevronDown, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadStaffInfo();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadStaffInfo = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('staff')
        .select('avatar_url, full_name_ar, employee_number, roles(name_ar)')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setAvatarUrl(data.avatar_url);
        setStaffInfo({
          fullName: data.full_name_ar,
          employeeNumber: data.employee_number,
          roleName: data.roles?.name_ar
        });
      }
    } catch (error) {
      console.error('Error loading staff info:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0].charAt(0) + parts[1].charAt(0);
    }
    return name.charAt(0);
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#276073] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">SD</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">القنصلية السودانية</h1>
                <p className="text-xs text-gray-500">نظام إدارة متكامل</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#276073]"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#276073] to-[#1e4a5a] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {getInitials(staffInfo?.fullName || user?.fullName || user?.username || 'Admin')}
                    </span>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {staffInfo?.fullName || user?.fullName || 'المدير'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {staffInfo?.roleName || (user?.role === 'super_admin' ? 'مدير عام' : 'موظف')}
                  </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {staffInfo?.fullName || user?.fullName || 'المدير'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {staffInfo?.employeeNumber || user?.email || user?.username}
                    </p>
                    {staffInfo?.roleName && (
                      <p className="text-xs text-[#276073] mt-1 font-medium">
                        {staffInfo.roleName}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/admin/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>الملف الشخصي</span>
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
