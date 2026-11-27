import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScroll } from 'framer-motion';
import { UserPlus, IdCard, FileSignature, Globe, ArrowUpRight } from 'lucide-react';
import { SectionHeading } from '../components/ui/premium';

// Home page: the partner journey in four steps. As the visitor scrolls, each
// step's hairline fills red and its numeral turns red, one after another.
const STEPS = [
  {
    icon: UserPlus,
    titleEn: 'Register on the portal',
    titleAr: 'سجّل في البوابة',
    descEn: 'Create your account in minutes.',
    descAr: 'أنشئ حسابك في دقائق.',
  },
  {
    icon: IdCard,
    titleEn: 'Complete your profile',
    titleAr: 'أكمل ملفك الشخصي',
    descEn: 'Add your expertise, countries and documents.',
    descAr: 'أضف خبراتك والدول التي تعمل بها ومستنداتك.',
  },
  {
    icon: FileSignature,
    titleEn: 'Sign the agreement',
    titleAr: 'وقّع الاتفاقية',
    descEn: 'Review and e-sign it online.',
    descAr: 'راجعها ووقّعها إلكترونيًا.',
  },
  {
    icon: Globe,
    titleEn: 'Serve globally and earn',
    titleAr: 'اخدم عالميًا واربح',
    descEn: 'Work in any niche, with clients worldwide.',
    descAr: 'اعمل في أي تخصص مع عملاء حول العالم.',
  },
];

const THRESHOLDS = [0.12, 0.35, 0.58, 0.8];

const HowItWorks = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end center'] });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', setProgress);
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <section id="how-it-works" className="lg-section lg-band-parchment relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="lg-container relative">
        <SectionHeading
          eyebrow={isRtl ? 'كيف يعمل' : 'How it works'}
          title={isRtl ? 'أربع خطوات' : 'Four steps to'}
          muted={isRtl ? 'إلى أول عمولة.' : 'your first commission.'}
          className="!max-w-5xl"
        />

        {/* editorial steps: a hairline that fills red, a large thin numeral, title, one line */}
        <ol ref={containerRef} className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, ...step }, idx) => {
            const active = progress >= THRESHOLDS[idx];
            const last = idx === STEPS.length - 1;
            return (
              <li key={step.titleEn} className="group relative">
                <div className="relative h-px w-full bg-black/[0.12]">
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 start-0 h-[2px] -translate-y-[0.5px] bg-[#dc2626] transition-[width] duration-[900ms] ease-[cubic-bezier(.2,.7,.1,1)] ${active ? 'w-full' : 'w-0'}`}
                  />
                </div>
                <div className="mt-6 flex items-start justify-between">
                  <span className={`text-[52px] font-extralight leading-none tracking-[-0.04em] tabular-nums transition-colors duration-700 ${active ? 'text-[#dc2626]' : 'text-[#c7c7cc]'}`}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <Icon className={`mt-1 h-5 w-5 transition-colors duration-700 ${active ? 'text-[#1d1d1f]' : 'text-[#c7c7cc]'}`} strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-[18px] font-semibold leading-snug tracking-[-0.015em] text-[#1d1d1f]">
                  {isRtl ? step.titleAr : step.titleEn}
                </h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[#6e6e73]">{isRtl ? step.descAr : step.descEn}</p>
                {last ? (
                  <a href="#contact" className="mt-4 inline-flex items-center gap-1 text-[14px] font-semibold text-[#dc2626] hover:underline">
                    {isRtl ? 'ابدأ الآن' : 'Get started'}
                    <ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" />
                  </a>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
