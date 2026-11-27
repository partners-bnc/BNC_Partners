import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowDown, Expand, X, Sparkles } from 'lucide-react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
const StartChattingSection = lazy(() => import('./StartChattingSection'));

const PartnerFormModal = lazy(() => import('./PartnerFormModal'));
const WorldMap = lazy(() =>
  import('../components/ui/world-map').then((module) => ({ default: module.WorldMap }))
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

// The headline is the page's main content (Lighthouse "LCP"): it slides in but is
// never hidden, so it counts as painted the moment the page renders.
const titleVariants = {
  hidden: { y: 18 },
  visible: { y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const mapVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }
  }
};

// Phones get a lighter, quicker map entrance (no scale/slide, short delay).
const mapVariantsPhone = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, delay: 0.15, ease: 'easeOut' } },
};

const PHONE_QUERY = '(max-width: 639px)';

// True only on phone-width screens; tablets/laptops keep the full desktop experience.
function useIsPhone() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(PHONE_QUERY).matches
  );
  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return isPhone;
}

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // greeting above the AI launcher; once closed it stays hidden for this visit
  const [showAiGreeting, setShowAiGreeting] = useState(() => {
    try { return sessionStorage.getItem('bncAiGreetingClosed') !== '1'; } catch { return true; }
  });
  const dismissAiGreeting = () => {
    setShowAiGreeting(false);
    try { sessionStorage.setItem('bncAiGreetingClosed', '1'); } catch { /* storage unavailable */ }
  };
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const [partnerUser, setPartnerUser] = useState(null);
  const location = useLocation();
  // scroll-linked motion: text drifts up and fades, the map rises and zooms in
  const heroRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const isPhone = useIsPhone();
  // Scroll parallax (drift/zoom) is skipped on phones: costly and distracting on small screens.
  const disableParallax = reduceMotion || isPhone;
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const mapY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const mapScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const heroAnimationVideoSrc = import.meta.env.VITE_HERO_ANIMATION_VIDEO_SRC || '';
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const lgTextAlign = isRtl ? 'lg:text-right' : 'lg:text-left';

  const handleExploreClick = (e) => {
    e.preventDefault();
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '/#services');
    }
  };
  const lgContainerAlign = isRtl ? 'lg:mr-0 lg:ml-auto' : 'lg:mx-0';
  const highlightContainerAlign = isRtl ? 'lg:mr-0 lg:ml-auto' : 'lg:mx-0';
  const highlightRowJustify = isRtl ? 'justify-end' : 'justify-start';
  const mapWrapAlign = isRtl ? 'lg:justify-start' : 'lg:justify-end';
  const mapOrigin = isRtl ? 'origin-top-left' : 'origin-top-right';
  const mapShift = isRtl ? 'lg:-translate-x-28 xl:-translate-x-36' : 'lg:translate-x-28 xl:translate-x-36';

  useEffect(() => {
    if (location.pathname === '/partner-form') {
      setIsModalOpen(true);
    }
  }, [location]);

  useEffect(() => {
    const storedPartner = localStorage.getItem('partnerUser');
    if (!storedPartner) return;

    try {
      setPartnerUser(JSON.parse(storedPartner));
    } catch (error) {
      console.error('Could not parse partner user from localStorage:', error);
    }
  }, []);

  useEffect(() => {
    let timeoutId;
    let idleId;

    const enableMap = () => setShouldRenderMap(true);

    // Phones load the map straight away instead of waiting for an idle slot.
    if (window.matchMedia(PHONE_QUERY).matches) {
      enableMap();
      return undefined;
    }

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableMap, { timeout: 1500 });
    } else {
      timeoutId = window.setTimeout(enableMap, 350);
    }

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  const isLoggedIn = Boolean(partnerUser);
  const partnerName = partnerUser?.firstName || partnerUser?.name || partnerUser?.email || '';

  const mapDots = [
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: 53.5461, lng: -113.4938, label: 'CAN' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: 25.5199, lng: -105.8701, label: 'USA' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: 51.5074, lng: -0.1278, label: 'UK' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: 22.9375, lng: 14.3754, label: 'MLT' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: -15.3875, lng: 28.3228, label: 'ZMB' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: 30.0444, lng: 31.2357, label: 'EGY' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: 7.2048, lng: 55.2708, label: 'UAE' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: -17.3521, lng: 103.8198, label: 'SGP' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: -37.8136, lng: 144.9631, label: 'Australia' },
    },
    {
      start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
      end: { lat: -5.8797, lng: 121.774, label: 'PHL' },
    },
  ];

  return (
    <>
      <section ref={heroRef} id="home" className="relative sm:min-h-screen overflow-hidden text-slate-900 -mt-16 pt-16 sm:pt-24 lg:pt-15" dir={isRtl ? 'rtl' : 'ltr'}>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes liquid-blob-1 {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(45px, -55px) scale(1.15); }
            66% { transform: translate(-35px, 35px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes liquid-blob-2 {
            0% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(-55px, 55px) scale(1.1); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes liquid-blob-3 {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(-35px, -45px) scale(0.95); }
            66% { transform: translate(55px, 35px) scale(1.15); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-liquid-1 {
            animation: liquid-blob-1 16s infinite alternate ease-in-out;
          }
          .animate-liquid-2 {
            animation: liquid-blob-2 20s infinite alternate ease-in-out;
          }
          .animate-liquid-3 {
            animation: liquid-blob-3 24s infinite alternate ease-in-out;
          }
        `}} />
        {isChatOpen && (
          <section className={`fixed bottom-5 ${isRtl ? 'left-5 sm:left-6' : 'right-5 sm:right-6'} z-50 flex h-[min(520px,calc(100dvh-5rem))] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_30px_60px_-24px_rgba(13,27,61,0.45)] ${isRtl ? 'rounded-[8px_28px_8px_28px]' : 'rounded-[28px_8px_28px_8px]'}`} aria-label="AI assistant chat">
            {/* header: the same glassy black-to-red gradient as the launcher, with the founder's photo */}
            <header className="relative flex h-16 shrink-0 items-center justify-between overflow-hidden bg-[linear-gradient(120deg,#0e0e10_0%,#2a0b0d_40%,#7f1d1d_75%,#dc2626_100%)] px-4 text-white shadow-[inset_0_-1px_0_rgba(255,255,255,0.08)]">
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/[0.14] to-transparent" />
              <span aria-hidden="true" className="lg-ai-sheen pointer-events-none absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <span className="relative flex items-center gap-3">
                <span className="relative h-10 w-10 flex-none">
                  <img src="/about-founders/assets/avatar-sg.png" alt="" width="40" height="40" className="h-full w-full rounded-full bg-white object-cover ring-2 ring-white/90" />
                  <span aria-hidden="true" className={`absolute -bottom-0.5 ${isRtl ? '-left-0.5' : '-right-0.5'} h-3 w-3 rounded-full bg-[#22c55e] ring-2 ring-[#2a0b0d]`} />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[14.5px] font-semibold tracking-[-0.01em] [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]">BNC AI Assistant</span>
                  <span className="text-[11.5px] text-white/70">{isRtl ? 'متصل الآن · نصًا أو صوتًا' : 'Online · text or voice'}</span>
                </span>
              </span>
              <div className="relative flex items-center gap-1">
                <Link to="/start-chatting" className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white" aria-label="Open full chat" title="Open full chat">
                  <Expand className="h-4 w-4" />
                </Link>
                <button type="button" onClick={() => setIsChatOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white" aria-label="Close chat">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-hidden bg-white">
              <Suspense fallback={<div className="h-full animate-pulse bg-[#f5f5f7]" />}>
                <StartChattingSection compact />
              </Suspense>
            </div>
          </section>
        )}
        {/* floating "Ask BNC AI" launcher: founder photo pill + a dismissible greeting above it */}
        {!isChatOpen && (
          <div className={`fixed bottom-5 sm:bottom-6 ${isRtl ? 'left-5 sm:left-6 items-start' : 'right-5 sm:right-6 items-end'} z-40 flex flex-col gap-2.5`}>
            {showAiGreeting && (
              <div className="lg-ai-greet relative hidden max-w-[230px] rounded-[16px] bg-white px-3.5 py-2.5 shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_18px_40px_-16px_rgba(13,27,61,0.35)] sm:block">
                <button
                  type="button"
                  onClick={dismissAiGreeting}
                  aria-label="Dismiss message"
                  className={`absolute -top-3 ${isRtl ? '-right-3' : '-left-3'} grid h-6 w-6 place-items-center rounded-full bg-white text-[#6e6e73] shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_10px_-4px_rgba(0,0,0,0.25)] transition-colors hover:text-[#1d1d1f]`}
                >
                  <X className="h-3 w-3" />
                </button>
                <button type="button" onClick={() => setIsChatOpen(true)} className="text-start text-[13px] leading-snug text-[#1d1d1f]">
                  {isRtl ? (
                    <>مرحبًا 👋 لديك سؤال؟ <strong className="whitespace-nowrap">اسأل BNC AI</strong>، نصًا أو صوتًا.</>
                  ) : (
                    <>Hi 👋 Have a question? <strong className="whitespace-nowrap">Ask BNC AI</strong>, by text or voice.</>
                  )}
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="lg-ai-pill group relative flex h-9 items-center gap-2.5 rounded-full pe-4 ps-0 text-white shadow-[0_16px_34px_-12px_rgba(153,27,27,0.65)] transition-transform duration-300 hover:-translate-y-0.5"
              aria-label={isRtl ? 'اسأل BNC AI، نصًا أو صوتًا' : 'Ask BNC AI, by text or voice'}
              aria-expanded={isChatOpen}
            >
              {/* glassy red-to-black background, kept in its own layer so the photo can stick out */}
              <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full bg-[linear-gradient(120deg,#0e0e10_0%,#2a0b0d_38%,#7f1d1d_72%,#dc2626_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.35),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
                <span className="absolute inset-x-3 top-0 h-1/2 rounded-full bg-gradient-to-b from-white/[0.16] to-transparent" />
                <span className="lg-ai-sheen absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              </span>
              <span className="relative -my-1.5 -ms-1 h-11 w-11 flex-none sm:h-[46px] sm:w-[46px]">
                <img
                  src="/about-founders/assets/avatar-sg.png"
                  alt=""
                  width="46"
                  height="46"
                  loading="lazy"
                  className="h-full w-full rounded-full bg-white object-cover ring-2 ring-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.5)]"
                />
                <span className={`absolute -bottom-0.5 ${isRtl ? '-left-0.5' : '-right-0.5'} grid h-[18px] w-[18px] place-items-center rounded-full bg-[linear-gradient(135deg,#f97316,#dc2626)] text-white ring-2 ring-white`}>
                  <Sparkles className="h-2.5 w-2.5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" strokeWidth={2.2} />
                </span>
              </span>
              <span className="relative whitespace-nowrap text-[13.5px] font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] tracking-[-0.01em] sm:text-[14px]">{isRtl ? 'اسأل BNC AI' : 'Ask BNC AI'}</span>
            </button>
          </div>
        )}
        {/* Liquid Glass Background */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 15% 20%, #dbe8ff 0, transparent 40%), radial-gradient(circle at 85% 30%, #e9e4ff 0, transparent 38%), linear-gradient(180deg, #f7f9fe, #eaf0fb)' }}>
          {/* Animated Liquid Blobs */}
          <div className={`absolute -top-12 ${isRtl ? '-left-12' : '-right-12'} hidden sm:block w-[450px] h-[450px] rounded-full bg-[#c9dbff]/60 blur-[80px] animate-liquid-1`} />
          <div className={`absolute top-48 ${isRtl ? 'right-24' : 'left-24'} hidden sm:block w-[400px] h-[400px] rounded-full bg-[#e4dcff]/60 blur-[90px] animate-liquid-2`} />
          <div className="absolute bottom-24 right-[15%] hidden sm:block w-[420px] h-[420px] rounded-full bg-[#d6e4ff]/50 blur-[100px] animate-liquid-3" />
          <div className={`absolute bottom-[-10%] ${isRtl ? 'right-0' : 'left-0'} hidden sm:block w-[380px] h-[380px] rounded-full bg-[#ece6ff]/50 blur-[85px] animate-liquid-1`} />

          {/* Frosted Glass Overlay */}
          <div className="absolute inset-0 hidden sm:block backdrop-blur-[80px] bg-white/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.15)_100%)]" />
        </div>

        <motion.div className="relative z-20" style={disableParallax ? undefined : { y: textY, opacity: textOpacity }}>
        <motion.div
          className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-7 sm:pt-12 lg:pt-16 pb-0 z-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div className="mb-3.5 sm:mb-6" variants={itemVariants}>
              <span className="lg-chip select-none">
                <span className="lg-pulse-dot" aria-hidden="true" />
                <span className="text-[10.5px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-[#1d1d1f] rtl:tracking-normal">{t('hero.badge')}</span>
              </span>
            </motion.div>


            <motion.h1
              className="font-capriola text-[36px] sm:text-6xl md:text-7xl font-light text-[#1d1d1f] leading-tight tracking-[-0.04em] max-w-5xl mx-auto mb-1 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1 sm:gap-y-2"
              variants={titleVariants}
            >
              <span className="relative -translate-y-1.5 sm:-translate-y-2 lg:-translate-y-2.5">{t('hero.titlePrefix')}</span>
              <img
                src="/Photas/bnc-leg-logo.webp"
                width="640"
                height="199"
                alt="BNC LEG"
                className="h-[34px] sm:h-14 md:h-16 lg:h-20 w-auto object-contain inline-block align-middle relative -translate-y-1 sm:-translate-y-1.5"
              />
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="font-geist text-[15px] sm:text-lg md:text-xl font-normal text-slate-500 tracking-tight max-w-3xl mx-auto mt-1 sm:mt-0.5 mb-6 sm:mb-8 leading-relaxed"
              variants={itemVariants}
            >
              {t('hero.subtitle')
                .split('\n')
                .map((line, index) => (
                  <span key={index} className="block">
                    {line}
                  </span>
                ))}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center items-center w-full max-w-[340px] sm:max-w-lg mx-auto"
              variants={itemVariants}
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="lg-btn lg-btn-ink lg-btn-grow w-full sm:w-auto !min-h-[48px] sm:!min-h-[52px] !px-9 !text-[15px] sm:!text-[16px]"
              >
                {t('hero.becomePartner')}
              </button>
              <Link
                to={isLoggedIn ? "/dashboard" : "/login"}
                className="lg-btn lg-btn-glass lg-btn-grow w-full sm:w-auto !min-h-[48px] sm:!min-h-[52px] !px-9 !text-[15px] sm:!text-[16px]"
              >
                {t('hero.partnerLogin')}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        </motion.div>

        {/* Map / Video Section (Adjustable size and alignment) */}
        <motion.div
          className="relative w-full max-w-none z-10 flex justify-center mt-5 sm:mt-2 lg:-mt-4 pb-10 sm:pb-12"
          variants={isPhone ? mapVariantsPhone : mapVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div style={disableParallax ? undefined : { y: mapY, scale: mapScale }} className="relative w-full max-w-[1350px] px-1 sm:px-6 lg:px-8 origin-top">
            {heroAnimationVideoSrc ? (
              <video
                src={heroAnimationVideoSrc}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-auto rounded-3xl object-contain shadow-2xl shadow-red-600/5"
                aria-label="Global network animation"
              />
            ) : shouldRenderMap ? (
              <Suspense fallback={<div className="aspect-[2/1] w-full rounded-3xl bg-white/40" aria-hidden="true" />}>
                {isPhone ? (
                  // Phone: zoom 20% and crop the empty polar/ocean edges so the map reads
                  // larger; thicker arcs and dots, and a ~4s loop instead of ~9s.
                  <div className="aspect-[2/1] w-full overflow-hidden">
                    <div className="scale-[1.2] origin-center">
                      <WorldMap
                        lineColor="#DC2626"
                        dots={mapDots}
                        drawDuration={0.38}
                        handoffPause={0.06}
                        loopPause={1.4}
                        strokeWidth={2}
                        dotRadius={3.2}
                      />
                    </div>
                  </div>
                ) : (
                  <WorldMap
                    lineColor="#DC2626"
                    dots={mapDots}
                    drawDuration={0.65}
                    handoffPause={0.10}
                    loopPause={0.9}
                  />
                )}
              </Suspense>
            ) : (
              <div className="aspect-[2/1] w-full rounded-3xl bg-white/40" aria-hidden="true" />
            )}
          </motion.div>
        </motion.div>
      </section>

      {isModalOpen ? (
        <Suspense fallback={null}>
          <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </Suspense>
      ) : null}
    </>
  );
};

export default Hero;
