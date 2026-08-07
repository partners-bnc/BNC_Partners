import React from 'react';
import { useTranslation } from 'react-i18next';

const StatsBar = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  return (
    <section className="bg-[rgb(46,53,67)] text-white py-10 relative z-20 shadow-xl border-y border-red-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y-0 md:divide-x divide-white ${isRtl ? 'dir-rtl' : 'dir-ltr'}`}>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">50+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'الشركاء في جميع أنحاء العالم' : 'Partners Worldwide'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">15+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'المنتجات الموزعة' : 'Products Distributed'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">15+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-300">
              {isRtl ? 'سنوات من الخبرة' : 'Years of Experience'}
            </div>
          </div>
          <div className="p-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-[#DC2626] mb-1 tracking-tight">98%</div>
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
