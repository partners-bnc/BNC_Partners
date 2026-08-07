import React, { useState, useEffect } from 'react';
import { FaUser, FaShieldAlt, FaLock, FaIdCard, FaArrowLeft, FaEye, FaEyeSlash, FaChartLine, FaBriefcase, FaHandshake, FaGraduationCap } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPartnerData, isPartnerProfileComplete, loginAdmin, loginPartner, loginPartnerWithGoogle } from '../lib/supabaseData';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const iconMargin = isRtl ? 'mr-2' : 'ml-2';
  const passPadding = isRtl ? 'pl-12' : 'pr-12';
  const eyePosition = isRtl ? 'left-3' : 'right-3';
  const topBlobPos = isRtl ? 'pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#DC2626]/15 blur-3xl' : 'pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#DC2626]/15 blur-3xl';
  const bottomBlobPos = isRtl ? 'pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#B91C1C]/15 blur-3xl' : 'pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#B91C1C]/15 blur-3xl';
  const [activeTab, setActiveTab] = useState('partner');
  const [selectedRole, setSelectedRole] = useState(null);
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const benefitItems = t('login.sidePanel.benefits', { returnObjects: true });
  const trustItems = t('login.trustIndicators', { returnObjects: true });

  const renderLeftIllustration = () => {
    if (selectedRole === 'provider') {
      return (
        <div className="flex flex-col items-start justify-center py-6 flex-grow text-left">
          <svg viewBox="0 0 400 300" className="w-full max-w-xs h-auto text-slate-800 drop-shadow-sm" fill="none">
            <path d="M50 250 L350 250 M50 200 L350 200 M50 150 L350 150 M50 100 L350 100" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
            <rect x="80" y="160" width="28" height="90" rx="6" fill="rgba(15,41,74,0.08)" />
            <rect x="140" y="120" width="28" height="130" rx="6" fill="rgba(15,41,74,0.18)" />
            <rect x="200" y="90" width="28" height="160" rx="6" fill="url(#blueGrad)" />
            <rect x="260" y="60" width="28" height="190" rx="6" fill="rgba(15,41,74,0.4)" />
            <path d="M94 150 Q154 110 214 80 T334 40" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" fill="none" />
            <circle cx="334" cy="40" r="8" fill="#DC2626" />
            <circle cx="334" cy="40" r="14" stroke="#DC2626" strokeWidth="2" opacity="0.5" className="animate-ping" style={{ transformOrigin: '334px 40px' }} />
            <circle cx="214" cy="210" r="28" fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
            <path d="M204 210 L224 210 M214 200 L214 220" stroke="#0f294a" strokeWidth="2" strokeLinecap="round" />
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
          </svg>
          <p className="text-xl font-poppins font-medium mt-6 text-slate-800">
            Claim Project Mandates
          </p>
          <p className="text-sm font-geist text-slate-500 mt-2 max-w-xs leading-relaxed">
            Access verified corporate mandates and build recurring advisory revenue.
          </p>
        </div>
      );
    }
    if (selectedRole === 'consumer') {
      return (
        <div className="flex flex-col items-start justify-center py-6 flex-grow text-left">
          <svg viewBox="0 0 400 300" className="w-full max-w-xs h-auto text-slate-800 drop-shadow-sm" fill="none">
            <circle cx="200" cy="150" r="36" fill="rgba(0,0,0,0.04)" stroke="rgba(0,0,0,0.15)" strokeWidth="2" />
            <circle cx="200" cy="150" r="22" fill="#DC2626" />
            <circle cx="80" cy="90" r="18" fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
            <circle cx="320" cy="90" r="22" fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
            <circle cx="100" cy="220" r="20" fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
            <circle cx="300" cy="220" r="18" fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" />
            <line x1="200" y1="150" x2="80" y2="90" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="200" y1="150" x2="320" y2="90" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="200" y1="150" x2="100" y2="220" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="4 4" />
            <line x1="200" y1="150" x2="300" y2="220" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="200" cy="150" r="80" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
            <circle cx="200" cy="150" r="120" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
            <circle cx="320" cy="90" r="30" stroke="#DC2626" strokeWidth="2" opacity="0.6" className="animate-ping" style={{ transformOrigin: '320px 90px' }} />
            <path d="M310 90 L330 90 M320 80 L320 100" stroke="#DC2626" strokeWidth="1.5" />
          </svg>
          <p className="text-xl font-poppins font-medium mt-6 text-slate-800">
            Source Expert Partners
          </p>
          <p className="text-sm font-geist text-slate-500 mt-2 max-w-xs leading-relaxed">
            Connect with verified agencies and top external experts for client needs.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-start justify-center py-6 flex-grow text-left">
        <svg viewBox="0 0 400 300" className="w-full max-w-xs h-auto text-slate-800 drop-shadow-sm" fill="none">
          <polygon points="200,60 290,210 110,210" stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="rgba(0,0,0,0.02)" />
          <circle cx="200" cy="60" r="24" fill="#DC2626" />
          <circle cx="290" cy="210" r="20" fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
          <circle cx="110" cy="210" r="20" fill="rgba(0,0,0,0.05)" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
          <line x1="200" y1="60" x2="290" y2="210" stroke="#0f294a" strokeWidth="2" />
          <line x1="290" y1="210" x2="110" y2="210" stroke="#0f294a" strokeWidth="2" />
          <line x1="110" y1="210" x2="200" y2="60" stroke="#0f294a" strokeWidth="2" />
          <path d="M170 140 A 30 30 0 1 1 230 140" stroke="rgba(0,0,0,0.18)" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
        <p className="text-xl font-poppins font-medium mt-6 text-slate-800">
          BnC Global Ecosystem
        </p>
        <p className="text-sm font-geist text-slate-500 mt-2 max-w-xs leading-relaxed">
          Empowering firms and corporations to source, match, and deliver mandates.
        </p>
      </div>
    );
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const loginType = searchParams.get('type');
    const adminOnly = loginType === 'admin';
    setIsAdminOnly(adminOnly);
    setActiveTab(adminOnly ? 'admin' : 'partner');

    const roleParam = searchParams.get('role');
    if (roleParam === 'provider' || roleParam === 'consumer') {
      setSelectedRole(roleParam);
    } else {
      setSelectedRole(null);
    }
  }, [location]);

  useEffect(() => {
    let isMounted = true;

    const completeGoogleLogin = async () => {
      const searchParams = new URLSearchParams(location.search);
      const hasCode = searchParams.has('code');
      const hasOAuthMarker = searchParams.get('oauth') === 'partner';
      const hasHashToken = String(location.hash || '').includes('access_token');

      if (activeTab !== 'partner' || (!hasCode && !hasOAuthMarker && !hasHashToken)) {
        return;
      }

      setIsGoogleLoading(true);
      try {
        const { handleAuthCallback } = await import('../lib/supabaseData');
        const session = await handleAuthCallback();
        if (!isMounted) return;

        if (session?.user) {
          const { fetchPartnerProfile } = await import('../lib/supabaseData');
          const profile = await fetchPartnerProfile(session.user.id);
          if (!isMounted) return;

          if (profile) {
            localStorage.setItem('partnerUser', JSON.stringify(profile));
            if (profile.role_completed) {
              navigate('/dashboard');
            } else {
              navigate('/complete-profile');
            }
          } else {
            navigate('/complete-profile');
          }
        }
      } catch (error) {
        console.error('OAuth callback processing error:', error);
        setErrors({ general: error?.message || 'Authentication callback failed' });
      } finally {
        if (isMounted) setIsGoogleLoading(false);
      }
    };

    completeGoogleLogin();
    return () => { isMounted = false; };
  }, [location, navigate, activeTab]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (activeTab === 'admin') {
      if (!formData.email.trim()) {
        newErrors.email = t('login.errors.adminIdRequired');
      }
    } else {
      if (!formData.email.trim()) {
        newErrors.email = t('login.errors.emailRequired');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = t('login.errors.emailInvalid');
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = t('login.errors.passwordRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (activeTab === 'admin') {
        const { admin } = await loginAdmin(formData.email, formData.password);
        localStorage.removeItem('partnerUser');
        localStorage.setItem('adminUser', JSON.stringify(admin));
        alert(t('login.alerts.adminSuccess'));
        window.location.href = '/admin-dashboard';
        return;
      }

      await loginPartner(formData.email, formData.password);
      const partner = await fetchPartnerData(formData.email);
      if (!partner) {
        throw new Error('Partner profile not found');
      }

      localStorage.removeItem('adminUser');
      localStorage.setItem('partnerUser', JSON.stringify(partner));
      alert(t('login.alerts.partnerSuccess', { name: partner.firstName }));
      window.location.href = isPartnerProfileComplete(partner) ? '/dashboard' : '/complete-profile';
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error?.message || t('login.errors.loginFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setErrors({});
    try {
      const { loginPartnerWithGoogle } = await import('../lib/supabaseData');
      const redirectTo = `${window.location.origin}/login?oauth=partner`;
      await loginPartnerWithGoogle(redirectTo);
    } catch (error) {
      console.error('Google login start error:', error);
      setErrors({ general: error?.message || t('login.errors.loginFailed') });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row ${isRtl ? 'md:flex-row-reverse' : ''} bg-white`}>

      {/* Left Brand Panel */}
      <div className={`relative w-full md:w-1/2 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-slate-50 text-slate-800 ${textAlign} min-h-[40vh] md:min-h-screen flex-shrink-0 border-r border-slate-100`}>
        {/* Subtle Liquid Gradient Blobs inside Left Panel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 opacity-20">
          <div className="absolute -top-20 -left-20 w-[60%] h-[60%] bg-[#DC2626]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-20 -right-20 w-[60%] h-[60%] bg-[#0f294a]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s' }} />
        </div>
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(90deg,rgba(0,0,0,0.2)_1px,transparent_1px),linear-gradient(180deg,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[length:24px_24px]" />
        <div className="pointer-events-none absolute right-6 bottom-28 opacity-20">
          <svg viewBox="0 0 220 90" className="h-20 w-40" fill="none">
            <path
              d="M5 75 C 45 20, 90 95, 140 40 C 170 10, 200 25, 215 8"
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="2"
              strokeDasharray="6 10"
            >
              <animate attributeName="stroke-dashoffset" values="0;32" dur="4.8s" repeatCount="indefinite" />
            </path>
            <circle cx="45" cy="28" r="3" fill="rgba(0,0,0,0.4)">
              <animate attributeName="r" values="2;3.5;2" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="140" cy="40" r="3" fill="rgba(0,0,0,0.4)">
              <animate attributeName="r" values="3.2;2;3.2" dur="3.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="215" cy="8" r="3" fill="rgba(0,0,0,0.4)">
              <animate attributeName="r" values="2;3.8;2" dur="3.2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
        {/* Top Logo Section */}
        <div className="relative">
          <div className={`inline-flex items-center ${rowDirection}`}>
            <img
              src="/Photas/aaf68a14-dda6-4743-824f-5bc2592df449.png"
              alt="BNC LEG"
              className="h-10 w-auto object-contain"
            />
          </div>
        </div>

        {/* Dynamic SVG Illustration Main Section */}
        {renderLeftIllustration()}

        {/* Contact Links & Tagline */}
        <div className="relative text-sm text-slate-600">
          <div className="flex items-center justify-start pt-2">
            <div className="grid gap-3 w-full max-w-md">
              <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-3">
                <a
                  href="mailto:info@bncglobal.in"
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white pl-0 pr-4 py-3 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center transition text-slate-500">
                    <svg
                      className="h-5 w-5 text-current"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4.236 8 4.8 8-4.8V6l-8 4.8L4 6v2.236z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">patner@bncglobal.in</p>
                  </div>
                </a>
                <a
                  href="https://wa.me/919958711796"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-1 rounded-2xl border border-slate-200 bg-white pl-0 pr-4 py-3 transition hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition text-slate-500 ${iconMargin}`}>
                    <svg
                      className="h-5 w-5 text-current"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.67.15-.198.297-.768.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.611-.916-2.206-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347M12.057 2.347c-5.523 0-10.017 4.494-10.017 10.017 0 1.77.463 3.445 1.355 4.94L2 22l4.861-1.277c1.413.771 3.007 1.195 4.696 1.195h.001c5.523 0 10.017-4.494 10.017-10.017S17.58 2.347 12.057 2.347m0 18.138c-1.52 0-2.985-.404-4.263-1.168l-.305-.182-2.883.758.769-2.81-.199-.32a8.27 8.27 0 0 1-1.259-4.404c0-4.561 3.711-8.273 8.273-8.273 4.561 0 8.273 3.712 8.273 8.273 0 4.561-3.712 8.273-8.273 8.273" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 whitespace-nowrap">+91 99587 11796</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <p className="pt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
            {t('login.revenueTagline')}
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white min-h-[60vh] md:min-h-screen">
        <div className={`w-full max-w-md ${textAlign}`}>

          <div className="md:hidden text-center mb-6">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3">
              <img
                src="/Photas/b%20nc%20global%20(2).avif"
                alt="BNC LEG"
                className="h-10 w-10 object-contain"
              />
            </div>
            <h1 className="text-[#DC2626]xl font-bold text-gray-800">
              {selectedRole === 'provider'
                ? 'Service Provider Login'
                : selectedRole === 'consumer'
                  ? 'Service Consumer Login'
                  : t('login.welcomeBack')}
            </h1>
            <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
          </div>

          {/* Tabs */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            {isAdminOnly ? (
              <div
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-semibold text-[#B91C1C] text-base ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                  <FaShieldAlt />
                </span>
                <span>{t('login.adminLogin')}</span>
              </div>
            ) : (
              <div
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-semibold text-[#B91C1C] ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                  <FaUser />
                </span>
                <span>
                  {selectedRole === 'provider'
                    ? 'Service Provider Login'
                    : selectedRole === 'consumer'
                      ? 'Service Consumer Login'
                      : t('login.partnerLogin')}
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {errors.general}
              </div>
            )}

            {/* User ID (Email/Admin ID) */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 ${rowDirection}`}>
                <FaIdCard className="text-[#DC2626]" />
                {activeTab === 'admin' ? t('login.adminId') : t('login.userIdEmail')}
              </label>
              <input
                type={activeTab === 'admin' ? 'text' : 'email'}
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#DC2626]/30 focus:border-transparent ${inputAlign} ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder={activeTab === 'admin' ? t('login.enterAdminId') : t('login.enterEmail')}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 ${rowDirection}`}>
                <FaLock className="text-[#DC2626]" />
                {t('login.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 ${passPadding} border rounded-lg focus:ring-2 focus:ring-[#DC2626]/30 focus:border-transparent ${inputAlign} ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder={t('login.enterPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${eyePosition} top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700`}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Submit + Create */}
            <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mt-2">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#163062] text-white py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_12px_30px_rgba(32,70,129,0.25)] hover:shadow-[0_18px_45px_rgba(32,70,129,0.35)] border border-transparent"
              >
                {isLoading
                  ? t('login.signingIn')
                  : (activeTab === 'partner' ? t('login.partnerSignIn') : t('login.adminSignIn'))}
              </button>
              {activeTab === 'partner' && (
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full bg-white hover:bg-slate-50 text-slate-800 py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 border border-slate-300 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.3l6.5-6.5C35.3 2.5 30 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.6 5.9C12 13.3 17.5 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.5 24.5c0-1.7-.1-3.3-.4-4.8H24v9.1h12.7c-.5 2.9-2.1 5.4-4.5 7.1l7 5.4c4.1-3.8 6.3-9.4 6.3-16.8z" />
                    <path fill="#FBBC05" d="M10.1 28.8c-.5-1.4-.8-2.9-.8-4.5s.3-3.1.8-4.5l-7.6-5.9C.9 17.1 0 20.5 0 24.3s.9 7.2 2.5 10.4l7.6-5.9z" />
                    <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7-5.4c-2 1.3-4.5 2.1-9 2.1-6.5 0-12-3.8-14-9.3l-7.6 5.9C6.4 42.6 14.6 48 24 48z" />
                  </svg>
                  {isGoogleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
                </button>
              )}
            </div>
          </form>

          {/* Back Link */}
          <div className="mt-4 text-center">
            <Link
              to="/?open=partner"
              className="inline-flex items-center text-[#DC2626] hover:text-[#B91C1C] font-medium"
            >
              <FaArrowLeft className={isRtl ? 'ml-2 flipInRtl' : 'mr-2'} />
              {t('login.backToRegistration')}
            </Link>
          </div>
          {activeTab === 'partner' && Array.isArray(trustItems) && (
            <div className="mt-3 grid gap-2 text-xs text-slate-500">
              {trustItems.map((item) => (
                <div key={item} className={`flex items-center gap-2 ${rowDirection}`}>
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#DC2626]/10 text-[#DC2626]">
                    <FaLock className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
