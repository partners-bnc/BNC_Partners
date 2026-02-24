import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaPaperPlane, FaUser, FaShieldAlt, FaTimes, FaMapMarkerAlt, FaRocketchat } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import PartnerFormModal from './PartnerFormModal';

const Sidebar = ({ isOpen, onClose, isLoggedIn, user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const sidePosition = 'left-0 rounded-r-3xl';
  const hiddenTranslate = '-translate-x-full';
  const languageOptions = isRtl
    ? [
      { code: 'ar', label: t('language.arabic') },
      { code: 'en', label: t('language.english') }
    ]
    : [
      { code: 'en', label: t('language.english') },
      { code: 'ar', label: t('language.arabic') }
    ];

  const handleApplyNowClick = () => {
    onClose();
    window.location.href = '/?open=partner';
  };

  const navigationItems = [
    { to: '/', icon: FaHome, label: t('sidebar.home') },
    { to: '/start-chatting', icon: FaRocketchat, label: t('header.aiChatting') }
  ];

  return (
    <>
      <div className={`fixed inset-0 z-50 transition-all duration-150 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div 
          className={`absolute inset-0 transition-all duration-150 ${isOpen ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-transparent'}`} 
          onClick={onClose}
        ></div>
        
        <div className={`absolute top-0 h-full w-80 bg-gradient-to-b from-white via-[#f7f9ff] to-[#edf2fb] shadow-2xl transform transition-all duration-150 ease-out ${sidePosition} ${isOpen ? 'translate-x-0' : hiddenTranslate}`}>
          <div className={`p-6 h-full flex flex-col ${textAlign}`}>
            {/* Header */}
            <div className={`flex items-start justify-between mb-6 ${rowDirection}`}>
              <div className={`flex items-center gap-3 ${rowDirection}`}>
                <img 
                  src="https://static.wixstatic.com/media/0446e3_50ff54e1251b45ef8a1066bca3a75b0e~mv2.png/v1/fill/w_256,h_256,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/b%20nc%20global.png" 
                  alt="BnC Global" 
                  className="h-20 w-20 object-contain"
                />
                <div className="flex flex-col">
                  <h2 className="font-poppins text-3xl font-light text-[#2C5AA0]">
                    BnC Global
                  </h2>
                  <div className="h-0.5 w-28 bg-black mt-2"></div>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full bg-white/80 border border-white/60 shadow-sm hover:shadow-md text-gray-500 hover:text-gray-700 transition-all duration-200"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            {/* Navigation */}
            <div className="flex-1">
              <div className="mb-4">
                <div className={`inline-flex items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm ${rowDirection}`}>
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => i18n.changeLanguage(option.code)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        i18n.language === option.code
                          ? 'bg-[#2C5AA0] text-white shadow'
                          : 'text-slate-600 hover:text-[#1e3a8a]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link 
                      key={item.to}
                      to={item.to} 
                      className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${rowDirection} ${textAlign}`}
                      onClick={onClose}
                    >
                      <Icon size={18} className="text-[#2C5AA0]/80 transition-colors duration-300 group-hover:text-[#1e3a8a]" />
                      <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#1e3a8a]">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                
                {/* Country services */}
                <>
                  <Link
                    to="/services/india"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <FaMapMarkerAlt size={18} className="text-[#2C5AA0]/80 transition-colors duration-300 group-hover:text-[#1e3a8a]" />
                    <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#1e3a8a]">
                      {t('countries.india')}
                    </span>
                  </Link>
                  <Link
                    to="/services/saudi-arabia"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <FaMapMarkerAlt size={18} className="text-[#2C5AA0]/80 transition-colors duration-300 group-hover:text-[#1e3a8a]" />
                    <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#1e3a8a]">
                      {t('countries.saudi')}
                    </span>
                  </Link>
                  <Link
                    to="/services/global"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <FaMapMarkerAlt size={18} className="text-[#2C5AA0]/80 transition-colors duration-300 group-hover:text-[#1e3a8a]" />
                    <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#1e3a8a]">
                      {t('countries.global')}
                    </span>
                  </Link>
                </>
                {!isLoggedIn && (
                  <button 
                    onClick={handleApplyNowClick} 
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 text-slate-700 hover:bg-white/70 w-full ${rowDirection} ${textAlign}`}
                  >
                    <FaPaperPlane size={18} className="text-[#2C5AA0]/80 transition-colors duration-300 group-hover:text-[#1e3a8a] flipInRtl" />
                    <span className="font-geist font-semibold transition-colors duration-300 group-hover:text-[#1e3a8a]">{t('sidebar.applyNow')}</span>
                  </button>
                )}
              </nav>
            </div>
            
            {/* Bottom border line */}
            <div className="border-t border-white/60 pt-4">
              <div className="space-y-3">
                {isLoggedIn ? (
                  <>
                    <div className={`flex items-center gap-3 py-3 px-4 border border-[#2C5AA0] rounded-xl bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] shadow-md ${rowDirection}`}>
                      <FaUser size={20} className="text-white" />
                      <div>
                        <div className="font-geist font-semibold text-white">{user?.firstName} {user?.lastName}</div>
                        <div className="font-geist text-sm text-blue-100 truncate">{user?.email}</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        onClose();
                        onLogout();
                      }}
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-red-200 transition-all duration-300 hover:bg-red-500 hover:text-white hover:border-red-500 text-red-700 bg-red-100 w-full ${rowDirection} ${textAlign}`}
                    >
                      <FaUser size={20} className="transition-colors duration-300" />
                      <span className="font-geist font-medium transition-colors duration-300">{t('sidebar.logout')}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-white/90 shadow-[0_10px_20px_rgba(44,90,160,0.25)] border border-black/30 flex items-center justify-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(44,90,160,0.35)]">
                        <img
                          src="/favicon/download.png"
                          alt="BnC Global"
                          className="h-10 w-10 object-contain drop-shadow-[0_6px_10px_rgba(44,90,160,0.35)]"
                        />
                      </div>
                    </div>
                    <Link 
                      to="/login" 
                      onClick={onClose} 
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-[#2C5AA0] bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] text-white shadow-md ${rowDirection}`}
                    >
                      <FaUser size={20} className="transition-colors duration-300" />
                      <span className="font-geist font-medium transition-colors duration-300">{t('sidebar.partnerLogin')}</span>
                    </Link>
                    
                    <Link 
                      to="/login?type=admin" 
                      onClick={onClose} 
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-200 transition-all duration-300 hover:text-white hover:border-blue-500 text-gray-700 bg-white/70 hover:bg-gradient-to-r hover:from-[#2C5AA0] hover:to-[#1e3a8a] ${rowDirection}`}
                    >
                      <FaShieldAlt size={20} className="transition-colors duration-300" />
                      <span className="font-geist font-medium transition-colors duration-300">{t('sidebar.adminLogin')}</span>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6" />
          </div>
        </div>
      </div>
      
      <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Sidebar;
