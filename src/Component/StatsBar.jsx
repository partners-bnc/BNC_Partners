import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Users, Layers, Globe, ThumbsUp } from 'lucide-react';

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

const STATS = [
  { icon: Users, value: 84, suffix: '', en: 'Partners worldwide', ar: 'شركاء حول العالم' },
  { icon: Layers, value: 15, suffix: '+', en: 'Products & services', ar: 'المنتجات والخدمات' },
  { icon: Globe, value: 42, suffix: '', en: 'Countries with partner connections', ar: 'دول لدينا فيها شبكة شركاء' },
  { icon: ThumbsUp, value: 98, suffix: '%', en: 'Partner satisfaction', ar: 'رضا الشركاء' },
];

// One stat card. As the row scrolls into view, cards 1-2 slide in from the left
// and cards 3-4 from the right (mirrored in Arabic), tied to the scroll position.
const StatCard = ({ stat, idx, progress, isRtl, reduce }) => {
  const Icon = stat.icon;
  const fromLeft = (idx < 2) !== isRtl;
  const distance = idx === 0 || idx === 3 ? 160 : 90; // outer cards travel further
  const x = useTransform(progress, [0, 1], [fromLeft ? -distance : distance, 0]);
  const opacity = useTransform(progress, [0, 0.7], [0, 1]);
  return (
    <motion.div
      style={reduce ? undefined : { x, opacity }}
      className="lg-card is-hover flex items-center gap-4 px-4 py-4 sm:px-5 sm:py-5"
    >
      <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#dc2626]/[0.08] text-[#dc2626]">
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <div className="text-[clamp(26px,2.6vw,34px)] font-semibold leading-none tracking-[-0.035em] text-[#1d1d1f]">
          <CountUp value={stat.value} />
          <span className="text-[#dc2626]">{stat.suffix}</span>
        </div>
        <div className="mt-1.5 text-[12.5px] leading-snug text-[#6e6e73] sm:text-[13.5px]">{isRtl ? stat.ar : stat.en}</div>
      </div>
    </motion.div>
  );
};

const StatsBar = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const reduce = useReducedMotion();
  const rowRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: rowRef, offset: ['start end', 'start 65%'] });

  return (
    <section className="relative z-20 -mt-6 overflow-x-clip pb-2 sm:-mt-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="lg-container">
        <div ref={rowRef} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {STATS.map((stat, idx) => (
            <StatCard key={stat.en} stat={stat} idx={idx} progress={scrollYProgress} isRtl={isRtl} reduce={reduce} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
