import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerFormModal = lazy(() => import('./PartnerFormModal'));
const WorldMap = lazy(() =>
  import('../components/ui/world-map').then((module) => ({ default: module.WorldMap }))
);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

const mapVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.0, delay: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const Hero = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldRenderMap, setShouldRenderMap] = useState(false);
  const [partnerUser, setPartnerUser] = useState(null);
  const location = useLocation();
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
  const floatingChatPosition = isRtl ? '-left-3' : '-right-3';

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
      <section id="home" className="relative min-h-screen overflow-hidden text-slate-900 -mt-16 pt-16 sm:pt-24 lg:pt-15" dir={isRtl ? 'rtl' : 'ltr'}>
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
        <Link
          to="/start-chatting"
          className={`fixed -bottom-10 ${floatingChatPosition} z-40 inline-flex items-center justify-center rounded-full bg-transparent p-2 hover:opacity-90 transition-all`}
          aria-label="Get AI help"
        >
          <img
            src="/Photas/chatbot_red_carrot-removebg-preview.png"
            alt="ChatBot AI"
            className="h-36 w-36 object-contain"
          />
        </Link>
        {/* Liquid Glass Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fffcfc] via-[#fcfbf9] to-[#f8f6f2]">
          {/* Animated Liquid Blobs */}
          <div className={`absolute -top-12 ${isRtl ? '-left-12' : '-right-12'} w-[450px] h-[450px] rounded-full bg-[#DC2626]/12 blur-[80px] animate-liquid-1`} />
          <div className={`absolute top-48 ${isRtl ? 'right-24' : 'left-24'} w-[400px] h-[400px] rounded-full bg-rose-500/8 blur-[90px] animate-liquid-2`} />
          <div className="absolute bottom-24 right-[15%] w-[420px] h-[420px] rounded-full bg-amber-400/8 blur-[100px] animate-liquid-3" />
          <div className={`absolute bottom-[-10%] ${isRtl ? 'right-0' : 'left-0'} w-[380px] h-[380px] rounded-full bg-[#DC2626]/8 blur-[85px] animate-liquid-1`} />

          {/* Frosted Glass Overlay */}
          <div className="absolute inset-0 backdrop-blur-[80px] bg-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.15)_100%)]" />
        </div>

        <motion.div
          className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-10 sm:pt-12 lg:pt-16 pb-0 z-20"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div className="mb-4 sm:mb-6" variants={itemVariants}>
              <div className="inline-flex items-center gap-2 bg-[#fdfbf7] px-6 py-2.5 rounded-full shadow-[6px_6px_12px_#e5e2db,-6px_-6px_12px_#ffffff] border border-white/60 text-[#DC2626] text-xs sm:text-sm font-extrabold tracking-wider uppercase font-geist transition-all duration-300 hover:shadow-[3px_3px_6px_#e5e2db,-3px_-3px_6px_#ffffff] hover:-translate-y-0.5 select-none">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DC2626]/80 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DC2626]"></span>
                </span>
                <span>{t('hero.badge')}</span>
              </div>
            </motion.div>


            {/* Heading */}
            <motion.h1
              className="font-capriola text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight max-w-5xl mx-auto mb-1"
              variants={itemVariants}
            >
              {isLoggedIn ? (
                <>
                  Welcome <span className="text-[#DC2626] font-extrabold">{partnerName}</span>
                </>
              ) : (
                <>
                  {t('hero.titlePrefix')}{' '}
                  <span className="text-slate-900 font-extrabold">BnC</span>{' '}
                  <span className="inline-block border-2 border-[#DC2626] px-3 py-1 rounded-2xl text-[#DC2626] font-black text-4xl sm:text-5xl md:text-6xl tracking-tight ml-1 leading-none">
                    LEG
                  </span>
                </>
              )}
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="font-geist text-lg md:text-xl font-normal text-slate-500 tracking-tight max-w-3xl mx-auto mt-0.5 mb-8 leading-relaxed"
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
              className="mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg mx-auto"
              variants={itemVariants}
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-geist font-medium text-base text-white bg-black hover:bg-neutral-900 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center"
              >
                {t('hero.becomePartner')}
              </button>
              <Link
                to={isLoggedIn ? "/dashboard" : "/login"}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-geist font-medium text-base text-slate-900 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center text-center"
              >
                {t('hero.partnerLogin')}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Map / Video Section (Adjustable size and alignment) */}
        <motion.div
          className="relative w-full max-w-none z-10 flex justify-center mt-4 sm:mt-6 lg:mt-8 pb-12"
          variants={mapVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative w-full max-w-[1350px] px-6 lg:px-8 hover:scale-[1.01] transition-transform duration-500">
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
                <WorldMap
                  lineColor="#DC2626"
                  dots={mapDots}
                  drawDuration={0.65}
                  handoffPause={0.10}
                  loopPause={0.9}
                />
              </Suspense>
            ) : (
              <div className="aspect-[2/1] w-full rounded-3xl bg-white/40" aria-hidden="true" />
            )}
          </div>
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
