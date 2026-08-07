import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-center';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';

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
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-6 left-12 right-12 h-0.5 bg-red-400/80 z-0"></div>

          {steps.map((step, idx) => (
            <div key={idx} className="relative z-10 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC2626] to-[#B91C1C] text-white font-black text-lg flex items-center justify-center ring-4 ring-red-50 dark:ring-slate-800 shadow-md mb-6 transition-all duration-300 hover:scale-110 shadow-red-500/10">
                {step.num}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {isRtl ? step.titleAr : step.titleEn}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                {isRtl ? step.descAr : step.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
