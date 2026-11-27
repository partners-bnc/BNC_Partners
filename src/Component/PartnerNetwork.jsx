import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Reveal, SectionHeading } from '../components/ui/premium';
import PartnerWorldMap from '../components/ui/partner-world-map';

// Home page: the interactive partner network map, below "How it works".
export default function PartnerNetwork() {
  const navigate = useNavigate();
  const location = useLocation();
  const open = (kind, service) => {
    const q = new URLSearchParams(location.search);
    q.set('open', kind);
    if (service) q.set('service', service); else q.delete('service');
    navigate(`${location.pathname}?${q}`, { preventScrollReset: true });
  };

  return (
    <section id="partner-network" className="lg-section lg-band-parchment">
      <div className="lg-container">
        <SectionHeading
          eyebrow="Global network"
          title="Partners across"
          muted="42 countries"
        />
      </div>
      {/* map on the left, details panel on the right */}
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-8">
        <Reveal className="mt-10">
          <PartnerWorldMap
            onRequest={(topic) => open('expert', `Partner in ${topic}`)}
            onJoin={() => open('partner')}
          />
        </Reveal>
      </div>
    </section>
  );
}
