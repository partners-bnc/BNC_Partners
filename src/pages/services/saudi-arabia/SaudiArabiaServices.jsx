import React from 'react';
import { useTranslation } from 'react-i18next';
import CountryServices from '../CountryServices';

const SaudiArabiaServices = () => {
  const { t } = useTranslation();

  return (
    <CountryServices
      country="saudi-arabia"
      title={t('bncServices.countries.saudi.servicesTitle')}
      description={t('bncServices.countries.saudi.servicesDescription')}
    />
  );
};

export default SaudiArabiaServices;
