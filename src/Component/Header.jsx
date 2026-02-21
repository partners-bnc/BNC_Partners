import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import PartnerFormModal from './PartnerFormModal';

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const partnerUser = localStorage.getItem('partnerUser');
    if (partnerUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(partnerUser));
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('open') === 'partner') {
      setIsModalOpen(true);
    }
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem('partnerUser');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const isActivePath = (path) => location.pathname === path;
  const isRtl = i18n.language === 'ar';
  const headerPadding = isRtl ? 'pr-16 pl-4' : 'pl-16 pr-4';
  const rightPadding = isRtl ? 'pr-2 ml-12' : 'pl-2 mr-12';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const underlineAlign = isRtl ? 'right-0' : 'left-0';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white shadow-lg z-40 rounded-b-3xl">
        <div className={`w-full ${headerPadding}`}>
          <div className={`flex items-center justify-between h-19 ${rowDirection}`}>
            {/* Left Section */}
            <div className={`flex items-center gap-3 pr-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Sidebar Menu Button */}
              <button 
                className="flex flex-col space-y-1"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                aria-label="Toggle sidebar"
                aria-expanded={isSidebarOpen}
              >
                <div className="w-5 h-0.5 bg-gray-700"></div>
                <div className="w-5 h-0.5 bg-gray-700"></div>
                <div className="w-5 h-0.5 bg-gray-700"></div>
              </button>
              
              {/* Logo + Company Name */}
              <Link to="/" className="flex items-center gap-2">
                <img 
                  src="https://static.wixstatic.com/media/0446e3_50ff54e1251b45ef8a1066bca3a75b0e~mv2.png/v1/fill/w_256,h_256,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/b%20nc%20global.png" 
                  alt="BnC Global" 
                  className="h-15 w-15 object-contain"
                />
                
                <span className="font-poppins font-bold text-[22px] text-[#2C5AA0] tracking-tight whitespace-nowrap">
                  BnC Global
                </span>
              </Link>
            </div>
            
            {/* Center Section */}
            <div className="hidden md:flex flex-1 justify-center">
              <nav className="flex items-center gap-6 whitespace-nowrap">
                {location.pathname !== '/' && (
                  <Link
                    to="/"
                    className={`font-geist text-base relative transition-colors duration-300 ${
                      isActivePath('/') ? 'text-[#2C5AA0] font-semibold' : 'text-gray-700 hover:text-[#2C5AA0]'
                    }`}
                  >
                    {t('header.home')}
                    <span
                      className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#2C5AA0] transition-all duration-300 ${
                        isActivePath('/') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    ></span>
                  </Link>
                )}
                <Link
                  to="/services/india"
                  className={`font-geist text-base relative transition-colors duration-300 ${
                    isActivePath('/services/india') ? 'text-[#2C5AA0] font-semibold' : 'text-gray-700 hover:text-[#2C5AA0]'
                  }`}
                >
                  {t('countries.india')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#2C5AA0] transition-all duration-300 ${
                      isActivePath('/services/india') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/services/saudi-arabia"
                  className={`font-geist text-base relative transition-colors duration-300 ${
                    isActivePath('/services/saudi-arabia') ? 'text-[#2C5AA0] font-semibold' : 'text-gray-700 hover:text-[#2C5AA0]'
                  }`}
                >
                  {t('countries.saudi')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#2C5AA0] transition-all duration-300 ${
                      isActivePath('/services/saudi-arabia') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
                <Link
                  to="/services/global"
                  className={`font-geist text-base relative transition-colors duration-300 ${
                    isActivePath('/services/global') ? 'text-[#2C5AA0] font-semibold' : 'text-gray-700 hover:text-[#2C5AA0]'
                  }`}
                >
                  {t('countries.global')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#2C5AA0] transition-all duration-300 ${
                      isActivePath('/services/global') ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              </nav>
            </div>

            {/* Right Section */}
            <div className={`flex items-center gap-3 ${rightPadding}`}>
              <Link
                to="/start-chatting"
                className="hidden md:inline-flex items-center bg-white border border-[#2C5AA0] text-[#2C5AA0] hover:bg-[#2C5AA0] hover:text-white px-4 py-2 rounded-lg font-poppins font-semibold text-sm transition-colors duration-300"
              >
                {t('header.aiChatting')}
              </Link>
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/dashboard"
                    className="hidden md:inline-block bg-white border border-[#2C5AA0] text-[#2C5AA0] hover:bg-[#2C5AA0] hover:text-white px-4 py-2 rounded-lg font-poppins font-semibold text-sm transition-colors duration-300"
                  >
                    {t('header.dashboard')}
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="hidden md:inline-block bg-[#2C5AA0] hover:bg-[#1e3f73] text-white px-4 py-2 rounded-lg font-poppins font-semibold text-sm transition-colors duration-300"
                  >
                    {t('header.logout')}
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:inline-block bg-[#2C5AA0] hover:bg-[#1e3f73] text-white px-4 py-2 rounded-lg font-poppins font-semibold text-sm transition-colors duration-300">
                  {t('header.login')}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Spacer for fixed header */}
      <div className="h-18"></div>
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
      />
      <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Header;
