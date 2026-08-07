import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = lazy(() => import('./Sidebar'));
const PartnerFormModal = lazy(() => import('./PartnerFormModal'));
const ExpertFormModal = lazy(() => import('./ExpertFormModal'));

const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
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
    } else if (params.get('open') === 'expert') {
      setIsExpertModalOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);

  const handleLogout = async () => {
    localStorage.removeItem('partnerUser');
    setIsLoggedIn(false);
    setUser(null);
    try {
      const { logout } = await import('../lib/supabaseData');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    window.location.href = '/';
  };

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname !== '/') return;
      const sections = ['home', 'about', 'services', 'how-it-works', 'contact'];
      const scrollPosition = window.scrollY + 240; // offset

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const isActiveNav = (sectionId) => {
    if (location.pathname !== '/') return false;
    return activeSection === sectionId;
  };

  const handleNavClick = (e, sectionId) => {
    if (location.pathname === '/') {
      e.preventDefault();
      if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
        setActiveSection('home');
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          window.history.pushState(null, '', `/#${sectionId}`);
          setActiveSection(sectionId);
        }
      }
    }
  };
  const isRtl = i18n.language === 'ar';
  const headerPadding = isRtl ? 'pr-16 pl-4' : 'pl-16 pr-4';
  const rightPadding = isRtl ? 'pr-2 ml-12' : 'pl-2 mr-12';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const underlineAlign = isRtl ? 'right-0' : 'left-0';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md border-b border-slate-100/50 z-40">
        <div className={`w-full ${headerPadding}`}>
          <div className={`flex items-center justify-between h-19 ${rowDirection}`}>
            {/* Left Section */}
            <div className={`flex items-center gap-3 pr-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
              {/* Sidebar Menu Button */}
              <button
                className="flex flex-col space-y-0.5 cursor-pointer"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                onMouseEnter={() => setIsSidebarOpen(true)}
                aria-label="Toggle sidebar"
                aria-expanded={isSidebarOpen}
              >
                <div className="w-4 h-[1.5px] bg-gray-700"></div>
                <div className="w-4 h-[1.5px] bg-gray-700"></div>
                <div className="w-4 h-[1.5px] bg-gray-700"></div>
              </button>

              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 ms-4" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'auto' })}>
                <img
                  src="/Photas/aaf68a14-dda6-4743-824f-5bc2592df449.png"
                  alt="BNC LEG"
                  className="h-12 w-auto object-contain"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
              </Link>
            </div>

            {/* Center Section */}
            <div className="hidden md:flex flex-1 justify-center">
              <nav className="flex items-center gap-6 whitespace-nowrap">
                {/* Home */}
                <Link
                  to="/"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className={`font-geist text-base relative transition-colors duration-300 ${isActiveNav('home') ? 'text-[#DC2626] font-semibold' : 'text-gray-700 hover:text-[#DC2626]'
                    }`}
                >
                  {t('header.home')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#DC2626] transition-all duration-300 ${isActiveNav('home') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  ></span>
                </Link>

                {/* About */}
                <Link
                  to="/#about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className={`font-geist text-base relative transition-colors duration-300 ${isActiveNav('about') ? 'text-[#DC2626] font-semibold' : 'text-gray-700 hover:text-[#DC2626]'
                    }`}
                >
                  {t('header.about')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#DC2626] transition-all duration-300 ${isActiveNav('about') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  ></span>
                </Link>

                {/* Services */}
                <Link
                  to="/#services"
                  onClick={(e) => handleNavClick(e, 'services')}
                  className={`font-geist text-base relative transition-colors duration-300 ${isActiveNav('services') ? 'text-[#DC2626] font-semibold' : 'text-gray-700 hover:text-[#DC2626]'
                    }`}
                >
                  {t('header.services')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#DC2626] transition-all duration-300 ${isActiveNav('services') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  ></span>
                </Link>

                {/* How It Works */}
                <Link
                  to="/#how-it-works"
                  onClick={(e) => handleNavClick(e, 'how-it-works')}
                  className={`font-geist text-base relative transition-colors duration-300 ${isActiveNav('how-it-works') ? 'text-[#DC2626] font-semibold' : 'text-gray-700 hover:text-[#DC2626]'
                    }`}
                >
                  {t('header.howItWorks')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#DC2626] transition-all duration-300 ${isActiveNav('how-it-works') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  ></span>
                </Link>

                {/* Contact */}
                <Link
                  to="/#contact"
                  onClick={(e) => handleNavClick(e, 'contact')}
                  className={`font-geist text-base relative transition-colors duration-300 ${isActiveNav('contact') ? 'text-[#DC2626] font-semibold' : 'text-gray-700 hover:text-[#DC2626]'
                    }`}
                >
                  {t('header.contact')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#DC2626] transition-all duration-300 ${isActiveNav('contact') ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  ></span>
                </Link>
              </nav>
            </div>

            {/* Right Section */}
            <div className={`flex items-center gap-3 ${rightPadding}`}>

              <div className="flex items-center gap-3">
                <Link
                  to={isLoggedIn ? "/dashboard" : "/login"}
                  className="hidden md:inline-block bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg font-poppins font-medium text-sm transition-all shadow-sm"
                >
                  {t('header.dashboard')}
                </Link>
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="hidden md:inline-block bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg font-poppins font-medium text-sm cursor-pointer transition-all shadow-sm"
                  >
                    {t('header.logout')}
                  </button>
                ) : (
                  <Link to="/login" className="hidden md:inline-block bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg font-poppins font-medium text-sm transition-all shadow-sm">
                    {t('header.login')}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {isSidebarOpen ? (
        <Suspense fallback={null}>
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={handleLogout}
          />
        </Suspense>
      ) : null}
      {isModalOpen ? (
        <Suspense fallback={null}>
          <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </Suspense>
      ) : null}
      {isExpertModalOpen ? (
        <Suspense fallback={null}>
          <ExpertFormModal isOpen={isExpertModalOpen} onClose={() => setIsExpertModalOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
};

export default Header;


