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
        <div className="w-full px-2 sm:px-3 max-w-full">
          {/* Single Line Compact Header */}
          <div className="flex items-center justify-between py-1.5 md:py-2 gap-1 md:gap-2">
            {/* Logo and Title */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#276073] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs sm:text-sm">SD</span>
              </div>
              <div className="min-w-0 hidden sm:block">
                <h1 className="text-xs sm:text-sm md:text-base font-bold text-[#276073] truncate leading-tight">
                  {language === 'ar' ? 'القنصلية السودانية' : 'Sudanese Consulate'}
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600 truncate hidden md:block leading-tight">
                  {language === 'ar' ? 'جدة - المملكة العربية السعودية' : 'Jeddah - Saudi Arabia'}
                </p>
              </div>
            </div>

            {/* Navigation - Compact Version */}
            <nav className="hidden lg:flex flex-1 justify-center overflow-x-auto max-w-full px-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#276073 transparent' }}>
              <ul className="flex items-center gap-0.5 xl:gap-1 flex-nowrap">
                {navigationItems.map((item) => (
                  <li key={item.key} className="group/nav-item relative flex-shrink-0">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleNavClick(item.href)}
                        className="text-gray-700 hover:text-white hover:bg-[#276073] font-medium transition-all duration-200 relative whitespace-nowrap text-[11px] xl:text-xs py-1 px-1.5 xl:px-2 rounded"
                      >
                        {t(`nav.${item.key}`)}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavClick(item.href, true);
                        }}
                        className="opacity-0 group-hover/nav-item:opacity-100 p-0.5 text-gray-400 hover:text-[#276073] hover:bg-gray-100 rounded transition-all duration-200"
                        title="فتح في نافذة جديدة"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Right Side Actions - Compact */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
              {/* Admin Login Button */}
              <a
                href="/admin/login"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden xl:flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-white hover:bg-[#276073] rounded transition-all duration-200 border border-gray-200"
                title="لوحة تحكم الإدارة"
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">إدارة</span>
              </a>

              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-white hover:bg-[#276073] rounded transition-all duration-200 border border-gray-200 flex-shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">
                  {language === 'ar' ? 'EN' : 'عر'}
                </span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden px-2 py-1 text-gray-600 hover:text-white hover:bg-[#276073] rounded transition-all duration-200 border border-gray-200 flex-shrink-0"
              >
                {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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