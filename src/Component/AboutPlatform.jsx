import { useState } from 'react';

const VIDEO_ID = 'jZDsLV1fiOM';

const AboutPlatform = () => {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto px-4 max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left - Video */}
          <div className="w-full lg:w-[55%] flex-shrink-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#2C5AA0]/20 h-full min-h-[420px] relative">
              {playing ? (
                <iframe
                  className="w-full h-full absolute inset-0"
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1`}
                  title="About BNC Platform"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div
                  className="w-full h-full absolute inset-0 cursor-pointer group"
                  onClick={() => setPlaying(true)}
                >
                  {/* Thumbnail */}
                  <img
                    src={`https://img.youtube.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                    alt="About BNC Platform"
                    className="w-full h-full object-cover"
                  />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

                  {/* Custom Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center group-hover:bg-white/30 transition-all duration-300">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <polygon points="5,3 14,8 5,13" fill="white" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Content */}
          <div className="w-full lg:w-[45%]">
            <span className="inline-block text-sm font-semibold text-[#2C5AA0] uppercase tracking-widest mb-3 font-poppins">
              About Our Platform
            </span>
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              Empowering Partners to <span className="text-[#2C5AA0]">Grow Together</span>
            </h2>
            <p className="font-geist text-gray-600 text-lg leading-relaxed mb-6">
              BNC Global is a next-generation partner ecosystem platform designed to connect businesses, technology providers, and service experts across the globe. Our platform streamlines collaboration, accelerates deal cycles, and unlocks new revenue streams for every partner in the network.
            </p>
            <p className="font-geist text-gray-600 leading-relaxed">
              Whether you're a sales partner, technology integrator, or service provider — BNC gives you the tools, insights, and support to scale your business with confidence. From real-time dashboards to AI-powered lead matching, we make partnership simple, transparent, and profitable.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutPlatform;
