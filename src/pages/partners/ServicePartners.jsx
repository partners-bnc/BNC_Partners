import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaFileSignature, FaBalanceScale, FaGlobe, FaClipboardCheck } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ServicePartners = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language?.startsWith('ar');
  const focusCards = [
    {
      title: 'IFRS & Reporting',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      description: 'IFRS advisory, reporting alignment, and audit-ready documentation.',
      icon: FaFileSignature
    },
    {
      title: 'M&A Advisory Support',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80',
      description: 'Diligence support, valuation inputs, and transaction readiness.',
      icon: FaBalanceScale
    },
    {
      title: 'Cross-Border Compliance',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      description: 'Regulatory alignment, filings, and compliance controls.',
      icon: FaGlobe
    },
    {
      title: 'SOPs & Controls',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      description: 'Process documentation, control testing, and governance support.',
      icon: FaClipboardCheck
    }
  ];

  const sidebarContent = isArabic
    ? {
      title: 'كن شريكًا',
      stepsLabel: '4 خطوات',
      stepPrefix: 'الخطوة',
      cta: 'ابدأ التقديم',
      steps: [
        'سجل كشريك.',
        'أكمل الملف التعريفي بالذكاء الاصطناعي.',
        'وقّع اتفاقية الشروط والأحكام إلكترونيًا.',
        'أرسل نموذج نوع الشراكة الخاص بك.'
      ]
    }
    : {
      title: 'Become a Partner',
      stepsLabel: '4 Steps',
      stepPrefix: 'Step',
      cta: 'Start Application',
      steps: [
        'Register as a partner.',
        'Complete AI profiling.',
        'E-Sign the Terminal Condition Agreement.',
        'Submit your partner type form.'
      ]
    };
  const timelineLinePosition = isArabic ? 'before:right-[1.125rem]' : 'before:left-[1.125rem]';

  return (
    <div className="bg-white">
      <section className="relative w-full bg-[#204681] text-white -mt-16 pt-28 pb-24 min-h-[320px] overflow-hidden rounded-b-[48px]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="container mx-auto px-4 md:px-6 lg:px-8 pl-10 md:pl-16 relative z-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Service Partners</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white">
              Deliver specialized services with consistent quality.
            </h1>
            <p className="mt-3 text-white/80">
              We align scope, reporting, and governance so your team can deliver reliably at scale.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 pl-10 md:pl-16">
        <div className="grid lg:grid-cols-[1.55fr_0.75fr] gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">What this partnership delivers</h2>
              <p className="mt-2 text-slate-600">
                Clear scopes, QA checkpoints, and audit-ready delivery documentation.
              </p>
            </div>
            
            {/* Adjusted gap-x-5 to gap-x-3 here for tighter horizontal spacing */}
            <div className="grid sm:grid-cols-2 gap-x-3 gap-y-4 justify-items-start">
              {focusCards.map((card) => (
                <div
                  key={card.title}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200 w-full max-w-[340px]"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-lg bg-white/95 backdrop-blur-sm p-2 text-[#2C5AA0] shadow-sm">
                      <card.icon className="text-[18px]" />
                    </div>
                  </div>
                  <div className="flex flex-col flex-grow p-4">
                    <h3 className="font-semibold text-slate-900 group-hover:text-[#2C5AA0] transition-colors">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-gradient-to-b from-[#f8fbff] to-white p-7 shadow-[0_12px_40px_rgba(32,70,129,0.08)] max-w-md w-full lg:justify-self-end h-fit">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-900">{sidebarContent.title}</h3>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs uppercase tracking-wider text-[#2C5AA0] font-semibold">
                {sidebarContent.stepsLabel}
              </span>
            </div>
            
            <div className={`mt-6 flex flex-col relative before:absolute before:inset-y-0 before:w-[2px] before:bg-gradient-to-b before:from-[#2C5AA0]/20 before:to-transparent ${timelineLinePosition}`}>
              {sidebarContent.steps.map((step, index) => (
                <div key={step} className="relative flex items-start gap-4 mb-5 last:mb-0 group">
                  <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-white bg-[#204681] text-white text-sm font-bold shadow-sm transition-transform duration-300 group-hover:scale-110">
                    {index + 1}
                  </div>
                  <div className="pt-1.5 pb-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#2C5AA0]/70 font-bold mb-0.5">
                      {sidebarContent.stepPrefix} 0{index + 1}
                    </p>
                    <p className="text-sm text-slate-700 font-medium leading-tight">{step}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link
              to="/?open=partner"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#204681] to-[#2C5AA0] text-white px-5 py-3.5 text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              {sidebarContent.cta}
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicePartners;
