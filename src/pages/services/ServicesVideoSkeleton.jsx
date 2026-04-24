import React from 'react';

const ServicesVideoSkeleton = () => (
  <div
    aria-hidden="true"
    className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-950 via-[#102f58] to-[#285a9b]"
  >
    <div className="absolute inset-0 opacity-45">
      <div className="absolute -left-10 top-8 h-36 w-36 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute -right-12 bottom-4 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute inset-y-0 right-1/4 w-28 skew-x-[-18deg] bg-white/10" />
    </div>

    <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.03),rgba(255,255,255,0.18),rgba(255,255,255,0.03))] bg-[length:220%_100%]" />

    <div className="relative flex h-full flex-col justify-between p-5">
      <div className="space-y-3">
        <div className="h-3 w-28 rounded-full bg-white/35" />
        <div className="h-5 w-3/5 rounded-full bg-white/45" />
        <div className="h-5 w-2/5 rounded-full bg-white/30" />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-white/25" />
          <div className="h-8 w-8 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/18 px-4 py-2">
          <div className="h-3 w-16 rounded-full bg-white/45" />
          <div className="h-5 w-8 rounded bg-white/35" />
        </div>
      </div>
    </div>

    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex h-14 w-20 items-center justify-center rounded-2xl bg-white/85 shadow-lg shadow-slate-950/20">
        <div className="ml-1 h-0 w-0 border-y-[12px] border-l-[18px] border-y-transparent border-l-[#2C5AA0]" />
      </div>
    </div>
  </div>
);

export default ServicesVideoSkeleton;
