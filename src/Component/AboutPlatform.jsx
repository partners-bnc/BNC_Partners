import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { LayoutDashboard, Sparkles, Globe2 } from 'lucide-react';
import { Glass, Reveal, SplitHeading } from '../components/ui/premium';

const VIDEO_ID = 'jZDsLV1fiOM';

const FEATURES = [
  { icon: LayoutDashboard, title: 'Live dashboards' },
  { icon: Sparkles, title: 'AI matching' },
  { icon: Globe2, title: 'Global network' },
];

const AboutPlatform = () => {
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  // the video eases from slightly smaller to full size as it scrolls into view
  const { scrollYProgress } = useScroll({ target: frameRef, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [48, 32]);

  return (
    <section id="about" className="lg-section bg-white">
      <div className="lg-container">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          {/* Content: heading, one paragraph, one small feature card */}
          <div>
            <Reveal>
              <span className="lg-eyebrow is-red">About the platform</span>
            </Reveal>
            <SplitHeading className="lg-h2 mt-5">
              {'Empowering partners '}
              <span className="lg-muted-line">to grow together.</span>
            </SplitHeading>
            <Reveal delay={0.1}>
              <p className="lg-lead mt-6 max-w-xl">
                Hear from our founder why BNC LEG exists: one trusted network where firms, specialists and
                technology partners find each other, work as one team and grow their revenue together.
              </p>
            </Reveal>

            <Reveal delay={0.18} className="mt-9">
              <Glass className="!rounded-[22px] px-5 py-4">
                <ul className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                  {FEATURES.map(({ icon: Icon, title }, i) => (
                    <li key={title} className={`flex items-center gap-2.5 ${i > 0 ? 'sm:border-s sm:border-black/[0.07] sm:ps-4' : ''} ${i < FEATURES.length - 1 ? 'sm:pe-4' : ''}`}>
                      <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-[#1d1d1f]/[0.05] text-[#1d1d1f]">
                        <Icon className="h-[17px] w-[17px]" strokeWidth={1.7} />
                      </span>
                      <span className="whitespace-nowrap text-[13.5px] font-semibold leading-tight tracking-[-0.01em] text-[#1d1d1f]">{title}</span>
                    </li>
                  ))}
                </ul>
              </Glass>
            </Reveal>
          </div>

          {/* Video */}
          <motion.div
            ref={frameRef}
            style={reduce ? undefined : { scale, borderRadius: radius }}
            className="relative aspect-[16/11] w-full overflow-hidden rounded-[32px] bg-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_40px_80px_-40px_rgba(0,0,0,0.45)] lg:origin-center"
          >
            {playing ? (
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                title="About BNC Platform"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <button type="button" className="group absolute inset-0 h-full w-full cursor-pointer" onClick={() => setPlaying(true)} aria-label="Play the founder video about the platform">
                <img
                  src={`https://i.ytimg.com/vi_webp/${VIDEO_ID}/maxresdefault.webp`}
                  width="1280"
                  height="720"
                  decoding="async"
                  alt="About BNC Platform"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.2,.7,.1,1)] group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                {/* one compact pill: the thumbnail already carries its own title */}
                <span
                  className="absolute bottom-5 start-5 inline-flex items-center gap-2.5 rounded-full bg-white/20 py-1.5 pe-4 ps-1.5 text-[13.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_0_0_1px_rgba(255,255,255,.3)] transition-transform duration-500 group-hover:scale-105"
                  style={{ WebkitBackdropFilter: 'blur(18px) saturate(1.8)', backdropFilter: 'blur(18px) saturate(1.8)' }}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dc2626]">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <polygon points="5,3 14,8 5,13" fill="white" />
                    </svg>
                  </span>
                  Watch: a word from our founder
                </span>
              </button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutPlatform;
