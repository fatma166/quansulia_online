import React, { useState } from 'react';
import { Globe, Menu, X, Shield } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';

const Header: React.FC = () => {
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { key: 'home', href: '/' },
    { key: 'services', href: '/services' },
    { key: 'about_consulate', href: '/about-consulate' },
    { key: 'track', href: '/track' },
    { key: 'services_guide', href: '/services-guide' },
    { key: 'news', href: '/news' },
    { key: 'events', href: '/events' },
    { key: 'about_sudan', href: '/about-sudan' },
    { key: 'important_links', href: '/important-links' },
    { key: 'karama_battle', href: '/karama-battle' },
    { key: 'contact', href: '/contact' }
  ];

  const handleNavClick = (href: string) => {
    if (href === '/services' || href === '/consular-services') {
      window.location.href = '/services';
    } else if (href === '/about-consulate') {
      window.location.href = '/about-consulate';
    } else if (href === '/track') {
      window.location.href = '/track';
    } else if (href === '/services-guide') {
      window.location.href = '/services-guide';
    } else if (href === '/about-sudan') {
      window.location.href = '/about-sudan';
    } else if (href === '/important-links') {
      window.location.href = '/important-links';
    } else if (href === '/karama-battle') {
      window.location.href = '/karama-battle';
    } else if (href === '/contact') {
      window.location.href = '/contact';
    } else if (href === '/news') {
      window.location.href = '/news';
    } else if (href === '/events') {
      window.location.href = '/events';
    } else if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = href;
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-lg sticky top-0 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4">
          {/* Single Line Header */}
          <div className="flex items-center justify-between py-3 md:py-4">
            {/* Logo, Title and Navigation */}
            <div className="flex items-center space-x-2 sm:space-x-4 rtl:space-x-reverse">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#276073] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-base sm:text-lg">SD</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-[#276073] truncate">
                  {language === 'ar' ? 'القنصلية السودانية' : 'Sudanese Consulate'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {language === 'ar' ? 'جدة - المملكة العربية السعودية' : 'Jeddah - Saudi Arabia'}
                </p>
              </div>
              
              {/* Navigation - Hidden on mobile */}
              <nav className="hidden lg:block mr-8 rtl:mr-0 rtl:ml-8">
                <ul className="flex items-center space-x-6 rtl:space-x-reverse">
                  {navigationItems.map((item) => (
                    <li key={item.key}>
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className="text-gray-700 hover:text-[#276073] font-medium transition-colors duration-200 relative group whitespace-nowrap"
                      >
                        {t(`nav.${item.key}`)}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#276073] group-hover:w-full transition-all duration-300"></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {/* Admin Login Button */}
              <a
                href="/admin/login"
                className="hidden md:flex items-center space-x-2 rtl:space-x-reverse p-2 text-gray-600 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="لوحة تحكم الإدارة"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm font-medium">إدارة</span>
              </a>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center space-x-2 rtl:space-x-reverse p-2 text-gray-600 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {language === 'ar' ? 'EN' : 'عر'}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200">
              <ul className="space-y-2">
                {navigationItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="block w-full text-right rtl:text-right py-2 px-4 text-gray-700 hover:text-[#276073] hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                    >
                      {t(`nav.${item.key}`)}
                    </button>
                  </li>
                ))}
                <li>
                  <a
                    href="/admin/login"
                    className="block w-full text-right rtl:text-right py-2 px-4 text-gray-700 hover:text-[#276073] hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                  >
                    لوحة تحكم الإدارة
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;