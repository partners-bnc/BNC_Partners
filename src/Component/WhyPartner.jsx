import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, ShieldCheck, LayoutDashboard, BookOpen, Package, FileText } from 'lucide-react';

const WhyPartner = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const textAlign = isRtl ? 'text-right' : 'text-left';
  const rowDirection = isRtl ? 'flex-row-reverse' : 'flex-row';

  const cards = [
    {
      icon: TrendingUp,
      iconBg: 'bg-amber-500/10 text-amber-500',
      titleEn: 'High Earning Potential',
      titleAr: 'إمكانات كسب عالية',
      descEn: 'Earn attractive commissions on every product sale. Our tiered structure rewards top performers with bonuses and incentives.',
      descAr: 'اكسب عمولات جذابة على كل عملية بيع منتج. هيكلنا المتدرج يكافئ أفضل المؤدين بالمكافآت والحوافز.'
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-emerald-500/10 text-emerald-500',
      titleEn: 'Trusted & Regulated',
      titleAr: 'موثوق ومنظم',
      descEn: 'We operate under full regulatory compliance. Your clients\' investments are safe and protected by top-tier insurers.',
      descAr: 'نحن نعمل بموجب الامتثال التنظيمي الكامل. استثمارات عملائك آمنة ومحمية من قبل شركات التأمين الكبرى.'
    },
    {
      icon: LayoutDashboard,
      iconBg: 'bg-blue-500/10 text-blue-500',
      titleEn: 'Partner Dashboard',
      titleAr: 'لوحة تحكم الشريك',
      descEn: 'Track earnings, leads, and commissions in real-time through our intuitive and powerful partner portal.',
      descAr: 'تتبع الأرباح والعملاء المحتملين والعمولات في الوقت الفعلي من خلال بوابة الشركاء سهلة الاستخدام والقوية.'
    },
    {
      icon: BookOpen,
      iconBg: 'bg-purple-500/10 text-purple-500',
      titleEn: 'Training & Support',
      titleAr: 'التدريب والدعم',
      descEn: 'Access comprehensive training modules, live webinars, and a dedicated relationship manager to help you grow.',
      descAr: 'احصل على إمكانية الوصول إلى وحدات تدريبية شاملة وندوات عبر الإنترنت ومدير علاقات مخصص لمساعدتك على النمو.'
    },
    {
      icon: Package,
      iconBg: 'bg-amber-600/10 text-amber-600',
      titleEn: 'Multi-Product Range',
      titleAr: 'مجموعة منتجات متعددة',
      descEn: 'Sell insurance, loans, mutual funds, credit cards, and more — all from a single platform under one umbrella.',
      descAr: 'بيع التأمين والقروض والصناديق المشتركة وبطاقات الائتمان والمزيد - كل ذلك من منصة واحدة تحت مظلة واحدة.'
    },
    {
      icon: FileText,
      iconBg: 'bg-red-500/10 text-[#DC2626]',
      titleEn: 'Partner Reports',
      titleAr: 'تقارير الشركاء',
      descEn: 'Get detailed monthly reports on your portfolio performance, pending commissions, and client acquisition stats.',
      descAr: 'احصل على تقارير شهرية مفصلة عن أداء محفظتك والعمولات المعلقة وإحصاءات جذب العملاء.'
    }
  ];

  return (
    <section id="services" className="py-20 bg-slate-50/50 dark:bg-slate-900/50 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-poppins text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white mb-4 relative inline-block">
            {isRtl ? (
              <>
                لماذا تشارك مع <span className="text-[#DC2626]">BNC LEG</span>
              </>
            ) : (
              <>
                Why Partner With <span className="text-[#DC2626]">BNC LEG</span>
              </>
            )}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            {isRtl
              ? 'تمكين شبكات الوكالات والمستشارين من الشركات بأدوات وسبل نمو مؤسسية.'
              : 'Empowering agency networks and corporate advisors with institutional-grade tools and growth avenues.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col ${textAlign}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${card.iconBg}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {isRtl ? card.titleAr : card.titleEn}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isRtl ? card.descAr : card.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyPartner;
