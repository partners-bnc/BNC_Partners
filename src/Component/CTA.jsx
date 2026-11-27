import React, { Suspense, lazy, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Briefcase } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { Reveal, SplitHeading, Eyebrow } from '../components/ui/premium';

const STEPS = [
  { en: 'Free to register on the portal', ar: 'التسجيل في البوابة مجاني' },
  { en: 'Complete your profile and sign the agreement online', ar: 'أكمل ملفك ووقّع الاتفاقية عبر الإنترنت' },
  { en: 'Serve clients worldwide and start earning', ar: 'قدّم خدماتك لعملاء حول العالم وابدأ الربح' },
];

const PartnerFormModal = lazy(() => import('./PartnerFormModal'));
const ExpertFormModal = lazy(() => import('./ExpertFormModal'));

// Left side of the Get Started card: an animated mock of the partner portal.
// The four journey steps tick off one by one, the progress bar fills, then a
// "new mandate" notification slides in; the loop then restarts.
const JOURNEY = [
  { en: 'Registered on the portal', ar: 'التسجيل في البوابة' },
  { en: 'Profile completed', ar: 'اكتمال الملف الشخصي' },
  { en: 'Agreement signed', ar: 'توقيع الاتفاقية' },
  { en: 'Live and receiving mandates', ar: 'نشط ويتلقى المهام' },
];
const LAST_STAGE = JOURNEY.length + 1; // after all steps: show the notification

const JourneyPanel = ({ isRtl }) => {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(reduce ? LAST_STAGE : 0);

  useEffect(() => {
    if (reduce) return undefined;
    // one tick per step, then hold the finished state before restarting
    const id = window.setInterval(() => setStage((s) => (s >= LAST_STAGE + 2 ? 0 : s + 1)), 1100);
    return () => window.clearInterval(id);
  }, [reduce]);

  const done = Math.min(stage, JOURNEY.length);
  const showNote = stage >= LAST_STAGE;

  return (
    <div className="relative isolate min-h-[400px] overflow-hidden bg-[#f5f5f7] lg:min-h-[560px]">
      {/* faint grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(75% 75% at 50% 45%, #000 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(75% 75% at 50% 45%, #000 40%, transparent 100%)',
        }}
      />
      <div aria-hidden="true" className="absolute -start-24 -top-24 h-72 w-72 rounded-full bg-[#dc2626]/[0.10] blur-[70px]" />

      {/* portal window */}
      <div className="absolute left-1/2 top-[46%] w-[min(380px,86%)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_30px_60px_-30px_rgba(13,27,61,0.35)]">
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ms-3 rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[11px] text-[#86868b]">partners.bncglobal.in</span>
        </div>
        <div className="p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{isRtl ? 'رحلتك كشريك' : 'Your partner journey'}</p>
            <p className="text-[12px] tabular-nums text-[#86868b]">{done}/{JOURNEY.length}</p>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
            <div className="h-full rounded-full bg-[#dc2626] transition-[width] duration-700 ease-[cubic-bezier(.2,.7,.1,1)]" style={{ width: `${(done / JOURNEY.length) * 100}%` }} />
          </div>
          <ul className="mt-4 space-y-1">
            {JOURNEY.map((item, i) => {
              const isDone = i < done;
              const isCurrent = i === done && !reduce;
              return (
                <li key={item.en} className={`flex items-center gap-3 rounded-[12px] px-2 py-2 transition-colors duration-500 ${isCurrent ? 'bg-[#dc2626]/[0.05]' : ''}`}>
                  <span
                    className={`grid h-6 w-6 flex-none place-items-center rounded-full transition-all duration-500 ${
                      isDone ? 'scale-100 bg-[#dc2626] text-white' : isCurrent ? 'shadow-[inset_0_0_0_1.5px_#dc2626]' : 'shadow-[inset_0_0_0_1.5px_rgba(0,0,0,0.15)]'
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : isCurrent ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#dc2626]" /> : null}
                  </span>
                  <span className={`flex-1 text-[13.5px] transition-colors duration-500 ${isDone || isCurrent ? 'text-[#1d1d1f]' : 'text-[#a1a1a6]'}`}>{isRtl ? item.ar : item.en}</span>
                  <span className={`text-[11.5px] transition-opacity duration-500 ${isDone ? 'text-[#86868b] opacity-100' : 'opacity-0'}`}>{isRtl ? 'تم' : 'Done'}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* notification that arrives once the partner is live */}
      <div
        className={`absolute bottom-[7%] end-[5%] flex w-[min(260px,80%)] items-center gap-3 rounded-[16px] bg-white p-3 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_20px_40px_-18px_rgba(13,27,61,0.4)] transition-all duration-700 ease-[cubic-bezier(.2,.7,.1,1)] ${
          showNote ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <span className="grid h-9 w-9 flex-none place-items-center rounded-[10px] bg-[#1d1d1f] text-white">
          <Briefcase className="h-4 w-4" strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-[#1d1d1f]">{isRtl ? 'طلب مهمة جديد' : 'New mandate request'}</span>
          <span className="block truncate text-[12px] text-[#86868b]">{isRtl ? 'استشارات ضريبية · الرياض' : 'Tax advisory · Riyadh, KSA'}</span>
        </span>
        <span className="text-[11px] text-[#a1a1a6]">{isRtl ? 'الآن' : 'now'}</span>
      </div>
    </div>
  );
};

const CTA = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpertModalOpen, setIsExpertModalOpen] = useState(false);
  const isRtl = i18n.language === 'ar';

  return (
    <>
      <section id="contact" className="lg-section relative overflow-hidden bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="lg-container relative">
          {/* one card: the handshake on one side, the call to action on the other */}
          <Reveal>
            <div className="grid items-stretch overflow-hidden rounded-[32px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_40px_80px_-40px_rgba(13,27,61,0.35)] lg:grid-cols-[1.05fr_1fr]">
              <JourneyPanel isRtl={isRtl} />

              <div className="flex flex-col justify-center px-6 pb-10 pt-10 text-center sm:px-12 lg:py-14 lg:pe-14 lg:ps-12 lg:text-start">
                <Eyebrow red center={false} className="mx-auto lg:mx-0">{isRtl ? 'ابدأ الآن' : 'Get started'}</Eyebrow>
                <SplitHeading className="lg-h2 mt-5 !text-[clamp(32px,3.6vw,48px)]">
                  {`${t('cta.title')} `}
                  <span className="lg-muted-line">{t('cta.highlight')}</span>
                </SplitHeading>
                <p className="lg-lead mx-auto mt-5 max-w-xl !text-[17px] lg:mx-0">{t('cta.subtitle')}</p>

                <ul className="mx-auto mt-7 grid max-w-md gap-2.5 text-start lg:mx-0">
                  {STEPS.map((step) => (
                    <li key={step.en} className="flex items-center gap-3 text-[14.5px] text-[#424245]">
                      <span className="grid h-6 w-6 flex-none place-items-center rounded-full bg-[#dc2626]/10 text-[#dc2626]">
                        <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                      </span>
                      {isRtl ? step.ar : step.en}
                    </li>
                  ))}
                </ul>

                <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                  <button onClick={() => setIsModalOpen(true)} className="lg-btn lg-btn-red w-full !px-7 sm:w-auto">
                    {t('cta.becomePartner')}
                  </button>
                  <button onClick={() => setIsExpertModalOpen(true)} className="lg-btn lg-btn-glass w-full !px-7 sm:w-auto">
                    {t('cta.talkToExpert')}
                  </button>
                </div>

                <div className="mt-9 flex flex-col items-center gap-3 border-t border-black/[0.06] pt-6 sm:flex-row lg:justify-start">
                  <span className="text-[13px] text-[#86868b]">{isRtl ? 'تابعنا' : 'Follow us'}</span>
                  <div className="flex gap-2.5">
                    <a
                      href="https://www.linkedin.com/company/broccoli-and-carrots-global-services-pvt-ltd-/"
                      className="lg-chip !h-11 !w-11 !justify-center !p-0 text-[#1d1d1f] transition-colors hover:!bg-[#1d1d1f] hover:text-white"
                      aria-label="LinkedIn"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/bncglobal.in/"
                      className="lg-chip !h-11 !w-11 !justify-center !p-0 text-[#1d1d1f] transition-colors hover:!bg-[#1d1d1f] hover:text-white"
                      aria-label="Instagram"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm10.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                      </svg>
                    </a>
                    <a
                      href="https://www.youtube.com/@bncglobal1"
                      className="lg-chip !h-11 !w-11 !justify-center !p-0 text-[#1d1d1f] transition-colors hover:!bg-[#1d1d1f] hover:text-white"
                      aria-label="YouTube"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                    <a
                      href="https://chat.whatsapp.com/JuKT39dKPEW2RxyA1vuHFK"
                      className="lg-chip !h-11 !w-11 !justify-center !p-0 text-[#1d1d1f] transition-colors hover:!bg-[#1d1d1f] hover:text-white"
                      aria-label="WhatsApp Community"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <svg className="h-[18px] w-[18px]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.52 3.48A11.93 11.93 0 0 0 12.05 0C5.46.02.07 5.4.09 12a11.86 11.86 0 0 0 1.62 6L0 24l6.2-1.62A12 12 0 0 0 12 24h.05c6.6-.02 11.99-5.4 11.95-12a11.93 11.93 0 0 0-3.48-8.52zm-8.47 18.5h-.04a10 10 0 0 1-5.1-1.4l-.37-.22-3.68.96.98-3.58-.24-.38A10 10 0 0 1 2.1 12c0-5.46 4.46-9.9 9.95-9.9a9.9 9.9 0 0 1 7 2.9 9.86 9.86 0 0 1 2.9 7c0 5.46-4.45 9.9-9.9 9.9zm5.45-7.4c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.18.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.46-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1-1.03 2.44s1.06 2.83 1.2 3.03c.15.2 2.09 3.19 5.06 4.47.71.31 1.27.5 1.7.64.71.23 1.35.2 1.86.12.57-.09 1.78-.72 2.03-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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

export default CTA;
