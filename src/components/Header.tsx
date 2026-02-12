import React, { useState } from 'react';
import { Globe, Menu, X, Shield, ExternalLink } from 'lucide-react';
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

  const handleNavClick = (href: string, openInNewTab = false) => {
    if (openInNewTab) {
      window.open(href, '_blank', 'noopener,noreferrer');
      setIsMenuOpen(false);
      return;
    }

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
      <header className="bg-white shadow-lg sticky top-0 z-50 w-full" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full px-3 sm:px-4 max-w-full">
          {/* Single Line Header */}
          <div className="flex items-center justify-between py-2 md:py-3 gap-2 md:gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#276073] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-base md:text-lg">SD</span>
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#276073] truncate">
                  {language === 'ar' ? 'القنصلية السودانية' : 'Sudanese Consulate'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden md:block">
                  {language === 'ar' ? 'جدة - المملكة العربية السعودية' : 'Jeddah - Saudi Arabia'}
                </p>
              </div>
            </div>

            {/* Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex flex-1 justify-center overflow-x-auto max-w-full px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <ul className="flex items-center gap-2 xl:gap-3 flex-nowrap">
                {navigationItems.map((item) => (
                  <li key={item.key} className="group/nav-item relative flex-shrink-0">
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className="text-gray-700 hover:text-[#276073] font-medium transition-colors duration-200 relative group whitespace-nowrap text-xs xl:text-sm py-1.5 px-1.5 xl:px-2"
                      >
                        {t(`nav.${item.key}`)}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#276073] group-hover:w-full transition-all duration-300"></span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick(item.href, true);
                        }}
                        className="opacity-0 group-hover/nav-item:opacity-100 p-1 text-gray-400 hover:text-[#276073] hover:bg-gray-100 rounded transition-all duration-200"
                        title="فتح في نافذة جديدة"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-shrink-0">
              {/* Admin Login Button */}
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex items-center gap-1.5 p-1.5 md:p-2 text-gray-600 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                title="لوحة تحكم الإدارة - فتح في نافذة جديدة"
              >
                <Shield className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">إدارة</span>
                <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1.5 p-1.5 md:p-2 text-gray-600 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
              >
                <Globe className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">
                  {language === 'ar' ? 'EN' : 'عر'}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-1.5 md:p-2 text-gray-600 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors duration-200 flex-shrink-0"
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
                    <div className="flex items-center gap-2 px-4">
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className="flex-1 text-right rtl:text-right py-2 text-gray-700 hover:text-[#276073] hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                      >
                        {t(`nav.${item.key}`)}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick(item.href, true);
                        }}
                        className="p-2 text-gray-400 hover:text-[#276073] hover:bg-gray-100 rounded-lg transition-colors"
                        title="فتح في نافذة جديدة"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
                <li>
                  <a
                    href="/admin/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full text-right rtl:text-right py-2 px-4 text-gray-700 hover:text-[#276073] hover:bg-gray-50 rounded-lg font-medium transition-colors duration-200"
                  >
                    <span>لوحة تحكم الإدارة</span>
                    <ExternalLink className="w-4 h-4 opacity-50" />
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