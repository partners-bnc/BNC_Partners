import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ChevronDown,
  LayoutDashboard,
  Store,
  Wallet,
  Calendar,
  User,
  Search,
  Mic,
  FileText,
  Settings,
  RefreshCw,
  LogOut,
  Gift
} from 'lucide-react';

const PROVIDER_OPTIONS = [
  {
    key: 'overview',
    title: 'Overview',
    description: 'Earnings, ratings and monthly trends',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    key: 'services',
    title: 'Listed Services',
    description: 'Manage and publish consulting packages',
    icon: Store,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  },
  {
    key: 'ledger',
    title: 'Transaction Ledger',
    description: 'Complete record of payout transactions',
    icon: Wallet,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  {
    key: 'calendar',
    title: 'Bookings Calendar',
    description: 'Scheduled client consultations calendar',
    icon: Calendar,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  {
    key: 'profile',
    title: 'Profile Onboarding',
    description: 'Complete setup and partner agreement',
    icon: User,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    key: 'referral-program',
    title: 'Referral Program',
    description: 'Invite partners and earn rewards',
    icon: Gift,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600'
  }
];

const CONSUMER_OPTIONS = [
  {
    key: 'overview',
    title: 'Overview',
    description: 'Client statistics and booked calls summary',
    icon: LayoutDashboard,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    key: 'directory',
    title: 'Explore Directory',
    description: 'Browse and book certified advisory experts',
    icon: Search,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600'
  },
  {
    key: 'ai-assistant',
    title: 'AI Match Assistant',
    description: 'Voice match project requirements instantly',
    icon: Mic,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600'
  },
  {
    key: 'bookings',
    title: 'My Bookings',
    description: 'Manage scheduled meetings and expert calls',
    icon: Calendar,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600'
  },
  {
    key: 'invoices',
    title: 'Invoices & Payments',
    description: 'Audit bills, invoice balance, and payments',
    icon: FileText,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600'
  },
  {
    key: 'settings',
    title: 'Client Settings',
    description: 'Organizational details and budget preferences',
    icon: Settings,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    key: 'profile',
    title: 'Profile Onboarding',
    description: 'Complete setup and partner agreement',
    icon: User,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    key: 'referral-program',
    title: 'Referral Program',
    description: 'Invite partners and earn rewards',
    icon: Gift,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600'
  }
];

const Sidebar = lazy(() => import('./Sidebar'));
const PartnerFormModal = lazy(() => import('./PartnerFormModal'));
const ExpertFormModal = lazy(() => import('./ExpertFormModal'));

const Header = ({ currentRole, onRoleSwitch, onMenuClick, isDashboardPage, handleTabChange, activeTab }) => {
  const { t, i18n } = useTranslation();

  // Calculate dynamic button label for the active role / active section
  const activeDashboardTab = activeTab || localStorage.getItem('activeDashboardTab') || 'overview';
  const role = currentRole || localStorage.getItem('dashboardRole') || 'provider';
  const activeList = role === 'provider' ? PROVIDER_OPTIONS : CONSUMER_OPTIONS;
  const activeOption = activeList.find(opt => opt.key === activeDashboardTab);
  const buttonLabel = (isDashboardPage && activeOption) ? activeOption.title : (role === 'provider' ? 'Provider' : 'Consumer');
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

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
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 shadow-xs transition-all cursor-pointer flex items-center justify-center"
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                onMouseEnter={() => setIsSidebarOpen(true)}
                aria-label="Toggle sidebar"
                aria-expanded={isSidebarOpen}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
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
                  to="/services"
                  className={`font-geist text-base relative transition-colors duration-300 ${location.pathname.startsWith('/services') ? 'text-[#DC2626] font-semibold' : 'text-gray-700 hover:text-[#DC2626]'
                    }`}
                >
                  {t('header.services')}
                  <span
                    className={`absolute bottom-0 ${underlineAlign} h-0.5 bg-[#DC2626] transition-all duration-300 ${location.pathname.startsWith('/services') ? 'w-full' : 'w-0'
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

                {/* Logged In Dashboard Dropdown */}
                {isLoggedIn && (
                  <div
                    className="relative inline-block text-left"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    {/* Trigger Button */}
                    <button
                      className="font-geist text-base relative transition-colors duration-300 text-gray-700 hover:text-[#DC2626] font-medium flex items-center gap-1.5 cursor-pointer py-1 focus:outline-none"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>{buttonLabel}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-[#DC2626]' : 'text-slate-500'}`} />
                      <span className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-[#DC2626] transition-all duration-300"></span>
                    </button>

                    {/* Dropdown Box Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 top-full mt-2 w-[480px] bg-white border border-slate-200/80 rounded-3xl shadow-2xl p-6 z-50 pointer-events-auto"
                        >
                          {/* 2-Column Options Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            {((currentRole || localStorage.getItem('dashboardRole') || 'provider') === 'provider' ? PROVIDER_OPTIONS : CONSUMER_OPTIONS).map((opt) => (
                              <button
                                key={opt.key}
                                onClick={() => {
                                  if (opt.key === 'referral-program') {
                                    window.location.href = '/referral-program';
                                    return;
                                  }
                                  localStorage.setItem('dashboardRole', currentRole || localStorage.getItem('dashboardRole') || 'provider');
                                  localStorage.setItem('activeDashboardTab', opt.key);
                                  if (isDashboardPage && handleTabChange) {
                                    handleTabChange(opt.key);
                                  } else {
                                    window.location.href = '/dashboard';
                                  }
                                }}
                                className="group/item flex items-center gap-3.5 p-4 rounded-2xl bg-gray-50 border border-slate-200/50 hover:bg-white hover:border-[#E52E38] transition-all w-full cursor-pointer text-left font-sans shadow-sm"
                              >
                                {/* Black professional icon with no background container */}
                                <opt.icon className="w-5 h-5 text-slate-800 group-hover/item:text-[#E52E38] transition-colors shrink-0" />

                                <span className="font-semibold text-slate-800 text-sm group-hover/item:text-[#E52E38] transition-colors leading-none">
                                  {opt.title}
                                </span>
                              </button>
                            ))}
                          </div>

                          {/* Footer controls: Switch Role Toggle Switch */}
                          <div className="mt-6 pt-4 border-t border-slate-150 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-550 font-sans">
                              {(currentRole || localStorage.getItem('dashboardRole') || 'provider') === 'provider' ? 'Switch to Consumer' : 'Switch to Provider'}
                            </span>

                            <button
                              onClick={() => {
                                if (onRoleSwitch) {
                                  onRoleSwitch();
                                } else {
                                  const active = localStorage.getItem('dashboardRole') || 'provider';
                                  const next = active === 'provider' ? 'consumer' : 'provider';
                                  localStorage.setItem('dashboardRole', next);
                                  window.location.href = '/dashboard';
                                }
                              }}
                              className={`relative w-11 h-6 rounded-full transition-colors duration-250 cursor-pointer focus:outline-none flex items-center ${(currentRole || localStorage.getItem('dashboardRole') || 'provider') === 'provider'
                                  ? 'bg-slate-300'
                                  : 'bg-[#E52E38]'
                                }`}
                            >
                              <span
                                className={`absolute left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-250 ${(currentRole || localStorage.getItem('dashboardRole') || 'provider') === 'provider'
                                    ? 'translate-x-0'
                                    : 'translate-x-5'
                                  }`}
                              />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </nav>
            </div>

            {/* Right Section - Restored Dashboard & Logout buttons */}
            <div className={`flex items-center gap-3 ${rightPadding}`}>
              <div className="flex items-center gap-3">
                <Link
                  to={isLoggedIn ? "/dashboard" : "/login"}
                  onClick={(e) => {
                    if (isLoggedIn && isDashboardPage && handleTabChange) {
                      e.preventDefault();
                      handleTabChange('overview');
                    } else if (isLoggedIn) {
                      localStorage.setItem('activeDashboardTab', 'overview');
                    }
                  }}
                  className="hidden md:inline-block bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 px-4 py-2 rounded-lg font-poppins font-medium text-sm transition-all shadow-sm"
                >
                  {t('header.dashboard')}
                </Link>
                {isLoggedIn ? (
                  <div
                    className="relative hidden md:inline-block"
                    onMouseEnter={() => setIsUserDropdownOpen(true)}
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="flex items-center gap-2 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 px-3 py-1.5 rounded-lg font-poppins font-medium text-sm cursor-pointer transition-all shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-[#0F2A4A] flex items-center justify-center text-xs font-bold text-white shadow-inner">
                        {(user?.firstName?.[0] || user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                      </div>
                      <span className="max-w-[120px] truncate">{user?.firstName || user?.name || user?.email?.split('@')[0]}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-slate-400 ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    <AnimatePresence>
                      {isUserDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200/80 rounded-xl shadow-lg py-2 z-50 pointer-events-auto"
                        >
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('header.logout')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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


