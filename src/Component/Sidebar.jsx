import React, { Suspense, lazy, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaPaperPlane, FaUser, FaShieldAlt, FaTimes, FaMapMarkerAlt, FaRocketchat } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PartnerFormModal = lazy(() => import('./PartnerFormModal'));

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
        
        <div 
          onMouseLeave={onClose}
          className={`absolute top-0 h-full w-80 bg-gradient-to-b from-white via-[#f7f9ff] to-[#edf2fb] shadow-2xl transform transition-all duration-150 ease-out ${sidePosition} ${isOpen ? 'translate-x-0' : hiddenTranslate}`}
        >
          <div className={`px-6 pb-6 pt-1.5 h-full flex flex-col ${textAlign}`}>
            {/* Header */}
            <div className={`relative flex flex-col ${isRtl ? 'items-end' : 'items-start'} w-full pt-6`}>
              <button 
                onClick={onClose} 
                className={`absolute top-4 ${isRtl ? 'left-0' : 'right-0'} p-2 rounded-full bg-white/80 border border-white/60 shadow-sm hover:shadow-md text-gray-500 hover:text-gray-700 transition-all duration-200`}
              >
                <FaTimes size={20} />
              </button>
              <img 
                src="/Photas/aaf68a14-dda6-4743-824f-5bc2592df449.png"
                alt="BNC LEG" 
                className={`w-36 h-auto object-contain mb-2 ${isRtl ? 'mr-8' : 'ml-8'}`}
                decoding="async"
              />
            </div>
            
            {/* Divider Line */}
            <div className="border-b border-slate-200/60 w-full mt-6 mb-4"></div>
            
            {/* Navigation */}
            <div className="flex-1">
              <div className="mb-5 mt-4">
                <div className={`inline-flex items-center rounded-full border border-slate-200 bg-white/80 p-1 shadow-sm ${rowDirection}`}>
                  {languageOptions.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      onClick={() => i18n.changeLanguage(option.code)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        i18n.language === option.code
                          ? 'bg-[#DC2626] text-white shadow'
                          : 'text-slate-600 hover:text-[#000000]'
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
                      <Icon size={18} className="text-[#DC2626]/80 transition-colors duration-300 group-hover:text-[#000000]" />
                      <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#000000]">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
                
                {/* Services catalog and categories */}
                <>
                  <Link
                    to="/services"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <FaMapMarkerAlt size={18} className="text-[#DC2626]/80 transition-colors duration-300 group-hover:text-[#000000]" />
                    <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#000000]">
                      {t('sidebar.services', { defaultValue: 'BnC Services' })}
                    </span>
                  </Link>
                  <Link
                    to="/services?category=Financial"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${isRtl ? 'pr-8' : 'pl-8'} ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]/60 group-hover:bg-[#000000]"></div>
                    <span className="font-geist font-medium text-slate-600 text-sm transition-colors duration-300 group-hover:text-[#000000]">
                      {t('discoverServices.categories.financial', { defaultValue: 'Financial' })}
                    </span>
                  </Link>
                  <Link
                    to="/services?category=Technology"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${isRtl ? 'pr-8' : 'pl-8'} ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]/60 group-hover:bg-[#000000]"></div>
                    <span className="font-geist font-medium text-slate-600 text-sm transition-colors duration-300 group-hover:text-[#000000]">
                      {t('discoverServices.categories.technology', { defaultValue: 'Technology' })}
                    </span>
                  </Link>
                  <Link
                    to="/services?category=ESG"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${isRtl ? 'pr-8' : 'pl-8'} ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]/60 group-hover:bg-[#000000]"></div>
                    <span className="font-geist font-medium text-slate-600 text-sm transition-colors duration-300 group-hover:text-[#000000]">
                      {t('discoverServices.categories.esg', { defaultValue: 'ESG' })}
                    </span>
                  </Link>
                  <Link
                    to="/services/global"
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 hover:bg-white/70 ${rowDirection} ${textAlign}`}
                    onClick={onClose}
                  >
                    <FaMapMarkerAlt size={18} className="text-[#DC2626]/80 transition-colors duration-300 group-hover:text-[#000000]" />
                    <span className="font-geist font-semibold text-slate-700 transition-colors duration-300 group-hover:text-[#000000]">
                      {t('sidebar.globalServices', { defaultValue: 'Global Services' })}
                    </span>
                  </Link>
                </>
                {!isLoggedIn && (
                  <button 
                    onClick={handleApplyNowClick} 
                    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-200 text-slate-700 hover:bg-white/70 w-full ${rowDirection} ${textAlign}`}
                  >
                    <FaPaperPlane size={18} className="text-[#DC2626]/80 transition-colors duration-300 group-hover:text-[#000000] flipInRtl" />
                    <span className="font-geist font-semibold transition-colors duration-300 group-hover:text-[#000000]">{t('sidebar.applyNow')}</span>
                  </button>
                )}
              </nav>
            </div>
            
            {/* Bottom border line */}
            <div className="border-t border-white/60 pt-4">
              <div className="space-y-3">
                {isLoggedIn ? (
                  <>
                    <div className={`flex items-center gap-3 py-3 px-4 border border-[#DC2626] rounded-xl bg-gradient-to-r from-[#DC2626] to-[#000000] shadow-md ${rowDirection}`}>
                      <FaUser size={20} className="text-white" />
                      <div>
                        <div className="font-geist font-semibold text-white">{user?.firstName} {user?.lastName}</div>
                        <div className="font-geist text-sm text-red-100 truncate">{user?.email}</div>
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
                    <Link 
                      to="/login" 
                      onClick={onClose} 
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-[#DC2626] bg-gradient-to-r from-[#DC2626] to-[#000000] text-white shadow-md ${rowDirection}`}
                    >
                      <FaUser size={20} className="transition-colors duration-300" />
                      <span className="font-geist font-medium transition-colors duration-300">{t('sidebar.partnerLogin')}</span>
                    </Link>
                    
                    <Link 
                      to="/login?type=admin" 
                      onClick={onClose} 
                      className={`flex items-center gap-3 py-3 px-4 rounded-xl border border-gray-200 transition-all duration-300 hover:text-white hover:border-blue-500 text-gray-700 bg-white/70 hover:bg-gradient-to-r hover:from-[#DC2626] hover:to-[#000000] ${rowDirection}`}
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
      
      {isModalOpen ? (
        <Suspense fallback={null}>
          <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
};

export default Sidebar;
