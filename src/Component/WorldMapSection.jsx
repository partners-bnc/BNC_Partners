import React from 'react';
import { WorldMap } from '../components/ui/world-map';

const WorldMapSection = () => {
  return (
    <section className="relative py-16 bg-[#f5f7fb] overflow-hidden">
      <div className="absolute -top-28 right-0 h-72 w-72 rounded-full bg-[#2C5AA0]/10 blur-3xl" />
      <div className="absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-geist text-xs uppercase tracking-[0.35em] text-slate-500">
            Global Footprint
          </p>
          <h2 className="font-poppins text-3xl md:text-4xl font-semibold text-slate-900 mt-3">
            Connecting Partners Across Regions
          </h2>
          <p className="font-geist text-slate-600 max-w-4xl mx-auto mt-4 whitespace-nowrap">
            Visualize how BnC Global connects India, Saudi Arabia, and worldwide
            partners through a trusted delivery network.
          </p>
        </div>

        <div className="mt-10" style={{ perspective: '1200px' }}>
          <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-[0_30px_70px_rgba(15,23,42,0.12)] transform-gpu [transform:rotateX(6deg)_rotateY(-6deg)] transition duration-500 hover:[transform:rotateX(0deg)_rotateY(0deg)]">
            <WorldMap
              lineColor="#2C5AA0"
              dots={[
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 53.5461, lng: -113.4938, label: 'CAN' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 25.5199, lng: -105.8701, label: 'USA' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 51.5074, lng: -0.1278, label: 'UK' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 22.9375, lng: 14.3754, label: 'MLT' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: -15.3875, lng: 28.3228, label: 'ZMB' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 30.0444, lng: 31.2357, label: 'EGY' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 10.7136, lng: 42.6753, label: 'KSA' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: 7.2048, lng: 55.2708, label: 'UAE' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: -17.3521, lng: 103.8198, label: 'SGP' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: -37.8136, lng: 144.9631, label: 'Australia' },
                },
                {
                  start: { lat: 17.6139, lng: 77.209, label: 'New Delhi' },
                  end: { lat: -5.8797, lng: 121.774, label: 'PHL' },
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorldMapSection;
