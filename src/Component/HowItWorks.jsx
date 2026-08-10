import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useScroll, useTransform } from 'framer-motion';

const HowItWorks = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"]
  });

  const lineProgress = useTransform(scrollYProgress, [0.15, 0.85], [0, 1]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setProgress(latest);
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const steps = [
    {
      num: '01',
      titleEn: 'Register Online',
      titleAr: 'سجل عبر الإنترنت',
      descEn: 'Fill out a quick application form and submit your KYC documents to get started in minutes.',
      descAr: 'املأ نموذج طلب سريعًا وأرسل مستندات KYC الخاصة بك للبدء في دقائق.'
    },
    {
      num: '02',
      titleEn: 'Get Products & Onboarding',
      titleAr: 'الحصول على المنتجات والتوجيه',
      descEn: 'Access our full product catalogue and complete a streamlined onboarding process.',
      descAr: 'الوصول إلى كتالوج منتجاتنا الكامل وإكمال عملية تهيئة مبسطة.'
    },
    {
      num: '03',
      titleEn: 'Training & Certification',
      titleAr: 'التدريب والشهادات',
      descEn: 'Complete our online certification courses to become a certified BNC partner.',
      descAr: 'أكمل دورات الشهادات عبر الإنترنت لتصبح شريك BNC معتمدًا.'
    },
    {
      num: '04',
      titleEn: 'Start Commissions',
      titleAr: 'ابدأ العمولات',
      descEn: 'Begin selling and earn commissions from day one with real-time tracking.',
      descAr: 'ابدأ البيع واكسب عمولات من اليوم الأول مع تتبع في الوقت الفعلي.'
    }
  ];

  const isActive = (idx) => {
    if (idx === 0) return progress >= 0.15;
    if (idx === 1) return progress >= 0.38;
    if (idx === 2) return progress >= 0.61;
    if (idx === 3) return progress >= 0.85;
    return false;
  };

  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-poppins text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white mb-4 relative inline-block">
            {isRtl ? 'كيف يعمل' : 'How It Works'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {isRtl
              ? 'رحلتك لتصبح شريكًا في BNC LEG في أربع خطوات بسيطة'
              : 'Your journey to becoming a BNC LEG partner in four simple steps'}
          </p>
        </div>

        {/* Steps Progress Bar Grid */}
        <div ref={containerRef} className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Connector Line (Desktop Background) */}
          <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-slate-100 dark:bg-slate-800/80 z-0"></div>
          {/* Connector Line (Desktop Active Progress) */}
          <motion.div 
            className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] z-0"
            style={{ scaleX: lineProgress, transformOrigin: isRtl ? "right" : "left" }}
          />

          {/* Connector Line (Mobile Background) */}
          <div className="md:hidden absolute top-6 bottom-6 left-6 w-0.5 bg-slate-100 dark:bg-slate-800/80 z-0"></div>
          {/* Connector Line (Mobile Active Progress) */}
          <motion.div 
            className="md:hidden absolute top-6 bottom-6 left-6 w-0.5 bg-gradient-to-b from-[#DC2626] to-[#B91C1C] z-0"
            style={{ scaleY: lineProgress, transformOrigin: "top" }}
          />

          {steps.map((step, idx) => {
            const active = isActive(idx);
            return (
              <div key={idx} className="relative z-10 text-center flex flex-col items-center md:items-center items-start pl-16 md:pl-0 min-h-[80px] md:min-h-0">
                <div className={`absolute left-0 md:relative w-12 h-12 rounded-full font-black text-lg flex items-center justify-center ring-4 transition-all duration-500 hover:scale-110 shadow-md mb-0 md:mb-6 ${
                  active 
                    ? 'bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white ring-red-100 dark:ring-red-950 shadow-red-500/20' 
                    : 'bg-slate-100 text-slate-400 ring-slate-50 dark:bg-slate-800 dark:text-slate-500 dark:ring-slate-900/50 shadow-none'
                }`}>
                  {step.num}
                </div>
                <div className="text-left md:text-center">
                  <h3 className={`text-base font-bold mb-2 transition-colors duration-500 ${
                    active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {isRtl ? step.titleAr : step.titleEn}
                  </h3>
                  <p className={`text-xs leading-relaxed transition-colors duration-500 ${
                    active ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                  }`}>
                    {isRtl ? step.descAr : step.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
