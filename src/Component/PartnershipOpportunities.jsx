import React from 'react';
import { Link } from 'react-router-dom';
import { Handshake, Users, Cpu, Briefcase, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RevealGroup, RevealItem, SectionHeading, ArrowIcon } from '../components/ui/premium';

const OPPORTUNITIES = [
  { key: 'strategic', icon: Handshake, path: '/partnerships/international' },
  { key: 'channel', icon: Users, path: '/partnerships/sales' },
  { key: 'technology', icon: Cpu, path: '/partnerships/technology' },
  { key: 'service', icon: Briefcase, path: '/partnerships/service' },
];

const PartnershipOpportunities = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="lg-section bg-white" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="lg-container">
        <SectionHeading
          eyebrow={isRtl ? 'فرص الشراكة' : 'Partnership models'}
          title={isRtl ? '' : 'Partnership'}
          muted={isRtl ? t('partnershipOpportunities.title') : 'Opportunities'}
          className="!max-w-4xl"
        />

        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {OPPORTUNITIES.map(({ key, icon: Icon, path }, idx) => {
            const features = t(`partnershipOpportunities.cards.${key}.features`, { returnObjects: true });
            return (
              <RevealItem key={key} className="h-full">
                <Link to={path} className="group lg-card is-hover flex h-full flex-col overflow-hidden p-7">
                  <div className="flex items-start justify-between">
                    <span className="lg-icon is-react">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <span className="lg-index text-[64px]">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="lg-h3 mt-8">{t(`partnershipOpportunities.cards.${key}.title`)}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73]">
                    {t(`partnershipOpportunities.cards.${key}.description`)}
                  </p>
                  <div className="lg-hairline my-6" />
                  <ul className="space-y-3">
                    {(Array.isArray(features) ? features : []).map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-[14.5px] text-[#424245]">
                        <span className="mt-0.5 grid h-[18px] w-[18px] flex-none place-items-center rounded-full bg-[#1d1d1f] text-white">
                          <Check className="h-3 w-3" strokeWidth={2.4} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="lg-link mt-auto pt-8 text-[15px]">
                    {t('partnershipOpportunities.learnMore')}
                    <ArrowIcon />
                  </span>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
};

export default PartnershipOpportunities;
