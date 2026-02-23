import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PartnerFormModal from './PartnerFormModal';
import { WorldMap } from '../components/ui/world-map';

const Hero = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/partner-form') {
      setIsModalOpen(true);
    }
  }, [location]);

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
      end: { lat: 10.7136, lng: 42.6753, label: 'KSA' },
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

  useEffect(() => {
    const drawDuration = 1.2;
    const stagger = 0.5;
    const loopPause = 1.8;
    const totalCycleMs = Math.max(
      1,
      (mapDots.length - 1) * stagger + drawDuration + loopPause
    ) * 1000;

    const interval = setInterval(() => {
      setMapKey((prev) => prev + 1);
    }, totalCycleMs);

    return () => clearInterval(interval);
  }, [mapDots.length]);

  return (
    <>
      <section className="relative min-h-screen overflow-hidden text-slate-900 -mt-16 pt-16 sm:pt-24 lg:pt-15">
        <Link
          to="/start-chatting"
          className="fixed -bottom-10 -right-3 z-40 inline-flex items-center justify-center rounded-full bg-transparent p-2 hover:opacity-90 transition-all"
          aria-label="Get AI help"
        >
          <img
            src="/favicon/WhatsApp_Image_2026-02-23_at_1.56.29_PM-removebg-preview.png"
            alt="ChatBot AI"
            className="h-50 w-50 object-contain"
          />
        </Link>
        <div className="absolute inset-0 bg-[#F7F2ED]">
          <div className="absolute -top-28 -right-20 h-96 w-96 rounded-full bg-gradient-to-br from-[#2C5AA0]/25 via-[#7ea5ff]/25 to-transparent blur-3xl" />
          <div className="absolute right-[-120px] top-[-60px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(44,90,160,0.35),rgba(126,165,255,0.18),rgba(255,255,255,0))] blur-3xl" />
          <div className="absolute right-10 top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(30,63,115,0.22),rgba(126,165,255,0.12),rgba(245,242,237,0))] blur-2xl" />
          <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/20 via-cyan-400/15 to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(44,90,160,0.12),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#f1f6ff] via-[#f7f2ed] to-[#eef2ff]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_35%,rgba(255,255,255,0.7),rgba(255,255,255,0.15),rgba(245,242,237,0))]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10 sm:py-12 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="text-center lg:text-left lg:-mt-10 mt-0 sm:mt-10 relative z-20">
              <div className="relative inline-flex items-center gap-2 rounded-full border border-slate-900/60 bg-[#e8f1ff] px-4 py-1.5 text-xs font-semibold mb-4 sm:mb-6 -mt-1 backdrop-blur-sm text-slate-900 overflow-hidden shadow-[0_10px_26px_rgba(15,23,42,0.12)]">
                <span className="absolute inset-0 bg-gradient-to-r from-[#2C5AA0]/20 via-[#7ea5ff]/20 to-transparent blur-md" />
                <span className="relative flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-900" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.5l1.9 4.7 4.9 1.2-4.1 3.4 1.2 5-3.9-2.6-3.9 2.6 1.2-5-4.1-3.4 4.9-1.2L12 2.5z" />
                  </svg>
                  {t('hero.badge')}
                </span>
              </div>

              <h1 className="font-sora text-4xl md:text-6xl font-semibold mb-3 leading-tight -mt-3 sm:-mt-5">
                Partner with
                <span className="block" style={{ color: '#2C5AA0' }}>BnC Global</span>
              </h1>

              <p className="font-geist text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0 text-slate-600">
                {t('hero.subtitle')
                  .split('\n')
                  .map((line, index) => (
                    <span key={index} className="block">
                      {line}
                    </span>
                  ))}
              </p>

              <div className="mb-8 -mt-2">
                <div className="flex items-center gap-3 text-slate-700">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-[#2C5AA0]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 12.5l2.4 2.4 4.6-5.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="font-geist text-sm md:text-base">{t('hero.highlights.finance')}</p>
                </div>
                <div className="mt-3 flex items-center gap-3 text-slate-700">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-[#2C5AA0]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 12.5l2.4 2.4 4.6-5.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="font-geist text-sm md:text-base">{t('hero.highlights.manpower')}</p>
                </div>
                <div className="mt-3 flex items-center gap-3 text-slate-700">
                  <span className="inline-flex h-4 w-4 items-center justify-center text-[#2C5AA0]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M8.5 12.5l2.4 2.4 4.6-5.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <p className="font-geist text-sm md:text-base">{t('hero.highlights.dataAi')}</p>
                </div>
              </div>

              <div className="flex flex-row gap-2 justify-between mb-6 w-full max-w-md mx-auto lg:mx-0">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#2C5AA0] hover:bg-[#1e3f73] text-white px-4 py-3.5 rounded-full font-medium transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.02] transform flex-1"
                >
                  {t('hero.becomePartner')}
                </button>
                <Link
                  to="/login"
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-black px-4 py-3.5 rounded-full font-medium transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.02] transform flex-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                  {t('hero.partnerLogin')}
                </Link>
              </div>

              <div className="mt-5 sm:mt-7 max-w-md mx-auto lg:mx-0" style={{ perspective: '1400px' }}>
                <div className="relative cursor-pointer rounded-2xl border border-white/80 bg-gradient-to-b from-white/95 via-white/80 to-slate-100/80 px-5 py-3 shadow-[0_26px_60px_rgba(15,23,42,0.18)] backdrop-blur transform-gpu [transform:rotateX(6deg)_rotateY(-6deg)] transition duration-300 hover:[transform:rotateX(0deg)_rotateY(0deg)_translateY(-8px)_scale(1.01)] hover:shadow-[0_44px_96px_rgba(15,23,42,0.24)] hover:ring-1 hover:ring-[#2C5AA0]/30">
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_55%)] pointer-events-none" />
                  <div className="relative grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-poppins text-lg sm:text-xl font-semibold text-slate-900">50+</p>
                      <p className="text-[11px] sm:text-xs text-slate-600">{t('hero.stats.global')}</p>
                    </div>
                    <div>
                      <p className="font-poppins text-lg sm:text-xl font-semibold text-slate-900">25+</p>
                      <p className="text-[11px] sm:text-xs text-slate-600">{t('hero.stats.indian')}</p>
                    </div>
                    <div>
                      <p className="font-poppins text-lg sm:text-xl font-semibold text-slate-900">14+</p>
                      <p className="text-[11px] sm:text-xs text-slate-600">{t('hero.stats.countries')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end z-10">
              <div className="relative w-full max-w-[1500px] -mt-8 lg:-mt-68 lg:translate-x-28 xl:translate-x-36 lg:scale-[1.55] xl:scale-[1.7] 2xl:scale-[1.85] origin-top-right">
                <WorldMap
                  key={mapKey}
                  lineColor="#2C5AA0"
                  dots={mapDots}
                  drawDuration={1.2}
                  stagger={0.5}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <PartnerFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default Hero;
