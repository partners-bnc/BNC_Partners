import React from 'react';
import { useTranslation } from 'react-i18next';
import CountryServices from '../CountryServices';

const IndiaServices = () => {
  const { t } = useTranslation();

  return (
    <CountryServices
      country="india"
      title={t('bncServices.countries.india.servicesTitle')}
      description={t('bncServices.countries.india.servicesDescription')}
    />
  );
};

export default IndiaServices;
