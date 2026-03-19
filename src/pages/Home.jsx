import React from 'react';
import Hero from '../Component/Hero';
import PartnershipOpportunities from '../Component/PartnershipOpportunities';
import AboutPlatform from '../Component/AboutPlatform';
import CTA from '../Component/CTA';

const Home = () => {
  return (
    <div>
      <Hero />
      <PartnershipOpportunities />
      <AboutPlatform />
      <CTA />
    </div>
  );
};

export default Home;
