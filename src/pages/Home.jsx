import React, { Suspense, lazy, useEffect, useState } from 'react';
import Hero from '../Component/Hero';
import { motion } from 'framer-motion';

const StatsBar = lazy(() => import('../Component/StatsBar'));
const AboutPlatform = lazy(() => import('../Component/AboutPlatform'));
const WhyPartner = lazy(() => import('../Component/WhyPartner'));
const PartnershipOpportunities = lazy(() => import('../Component/PartnershipOpportunities'));
const HowItWorks = lazy(() => import('../Component/HowItWorks'));
const CTA = lazy(() => import('../Component/CTA'));

const scrollRevealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

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
    <div>
      <Hero />
      {showDeferredSections ? (
        <Suspense fallback={<div className="min-h-[24rem] bg-gray-50" aria-hidden="true" />}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <StatsBar />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <AboutPlatform />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <WhyPartner />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <PartnershipOpportunities />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <HowItWorks />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={scrollRevealVariants}
          >
            <CTA />
          </motion.div>
        </Suspense>
      ) : null}
    </div>
  );
};

export default Home;
