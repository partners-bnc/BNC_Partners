import React, { Suspense, lazy, useEffect, useState } from 'react';
import Hero from '../Component/Hero';

const StatsBar = lazy(() => import('../Component/StatsBar'));
const AboutPlatform = lazy(() => import('../Component/AboutPlatform'));
const WhyPartner = lazy(() => import('../Component/WhyPartner'));
const PartnershipOpportunities = lazy(() => import('../Component/PartnershipOpportunities'));
const HowItWorks = lazy(() => import('../Component/HowItWorks'));
const PartnerNetwork = lazy(() => import('../Component/PartnerNetwork'));
const CTA = lazy(() => import('../Component/CTA'));

const Home = () => {
  const [showDeferredSections, setShowDeferredSections] = useState(true);

  useEffect(() => {
    let timeoutId;
    let idleId;

    const enableDeferredSections = () => setShowDeferredSections(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(enableDeferredSections, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(enableDeferredSections, 250);
    }

    return () => {
      if (typeof window !== 'undefined' && 'cancelIdleCallback' in window && idleId) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  useEffect(() => {
    if (showDeferredSections && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [showDeferredSections]);

  return (
    <div className="lg-home">
      <Hero />
      {showDeferredSections ? (
        <Suspense fallback={<div className="min-h-[24rem] bg-white" aria-hidden="true" />}>
          {/* each section reveals itself on scroll (see components/ui/premium.jsx) */}
          <StatsBar />
          <AboutPlatform />
          <WhyPartner />
          <PartnershipOpportunities />
          <HowItWorks />
          <PartnerNetwork />
          <CTA />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Home;
