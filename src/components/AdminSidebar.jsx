import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Calendar, MessageCircle, LayoutGrid as Layout, Users, Settings, Package, User, ChevronDown, ChevronRight, Building2, BookOpen, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// تعريف التابس خارج الكومبوننت لتجنب إعادة إنشائها في كل render
const ALL_TABS = [
    {
      id: 'overview',
      section: 'overview',
      label: 'نظرة عامة',
      icon: BarChart3,
      path: '/admin/dashboard?tab=overview'
    },
    {
      id: 'applications',
      section: 'applications',
      label: 'الطلبات',
      icon: FileText,
      path: '/admin/applications'
    },
    {
      id: 'services',
      section: 'services',
      label: 'إدارة الخدمات',
      icon: Settings,
      path: '/admin/services'
    },
    {
      id: 'appointments',
      section: 'appointments',
      label: 'تقويم الحجوزات',
      icon: Calendar,
      path: '/admin/appointments'
    },
    {
      id: 'shipping',
      section: 'shipping',
      label: 'شركات الشحن',
      icon: Package,
      path: '/admin/shipping-companies'
    },
    {
      id: 'content',
      section: 'content',
      label: 'إدارة المحتوى',
      icon: Layout,
      submenu: [
        {
          id: 'content-main',
          label: 'المحتوى الرئيسي',
          path: '/admin/dashboard?tab=content'
        },
        {
          id: 'content-consulate',
          label: 'عن القنصلية',
          icon: Building2,
          path: '/admin/content/consulate'
        },
        {
          id: 'content-services-guide',
          label: 'دليل المعاملات',
          icon: BookOpen,
          path: '/admin/content/services-guide'
        },
        {
          id: 'content-important-links',
          label: 'صفحات مهمة',
          icon: Globe,
          path: '/admin/content/important-links'
        }
      ]
    },
    {
      id: 'staff',
      section: 'staff',
      label: 'إدارة الموظفين',
      icon: Users,
      path: '/admin/staff'
    },
    {
      id: 'chat',
      section: 'chat',
      label: 'إدارة المحادثات',
      icon: MessageCircle,
      path: '/admin/chat'
    },
    {
      id: 'profile',
      section: 'profile',
      label: 'الملف الشخصي',
      icon: User,
      path: '/admin/profile'
    }
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isSuperAdmin, user } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState(['content']);

  // فلترة العناصر حسب الصلاحيات - باستخدام useMemo للحفاظ على ثبات القائمة
  const tabs = useMemo(() => {
    if (!user) return [];

    if (isSuperAdmin) {
      return ALL_TABS;
    }

    // للموظفين: نفلتر حسب dashboardSections
    const filteredTabs = ALL_TABS.filter(tab => {
      // الـ profile متاح للجميع
      if (tab.section === 'profile') return true;

      // التحقق من الصلاحيات
      if (!user.dashboardSections || !Array.isArray(user.dashboardSections)) {
        return false;
      }

      return user.dashboardSections.includes(tab.section);
    });

    // Log للـ debugging (يمكن حذفه بعد التأكد من الحل)
    console.log('Sidebar tabs filtered:', {
      userId: user.id,
      dashboardSections: user.dashboardSections,
      filteredCount: filteredTabs.length,
      tabs: filteredTabs.map(t => t.section)
    });

    return filteredTabs;
  }, [user?.id, user?.role, user?.dashboardSections, isSuperAdmin]);

  const isActive = (tabPath) => {
    const currentPath = location.pathname + location.search;
    return currentPath === tabPath;
  };

  const toggleMenu = (menuId) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  return (
    <div className="w-64 bg-white shadow-lg border-l border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center space-x-3 rtl:space-x-reverse mb-8">
          <div className="w-10 h-10 bg-[#276073] rounded-full flex items-center justify-center">
            <span className="text-white font-bold">SD</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">لوحة التحكم</h2>
            <p className="text-sm text-gray-600">نظام الإدارة</p>
          </div>
        </div>

        <nav className="space-y-2">
          {tabs.map((tab) => (
            <div key={tab.id}>
              {tab.submenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </div>
                    {expandedMenus.includes(tab.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedMenus.includes(tab.id) && (
                    <div className="mr-4 rtl:mr-0 rtl:ml-4 mt-1 space-y-1">
                      {tab.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <button
                            key={subItem.id}
                            onClick={() => navigate(subItem.path)}
                            className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              isActive(subItem.path)
                                ? 'bg-[#276073] text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                          >
                            {SubIcon && <SubIcon className="w-4 h-4" />}
                            <span>{subItem.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate(tab.path)}
                  className={`w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(tab.path)
                      ? 'bg-[#276073] text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
