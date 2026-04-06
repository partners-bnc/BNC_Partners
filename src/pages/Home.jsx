import React, { Suspense, lazy, useEffect, useState } from 'react';
import Hero from '../Component/Hero';

const PartnershipOpportunities = lazy(() => import('../Component/PartnershipOpportunities'));
const CTA = lazy(() => import('../Component/CTA'));

const Home = () => {
  const [showDeferredSections, setShowDeferredSections] = useState(false);

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

  return (
    <div>
      <Hero />
      {showDeferredSections ? (
        <Suspense fallback={<div className="min-h-[24rem] bg-gray-50" aria-hidden="true" />}>
          <PartnershipOpportunities />
          <CTA />
        </Suspense>
      ) : null}
    </div>
  );
};

export default Home;
