import React from 'react';
import { useTranslation } from 'react-i18next';
import PartnershipOpportunities from '../Component/PartnershipOpportunities';
import CTA from '../Component/CTA';

const Partnerships = () => {
  const { t } = useTranslation();
  return (
    <div>
      <section className="py-16 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('partnershipsPage.heroTitle')}</h1>
          <p className="text-xl max-w-3xl mx-auto">
            {t('partnershipsPage.heroSubtitle')}
          </p>
        </div>
      </section>
      <PartnershipOpportunities />
      <CTA />
    </div>
  );
};

export default Partnerships;
