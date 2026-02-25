import React, { useState, useEffect } from 'react';
import { FaUser, FaShieldAlt, FaLock, FaIdCard, FaArrowLeft, FaEye, FaEyeSlash, FaChartLine, FaBriefcase, FaHandshake, FaGraduationCap } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchPartnerData, loginAdmin, loginPartner } from '../lib/supabaseData';

const Login = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const iconMargin = isRtl ? 'mr-2' : 'ml-2';
  const passPadding = isRtl ? 'pl-12' : 'pr-12';
  const eyePosition = isRtl ? 'left-3' : 'right-3';
  const topBlobPos = isRtl ? 'pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#2C5AA0]/15 blur-3xl' : 'pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#2C5AA0]/15 blur-3xl';
  const bottomBlobPos = isRtl ? 'pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#1e3f73]/15 blur-3xl' : 'pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#1e3f73]/15 blur-3xl';
  const [activeTab, setActiveTab] = useState('partner');
  const [isAdminOnly, setIsAdminOnly] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const benefitItems = t('login.sidePanel.benefits', { returnObjects: true });
  const trustItems = t('login.trustIndicators', { returnObjects: true });
  const socialMetrics = t('login.socialProof.metrics', { returnObjects: true });
  const benefitIcons = [FaChartLine, FaBriefcase, FaShieldAlt, FaHandshake, FaGraduationCap];

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const loginType = searchParams.get('type');
    const adminOnly = loginType === 'admin';
    setIsAdminOnly(adminOnly);
    setActiveTab(adminOnly ? 'admin' : 'partner');
  }, [location]);

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
      // Admin validation
      if (!formData.email.trim()) {
        newErrors.email = t('login.errors.adminIdRequired');
      }
    } else {
      // Partner validation
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

      localStorage.setItem('partnerUser', JSON.stringify(partner));
      alert(t('login.alerts.partnerSuccess', { name: partner.firstName }));
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: error?.message || t('login.errors.loginFailed') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  relative overflow-hidden flex items-center justify-center px-4 py-6">
      <div
        className="absolute inset-0 -z-10 bg-center bg-cover bg-no-repeat"
        style={{
          backgroundImage: "url('/favicon/WhatsApp%20Image%202026-02-25%20at%206.49.50%20PM.jpeg')",
          filter: 'blur(2px)'
        }}
      />
      <div className="w-full max-w-4xl">
        <div className={`flex flex-col md:flex-row ${isRtl ? 'md:flex-row-reverse' : ''} bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/60`}>
          {/* Left Brand Panel */}
          <div className={`relative hidden md:flex md:w-1/2 flex-col justify-between p-8 bg-gradient-to-br from-[#2C5AA0] via-[#24508f] to-[#163062] text-white ${textAlign}`}>
            <div className="absolute inset-0 opacity-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[length:24px_24px]" />
            <div className="pointer-events-none absolute right-6 bottom-28 opacity-60">
              <svg viewBox="0 0 220 90" className="h-20 w-40" fill="none">
                <path
                  d="M5 75 C 45 20, 90 95, 140 40 C 170 10, 200 25, 215 8"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                  strokeDasharray="6 10"
                >
                  <animate attributeName="stroke-dashoffset" values="0;32" dur="4.8s" repeatCount="indefinite" />
                </path>
                <circle cx="45" cy="28" r="3" fill="rgba(255,255,255,0.85)">
                  <animate attributeName="r" values="2;3.5;2" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="40" r="3" fill="rgba(255,255,255,0.85)">
                  <animate attributeName="r" values="3.2;2;3.2" dur="3.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="215" cy="8" r="3" fill="rgba(255,255,255,0.85)">
                  <animate attributeName="r" values="2;3.8;2" dur="3.2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
            <div className="relative">
              <div className={`inline-flex items-center gap-3 ${rowDirection}`}>
                <div className="h-14 w-14 rounded-full flex items-center justify-center">
                  <img
                    src="/favicon/trans.png"
                    alt="BnC Global"
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                    BnC Global
                  </p>
                  <h1 className="text-2xl font-semibold mt-1">{t('login.welcomeBack')}</h1>
                </div>
              </div>
              <p className="mt-3 text-sm text-white/80 leading-relaxed">
                {t('login.sidePanel.description')}
              </p>
            </div>
            <div className="relative mt-4 space-y-3 text-sm text-white/80">
              {(Array.isArray(benefitItems) ? benefitItems : []).map((item, index) => {
                const Icon = benefitIcons[index] || FaShieldAlt;
                return (
                  <div key={item} className={`flex items-center gap-3 ${rowDirection}`}>
                    <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                      <Icon />
                    </div>
                    {item}
                  </div>
                );
              })}
              <div className="flex items-center justify-center pt-2">
                <div className="grid gap-3 w-full max-w-md">
                  <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-3">
                    <a
                      href="mailto:info@bncglobal.in"
                      className="group flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 pl-0 pr-4 py-3 transition hover:bg-white/15 hover:border-white/40"
                    >
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center transition">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 4.236 8 4.8 8-4.8V6l-8 4.8L4 6v2.236z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">patner@bncglobal.in</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/919958711796"
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-1 rounded-2xl border border-white/20 bg-white/10 pl-0 pr-4 py-3 transition hover:bg-white/15 hover:border-white/40"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition ${iconMargin}`}>
                        <svg
                          className="h-5 w-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.149-.67.15-.198.297-.768.967-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.611-.916-2.206-.242-.579-.487-.5-.67-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347M12.057 2.347c-5.523 0-10.017 4.494-10.017 10.017 0 1.77.463 3.445 1.355 4.94L2 22l4.861-1.277c1.413.771 3.007 1.195 4.696 1.195h.001c5.523 0 10.017-4.494 10.017-10.017S17.58 2.347 12.057 2.347m0 18.138c-1.52 0-2.985-.404-4.263-1.168l-.305-.182-2.883.758.769-2.81-.199-.32a8.27 8.27 0 0 1-1.259-4.404c0-4.561 3.711-8.273 8.273-8.273 4.561 0 8.273 3.712 8.273 8.273 0 4.561-3.712 8.273-8.273 8.273" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white whitespace-nowrap">+91 99587 11796</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <p className="pt-4 text-xs uppercase tracking-[0.2em] text-white/70">
                {t('login.revenueTagline')}
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className={`p-6 md:p-8 md:w-1/2 ${textAlign}`}>
            <div className="md:hidden text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full mb-3">
                <img
                  src="/favicon/b%20nc%20global%20(2).avif"
                  alt="BnC Global"
                  className="h-10 w-10 object-contain"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">{t('login.welcomeBack')}</h1>
              <p className="text-gray-500 text-sm">{t('login.subtitle')}</p>
            </div>

            {/* Tabs */}
            <div className="mb-5 rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
              {isAdminOnly ? (
                <div
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-semibold text-[#1e3f73] text-base ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2C5AA0]/10 text-[#2C5AA0]">
                    <FaShieldAlt />
                  </span>
                  <span>{t('login.adminLogin')}</span>
                </div>
              ) : (
                <div
                  className={`flex items-center justify-center gap-3 py-3 px-4 rounded-2xl font-semibold text-[#1e3f73] ${isRtl ? 'flex-row-reverse' : ''}`}
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#2C5AA0]/10 text-[#2C5AA0]">
                    <FaUser />
                  </span>
                  <span>{t('login.partnerLogin')}</span>
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
                  <FaIdCard className="text-[#2C5AA0]" />
                  {activeTab === 'admin' ? t('login.adminId') : t('login.userIdEmail')}
                </label>
                <input
                  type={activeTab === 'admin' ? 'text' : 'email'}
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#2C5AA0]/30 focus:border-transparent ${inputAlign} ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={activeTab === 'admin' ? t('login.enterAdminId') : t('login.enterEmail')}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                
              </div>

              {/* Password */}
              <div>
                <label className={`flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 ${rowDirection}`}>
                  <FaLock className="text-[#2C5AA0]" />
                  {t('login.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2.5 ${passPadding} border rounded-lg focus:ring-2 focus:ring-[#2C5AA0]/30 focus:border-transparent ${inputAlign} ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
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
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#2C5AA0] to-[#1e3f73] hover:from-[#1e3f73] hover:to-[#163062] text-white py-2.5 px-4 rounded-lg font-semibold transition-all flex items-center justify-center disabled:opacity-50 shadow-[0_12px_30px_rgba(32,70,129,0.25)] hover:shadow-[0_18px_45px_rgba(32,70,129,0.35)] border border-transparent"
                >
                  {isLoading
                    ? t('login.signingIn')
                    : (activeTab === 'partner' ? t('login.partnerSignIn') : t('login.adminSignIn'))}
                </button>
              </div>
            </form>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <Link 
                to="/?open=partner" 
                className="inline-flex items-center text-[#2C5AA0] hover:text-[#1e3f73] font-medium"
              >
                <FaArrowLeft className={isRtl ? 'ml-2 flipInRtl' : 'mr-2'} />
                {t('login.backToRegistration')}
              </Link>
            </div>
            {activeTab === 'partner' && Array.isArray(trustItems) && (
              <div className="mt-3 grid gap-2 text-xs text-slate-500">
                {trustItems.map((item) => (
                  <div key={item} className={`flex items-center gap-2 ${rowDirection}`}>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2C5AA0]/10 text-[#2C5AA0]">
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
    </div>
  );
};

export default Login;
