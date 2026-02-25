import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaGlobe, FaBalanceScale, FaBuilding, FaChartLine } from 'react-icons/fa';

const InternationalPartners = () => {
  const focusCards = [
    {
      title: 'Market Entry & Localization',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
      description: 'Local market analysis, entity setup guidance, and go-to-market alignment.',
      icon: FaGlobe
    },
    {
      title: 'Local Compliance & Tax',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80',
      description: 'Regulatory filings, tax alignment, and audit-ready documentation.',
      icon: FaBalanceScale
    },
    {
      title: 'Cross-Border Delivery',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
      description: 'On-ground execution with shared SLAs, QA, and reporting standards.',
      icon: FaBuilding
    },
    {
      title: 'Shared Services Setup',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      description: 'Design and stabilization of shared service hubs and governance.',
      icon: FaChartLine
    }
  ];

  const steps = [
    'Register as a partner.',
    'Complete AI profiling.',
    'E-Sign the Terminal Condition Agreement.',
    'Submit your partner type form.'
  ];

  return (
    <div className="bg-white">
      <section className="relative w-full bg-[#204681] text-white -mt-16 pt-28 pb-24 min-h-[320px] overflow-hidden rounded-b-[48px]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_55%)]" />
                <div className="container mx-auto px-4 md:px-6 lg:px-8 pl-10 md:pl-16 relative z-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">International Partners</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold text-white">
              Lead cross-border delivery with trusted local execution.
            </h1>
            <p className="mt-3 text-white/80">
              We partner with firms that can deliver compliance-ready services and client success across key regions.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 pl-10 md:pl-16">
        <div className="grid lg:grid-cols-[1.55fr_0.75fr] gap-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">What this partnership delivers</h2>
              <p className="mt-2 text-slate-600">
                Local execution, compliance alignment, and shared delivery standards to scale global engagements.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 justify-items-start">
              {focusCards.map((card) => (
                <div
                  key={card.title}
                  className="overflow-hidden rounded-2xl border border-white/70 bg-gradient-to-br from-white via-[#f3f7ff] to-[#e6efff] shadow-[0_12px_28px_rgba(32,70,129,0.16)] transition-transform duration-200 hover:-translate-y-1 w-full max-w-[340px]"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-5 pt-4">
                    <h3 className="font-semibold text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-[#f8fbff] to-white p-6 shadow-[0_16px_36px_rgba(32,70,129,0.12)] max-w-md w-full lg:justify-self-end">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">How to become a partner</h3>
              <span className="text-xs uppercase tracking-[0.2em] text-[#2C5AA0]/70">Steps</span>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="w-full rounded-2xl border border-slate-100 bg-white/90 px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-[#2C5AA0] to-[#1e3f73] text-white flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[#2C5AA0]/60">Step</p>
                      <p className="mt-1 text-slate-700 font-medium">{step}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/?open=partner"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2C5AA0] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[#1e3f73] transition"
            >
              Become a Partner
              <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InternationalPartners;