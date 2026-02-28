import React, { useState, useEffect, useMemo } from 'react';
import { FaUser, FaMicrophone, FaSitemap } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../Component/Header';
import Footer from '../Component/Footer';
import AIProfileModal from '../Component/AIProfileModal';
import TermsAgreementModal from '../Component/TermsAgreementModal';
import RequirementVoiceModal from '../Component/RequirementVoiceModal';
import { getServicesByCountry } from '../data/services';
import { fetchPartnerData, getSessionUser, logout, submitPartnerAgreement, submitVoiceRequirement } from '../lib/supabaseData';

const PartnerDashboard = () => {
  const [partnerData, setPartnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('india');
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const inputAlign = isRtl ? 'text-right' : 'text-left';
  const searchButtonMargin = isRtl ? 'mr-3' : 'ml-3';
  const voiceButtonMargin = isRtl ? 'mr-4' : 'ml-4';
  const statusAlign = isRtl ? 'sm:mr-auto sm:w-auto sm:items-start' : 'sm:ml-auto sm:w-auto sm:items-end';
  const quickAlign = isRtl ? 'justify-start' : 'justify-end';
  const cardButtonPos = isRtl ? 'left-6' : 'right-6';

  useEffect(() => {
    const userData = localStorage.getItem('partnerUser');
    if (!userData) {
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      setPartnerData(user);
      setLoading(false);
      let isRefreshing = false;
      let isMounted = true;
      
      const refreshData = async () => {
        if (isRefreshing) return;
        isRefreshing = true;
        try {
          const freshData = await fetchPartnerData(user.email, user.id);
          if (freshData) {
            setPartnerData((prev) => {
              const merged = {
                ...freshData,
                agreementSigned: prev?.agreementSigned || freshData.agreementSigned,
                agreementSignedName: prev?.agreementSignedName || freshData.agreementSignedName,
                agreementSignedAt: prev?.agreementSignedAt || freshData.agreementSignedAt
              };
              const prevSnapshot = JSON.stringify(prev || {});
              const nextSnapshot = JSON.stringify(merged || {});
              if (prevSnapshot === nextSnapshot) {
                return prev;
              }
              localStorage.setItem('partnerUser', JSON.stringify(merged));
              return merged;
            });
          } else {
            localStorage.removeItem('partnerUser');
            if (isMounted) {
              navigate('/login');
            }
          }
        } catch (error) {
          const message = String(error?.message || '').toLowerCase();
          if (message.includes('lockmanager') || message.includes('lock') || message.includes('timeout')) {
            console.warn('Skipping refresh due to temporary auth lock timeout:', error);
            return;
          }
          console.error('Failed to refresh partner data:', error);
        } finally {
          isRefreshing = false;
        }
      };
      
      refreshData().catch((error) => {
        console.error('Initial partner refresh failed:', error);
      });
      
      // Keep profile in sync without excessive auth-lock churn.
      const interval = setInterval(refreshData, 15000);
      
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  const ensureSessionOrRedirect = async () => {
    const sessionUser = await getSessionUser();
    if (sessionUser) return sessionUser;
    localStorage.removeItem('partnerUser');
    navigate('/login');
    return null;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const open = params.get('open');
    if (open === 'ai-profile' && !partnerData?.aiProfileCompleted) {
      setIsAIModalOpen(true);
    }
  }, [location.search, partnerData?.aiProfileCompleted]);

  const handleLogout = async () => {
    localStorage.removeItem('partnerUser');
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    navigate('/login');
  };

  const handleVoiceRequirementSubmit = async (payload) => {
    const requirementText = typeof payload === 'string' ? payload : payload?.text || '';
    const audioFile = typeof payload === 'string' ? null : payload?.audioFile || null;
    const sessionUser = await ensureSessionOrRedirect();
    if (!sessionUser) {
      throw new Error('Please log in to submit your requirement.');
    }
    try {
      await submitVoiceRequirement({
        requirement: requirementText,
        audioFile,
        partnerId: partnerData?.id || null,
        partnerEmail: partnerData?.email || '',
        recipientEmail: 'rohanbncglobal@gmail.com',
        source: 'partner-dashboard'
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        navigate('/login');
        throw new Error('Please log in to submit your requirement.');
      }
      throw error;
    }
  };

  const agreementSigned = Boolean(partnerData?.agreementSigned);
  const aiProfileCompleted = Boolean(partnerData?.aiProfileCompleted);

  const statusConfig = aiProfileCompleted
    ? agreementSigned
      ? {
          text: t('partnerDashboard.status.readyText'),
          badgeLabel: t('partnerDashboard.status.profileComplete'),
          badgeTone: 'success'
        }
      : {
          text: t('partnerDashboard.status.signAgreementText'),
          buttonLabel: t('partnerDashboard.status.signAgreementButton'),
          onClick: () => {
            setIsAgreementOpen(true);
          }
        }
    : {
        text: t('partnerDashboard.status.completeProfileText'),
        buttonLabel: t('partnerDashboard.status.completeProfileButton'),
        onClick: () => setIsAIModalOpen(true)
      };
  const query = searchTerm.trim().toLowerCase();
  const matchesSearch = (value) =>
    !query || (value && value.toLowerCase().includes(query));
  const normalizeTokensText = (tokens) => {
    if (Array.isArray(tokens)) return tokens.join(' ');
    if (typeof tokens === 'string') return tokens;
    return '';
  };

  const handleOpenRequirementModal = async () => {
    const sessionUser = await ensureSessionOrRedirect();
    if (!sessionUser) return;
    setIsRequirementModalOpen(true);
  };

  const aiProfileTokens = t('partnerDashboard.aiProfileSearchTokens', { returnObjects: true });
  const showAIProfile = matchesSearch(normalizeTokensText(aiProfileTokens));

  const embeddedCountryKey = selectedCountry === 'global' ? 'other' : selectedCountry;
  const embeddedServices = useMemo(() => {
    const services = getServicesByCountry(embeddedCountryKey).map((service) => {
      const localizedTitle = t(`servicesData.${service.id}.title`, {
        defaultValue: service.title
      });
      const localizedBullets = t(`servicesData.${service.id}.bullets`, {
        returnObjects: true,
        defaultValue: service.bullets
      });
      return {
        ...service,
        title: localizedTitle,
        bullets: Array.isArray(localizedBullets) ? localizedBullets : service.bullets
      };
    });
    const term = searchTerm.trim().toLowerCase();
    const filtered = !term
      ? services
      : services.filter((service) => {
      if (service.title.toLowerCase().includes(term)) return true;
      if (service.id.toLowerCase().includes(term)) return true;
      return (service.bullets || []).some((item) => item.toLowerCase().includes(term));
    });

    return [...filtered].sort((a, b) => {
      const aHasVideo = Boolean(a.videoUrl);
      const bHasVideo = Boolean(b.videoUrl);
      if (aHasVideo === bHasVideo) return 0;
      return bHasVideo ? 1 : -1;
    });
  }, [embeddedCountryKey, searchTerm, t, i18n.language]);

  const LazyVideo = ({ src, title }) => {
    const containerRef = React.useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
      if (!containerRef.current) return undefined;
      if (shouldLoad) return undefined;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setShouldLoad(true);
            }
          });
        },
        { rootMargin: '150px' }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }, [shouldLoad]);

    return (
      <div ref={containerRef} className="relative w-full h-full">
        {shouldLoad ? (
          <iframe
            className="w-full h-full"
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            loading="lazy"
            allowFullScreen
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 via-white to-slate-100">
            <div className="h-full w-full animate-pulse bg-[linear-gradient(110deg,rgba(226,232,240,0.35),rgba(255,255,255,0.8),rgba(226,232,240,0.35))] bg-[length:200%_100%]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-geist text-slate-500 shadow-sm">
                {t('countryServices.preparingPreview')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ee] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C5AA0] mx-auto mb-4"></div>
          <p className="text-gray-600">{t('partnerDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f7f3ee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          {/* Top Structure */}
          <div className="rounded-3xl bg-[#f7f3ee] px-6 py-10 sm:px-10">
            <div className="mt-0 flex flex-col gap-4 rounded-2xl bg-[#efede8] px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v6" strokeLinecap="round" />
                    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
                  </svg>
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-700">{t('partnerDashboard.accountIdLabel')}:</span>
                    <span className="font-mono text-slate-700">{partnerData?.email || 'N/A'}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {t('partnerDashboard.profileHint')}
                  </div>
                </div>
              </div>
              <div className={`flex w-full flex-col gap-3 ${statusAlign}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-slate-700">{t('partnerDashboard.statusLabel')}:</span>
                  <span className="text-slate-600">{statusConfig.text}</span>
                  {statusConfig.badgeLabel ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 shadow-sm">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                        ✓
                      </span>
                      {statusConfig.badgeLabel}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={statusConfig.onClick}
                      className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm ${
                        aiProfileCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {statusConfig.buttonLabel}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {(partnerData?.aiProfileCompleted || agreementSigned) && (
              <div className={`mt-2 flex items-center gap-3 text-xs text-slate-500 ${isRtl ? 'pr-10' : 'pl-10'}`}>
                {partnerData?.aiProfileCompleted && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{t('partnerDashboard.badges.aiComplete')}</span>
                  </div>
                )}
                {agreementSigned && (
                  <div className="flex items-center gap-1">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      <svg viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span>{t('partnerDashboard.badges.agreementComplete')}</span>
                  </div>
                )}
              </div>
            )}

            <div className={`mt-2 flex ${quickAlign}`}>
              <div className="flex flex-wrap items-stretch gap-3">
                {showAIProfile && (
                  <div className="w-32 rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-slate-200/70">
                    <div className={`flex items-center gap-2 ${rowDirection}`}>
                      <FaUser className="h-3.5 w-3.5 text-[#2C5AA0]" />
                      <div className="flex-1">
                        <h3 className="font-poppins text-[10px] font-semibold text-slate-900">
                          {t('partnerDashboard.aiProfile.title')}
                        </h3>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!partnerData?.aiProfileCompleted) {
                          setIsAIModalOpen(true);
                        }
                      }}
                      disabled={partnerData?.aiProfileCompleted}
                      className={`mt-2 w-full rounded-full px-2 py-1 text-[9px] font-semibold transition-colors ${
                        partnerData?.aiProfileCompleted
                          ? 'bg-emerald-500 text-white cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] text-white hover:from-[#1e3a8a] hover:to-[#2C5AA0]'
                      }`}
                    >
                      {partnerData?.aiProfileCompleted ? t('partnerDashboard.aiProfile.done') : t('partnerDashboard.aiProfile.start')}
                    </button>
                  </div>
                )}
                <div className="w-32 rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-slate-200/70">
                  <div className={`flex items-center gap-2 ${rowDirection}`}>
                    <FaSitemap className="h-3.5 w-3.5 text-[#2C5AA0]" />
                    <div className="flex-1">
                      <h3 className="font-poppins text-[10px] font-semibold text-slate-900">
                        {t('partnerDashboard.referralProgram.title')}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/referral-program')}
                    className="mt-2 w-full rounded-full px-2 py-1 text-[9px] font-semibold transition-colors bg-linear-to-r from-[#2C5AA0] to-[#1e3a8a] text-white hover:from-[#1e3a8a] hover:to-[#2C5AA0]"
                  >
                    {t('partnerDashboard.referralProgram.cta')}
                  </button>
                </div>
                <div className="w-32 rounded-lg bg-white p-2.5 shadow-sm ring-1 ring-slate-200/70">
                  <div className={`flex items-center gap-2 ${rowDirection}`}>
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-700" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 4h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                      <path d="M14 4v4h4" />
                      <path d="M8 12h8" />
                      <path d="M8 16h6" />
                    </svg>
                    <h3 className="font-poppins text-[10px] font-semibold text-slate-900">
                      {t('partnerDashboard.agreement.title')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!partnerData?.aiProfileCompleted) {
                        alert(t('partnerDashboard.agreement.alertCompleteProfile'));
                        return;
                      }
                      setIsAgreementOpen(true);
                    }}
                    className={`mt-2 w-full rounded-full px-2 py-1 text-[9px] font-semibold transition-colors ${
                      agreementSigned
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {agreementSigned ? t('partnerDashboard.agreement.signed') : t('partnerDashboard.agreement.sign')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="font-geist text-sm uppercase tracking-[0.28em] text-slate-500">
                {t('partnerDashboard.title')}
              </p>
              <h2 className="font-poppins text-3xl sm:text-4xl font-semibold text-slate-900 mt-3">
                {t('partnerDashboard.welcomeBack', { name: partnerData?.firstName || '' })}
              </h2>
              <p className="font-geist text-slate-500 mt-3">
                Grow your revenue strengthen , client trust.
              </p>
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex w-full max-w-3xl items-start gap-3">
                <div className="flex-[6]">
                  <p className={`mb-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-400 ${textAlign} whitespace-nowrap pl-4`}>
                    Use voice recording to share your business requirement instantly.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenRequirementModal}
                    className="w-full inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    aria-label="Open voice requirement"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#2C5AA0]/10 text-[#2C5AA0]">
                      <FaMicrophone className="h-4 w-4" />
                    </span>
                    Speak your requirement — we handle the rest
                  </button>
                </div>
                <div className="flex-[4] pt-4">
                  <div className="flex items-center rounded-full bg-white px-4 py-2.5 shadow-sm ring-1 ring-slate-200 w-full">
                    <input
                      type="text"
                      placeholder={t('partnerDashboard.searchPlaceholder')}
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      className={`w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none ${inputAlign}`}
                    />
                    <button
                      type="button"
                      className={`${searchButtonMargin} inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700`}
                      aria-label={t('partnerDashboard.searchAria')}
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" />
                        <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Country Services Embed */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-3">
              {[
                { key: 'india', label: t('partnerDashboard.countryTabs.india') },
                { key: 'saudi-arabia', label: t('partnerDashboard.countryTabs.saudi') },
                { key: 'global', label: t('partnerDashboard.countryTabs.global') }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedCountry(item.key)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                    selectedCountry === item.key
                      ? 'bg-[#2C5AA0] text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {embeddedServices.map((service) => (
                <div
                  key={service.id}
                  className="group relative bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-b from-[#f1f5ff] to-[#e8eef9]">
                    <div className="aspect-video">
                      {service.videoUrl ? (
                        <LazyVideo src={service.videoUrl} title={`${service.title} video`} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-geist">
                          {t('countryServices.videoComingSoon')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`p-5 pb-16 ${textAlign}`}>
                    <div className={`flex items-center justify-between ${rowDirection}`}>
                      <h2 className="font-poppins text-xl font-semibold text-gray-900">
                        {service.title}
                      </h2>
                      {service.bullets?.length > 0 && (
                        <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-geist font-semibold text-[#2C5AA0] bg-blue-50 px-2.5 py-1 rounded-full">
                          {t('countryServices.servicesCount', { count: service.bullets.length })}
                        </span>
                      )}
                    </div>
                    {service.bullets?.length > 0 && (
                      <>
                        <div className="h-1 w-16 bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] rounded-full mt-3" />
                        <ul className={`mt-4 space-y-2 text-sm text-gray-700 list-disc list-inside ${textAlign}`}>
                          {service.bullets.map((item) => (
                            <li key={item} className="font-geist">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {!service.videoUrl && (
                      <p className="font-geist text-gray-500 text-xs mt-4">
                        {t('countryServices.servicesComingSoon')}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/services/${selectedCountry}/${service.id}`)}
                    className={`absolute bottom-4 ${cardButtonPos} inline-flex items-center gap-2 text-sm font-semibold font-geist text-white rounded-full px-5 py-2.5 bg-gradient-to-r from-[#2C5AA0] to-[#1e3a8a] shadow-lg shadow-[#2C5AA0]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#2C5AA0]/30 hover:-translate-y-0.5 hover:from-[#1e3a8a] hover:to-[#163062] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5AA0]/40`}
                  >
                    {t('countryServices.viewMore')}
                    <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-white/20 text-white text-xs transition-transform duration-300 group-hover:translate-x-0.5">
                      <span className="flipInRtl">&#8594;</span>
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      <Footer />
      
      <AIProfileModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)}
        onSubmitted={() => {
          setPartnerData(prev => {
            const updated = { ...(prev || {}), aiProfileCompleted: true };
            localStorage.setItem('partnerUser', JSON.stringify(updated));
            return updated;
          });
        }}
        partnerData={partnerData}
      />
      
      <TermsAgreementModal
        isOpen={isAgreementOpen}
        onClose={() => setIsAgreementOpen(false)}
        partnerData={partnerData}
        onSubmitted={async ({ signedName, signedAt }) => {
          await submitPartnerAgreement({
            partnerId: partnerData?.id,
            partnerEmail: partnerData?.email,
            signedName,
            signedAt
          });
          setPartnerData((prev) => {
            const updated = {
              ...(prev || {}),
              agreementSigned: true,
              agreementSignedName: signedName,
              agreementSignedAt: signedAt
            };
            localStorage.setItem('partnerUser', JSON.stringify(updated));
            return updated;
          });
        }}
      />
      <RequirementVoiceModal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        onSend={handleVoiceRequirementSubmit}
      />
    </>
  );
};

export default PartnerDashboard;
