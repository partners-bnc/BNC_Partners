import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useInView } from 'framer-motion';

const CountUp = ({ value, suffix = '', duration = 1.5 }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp = null;
    let frameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };
    frameId = window.requestAnimationFrame(step);
    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

const StatsBar = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="bg-[rgb(46,53,67)] text-white py-10 relative z-20 shadow-xl border-y border-red-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y-0 md:divide-x divide-white ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">
              <CountUp value={50} suffix="+" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'الشركاء في جميع أنحاء العالم' : 'Partners Worldwide'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">
              <CountUp value={15} suffix="+" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'المنتجات الموزعة' : 'Products Distributed'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">
              <CountUp value={15} suffix="+" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'سنوات من الخبرة' : 'Years of Experience'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">
              <CountUp value={98} suffix="%" />
            </div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'رضا الشركاء' : 'Partner Satisfaction'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
