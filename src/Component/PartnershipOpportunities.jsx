import React from 'react';
import { FaHandshake, FaUsers, FaCogs, FaUserTie, FaCheckCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const PartnershipOpportunities = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';
  const opportunities = [
    { key: 'strategic', icon: FaHandshake },
    { key: 'channel', icon: FaUsers },
    { key: 'technology', icon: FaCogs },
    { key: 'service', icon: FaUserTie }
  ];

  return (
    <section className="bg-gray-50 -mt-20 pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 pt-8">
          <h2 className="font-poppins text-3xl md:text-4xl font-semibold text-slate-900 mb-4 relative inline-block">
            {t('partnershipOpportunities.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {opportunities.map((opportunity) => (
            <div
              key={opportunity.key}
              className={`group relative bg-white p-9 rounded-3xl border border-slate-100 shadow-xl shadow-[#2C5AA0]/10 hover:shadow-[0_28px_70px_rgba(44,90,160,0.28)] hover:-translate-y-3 hover:scale-[1.02] transition-all duration-150 ease-out flex flex-col ${textAlign}`}
            >
              <div className="absolute inset-x-0 -top-px h-1 rounded-t-3xl bg-gradient-to-r from-[#2C5AA0] via-[#3b6cc4] to-[#1e3f73]" />
              <div className={`flex items-center gap-4 mb-6 ${rowDirection}`}>
                <div className="h-14 w-14 rounded-2xl bg-[#2C5AA0]/10 text-[#2C5AA0] flex items-center justify-center transition duration-150 ease-out group-hover:scale-110">
                  <opportunity.icon className="text-3xl" />
                </div>
                <h3 className="font-poppins text-xl font-semibold text-gray-900">
                  {t(`partnershipOpportunities.cards.${opportunity.key}.title`)}
                </h3>
              </div>
              <p className="font-geist text-gray-600 mb-6 leading-relaxed">
                {t(`partnershipOpportunities.cards.${opportunity.key}.description`)}
              </p>
              <ul className="space-y-3 mb-8">
                {t(`partnershipOpportunities.cards.${opportunity.key}.features`, { returnObjects: true }).map((feature, idx) => (
                  <li key={idx} className={`flex items-start gap-3 font-geist text-gray-700 ${rowDirection}`}>
                    <span className="mt-1 text-[#2C5AA0]">
                      <FaCheckCircle className="h-5 w-5" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-auto w-full inline-flex items-center justify-center font-poppins text-white px-6 py-2.5 rounded-full font-semibold bg-gradient-to-r from-[#2C5AA0] to-[#1e3f73] transition-all duration-150 ease-out hover:shadow-[0_16px_32px_rgba(44,90,160,0.35)] hover:-translate-y-0.5">
                {t('partnershipOpportunities.learnMore')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnershipOpportunities;
